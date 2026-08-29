import { query } from '../db/db.js';

// Pre-defined campus clinical triage guidelines
const SPECIALTY_MAP = {
  fever: { doctor: 'General Physician', urgency: 'moderate', name: 'Dr. Aditi Rao' },
  cold: { doctor: 'General Physician', urgency: 'mild', name: 'Dr. Aditi Rao' },
  cough: { doctor: 'General Physician', urgency: 'mild', name: 'Dr. Aditi Rao' },
  eye: { doctor: 'General Physician', urgency: 'moderate', name: 'Dr. Aditi Rao', outbreakTag: 'Viral Conjunctivitis (Pink Eye)' },
  rash: { doctor: 'Dermatology', urgency: 'mild', name: 'Dr. Sanjana Iyer' },
  acne: { doctor: 'Dermatology', urgency: 'mild', name: 'Dr. Sanjana Iyer' },
  skin: { doctor: 'Dermatology', urgency: 'mild', name: 'Dr. Sanjana Iyer' },
  bone: { doctor: 'Orthopaedics', urgency: 'moderate', name: 'Dr. Rohan Verma' },
  joint: { doctor: 'Orthopaedics', urgency: 'moderate', name: 'Dr. Rohan Verma' },
  sprain: { doctor: 'Orthopaedics', urgency: 'moderate', name: 'Dr. Rohan Verma' },
  fracture: { doctor: 'Orthopaedics', urgency: 'urgent', name: 'Dr. Rohan Verma' },
  period: { doctor: 'Gynaecology', urgency: 'mild', name: 'Dr. Kabir Mehta' },
  cramps: { doctor: 'Gynaecology', urgency: 'mild', name: 'Dr. Kabir Mehta' },
  pcod: { doctor: 'Gynaecology', urgency: 'moderate', name: 'Dr. Kabir Mehta' },
};

/**
 * Evaluates symptoms using Gemini AI if GEMINI_API_KEY is configured,
 * or using intelligent campus clinical heuristics fallback.
 */
