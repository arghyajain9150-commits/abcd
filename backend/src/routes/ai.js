import { Router } from 'express';
import { query } from '../db/db.js';
import { triageSymptoms } from '../services/aiService.js';

const router = Router();

// POST /api/ai/triage - AI symptom triage & doctor recommendation
router.post('/triage', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await triageSymptoms({ message, history });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/outbreaks - Get active campus infectious disease advisories
router.get('/outbreaks', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM outbreak_alerts WHERE is_active = TRUE ORDER BY updated_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
