import { Router } from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/doctors  — list all active doctors
router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT d.id, d.name, d.specialty, d.bio, d.avatar_url
       FROM doctors d
       WHERE d.is_active = TRUE
       ORDER BY d.name`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD  — available slots for a doctor
router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT s.id, s.slot_time, s.slot_date, s.is_booked
       FROM slots s
       WHERE s.doctor_id = $1
         AND s.slot_date = $2
         AND s.is_booked = FALSE
       ORDER BY s.slot_time`,
      [id, date]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

// POST /api/doctors/:id/slots  — admin creates slots for a doctor
router.post('/:id/slots', authMiddleware, async (req, res, next) => {
  try {
    if (!['admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
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
