import { Router } from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/doctors — list all active verified distinct doctors
router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (d.name) d.id, d.name, d.specialty, d.bio, d.avatar_url, d.qualifications, d.opd_room, d.shift_hours
       FROM doctors d
       WHERE d.is_active = TRUE
       ORDER BY d.name ASC, d.id ASC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD — available slots for a doctor with guaranteed auto-generation
router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Check existing available slots
    let result = await query(
      `SELECT s.id, s.slot_time, s.slot_date, s.is_booked
       FROM slots s
       WHERE s.doctor_id = $1
         AND s.slot_date = $2
         AND s.is_booked = FALSE
       ORDER BY s.slot_time`,
      [id, date]
    );

    // If no slots exist for this doctor on this date, automatically seed default clinic OPD slots!
    if (result.rows.length === 0) {
      const anySlots = await query(
        'SELECT COUNT(*) FROM slots WHERE doctor_id = $1 AND slot_date = $2',
        [id, date]
      );
      if (parseInt(anySlots.rows[0].count) === 0) {
        const defaultTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
        for (const time of defaultTimes) {
          await query(
            'INSERT INTO slots (doctor_id, slot_time, slot_date, is_booked) VALUES ($1, $2, $3, FALSE) ON CONFLICT DO NOTHING',
            [id, time, date]
          );
        }
        result = await query(
          `SELECT s.id, s.slot_time, s.slot_date, s.is_booked
           FROM slots s
           WHERE s.doctor_id = $1
             AND s.slot_date = $2
             AND s.is_booked = FALSE
           ORDER BY s.slot_time`,
          [id, date]
        );
      }
    }

    res.json(result.rows);
  } catch (err) { next(err); }
});

// POST /api/doctors/:id/slots — doctor creates slots
router.post('/:id/slots', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slot_time, slot_date } = req.body;

    const result = await query(
      `INSERT INTO slots (doctor_id, slot_time, slot_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, slot_time, slot_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;
