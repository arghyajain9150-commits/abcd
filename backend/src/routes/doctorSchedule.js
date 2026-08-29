import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { io } from '../index.js';

const router = Router();

// GET /api/doctor/queue - Get patient queue for the doctor
router.get('/queue', authMiddleware, async (req, res, next) => {
  try {
    const { date, doctor_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Find doctor id
    let doctorId = doctor_id;
    if (!doctorId) {
      const docRes = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      doctorId = docRes.rows[0]?.id;
    }

    let filterQuery = '';
    const params = [targetDate];
    if (doctorId) {
      filterQuery = 'AND a.doctor_id = $2';
      params.push(doctorId);
    }

    const appts = await query(
      `SELECT a.*, 
              u.name as student_name, u.email as student_email, u.phone as student_phone,
              s.slot_time, s.slot_date,
              d.name as doctor_name, d.specialty as doctor_specialty
       FROM appointments a
       JOIN users u ON a.student_id = u.id
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE s.slot_date = $1 AND a.status != 'cancelled' ${filterQuery}
       ORDER BY 
         CASE a.status
           WHEN 'in_consultation' THEN 1
           WHEN 'confirmed' THEN 2
           WHEN 'completed' THEN 3
           ELSE 4
         END,
         s.slot_time ASC`,
      params
    );

    res.json(appts.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/doctor/slots - Doctor adds new clinic time slots
router.post('/slots', authMiddleware, async (req, res, next) => {
  try {
    const SlotSchema = z.object({
      slot_date: z.string(), // YYYY-MM-DD
      slot_times: z.array(z.string()).min(1), // ["09:00", "09:30"]
      doctor_id: z.string().uuid().optional(),
    });

    const data = SlotSchema.parse(req.body);

    let doctorId = data.doctor_id;
    if (!doctorId) {
      const docRes = await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
      doctorId = docRes.rows[0]?.id;
    }

    if (!doctorId) {
      const fallbackDoc = await query('SELECT id FROM doctors LIMIT 1');
      doctorId = fallbackDoc.rows[0]?.id;
    }

    const createdSlots = [];
    for (const t of data.slot_times) {
      const inserted = await query(
        `INSERT INTO slots (doctor_id, slot_date, slot_time, is_booked)
         VALUES ($1, $2, $3::TIME, FALSE)
         ON CONFLICT (doctor_id, slot_date, slot_time) DO NOTHING
         RETURNING *`,
        [doctorId, data.slot_date, t]
      );
      if (inserted.rows[0]) createdSlots.push(inserted.rows[0]);
    }

    res.status(201).json({ message: 'Slots generated', slots: createdSlots });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// PATCH /api/doctor/appointments/:id/status - Update consultation status
router.patch('/appointments/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['confirmed', 'in_consultation', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Appointment not found' });
    const appt = result.rows[0];

    // Notify Student
    if (status === 'in_consultation') {
      await query(
        `INSERT INTO notifications (user_id, title, body, type)
         VALUES ($1, '🩺 Your Turn Now!', 'Dr. is ready to see you in Consultation Room 1.', 'urgent')`,
        [appt.student_id]
      );
      io.to(`user:${appt.student_id}`).emit('new_notification', {
        title: '🩺 Your Turn Now!',
        body: 'Dr. is ready to see you in Consultation Room 1.'
      });
    }

    io.emit('queue_update', { doctorId: appt.doctor_id, status });
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

export default router;
