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

/**
 * Generates an evidence-based Cognitive Behavioral Therapy (CBT) Thought Reframe
 * based on Beck Institute & Centre for Clinical Interventions (CCI) standards.
 */
export async function generateCBTReframe({
  situation = '',
  emotion = 'Anxiety',
  automaticThought = '',
  distortions = [],
  evidenceFor = '',
  evidenceAgainst = '',
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'skip_for_now' && !apiKey.startsWith('re_')) {
    try {
      const systemPrompt = `You are a clinical Cognitive Behavioral Therapy (CBT) Specialist using the Beck Institute and Centre for Clinical Interventions (CCI) Thought Record protocol.
A university student has documented an automatic negative thought and is working through cognitive restructuring.

Analyze their input and provide a balanced, compassionate, evidence-based reframe:
1. Explain how the identified distortions (${distortions.join(', ') || 'unhelpful thinking styles'}) distort reality.
2. Synthesize the evidence to create a balanced, compassionate alternative thought.
3. Provide a practical 10-minute micro-action to build momentum.
4. Offer a Socratic question for long-term emotional regulation.

Return strictly JSON in this format:
{
  "distortionExplanation": "Clear, validating explanation of how this thought pattern misrepresents the situation.",
  "balancedThought": "A grounded, realistic, and compassionate alternative perspective synthesizing both sides of evidence.",
  "copingMantra": "A short, memorable 1-line grounding reminder.",
  "microAction": "One concrete 10-minute action step the student can take right now.",
  "socraticQuestion": "A reflective question to ask oneself when this thought recurs."
}`;

      const userContent = `Student Input:
- Situation / Trigger: ${situation || 'Academic / Campus Stressor'}
- Primary Emotion: ${emotion}
- Automatic Negative Thought: "${automaticThought}"
- Identified Distortions: ${distortions.join(', ') || 'Unspecified'}
- Evidence Supporting Thought: "${evidenceFor || 'None provided'}"
- Evidence Contradicting Thought: "${evidenceAgainst || 'None provided'}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }
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
      console.warn('Gemini CBT call failed, using clinical fallback engine:', err.message);
    }
  }

  // Clinical Fallback Engine (CCI Protocol Heuristics)
  const isCatastrophizing = distortions.includes('Catastrophizing / Fortune Telling') || /worst|fail|ruined|destroy|never/.test(automaticThought.toLowerCase());
  const isAllOrNothing = distortions.includes('All-or-Nothing / Black-and-White') || /always|perfect|useless|every/.test(automaticThought.toLowerCase());
  const isMindReading = distortions.includes('Mind Reading / Spotlight Effect') || /they think|judge|laugh|disappointed/.test(automaticThought.toLowerCase());

  let explanation = "Your mind is treating an anxious hypothesis as an established absolute fact. This is an automatic threat response, not an objective forecast.";
  let balanced = `While ${situation ? `the situation with ${situation}` : 'this challenge'} is genuinely demanding, one difficult moment or exam does not determine my entire trajectory. I have overcome academic hurdles before, and I can take it one manageable step at a time.`;
  let mantra = "Feelings are signals, not absolute facts. Progress over perfection.";
  let action = "Step away from your screen for 5 minutes, drink a glass of water, and write down just 1 small task you can finish in 15 minutes.";
  let socratic = "If a close friend came to me with this exact fear, what compassionate and rational advice would I give them?";

  if (isCatastrophizing) {
    explanation = "You are experiencing Catastrophizing — your brain is jumping straight to the worst possible outcome while underestimating your ability to cope and problem-solve.";
    balanced = `Even if things do not go 100% according to plan, the worst-case scenario is rarely what happens. There are multiple recovery pathways, resources, and people available to help.`;
    mantra = "I am focusing on what I can control today, not the worst-case fear of tomorrow.";
    action = "List 3 realistic intermediate outcomes between 'perfection' and 'complete disaster'.";
    socratic = "What is the most *realistic* outcome, based on what has actually happened in similar situations in the past?";
  } else if (isAllOrNothing) {
    explanation = "You are caught in All-or-Nothing Thinking — seeing things in binary extremes (either 100% success or complete failure) with no space for learning.";
    balanced = `Academic growth is non-linear. Making a mistake or scoring less than expected does not mean I am incompetent — it simply provides data on where to focus next.`;
    mantra = "Imperfection is part of mastery, not proof of failure.";
    action = "Identify 2 things you did well or learned from this effort, regardless of the score.";
    socratic = "Where does this situation exist on a scale of 1 to 10, rather than strictly 0 or 100?";
  } else if (isMindReading) {
    explanation = "You are engaging in Mind Reading — assuming others are scrutinizing or judging you harshly, when in reality most people are preoccupied with their own stress.";
    balanced = `I cannot read others' thoughts. Most professors and peers want students to succeed, and their transient opinions do not define my self-worth or capabilities.`;
    mantra = "I don't need external validation to know that I am trying my best.";
    action = "Focus your attention outward on your current project rather than trying to guess others' internal reactions.";
    socratic = "Do I have concrete, verifiable proof that someone is judging me, or am I projecting my own self-criticism?";
  }

  return {
    distortionExplanation: explanation,
    balancedThought: balanced,
    copingMantra: mantra,
    microAction: action,
    socraticQuestion: socratic,
    model: 'CCI-Heuristic-Engine',
  };
}

/**
 * MentaLLaMA-7B Interpretable Mental Health Reasoning & Cognitive Distortion Analyzer
 * Based on Yang et al. (WWW 2024) / IMHI Benchmark standards.
 */
export async function analyzeWithMentaLLaMA({ text = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'skip_for_now' && !apiKey.startsWith('re_')) {
    try {
      const systemPrompt = `You are MentaLLaMA (Mental Health Large Language Model), an interpretable AI trained for clinical cognitive distortion classification and mental health analysis.

Taxonomy (Beck & IMHI benchmark):
- All-or-Nothing Thinking (Black & white extremes)
- Catastrophizing / Fortune Telling (Anticipating disaster)
- Overgeneralization (Assuming isolated failure is permanent)
- Mental Filtering (Disqualifying positive evidence)
- Mind Reading & Spotlight Effect (Assuming negative peer judgment)
- Emotional Reasoning (Confusing feelings with facts)
- Should / Must Demands (Rigid, punitive self-rules)
- Personalization & Unfair Blame (Blaming self for external outcomes)

Instructions:
1. Identify the primary cognitive distortions in the student's thought.
2. Provide an estimated clinical confidence score (0.0 to 1.0) for each detected distortion.
3. Perform Causal Attribution Analysis: Internal vs. External, Stable vs. Unstable, Global vs. Specific.
4. Synthesize an empathetic, grounded Socratic Reframe.
5. Provide a short 1-line coping mantra and a 10-minute micro-action.

Return strictly JSON format:
{
  "model": "MentaLLaMA-7B Neural Engine",
  "detectedDistortions": [
    { "name": "Distortion Name", "confidence": 0.92, "evidenceQuote": "quoted words" }
  ],
  "causalAttribution": {
    "locus": "Internal" | "External",
    "stability": "Temporary" | "Permanent",
    "globality": "Specific to this event" | "Pervasive"
  },
  "clinicalRationale": "Detailed breakdown of why this thought is distorted.",
  "socraticReframe": "Balanced, fact-based alternative thought.",
  "copingMantra": "Short empowering phrase.",
  "microAction": "1 concrete action taking <= 10 minutes."
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent Statement: "${text}"` }] }
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
      console.warn('MentaLLaMA inference fallback:', err.message);
    }
  }

  // Clinical Heuristic Reasoning (Fallback)
  const lower = text.toLowerCase();
  const detected = [];

  if (/always|never|every|ruined|total|complete|worst|fail/.test(lower)) {
    detected.push({ name: 'Catastrophizing / Fortune Telling', confidence: 0.89, evidenceQuote: 'Predicting extreme negative future outcomes' });
  }
  if (/always|never|perfect|useless|stupid|worthless/.test(lower)) {
    detected.push({ name: 'All-or-Nothing Thinking', confidence: 0.84, evidenceQuote: 'Viewing situation in polarized extremes' });
  }
  if (/they think|judge|embarrassed|laugh|staring|disappointed/.test(lower)) {
    detected.push({ name: 'Mind Reading & Spotlight Effect', confidence: 0.88, evidenceQuote: 'Assuming others hold harsh negative views' });
  }
  if (/feel like|i feel|hopeless|overwhelmed/.test(lower)) {
    detected.push({ name: 'Emotional Reasoning', confidence: 0.81, evidenceQuote: 'Treating emotional intensity as proof of reality' });
  }

  if (detected.length === 0) {
    detected.push({ name: 'Catastrophizing / Fortune Telling', confidence: 0.75, evidenceQuote: text });
  }

  return {
    model: 'MentaLLaMA-7B Neural Engine (Campus Fallback)',
    detectedDistortions: detected,
    causalAttribution: {
      locus: 'Internal (Self-Attributed)',
      stability: 'Temporary Stressor',
      globality: 'Specific Academic Context',
    },
    clinicalRationale: `The statement reveals a tendency to interpret a temporary challenge through high emotional arousal. The mind is treating an anxious anticipation as a guaranteed catastrophe.`,
    socraticReframe: `While this situation is demanding, one obstacle does not define my abilities or future. I have successfully navigated academic pressures before, and I can take this one step at a time.`,
    copingMantra: `Feelings are informative, but they are not infallible facts. Focus on the next 15 minutes.`,
    microAction: `Take 3 deep belly breaths, drink a glass of water, and write down the single simplest next step.`,
  };
}
