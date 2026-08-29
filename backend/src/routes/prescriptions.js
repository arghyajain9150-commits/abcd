import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { io } from '../index.js';

const router = Router();

const PrescriptionItemSchema = z.object({
  medicine_name: z.string().min(1),
  dosage: z.string().default('500mg'),
  frequency: z.string().default('1-0-1 (Morning & Night)'),
  duration_days: z.number().int().positive().default(3),
  instructions: z.string().optional().default('After food with water'),
});

const CreatePrescriptionSchema = z.object({
  appointment_id: z.string().optional().nullable(),
  student_id: z.string().optional().nullable(),
  student_name: z.string().optional(),
  student_email: z.string().optional(),
  doctor_id: z.string().optional().nullable(),
  diagnosis: z.string().min(2),
  notes: z.string().optional(),
  items: z.array(PrescriptionItemSchema).min(1),
});

// POST /api/prescriptions - Doctor creates digital prescription
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = CreatePrescriptionSchema.parse(req.body);

    // 1. Resolve student_id
    let studentId = data.student_id;
    if (!studentId || studentId === 'undefined' || studentId === 'null') {
      if (data.student_email) {
        const studentRes = await query('SELECT id FROM users WHERE email = $1', [data.student_email]);
        studentId = studentRes.rows[0]?.id;
      }
      if (!studentId) {
        // Fallback to first student or current user
        const fallbackStudent = await query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
        studentId = fallbackStudent.rows[0]?.id || req.user.id;
      }
    }

    // 2. Resolve doctor_id
    let doctorId = data.doctor_id;
    if (!doctorId || doctorId === 'undefined' || doctorId === 'null') {
      const docRes = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      if (docRes.rows[0]) {
        doctorId = docRes.rows[0].id;
      } else {
        const fallbackDoc = await query('SELECT id FROM doctors LIMIT 1');
        doctorId = fallbackDoc.rows[0]?.id;
      }
    }

    // 3. Insert Prescription
    const rxRes = await query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, student_id, diagnosis, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [
        data.appointment_id && data.appointment_id.length > 10 ? data.appointment_id : null,
        doctorId,
        studentId,
        data.diagnosis,
        data.notes || ''
      ]
    );
    const prescription = rxRes.rows[0];

    // 4. Insert Prescription Items
    const insertedItems = [];
    for (const item of data.items) {
      const itemRes = await query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration_days, instructions)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [prescription.id, item.medicine_name, item.dosage, item.frequency, item.duration_days, item.instructions || '']
      );
      insertedItems.push(itemRes.rows[0]);
    }

    // 5. Update appointment status if appointment_id provided
    if (data.appointment_id && data.appointment_id.length > 10) {
      await query(
        "UPDATE appointments SET status = 'completed' WHERE id = $1",
        [data.appointment_id]
      );
    }

    // 6. Create Student Notification
    try {
      await query(
        `INSERT INTO notifications (user_id, title, body, type)
         VALUES ($1, 'New Prescription Issued', $2, 'prescription')`,
        [
          studentId,
          `Doctor has prescribed medications for "${data.diagnosis}". Dispatched to Campus Pharmacy.`
        ]
      );
      io.to(`user:${studentId}`).emit('new_notification', {
        title: 'New Prescription Issued',
        body: `Doctor has prescribed medications for "${data.diagnosis}". Dispatched to Campus Pharmacy.`
      });
    } catch (e) {
      console.warn('Could not write notification:', e.message);
    }

    // 7. Emit Real-Time Socket Event to Pharmacy
    io.emit('new_prescription', {
      ...prescription,
      items: insertedItems,
    });

    res.status(201).json({
      ...prescription,
      items: insertedItems,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

// GET /api/prescriptions/student - Get student's prescription history
router.get('/student', authMiddleware, async (req, res, next) => {
  try {
    const rxRes = await query(
      `SELECT p.*, d.name as doctor_name, d.specialty as doctor_specialty
       FROM prescriptions p
       LEFT JOIN doctors d ON p.doctor_id = d.id
       WHERE p.student_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    const prescriptions = [];
    for (const rx of rxRes.rows) {
      const itemsRes = await query(
        'SELECT * FROM prescription_items WHERE prescription_id = $1',
        [rx.id]
      );
      prescriptions.push({ ...rx, items: itemsRes.rows });
    }

    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// GET /api/prescriptions/pharmacy - Get pharmacy active processing queue
router.get('/pharmacy', authMiddleware, async (_req, res, next) => {
  try {
    const rxRes = await query(
      `SELECT p.*, u.name as student_name, u.email as student_email, u.phone as student_phone,
              d.name as doctor_name, d.specialty as doctor_specialty
       FROM prescriptions p
       LEFT JOIN users u ON p.student_id = u.id
       LEFT JOIN doctors d ON p.doctor_id = d.id
       ORDER BY 
         CASE p.status
           WHEN 'pending' THEN 1
           WHEN 'preparing' THEN 2
           WHEN 'ready_for_pickup' THEN 3
           WHEN 'dispensed' THEN 4
           ELSE 5
         END,
         p.created_at DESC`
    );

    const prescriptions = [];
    for (const rx of rxRes.rows) {
      const itemsRes = await query(
        'SELECT * FROM prescription_items WHERE prescription_id = $1',
        [rx.id]
      );
      prescriptions.push({ ...rx, items: itemsRes.rows });
    }

    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/prescriptions/:id/status - Update fulfillment status
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'preparing', 'ready_for_pickup', 'dispensed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const dispensedAt = status === 'dispensed' ? 'NOW()' : 'dispensed_at';
    const rxRes = await query(
      `UPDATE prescriptions 
       SET status = $1, dispensed_at = ${dispensedAt} 
       WHERE id = $2 
       RETURNING *`,
      [status, req.params.id]
    );

    if (!rxRes.rows[0]) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    const updatedRx = rxRes.rows[0];

    // Notify Student if Ready for Pickup
    if (status === 'ready_for_pickup') {
      try {
        await query(
          `INSERT INTO notifications (user_id, title, body, type)
           VALUES ($1, '💊 Prescription Ready for Pickup', 'Your medications are packed and ready at Campus Pharmacy (Block A Ground Floor).', 'prescription')`,
          [updatedRx.student_id]
        );
        io.to(`user:${updatedRx.student_id}`).emit('new_notification', {
          title: '💊 Prescription Ready for Pickup',
          body: 'Your medications are packed and ready at Campus Pharmacy (Block A Ground Floor).'
        });
      } catch (e) {
        console.warn('Could not write pickup notification:', e.message);
      }
    }

    io.emit('prescription_status_update', updatedRx);
    res.json(updatedRx);
  } catch (err) {
    next(err);
  }
});

export default router;
