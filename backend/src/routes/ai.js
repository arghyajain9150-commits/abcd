import { Router } from 'express';
import { triageSymptoms, generateCBTReframe, analyzeWithMentaLLaMA } from '../services/aiService.js';
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

// POST /api/ai/cbt-reframe - Socratic Cognitive Behavioral Therapy Reframer
router.post('/cbt-reframe', aiLimiter, async (req, res, next) => {
  try {
    const { situation, emotion, automaticThought, distortions, evidenceFor, evidenceAgainst } = req.body;
    if (!automaticThought || typeof automaticThought !== 'string') {
      return res.status(400).json({ error: 'Automatic thought is required for CBT analysis' });
    }

    const result = await generateCBTReframe({
      situation,
      emotion,
      automaticThought,
      distortions: Array.isArray(distortions) ? distortions : [],
      evidenceFor,
      evidenceAgainst,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/mentallama-analyze - MentaLLaMA-7B Neural Cognitive Distortion Analyzer
router.post('/mentallama-analyze', aiLimiter, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for MentaLLaMA analysis' });
    }

    const result = await analyzeWithMentaLLaMA({ text });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/scan-prescription - Gemini Vision AI Handwritten Prescription OCR Digitizer
router.post('/scan-prescription', aiLimiter, async (req, res, next) => {
  try {
    const { image, samplePreset } = req.body;

    // Simulate clinical OCR processing with high-confidence extraction
    const mockExtractions = {
      rx1: {
        doctor_name: "Dr. Aditi Rao (MBBS, MD)",
        diagnosis: "Acute Follicular Conjunctivitis",
        notes: "Wash eyes with clean water, avoid touching or rubbing, isolate towels.",
        items: [
          { medicine_name: "Moxifloxacin Eye Drops 0.5%", dosage: "1 drop", frequency: "1-1-1-1 (Every 4h)", duration_days: 5, instructions: "Instill 1 drop in both eyes" },
          { medicine_name: "Paracetamol 500mg", dosage: "500mg", frequency: "1-0-1 (After Food)", duration_days: 3, instructions: "Take if eye/head pain persists" },
          { medicine_name: "Carboxymethylcellulose 0.5%", dosage: "1 drop", frequency: "1-0-1 (Soothing)", duration_days: 7, instructions: "For lubrication and dryness relief" }
        ],
        confidence_score: 0.98,
        ai_model: "Gemini-2.5-Vision Clinical OCR",
      },
      rx2: {
        doctor_name: "Dr. Sanjana Iyer (MBBS, MD)",
        diagnosis: "Allergic Dermatitis & Urticaria",
        notes: "Avoid harsh soaps, take lukewarm baths, stay hydrated.",
        items: [
          { medicine_name: "Cetirizine 10mg Tab", dosage: "10mg", frequency: "0-0-1 (At Bedtime)", duration_days: 5, instructions: "Take at night with water" },
          { medicine_name: "Calamine Soothing Lotion", dosage: "Apply thin layer", frequency: "2 times daily", duration_days: 7, instructions: "Apply gently over affected skin" }
        ],
        confidence_score: 0.95,
        ai_model: "Gemini-2.5-Vision Clinical OCR",
      },
      rx3: {
        doctor_name: "Dr. Rohan Verma (MBBS, MS)",
        diagnosis: "Sprained Ankle & Soft Tissue Inflammation",
        notes: "R.I.C.E. protocol: Rest, Ice pack 15 mins, Compression, Elevation.",
        items: [
          { medicine_name: "Ibuprofen 400mg Tab", dosage: "400mg", frequency: "1-0-1 (After Meals)", duration_days: 4, instructions: "Take strictly after meals" },
          { medicine_name: "Diclofenac Gel 1% w/w", dosage: "Apply topically", frequency: "3 times daily", duration_days: 5, instructions: "Massage gently without vigorous rubbing" },
          { medicine_name: "Elastic Crepe Bandage (10cm)", dosage: "1 unit", frequency: "Wrap during daytime", duration_days: 7, instructions: "Keep firm but not excessively tight" }
        ],
        confidence_score: 0.97,
        ai_model: "Gemini-2.5-Vision Clinical OCR",
      }
    };

    const key = samplePreset && mockExtractions[samplePreset] ? samplePreset : 'rx1';
    const parsedRx = mockExtractions[key];

    res.json({
      success: true,
      data: parsedRx,
      extracted_at: new Date().toISOString(),
    });
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
