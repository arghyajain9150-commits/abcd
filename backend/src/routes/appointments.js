import { Router } from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sendAppointmentConfirmation, sendCancellationEmail } from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';
import { io } from '../index.js';

const router = Router();

// All appointment routes are protected
router.use(authMiddleware);

// ── GET /api/appointments/mine ──────────────────────────────────
router.get('/mine', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.id, a.status, a.queue_pos, a.booked_at, a.notes,
              s.slot_time, s.slot_date, s.id as slot_id,
              d.id as doctor_id, d.name as doctor_name, d.specialty, d.opd_room, d.qualifications
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.student_id = $1
       ORDER BY s.slot_date DESC, s.slot_time DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// ── POST /api/appointments  — Book an appointment ───────────────
router.post('/', async (req, res, next) => {
  try {
    const { doctor_id, slot_id, notes } = req.body;
    if (!doctor_id || !slot_id) {
      return res.status(400).json({ error: 'doctor_id and slot_id are required' });
    }

    // Check slot is still available
    const slotCheck = await query(
      'SELECT * FROM slots WHERE id = $1 AND is_booked = FALSE',
      [slot_id]
    );
    if (slotCheck.rows.length === 0) {
      return res.status(409).json({ error: 'Slot is no longer available' });
    }
    const slot = slotCheck.rows[0];

    // Conflict Check: Check if student already has a confirmed appointment at this exact date & time
    const conflictCheck = await query(
      `SELECT a.id, d.name as doctor_name 
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.student_id = $1
         AND s.slot_date = $2
         AND s.slot_time = $3
         AND a.status = 'confirmed'`,
      [req.user.id, slot.slot_date, slot.slot_time]
    );
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        error: `Time conflict: You already have a confirmed appointment with ${conflictCheck.rows[0].doctor_name} at ${slot.slot_time}. Please pick another time slot.`
      });
    }

    // Count existing confirmed appointments for this doctor/date to assign queue pos
    const queueResult = await query(
      `SELECT COUNT(*) FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       WHERE a.doctor_id = $1
         AND s.slot_date = $2
         AND a.status = 'confirmed'`,
      [doctor_id, slot.slot_date]
    );
    const queuePos = parseInt(queueResult.rows[0].count) + 1;

    // Create the appointment
    const apptResult = await query(
      `INSERT INTO appointments (student_id, doctor_id, slot_id, queue_pos, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, doctor_id, slot_id, queuePos, notes || null]
    );
    const appointment = apptResult.rows[0];

    // Mark slot as booked
    await query('UPDATE slots SET is_booked = TRUE WHERE id = $1', [slot_id]);

    // Get user info for email
    const userResult = await query(
      'SELECT name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];

    // Get doctor name
    const docResult = await query(
      'SELECT name, specialty FROM doctors WHERE id = $1',
      [doctor_id]
    );
    const doctor = docResult.rows[0];

    // ── Send confirmation email ───────────────────────────────────
    await sendAppointmentConfirmation({
      to: user.email,
      studentName: user.name,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      slotTime: slot.slot_time,
      slotDate: slot.slot_date,
      queuePos,
    });

    // ── Create in-app notification ────────────────────────────────
    const notif = await createNotification({
      userId: req.user.id,
      title: 'Appointment Confirmed ✅',
      body: `${doctor.name} · ${slot.slot_time} · Queue #${queuePos}`,
      type: 'info',
    });

    // ── Emit real-time event to student ──────────────────────────
    io.to(`user:${req.user.id}`).emit('appt_confirmed', {
      appointment,
      queuePos,
      doctorName: doctor.name,
      slotTime: slot.slot_time,
    });

    // ── Emit queue update to doctor's room ───────────────────────
    io.to(`queue:${doctor_id}:${slot.slot_date}`).emit('queue_update', {
      doctorId: doctor_id,
      date: slot.slot_date,
      totalInQueue: queuePos,
    });

    res.status(201).json({ appointment, queuePos, notification: notif });
  } catch (err) { next(err); }
});

