import { Router } from 'express';
import { query } from '../db/db.js';

const router = Router();

// GET /api/emergency  — public, no auth needed
router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM emergency_contacts ORDER BY priority ASC'
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

export default router;