export async function triageSymptoms({ message, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Retrieve active outbreak advisories from database
  let activeOutbreaks = [];
  try {
    const alertRes = await query('SELECT * FROM outbreak_alerts WHERE is_active = TRUE');
    activeOutbreaks = alertRes.rows;
  } catch (err) {
    console.error('Error fetching outbreaks in AI service:', err.message);
  }

  // If Gemini API Key is available, call Google Gemini 1.5/2.0 API
  if (apiKey && apiKey !== 'skip_for_now' && !apiKey.startsWith('re_')) {
    try {
      const outbreakContext = activeOutbreaks.map(o => `${o.disease_name} (Severity: ${o.severity}): ${o.advisory}`).join('\n');
      const systemPrompt = `You are CHAMP Campus AI Medical Triage Assistant for university students.
Current Campus Health Alerts:\n${outbreakContext || 'No active epidemics.'}

Available Doctors on Campus:
1. Dr. Aditi Rao (General Physician) - Fever, Flu, Infections, Pink Eye, Stomach issues
2. Dr. Kabir Mehta (Gynaecology) - Menstrual health, PCOD, Hormonal, Reproductive wellness
3. Dr. Sanjana Iyer (Dermatology) - Skin allergies, Rashes, Acne, Hair
4. Dr. Rohan Verma (Orthopaedics) - Sports injuries, Joint pains, Sprains, Backache

Instructions:
- Provide empathetic, concise student health guidance (2-4 sentences).
- If symptoms match an active campus outbreak (e.g. red eyes, flu), flag the outbreak risk and give immediate isolation/prevention tips.
- Recommend the best matching doctor by name and specialty.
- Assign a triageLevel: 'self_care' | 'clinic_visit' | 'urgent_emergency'.
- Return JSON strictly in this format:
{
  "reply": "friendly explanation and immediate care tips",
  "recommendedDoctor": "Dr. Name",
  "recommendedSpecialty": "Specialty",
  "urgency": "mild" | "moderate" | "urgent",
  "triageLevel": "self_care" | "clinic_visit" | "urgent_emergency",
  "matchedOutbreak": "Disease name if matched or null",
  "preventionTips": ["tip 1", "tip 2"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Message: ${message}` }] }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          return JSON.parse(rawJson);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using clinical fallback engine:', err.message);
    }
  }

  // Clinical Heuristic Engine (Offline / Instant Fallback)
  const lower = message.toLowerCase();
  let matchedSpecialty = 'General Physician';
  let matchedDoctor = 'Dr. Aditi Rao';
  let urgency = 'moderate';
  let triageLevel = 'clinic_visit';
  let matchedOutbreak = null;
  let preventionTips = [
    'Stay well hydrated with clean water and ORS if dehydrated.',
    'Get adequate rest and avoid crowded lecture halls if symptomatic.',
    'Wear a mask and sanitize hands frequently.'
  ];

  // Check for Conjunctivitis / Eye Infection outbreak
  if (lower.includes('eye') || lower.includes('pink') || lower.includes('red') || lower.includes('itchy eye') || lower.includes('watery')) {
    matchedOutbreak = 'Viral Conjunctivitis (Pink Eye)';
    matchedDoctor = 'Dr. Aditi Rao';
    matchedSpecialty = 'General Physician';
    urgency = 'moderate';
    triageLevel = 'clinic_visit';
    preventionTips = [
      'Avoid rubbing or touching your eyes.',
      'Do not share towels, pillows, or eye drops with roommates.',
      'Wear eyeglasses instead of contact lenses.',
      'Isolate in your room to prevent spreading in hostel corridors.'
    ];
  } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('acne') || lower.includes('itch')) {
    matchedDoctor = 'Dr. Sanjana Iyer';
    matchedSpecialty = 'Dermatology';
    urgency = 'mild';
    triageLevel = 'clinic_visit';
    preventionTips = [
      'Avoid harsh chemical soaps on affected areas.',
      'Keep the skin clean and dry.',
      'Do not scratch or burst any blisters or acne.'
    ];
  } else if (lower.includes('sprain') || lower.includes('bone') || lower.includes('ankle') || lower.includes('knee') || lower.includes('fracture') || lower.includes('gym')) {
    matchedDoctor = 'Dr. Rohan Verma';
    matchedSpecialty = 'Orthopaedics';
    urgency = lower.includes('fracture') ? 'urgent' : 'moderate';
    triageLevel = lower.includes('fracture') ? 'urgent_emergency' : 'clinic_visit';
    preventionTips = [
      'Follow R.I.C.E protocol: Rest, Ice, Compression, Elevation.',
      'Avoid bearing weight on the affected limb.',
      'Apply an ice pack wrapped in a cloth for 15 minutes.'
    ];
  } else if (lower.includes('period') || lower.includes('cramp') || lower.includes('pcod') || lower.includes('menstrual')) {
    matchedDoctor = 'Dr. Kabir Mehta';
    matchedSpecialty = 'Gynaecology';
    urgency = 'mild';
    triageLevel = 'clinic_visit';
    preventionTips = [
      'Use a warm heating pad for abdominal discomfort.',
      'Stay hydrated and drink warm herbal tea or water.',
      'Schedule a confidential consultation for personalized care.'
    ];
  } else if (lower.includes('chest pain') || lower.includes('cannot breathe') || lower.includes('unconscious') || lower.includes('severe bleeding')) {
    urgency = 'urgent';
    triageLevel = 'urgent_emergency';
    preventionTips = [
      'Call Campus Ambulance (108) immediately using the emergency button.',
      'Do not attempt to walk or drive alone.',
      'Inform your hostel warden or room neighbor right away.'
    ];
  }

  let replyText = '';
  if (triageLevel === 'urgent_emergency') {
    replyText = `⚠️ **Urgent Health Advisory:** Your symptoms require immediate medical attention. Please tap the red Emergency button to call the campus ambulance or reach Block A Ground Floor Health Centre now.`;
  } else if (matchedOutbreak) {
    replyText = `⚠️ **Campus Alert Match:** Your symptoms align with the active **${matchedOutbreak}** outbreak on campus. Please practice strict surface hygiene, avoid shared hostel items, and book an appointment with **${matchedDoctor}** for medicated eye drops and a quick checkup.`;
  } else {
    replyText = `Based on your symptoms, we recommend getting checked by **${matchedDoctor} (${matchedSpecialty})**. In the meantime, rest well, stay hydrated, and monitor your symptoms.`;
  }

  return {
    reply: replyText,
    recommendedDoctor: matchedDoctor,
    recommendedSpecialty: matchedSpecialty,
    urgency,
    triageLevel,
    matchedOutbreak,
    preventionTips
  };
}