// ── PATCH /api/appointments/:id/reschedule ───────────────────────
router.patch('/:id/reschedule', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_slot_id } = req.body;

    if (!new_slot_id) {
      return res.status(400).json({ error: 'new_slot_id is required' });
    }

    // 1. Verify existing appointment ownership
    const apptResult = await query(
      `SELECT a.*, s.slot_date as old_date, s.slot_time as old_time, d.name as doctor_name
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1 AND a.student_id = $2`,
      [id, req.user.id]
    );
    if (apptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const appt = apptResult.rows[0];

    // 2. Check new slot is available
    const newSlotCheck = await query(
      'SELECT * FROM slots WHERE id = $1 AND is_booked = FALSE',
      [new_slot_id]
    );
    if (newSlotCheck.rows.length === 0) {
      return res.status(409).json({ error: 'Selected new slot is no longer available' });
    }
    const newSlot = newSlotCheck.rows[0];

    // 3. Free old slot and reserve new slot
    await query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [appt.slot_id]);
    await query('UPDATE slots SET is_booked = TRUE WHERE id = $1', [new_slot_id]);

    // 4. Update appointment
    const updateRes = await query(
      `UPDATE appointments 
       SET slot_id = $1, status = 'confirmed', booked_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [new_slot_id, id]
    );

    // 5. Recompute queues
    await recomputeQueue(appt.doctor_id, appt.old_date);
    await recomputeQueue(appt.doctor_id, newSlot.slot_date);

    await createNotification({
      userId: req.user.id,
      title: 'Appointment Rescheduled 🔄',
      body: `Your visit with ${appt.doctor_name} has been moved to ${newSlot.slot_date} at ${newSlot.slot_time}.`,
      type: 'info',
    });

    res.json({ message: 'Appointment rescheduled successfully', appointment: updateRes.rows[0] });
  } catch (err) { next(err); }
});

// ── PATCH /api/appointments/:id/cancel ──────────────────────────
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const apptResult = await query(
      `SELECT a.*, s.slot_date, s.slot_time, d.name as doctor_name
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1 AND a.student_id = $2`,
      [id, req.user.id]
    );
    if (apptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const appt = apptResult.rows[0];

    if (appt.status === 'cancelled') {
      return res.status(400).json({ error: 'Already cancelled' });
    }

    // Cancel it
    await query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    // Free the slot
    await query('UPDATE slots SET is_booked = FALSE WHERE id = $1', [appt.slot_id]);

    // Re-number queue positions for remaining students
    await recomputeQueue(appt.doctor_id, appt.slot_date);

    // Get user email
    const userResult = await query('SELECT email, name FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    await sendCancellationEmail({
      to: user.email,
      studentName: user.name,
      doctorName: appt.doctor_name,
      slotTime: appt.slot_time,
      slotDate: appt.slot_date,
    });

    await createNotification({
      userId: req.user.id,
      title: 'Appointment Cancelled',
      body: `Your slot with ${appt.doctor_name} at ${appt.slot_time} has been cancelled.`,
      type: 'cancelled',
    });

    // Emit queue_update to doctor room so all waiting students get updated positions
    io.to(`queue:${appt.doctor_id}:${appt.slot_date}`).emit('queue_update', {
      message: 'Queue updated after cancellation',
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) { next(err); }
});

// ── GET /api/appointments/queue/:doctorId  — live queue position ─
router.get('/queue/:doctorId', async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT a.id, a.queue_pos, a.student_id,
              s.slot_time, u.name as student_name
       FROM appointments a
       JOIN slots s ON a.slot_id = s.id
       JOIN users u ON a.student_id = u.id
       WHERE a.doctor_id = $1
         AND s.slot_date = $2
         AND a.status = 'confirmed'
       ORDER BY a.queue_pos`,
      [doctorId, date]
    );

    const myEntry = result.rows.find((r) => r.student_id === req.user.id);
    res.json({
      queuePos: myEntry?.queue_pos ?? null,
      totalInQueue: result.rows.length,
    });
  } catch (err) { next(err); }
});

// Helper: recompute queue numbers after a cancellation or reschedule
async function recomputeQueue(doctorId, slotDate) {
  const result = await query(
    `SELECT a.id FROM appointments a
     JOIN slots s ON a.slot_id = s.id
     WHERE a.doctor_id = $1
       AND s.slot_date = $2
       AND a.status = 'confirmed'
     ORDER BY a.booked_at`,
    [doctorId, slotDate]
  );
  for (let i = 0; i < result.rows.length; i++) {
    await query('UPDATE appointments SET queue_pos = $1 WHERE id = $2', [
      i + 1,
      result.rows[i].id,
    ]);
  }
}

export default router;
