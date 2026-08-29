import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

const TicketSchema = z.object({
  category: z.string().default('General Inquiry'),
  subject: z.string().min(3),
  message: z.string().min(5),
});

// POST /api/support/tickets - Submit student helpdesk query / medical leave note request
router.post('/tickets', authMiddleware, async (req, res, next) => {
  try {
    const data = TicketSchema.parse(req.body);

    const result = await query(
      `INSERT INTO support_tickets (user_id, category, subject, message, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING *`,
      [req.user.id, data.category, data.subject, data.message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// GET /api/support/tickets - Get my submitted tickets
router.get('/tickets', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
