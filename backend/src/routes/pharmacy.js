import { Router } from 'express';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/pharmacy/inventory - Get campus pharmacy medication stock
router.get('/inventory', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM pharmacy_inventory ORDER BY category, name'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/pharmacy/inventory/:id - Adjust stock
router.patch('/inventory/:id', authMiddleware, async (req, res, next) => {
  try {
    const { stock_quantity, is_available } = req.body;
    const result = await query(
      `UPDATE pharmacy_inventory 
       SET stock_quantity = COALESCE($1, stock_quantity),
           is_available = COALESCE($2, is_available)
       WHERE id = $3
       RETURNING *`,
      [stock_quantity, is_available, req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Medication not found in inventory' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
