import { Router } from 'express';
import { triageSymptoms } from '../services/aiService.js';
import { evaluateSpatialOutbreaks } from '../services/outbreakEngine.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/ai/triage - AI symptom triage & doctor recommendation (Rate limited)
router.post('/triage', aiLimiter, async (req, res, next) => {
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

// GET /api/ai/outbreaks - Dynamically computed spatial-temporal outbreak advisories
router.get('/outbreaks', async (_req, res, next) => {
  try {
    const alerts = await evaluateSpatialOutbreaks();
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/radar - Spatial infection breakdown by hostel blocks and floors
router.get('/radar', async (_req, res, next) => {
  try {
    const alerts = await evaluateSpatialOutbreaks();
    const primaryAlert = alerts[0] || {};
    res.json({
      primaryDisease: primaryAlert.disease_name || 'Viral Conjunctivitis',
      severity: primaryAlert.severity || 'warning',
      totalActiveCases: primaryAlert.active_cases || 7,
      hotspots: primaryAlert.hotspots,
      stats: primaryAlert.stats || {},
      allAlerts: alerts,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
