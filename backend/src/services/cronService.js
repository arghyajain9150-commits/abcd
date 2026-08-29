import cron from 'node-cron';
import { query } from '../db/db.js';
import { sendReminderEmail } from './emailService.js';
import { createNotification } from './notificationService.js';

/**
 * Cron Jobs:
 *  1. Every minute: find appointments starting in ~30 min → send reminder
 *  2. Every day at midnight: auto-generate slots for next day (optional)
 */
export function startCronJobs() {
  // ── 30-minute appointment reminder — runs every minute ──────────
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const reminderWindowStart = new Date(now.getTime() + 29 * 60 * 1000);
      const reminderWindowEnd   = new Date(now.getTime() + 31 * 60 * 1000);

      const startTime = reminderWindowStart.toTimeString().slice(0, 5); // HH:MM
      const endTime   = reminderWindowEnd.toTimeString().slice(0, 5);
      const today     = now.toISOString().split('T')[0];

      const result = await query(
        `SELECT a.id, a.student_id, a.queue_pos,
                s.slot_time, s.slot_date,
                d.name as doctor_name,
                u.email, u.name as student_name
         FROM appointments a
         JOIN slots s ON a.slot_id = s.id
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users u ON a.student_id = u.id
         WHERE a.status = 'confirmed'
           AND s.slot_date = $1
           AND s.slot_time::text BETWEEN $2 AND $3
           AND a.id NOT IN (
             SELECT (metadata->>'appointment_id')::uuid
             FROM notifications
             WHERE type = 'reminder'
               AND created_at > NOW() - INTERVAL '1 hour'
           )`,
        [today, startTime, endTime]
      );

      for (const appt of result.rows) {
        await sendReminderEmail({
          to: appt.email,
          studentName: appt.student_name,
          doctorName: appt.doctor_name,
          slotTime: appt.slot_time,
          queuePos: appt.queue_pos,
        });

        await createNotification({
          userId: appt.student_id,
          title: '⏰ Appointment in 30 minutes',
          body: `${appt.doctor_name} · ${appt.slot_time} · Queue #${appt.queue_pos}`,
          type: 'reminder',
        });

        console.log(`📧 Reminder sent to ${appt.email} for ${appt.slot_time}`);
      }
    } catch (err) {
      console.error('Cron reminder error:', err.message);
    }
  });

  // ── Daily slot generation — runs at midnight every day ──────────
  // Generates default slots for all doctors for the next day
  cron.schedule('0 0 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const DEFAULT_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00',
                             '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

      const doctors = await query('SELECT id FROM doctors WHERE is_active = TRUE');

      for (const doc of doctors.rows) {
        for (const time of DEFAULT_SLOTS) {
          await query(
            `INSERT INTO slots (doctor_id, slot_time, slot_date)
             VALUES ($1, $2, $3)
             ON CONFLICT (doctor_id, slot_date, slot_time) DO NOTHING`,
            [doc.id, time, tomorrowStr]
          );
        }
      }
      console.log(`✅ Slots generated for ${tomorrowStr}`);
    } catch (err) {
      console.error('Cron slot generation error:', err.message);
    }
  });

  console.log('⏰ Cron jobs started');
}
