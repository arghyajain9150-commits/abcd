import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, MessageSquare, Calendar, CheckSquare, Users, ShieldAlert,
  Sparkles, Send, Trash2, ArrowRight, CheckCircle2, Clock, Phone, AlertTriangle,
  Plus, X, ChevronRight, User, ThumbsUp, Flag, RefreshCw, Play, Pause, RotateCcw,
  Check, CalendarCheck, ShieldCheck, MapPin, Search, Wind, Volume2, VolumeX,
  Smile, Frown, Meh, Compass, Feather, Flame, Sparkle, HelpCircle, ArrowLeft,
  BookOpen, Music, CheckCheck, Eye, Activity, Sliders, Award, Layers,
  Printer, Download, AlertCircle, FileText, Scale, Zap, Bookmark, History
} from 'lucide-react';
import { useAuthStore } from '../store/store.js';
import { generateCBTReframe, analyzeWithMentaLLaMA } from '../api/index.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
};

// ─── Centre for Clinical Interventions (CCI) Cognitive Distortions ──
const COGNITIVE_DISTORTIONS = [
  {
    id: 'all_or_nothing',
    name: 'All-or-Nothing Thinking',
    desc: 'Viewing situations in binary black-and-white terms (perfection vs. absolute failure).',
    example: '"If I get one low score, my entire semester is ruined."',
    icon: '⚖️',
  },
  {
    id: 'catastrophizing',
    name: 'Catastrophizing / Fortune Telling',
    desc: 'Predicting the worst-case disaster and assuming you will be unable to cope.',
    example: '"I will definitely freeze during the presentation and humiliate myself."',
    icon: '💥',
  },
  {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    desc: 'Viewing a single difficult event as a permanent, never-ending pattern of defeat.',
    example: '"I couldn\'t solve this lab code, so I\'m hopeless at engineering."',
    icon: '🔁',
  },
  {
    id: 'mental_filter',
    name: 'Mental Filter (Disqualifying Positives)',
    desc: 'Fixating on one single flaw while ignoring a multitude of positive achievements.',
    example: '"The reviewer pointed out one typo, so the entire thesis is worthless."',
    icon: '🔍',
  },
  {
    id: 'mind_reading',
    name: 'Mind Reading & Spotlight Effect',
    desc: 'Assuming others are judging you harshly without any factual confirmation.',
    example: '"They saw my question in the group chat and think I am incompetent."',
    icon: '🧠',
  },
  {
    id: 'emotional_reasoning',
    name: 'Emotional Reasoning',
    desc: 'Believing that because you feel anxious or inadequate, it must be the objective truth.',
    example: '"I feel like an imposter, therefore I must actually be a fraud."',
    icon: '🌊',
  },
  {
    id: 'should_statements',
    name: '"Should" & "Must" Demands',
    desc: 'Imposing rigid, punitive rules upon yourself or others.',
    example: '"I should always be able to study 10 hours straight without losing focus."',
    icon: '📏',
  },
  {
    id: 'personalization',
    name: 'Personalization & Unfair Blame',
    desc: 'Blaming yourself exclusively for circumstances beyond your full control.',
    example: '"Our project submission had bugs because I wasn\'t competent enough."',
    icon: '🎯',
  },
];

// ─── 1. Harvard mindLAMP (BIDMC) Standard PHQ-4 Questions ───────────
const PHQ4_QUESTIONS = [
  {
    id: 'anx1',
    category: 'Anxiety Subscale (GAD-2)',
    subscale: 'Anxiety',
    questionNumber: 1,
    title: 'Nervousness & Restlessness',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
    context: 'Assesses baseline autonomic nervous system arousal and hyper-vigilance during daily academic life.',
  },
  {
    id: 'anx2',
    category: 'Anxiety Subscale (GAD-2)',
    subscale: 'Anxiety',
    questionNumber: 2,
    title: 'Uncontrollable Worrying',
    text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
    context: 'Measures intrusive catastrophic thoughts regarding exams, hostel adjustments, or future deadlines.',
  },
  {
    id: 'dep1',
    category: 'Depression Subscale (PHQ-2)',
    subscale: 'Depression',
    questionNumber: 3,
    title: 'Anhedonia & Low Interest',
    text: 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?',
    context: 'Evaluates emotional blunting and loss of motivation for studies, hobbies, and social interactions.',
  },
  {
    id: 'dep2',
    category: 'Depression Subscale (PHQ-2)',
    subscale: 'Depression',
    questionNumber: 4,
    title: 'Depressed Mood & Hopelessness',
    text: 'Over the last 2 weeks, how often have you been feeling down, depressed, or hopeless?',
    context: 'Screens for pervasive feelings of discouragement, exhaustion, or emotional burnout.',
  },
];

const PHQ4_OPTIONS = [
  {
    points: 0,
    label: 'Not at all',
    desc: 'Zero distress or disruption in your normal daily routine.',
  },
  {
    points: 1,
    label: 'Several days',
    desc: 'Occasional mild tension or fatigue that passes with rest.',
  },
  {
    points: 2,
    label: 'More than half the days',
    desc: 'Frequent worry or low mood noticeably impacting focus & sleep.',
  },
  {
    points: 3,
    label: 'Nearly every day',
    desc: 'Persistent, chronic distress severely affecting academic & personal life.',
  },
];

// ─── 2. Aware 5-4-3-2-1 Somatic Grounding Steps ─────────────────────
const GROUNDING_STEPS = [
  {
    step: 5,
    sense: 'Sight (Visual Anchors)',
    icon: '👁️',
    prompt: 'Look around your room or study space. Name 5 distinct objects you can clearly see right now.',
    examples: ['Your notebook spine', 'A water bottle', 'Window frame', 'Ceiling fan blades', 'Campus clock'],
  },
  {
    step: 4,
    sense: 'Touch (Physical Sensations)',
    icon: '✋',
    prompt: 'Bring awareness to your body. Name 4 physical sensations you can actively feel.',
    examples: ['Feet flat on the floor', 'Desk surface texture', 'Fabric of your shirt', 'Back against the chair'],
  },
  {
    step: 3,
    sense: 'Hearing (Auditory Anchors)',
    icon: '👂',
    prompt: 'Close your eyes for 5 seconds. Name 3 distinct sounds in your campus environment.',
    examples: ['Distant traffic/birds', 'Laptop fan hum', 'Someone walking in the hallway'],
  },
  {
    step: 2,
    sense: 'Smell (Olfactory Anchors)',
    icon: '👃',
    prompt: 'Take a gentle breath in. Name 2 scents or aromas you can detect.',
    examples: ['Fresh air from window', 'Coffee / Tea scent or pencil wood'],
  },
  {
    step: 1,
    sense: 'Taste (Oral Anchor)',
    icon: '👅',
    prompt: 'Notice 1 taste in your mouth, or take a refreshing sip of cold water.',
    examples: ['Sip of water or mint freshness'],
  },
];

// ─── 3. Verified Campus Psychologists ──────────────────────────────
const COUNSELLORS = [
  {
    id: 'c1',
    name: 'Dr. Meera Nambiar',
    title: 'Lead Campus Psychologist & Psychotherapist',
    qualifications: 'M.Phil, Ph.D. in Clinical Psychology (NIMHANS)',
    specializations: ['Exam Stress & Burnout', 'Depressive Symptoms', 'Sleep Disorders'],
    description: '10+ years specializing in undergraduate academic stress, imposter syndrome, and sleep hygiene.',
    room: 'Wellness Centre Room 201',
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
    sessionTypes: ['In-Person (Room 201)', 'Confidential Video Link'],
  },
  {
    id: 'c2',
    name: 'Dr. Rajesh Sharma',
    title: 'Senior Student Wellness Counsellor',
    qualifications: 'M.A., M.Phil (Cognitive Behavioral Therapy)',
    specializations: ['Hostel Adjustment', 'Procrastination', 'Relationship Support'],
    description: 'Practical CBT strategies to overcome chronic study procrastination, social anxiety, and hostel loneliness.',
    room: 'Wellness Centre Room 203',
    availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    sessionTypes: ['In-Person (Room 203)', 'Confidential Video Link'],
  },
  {
    id: 'c3',
    name: 'Ms. Ananya Sen',
    title: 'Youth Mental Health & Crisis Counsellor',
    qualifications: 'M.Sc. Counselling Psychology',
    specializations: ['Panic Attacks', 'Somatic Grounding', 'Mindfulness'],
    description: 'Empathetic guidance focusing on nervous system regulation, breathing biofeedback, and self-compassion.',
    room: 'Wellness Centre Room 205',
    availableSlots: ['10:30 AM', '12:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
    sessionTypes: ['In-Person (Room 205)', 'Confidential Video Link'],
  },
];

// ─── 4. Verified Official 24/7 Crisis Helplines ───────────────────
const CRISIS_RESOURCES = [
  {
    name: 'Tele-MANAS (Govt. of India 24/7 National Mental Health)',
    purpose: 'Free 24/7 confidential tele-counselling across 20+ Indian languages with clinical psychologists and psychiatrists.',
    phone: '14416',
    alt: '1800-891-4416',
    badge: '24/7 Toll-Free',
    isEmergency: true,
  },
  {
    name: 'KIRAN National Mental Health Helpline',
    purpose: 'Ministry of Social Justice 24/7 early screening, psychological first-aid and crisis management.',
    phone: '1800-599-0019',
    badge: '24/7 Toll-Free',
    isEmergency: true,
  },
  {
    name: 'Campus Ambulance & Medical Casualty Desk',
    purpose: '24/7 On-campus emergency paramedic response and immediate hospital dispatch.',
    phone: '108',
    alt: '011-2659-1100',
    badge: 'Campus Emergency Desk',
    isEmergency: true,
  },
  {
    name: 'National Emergency Response (Police, Fire, Ambulance)',
    purpose: 'Unified emergency response services across India.',
    phone: '112',
    badge: 'National Helpline',
    isEmergency: true,
  },
];

// ─── 5. Campus Peer Sticky Notes Wall ──────────────────────────────
const INITIAL_STICKY_NOTES = [
  {
    id: 1,
    tag: 'Academic Stress',
    text: "Felt like everyone in my lab was way smarter than me. Talked to Dr. Meera and realized 90% of students feel imposter syndrome. Be kind to yourself.",
    author: '3rd Year B.Tech',
    time: '2 hours ago',
    likes: 42,
    liked: false,
    color: '#FFF8E6',
  },
  {
    id: 2,
    tag: 'Hostel Life',
    text: "Hostel Block B set up an ORS & paper napkin station on 2nd floor during this flu wave. If you're sick in your room, message the group for meal delivery!",
    author: 'Hostel Council',
    time: '4 hours ago',
    likes: 58,
    liked: false,
    color: '#E4EFEA',
  },
  {
    id: 3,
    tag: 'Exam Grounding',
    text: "The 20-20-20 rule during 6-hour coding stretches saved my eyes and cut down late-night tension headaches. Look 20ft away every 20 mins for 20 secs.",
    author: 'Biotech Dept',
    time: 'Yesterday',
    likes: 31,
    liked: false,
    color: '#EBF3FF',
  },
];

export default function WellnessPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'campus_student';

  // Active View: 'sanctuary' | 'mindlamp' | 'grounding' | 'cbt' | 'breathing' | 'counsellors' | 'notes' | 'crisis'
  const [activeView, setActiveView] = useState('sanctuary');

  // ─── 1. ARTICULATED STEP-BY-STEP mindLAMP ASSESSMENT STATE ───────
  // Step: 'intro' | 'question' | 'report'
  const [testStage, setTestStage] = useState('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { anx1: 0, anx2: 1, dep1: 2, dep2: 0 }
  const [assessmentResult, setAssessmentResult] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_mindlamp_result_${userId}`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleStartTest = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setTestStage('question');
  };

  const handleSelectAnswer = (points) => {
    const currentQ = PHQ4_QUESTIONS[currentQIndex];
    const updatedAnswers = { ...answers, [currentQ.id]: points };
    setAnswers(updatedAnswers);

    if (currentQIndex < PHQ4_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQIndex(currentQIndex + 1);
      }, 180);
    } else {
      // Calculate and finalize assessment
      setTimeout(() => {
        computeAndFinalizeTest(updatedAnswers);
      }, 200);
    }
  };

  const computeAndFinalizeTest = (finalAnswers) => {
    const totalScore = Object.values(finalAnswers).reduce((a, b) => a + (b || 0), 0);
    const anxietyScore = (finalAnswers.anx1 || 0) + (finalAnswers.anx2 || 0);
    const depressionScore = (finalAnswers.dep1 || 0) + (finalAnswers.dep2 || 0);

    let tier = 'Minimal Psychological Distress';
    let riskLevel = 'Low';
    let color = '#1B7A4B';
    let bg = '#D8F3E5';
    let clinicalSummary = 'Your responses reflect a stable, well-regulated psychological baseline. Occasional stress is normal during university semesters.';
    let recommendations = [
      'Maintain steady sleep hygiene (7-8 hours per night).',
      'Use 432Hz ambient focus audio during intensive study blocks.',
      'Take regular 5-minute movement breaks between lectures.',
    ];

    if (totalScore >= 9) {
      tier = 'Severe Distress (High Clinical Priority)';
      riskLevel = 'High';
      color = C.urgent;
      bg = '#FFE8E5';
      clinicalSummary = 'Your screening indicates significant cumulative anxiety and mood burden. These symptoms may be interfering with your ability to focus, rest, or enjoy campus life.';
      recommendations = [
        'Book a free, confidential 1-on-1 consultation with Lead Psychologist Dr. Meera Nambiar.',
        'Reach out to Tele-MANAS (14416) for 24/7 free clinical tele-counselling.',
        'Notify your hostel warden or trusted friend if you feel physically exhausted.',
      ];
    } else if (totalScore >= 6) {
      tier = 'Moderate Psychological Distress';
      riskLevel = 'Moderate';
      color = '#B45309';
      bg = '#FFF4E5';
      clinicalSummary = 'Your screening detects noticeable academic anxiety and fatigue. Proactive coping strategies are strongly recommended before midterms intensify.';
      recommendations = [
        'Schedule a 30-minute stress-management session with Dr. Rajesh Sharma.',
        'Practice the 5-4-3-2-1 Somatic Grounding drill when feeling overwhelmed.',
        'Challenge catastrophic study assumptions using our CBT Reframer.',
      ];
    } else if (totalScore >= 3) {
      tier = 'Mild Campus Stress';
      riskLevel = 'Mild';
      color = C.primary;
      bg = C.primarySoft;
      clinicalSummary = 'Mild stress detected, likely related to impending project deadlines or hostel adjustments.';
      recommendations = [
        'Practice the 4-7-8 parasympathetic breathing reset twice daily.',
        'Stay well hydrated and ensure proper nutrition during lab hours.',
        'Connect with peers in our Campus Solidarity Wall.',
      ];
    }

    const resultObj = {
      totalScore,
      anxietyScore,
      depressionScore,
      tier,
      riskLevel,
      color,
      bg,
      clinicalSummary,
      recommendations,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    setAssessmentResult(resultObj);
    localStorage.setItem(`champ_mindlamp_result_${userId}`, JSON.stringify(resultObj));
    setTestStage('report');
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQIndex(0);
    setTestStage('intro');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // ─── 2. AWARE 5-4-3-2-1 GROUNDING STATE ──────────────────────────
  const [groundingIndex, setGroundingIndex] = useState(0);
  const [groundingCompleted, setGroundingCompleted] = useState(false);

  const handleNextGroundingStep = () => {
    if (groundingIndex < GROUNDING_STEPS.length - 1) {
      setGroundingIndex(groundingIndex + 1);
    } else {
      setGroundingCompleted(true);
    }
  };

  const handleResetGrounding = () => {
    setGroundingIndex(0);
    setGroundingCompleted(false);
  };

  // ─── 3. CENTRE FOR CLINICAL INTERVENTIONS (CCI) THOUGHT RECORD ───
  const [cbtStep, setCbtStep] = useState(1); // 1: Situation & Emotion | 2: Hot Thought | 3: Distortions | 4: Evidence | 5: Reframe & Outcome
  const [cbtSituation, setCbtSituation] = useState('');
  const [cbtEmotion, setCbtEmotion] = useState('Anxiety / Panic');
  const [cbtInitialDistress, setCbtInitialDistress] = useState(75); // 0 - 100%

  const [cbtAutomaticThought, setCbtAutomaticThought] = useState('');
  const [cbtInitialBelief, setCbtInitialBelief] = useState(80); // 0 - 100%

  const [cbtDistortions, setCbtDistortions] = useState(['catastrophizing']);

  const [cbtEvidenceFor, setCbtEvidenceFor] = useState('');
  const [cbtEvidenceAgainst, setCbtEvidenceAgainst] = useState('');

  const [cbtBalancedThought, setCbtBalancedThought] = useState('');
  const [cbtOutcomeDistress, setCbtOutcomeDistress] = useState(30); // 0 - 100%

  const [cbtAIAnalysis, setCbtAIAnalysis] = useState(null);
  const [cbtAILoading, setCbtAILoading] = useState(false);
  const [cbtSavedNotice, setCbtSavedNotice] = useState('');

  const [cbtDiary, setCbtDiary] = useState(() => {
    try {
      const saved = localStorage.getItem('champ_cbt_diary');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleDistortion = (id) => {
    if (cbtDistortions.includes(id)) {
      setCbtDistortions(cbtDistortions.filter((d) => d !== id));
    } else {
      setCbtDistortions([...cbtDistortions, id]);
    }
  };

  const handleRequestAIReframe = async () => {
    if (!cbtAutomaticThought.trim()) return;
    setCbtAILoading(true);
    try {
      const selectedNames = cbtDistortions.map((id) => {
        const item = COGNITIVE_DISTORTIONS.find((d) => d.id === id);
        return item ? item.name : id;
      });

      const res = await generateCBTReframe({
        situation: cbtSituation,
        emotion: cbtEmotion,
        automaticThought: cbtAutomaticThought,
        distortions: selectedNames,
        evidenceFor: cbtEvidenceFor,
        evidenceAgainst: cbtEvidenceAgainst,
      });

      if (res.data) {
        setCbtAIAnalysis(res.data);
        if (!cbtBalancedThought.trim() && res.data.balancedThought) {
          setCbtBalancedThought(res.data.balancedThought);
        }
      }
    } catch (err) {
      console.warn('AI Reframe request fallback:', err);
    } finally {
      setCbtAILoading(false);
    }
  };

  const handleSaveToDiary = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      situation: cbtSituation || 'Academic Event',
      emotion: cbtEmotion,
      initialDistress: cbtInitialDistress,
      automaticThought: cbtAutomaticThought,
      initialBelief: cbtInitialBelief,
      distortions: cbtDistortions,
      evidenceFor: cbtEvidenceFor,
      evidenceAgainst: cbtEvidenceAgainst,
      balancedThought: cbtBalancedThought,
      outcomeDistress: cbtOutcomeDistress,
      relief: Math.max(0, cbtInitialDistress - cbtOutcomeDistress),
      aiAnalysis: cbtAIAnalysis,
    };

    const updated = [newEntry, ...cbtDiary];
    setCbtDiary(updated);
    localStorage.setItem('champ_cbt_diary', JSON.stringify(updated));
    setCbtSavedNotice('✓ Saved to your confidential Thought Diary!');
    setTimeout(() => setCbtSavedNotice(''), 3500);
  };

  const handleResetCBT = () => {
    setCbtStep(1);
    setCbtSituation('');
    setCbtEmotion('Anxiety / Panic');
    setCbtInitialDistress(75);
    setCbtAutomaticThought('');
    setCbtInitialBelief(80);
    setCbtDistortions(['catastrophizing']);
    setCbtEvidenceFor('');
    setCbtEvidenceAgainst('');
    setCbtBalancedThought('');
    setCbtOutcomeDistress(30);
    setCbtAIAnalysis(null);
  };

  // ─── MentaLLaMA-7B Neural Classifier State ───
  const [mentaInput, setMentaInput] = useState('');
  const [mentaResult, setMentaResult] = useState(null);
  const [mentaLoading, setMentaLoading] = useState(false);

  const handleRunMentaLLaMA = async (e) => {
    if (e) e.preventDefault();
    if (!mentaInput.trim()) return;
    setMentaLoading(true);
    try {
      const res = await analyzeWithMentaLLaMA({ text: mentaInput });
      if (res.data) {
        setMentaResult(res.data);
      }
    } catch (err) {
      console.warn('MentaLLaMA scan error:', err);
    } finally {
      setMentaLoading(false);
    }
  };

  const handleAutoFillCCI = (menta) => {
    if (!menta) return;
    setCbtAutomaticThought(mentaInput);
    if (menta.socraticReframe) {
      setCbtBalancedThought(menta.socraticReframe);
    }
    if (menta.detectedDistortions && menta.detectedDistortions.length > 0) {
      const matchedIds = [];
      menta.detectedDistortions.forEach((d) => {
        const found = COGNITIVE_DISTORTIONS.find((cd) => cd.name.toLowerCase().includes(d.name.toLowerCase().slice(0, 8)));
        if (found) matchedIds.push(found.id);
      });
      if (matchedIds.length > 0) setCbtDistortions(matchedIds);
    }
    setCbtStep(3);
  };

  // ─── 4. NATIVE WEB AUDIO AMBIENT SOUNDSCAPE SYNTHESIZER ──────────
  const [soundPlaying, setSoundPlaying] = useState(null);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);

  const stopAudio = () => {
    if (audioNodesRef.current) {
      audioNodesRef.current.forEach((n) => {
        try { n.stop ? n.stop() : n.disconnect(); } catch {}
      });
      audioNodesRef.current = [];
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    setSoundPlaying(null);
  };

  const playSoundscape = (type) => {
    if (soundPlaying === type) {
      stopAudio();
      return;
    }
    stopAudio();

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 750;
        src.connect(filter);
        filter.connect(masterGain);
        src.start();
        audioNodesRef.current = [src, filter, masterGain];
      } else if (type === 'alpha') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(442, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(masterGain);
        osc1.start();
        osc2.start();
        audioNodesRef.current = [osc1, osc2, oscGain, masterGain];
      }
      setSoundPlaying(type);
    } catch (e) {
      console.warn('Web Audio error', e);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // ─── 5. 4-7-8 BREATHING RESET STATE ──────────────────────────────
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    let timer;
    if (breathingActive) {
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c > 1) return c - 1;
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  // ─── 6. COUNSELLOR BOOKING STATE ─────────────────────────────────
  const [counsellorBookings, setCounsellorBookings] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_counsellor_bookings_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSlot, setBookingSlot] = useState('');
  const [sessionType, setSessionType] = useState('In-Person (Room 201)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleConfirmBooking = () => {
    if (!selectedCounsellor || !bookingSlot) return;
    const newBooking = {
      id: Date.now(),
      counsellorName: selectedCounsellor.name,
      room: selectedCounsellor.room,
      date: bookingDate,
      time: bookingSlot,
      type: sessionType,
    };
    const updated = [newBooking, ...counsellorBookings];
    setCounsellorBookings(updated);
    localStorage.setItem(`champ_counsellor_bookings_${userId}`, JSON.stringify(updated));
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedCounsellor(null);
      setBookingSlot('');
    }, 1400);
  };

  const handleCancelBooking = (id) => {
    if (window.confirm('Cancel this confidential counselling appointment?')) {
      const updated = counsellorBookings.filter((b) => b.id !== id);
      setCounsellorBookings(updated);
      localStorage.setItem(`champ_counsellor_bookings_${userId}`, JSON.stringify(updated));
    }
  };

  // ─── 7. STICKY NOTES STATE ───────────────────────────────────────
  const [stickyNotes, setStickyNotes] = useState(INITIAL_STICKY_NOTES);

  const handleLikeNote = (id) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, likes: n.liked ? n.likes - 1 : n.likes + 1, liked: !n.liked } : n))
    );
  };

  // ─── NAV TABS ────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'sanctuary',   label: '✨ Sanctuary Home',      Icon: HeartPulse },
    { id: 'mindlamp',    label: '📊 mindLAMP Test (PHQ-4)', Icon: Activity },
    { id: 'grounding',   label: '👁️ 5-4-3-2-1 Grounding', Icon: Compass },
    { id: 'cbt',         label: '🧠 CBT Reframer',        Icon: Sparkles },
    { id: 'breathing',   label: '🫁 4-7-8 Breathing',     Icon: Wind },
    { id: 'counsellors', label: '🩺 Book Psychologist',   Icon: User },
    { id: 'notes',       label: '💌 Solidarity Wall',     Icon: Users },
    { id: 'crisis',      label: '🚨 Crisis SOS',          Icon: ShieldAlert, highlight: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ─── Top Ambient Bar with Harvard mindLAMP Badge ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 22,
          padding: '16px 20px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 8px 30px -8px rgba(23,50,44,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Feather size={22} color="#FFE699" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A3D9C9' }}>
                Open Health & mindLAMP Clinical Platform
              </span>
              <span style={{ fontSize: 10.5, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                Harvard BIDMC Standard
              </span>
            </div>
            <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
              Campus Mental Health Sanctuary
            </div>
          </div>
        </div>

        {/* Ambient Web Audio Focus Synthesizer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.25)', padding: '6px 12px', borderRadius: 14 }}>
          <Music size={15} color="#FFE699" />
          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>Focus Audio:</span>
          
          <button
            onClick={() => playSoundscape('rain')}
            style={{
              background: soundPlaying === 'rain' ? '#FFE699' : 'rgba(255,255,255,0.15)',
              color: soundPlaying === 'rain' ? '#17322C' : '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🌧️ Rain {soundPlaying === 'rain' ? '▶' : ''}
          </button>

          <button
            onClick={() => playSoundscape('alpha')}
            style={{
              background: soundPlaying === 'alpha' ? '#FFE699' : 'rgba(255,255,255,0.15)',
              color: soundPlaying === 'alpha' ? '#17322C' : '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🧘 432Hz Alpha {soundPlaying === 'alpha' ? '▶' : ''}
          </button>

          {soundPlaying && (
            <button
              onClick={stopAudio}
              title="Stop Ambient Audio"
              style={{ background: 'rgba(214,72,60,0.85)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}
            >
              <VolumeX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ─── */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: C.surface,
          borderRadius: 14,
          padding: 4,
          border: `1px solid ${C.border}`,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {NAV_ITEMS.map(({ id, label, Icon, highlight }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isActive
                  ? highlight ? C.urgent : C.primary
                  : highlight ? C.urgentSoft : 'transparent',
                color: isActive ? '#fff' : highlight ? C.urgent : C.soft,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Subview Back Navigation Header */}
      {activeView !== 'sanctuary' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 2 }}>
          <button
            onClick={() => setActiveView('sanctuary')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: C.surface,
              border: `1.5px solid ${C.border}`,
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 12.5,
              fontWeight: 700,
              color: C.primary,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Sanctuary Dashboard</span>
          </button>

          <span style={{ fontSize: 11.5, color: C.soft }}>
            Sanctuary / <strong style={{ color: C.ink }}>{NAV_ITEMS.find((n) => n.id === activeView)?.label}</strong>
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 1: SANCTUARY DASHBOARD
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'sanctuary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* mindLAMP Clinical Assessment Banner */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={22} color={C.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>
                  mindLAMP Standard Clinical Assessment (PHQ-4)
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                  {assessmentResult ? `Latest Assessment: ${assessmentResult.totalScore}/12 (${assessmentResult.tier}) · ${assessmentResult.date}` : '45-second clinical anxiety and mood screener based on Harvard BIDMC research.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveView('mindlamp');
                if (!assessmentResult) setTestStage('intro');
                else setTestStage('report');
              }}
              style={{ background: C.primary, color: '#fff', padding: '8px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {assessmentResult ? 'View Detailed Report →' : 'Start Clinical Screener →'}
            </button>
          </div>

          {/* 3 Prominent Open-Source Clinical Tools Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            
            {/* Tool 1: 5-4-3-2-1 Sensory Grounding */}
            <div
              onClick={() => setActiveView('grounding')}
              style={{
                background: C.surface,
                borderRadius: 18,
                padding: 16,
                border: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#EBF3FF', color: '#2563EB', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                    Aware Framework
                  </span>
                  <span style={{ fontSize: 20 }}>👁️</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginTop: 8 }}>
                  5-4-3-2-1 Somatic Grounding
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 4, lineHeight: 1.4 }}>
                  Step-by-step sensory anchoring tool to immediately stop acute panic and study overwhelm.
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Start Grounding →</span>
            </div>

            {/* Tool 2: CBT Thought Challenger */}
            <div
              onClick={() => setActiveView('cbt')}
              style={{
                background: C.surface,
                borderRadius: 18,
                padding: 16,
                border: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#FFF4E5', color: '#B45309', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                    MentaLLaMA & CCI
                  </span>
                  <span style={{ fontSize: 20 }}>🧠</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginTop: 8 }}>
                  CBT Thought Challenger
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 4, lineHeight: 1.4 }}>
                  Identify cognitive distortions (Catastrophizing, All-or-Nothing) and generate balanced rational facts.
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Challenge a Thought →</span>
            </div>

            {/* Tool 3: 4-7-8 Breathing Reset */}
            <div
              onClick={() => setActiveView('breathing')}
              style={{
                background: C.surface,
                borderRadius: 18,
                padding: 16,
                border: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: '#D8F3E5', color: '#1B7A4B', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                    Vagal Stimulation
                  </span>
                  <span style={{ fontSize: 20 }}>🫁</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginTop: 8 }}>
                  4-7-8 Parasympathetic Reset
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 4, lineHeight: 1.4 }}>
                  Guided biofeedback pacing (Inhale 4s, Hold 7s, Exhale 8s) to decelerate heart rate.
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>Start 2-Min Reset →</span>
            </div>
          </div>

          {/* 2-Column Campus Support & Solidarity Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* Campus Psychologists */}
            <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>🩺 Campus Psychologists</div>
                <button onClick={() => setActiveView('counsellors')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
              </div>

              {counsellorBookings.length > 0 ? (
                <div style={{ background: C.primarySoft, borderRadius: 12, padding: 12, border: `1px solid ${C.primary}` }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>{counsellorBookings[0].counsellorName}</div>
                  <div style={{ fontSize: 11.5, color: C.soft }}>{counsellorBookings[0].date} at {counsellorBookings[0].time} · {counsellorBookings[0].type}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg, padding: '10px 12px', borderRadius: 12 }}>
                  <span style={{ fontSize: 12, color: C.soft }}>No active sessions booked</span>
                  <button onClick={() => setActiveView('counsellors')} style={{ background: C.primary, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>Book Session</button>
                </div>
              )}
            </div>

            {/* Solidarity Wall Preview */}
            <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>💌 Campus Solidarity Wall</div>
                <button onClick={() => setActiveView('notes')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
              </div>

              <div style={{ background: stickyNotes[0]?.color || '#FFF8E6', borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.ink }}>"{stickyNotes[0]?.text}"</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 10.5, color: C.soft }}>
                  <span>{stickyNotes[0]?.author}</span>
                  <span style={{ fontWeight: 700, color: C.primary }}>❤️ {stickyNotes[0]?.likes} relate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 2: WORLD-CLASS ARTICULATED STEP-BY-STEP mindLAMP ASSESSMENT
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'mindlamp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* ── STAGE A: INTRO / ONBOARDING SCREEN ── */}
          {testStage === 'intro' && (
            <div
              style={{
                background: C.surface,
                borderRadius: 24,
                padding: '36px 24px',
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 18,
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 18, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={28} color={C.primary} />
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Harvard BIDMC Digital Psychiatry Framework
                </span>
                <div className="champ-heading" style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 4 }}>
                  mindLAMP Clinical Anxiety & Mood Screener (PHQ-4)
                </div>
                <div style={{ fontSize: 13, color: C.soft, maxWidth: 540, marginTop: 8, lineHeight: 1.55 }}>
                  This standardized 4-question clinical assessment is used globally by universities and clinics to measure <strong>Generalized Anxiety (GAD-2)</strong> and <strong>Depression (PHQ-2)</strong> levels over the past 14 days.
                </div>
              </div>

              {/* Quality & Safety Badges */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ background: C.bg, padding: '6px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}` }}>
                  🔒 100% Confidential & Private
                </span>
                <span style={{ background: C.bg, padding: '6px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}` }}>
                  ⏱️ 45 Seconds
                </span>
                <span style={{ background: C.bg, padding: '6px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}` }}>
                  🩺 Clinically Validated Scoring
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleStartTest}
                  style={{
                    background: C.primary,
                    color: '#fff',
                    padding: '12px 32px',
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(47,122,104,0.3)',
                  }}
                >
                  <span>Begin Assessment</span>
                  <ArrowRight size={16} />
                </button>

                {assessmentResult && (
                  <button
                    onClick={() => setTestStage('report')}
                    style={{
                      background: C.bg,
                      color: C.ink,
                      padding: '12px 20px',
                      borderRadius: 14,
                      fontSize: 13.5,
                      fontWeight: 700,
                      border: `1px solid ${C.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    View Past Report
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STAGE B: STEP-BY-STEP QUESTION WIZARD ── */}
          {testStage === 'question' && (
            <div
              style={{
                background: C.surface,
                borderRadius: 24,
                padding: '28px 24px',
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Progress Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {PHQ4_QUESTIONS[currentQIndex].category} · Question {currentQIndex + 1} of 4
                  </span>
                  <span style={{ fontSize: 11.5, color: C.soft, fontWeight: 700 }}>
                    {Math.round(((currentQIndex + 1) / 4) * 100)}% Completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: 6, background: C.bg, borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${((currentQIndex + 1) / 4) * 100}%`,
                      height: '100%',
                      background: C.primary,
                      transition: 'width 0.3s ease-in-out',
                    }}
                  />
                </div>
              </div>

              {/* Question Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>
                  {PHQ4_QUESTIONS[currentQIndex].title}
                </span>
                <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink, lineHeight: 1.35 }}>
                  {PHQ4_QUESTIONS[currentQIndex].text}
                </div>
                <div style={{ fontSize: 12, color: C.soft, fontStyle: 'italic', marginTop: 2 }}>
                  {PHQ4_QUESTIONS[currentQIndex].context}
                </div>
              </div>

              {/* 4 Interactive Option Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PHQ4_OPTIONS.map((opt) => {
                  const currentQ = PHQ4_QUESTIONS[currentQIndex];
                  const isSelected = answers[currentQ.id] === opt.points;
                  return (
                    <button
                      key={opt.points}
                      onClick={() => handleSelectAnswer(opt.points)}
                      style={{
                        background: isSelected ? C.primarySoft : '#fff',
                        border: `2px solid ${isSelected ? C.primary : C.border}`,
                        borderRadius: 16,
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(47,122,104,0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14.5, color: isSelected ? C.primary : C.ink }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 11.5, color: isSelected ? C.primary : C.soft, marginTop: 2 }}>
                          {opt.desc}
                        </div>
                      </div>

                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? C.primary : C.border}`,
                          background: isSelected ? C.primary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Back / Next Footers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(currentQIndex - 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentQIndex === 0 ? '#bbb' : C.soft,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: currentQIndex === 0 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ArrowLeft size={14} /> Previous Question
                </button>

                <span style={{ fontSize: 11.5, color: C.soft }}>
                  Tap any option to auto-advance
                </span>
              </div>
            </div>
          )}

          {/* ── STAGE C: ARTICULATED CLINICAL REPORT & DIAGNOSTIC SLIP ── */}
          {testStage === 'report' && assessmentResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Main Clinical Diagnostic Slip */}
              <div
                style={{
                  background: C.surface,
                  borderRadius: 24,
                  padding: '24px 22px',
                  border: `1.5px solid ${C.border}`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Header with Print & Retake buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Diagnostic Result · Harvard mindLAMP Protocol
                    </span>
                    <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                      Psychological Assessment Summary
                    </div>
                    <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>
                      Generated for <strong>{user?.name || 'Campus Student'}</strong> on {assessmentResult.date}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={handlePrintReport}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.ink, padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Printer size={13} /> Print Summary Slip
                    </button>
                    <button
                      onClick={handleRetake}
                      style={{ background: C.primary, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <RotateCcw size={13} /> Retake Test
                    </button>
                  </div>
                </div>

                {/* Score Severity Banner */}
                <div style={{ background: assessmentResult.bg, borderRadius: 18, padding: 18, border: `1.5px solid ${assessmentResult.color}44`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: assessmentResult.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Clinical Classification ({assessmentResult.riskLevel} Risk)
                      </span>
                      <div style={{ fontSize: 18, fontWeight: 800, color: assessmentResult.color, marginTop: 2 }}>
                        {assessmentResult.tier}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>PHQ-4 Index</span>
                      <div style={{ fontSize: 26, fontWeight: 900, color: assessmentResult.color, lineHeight: 1 }}>
                        {assessmentResult.totalScore} <span style={{ fontSize: 14, fontWeight: 600, color: C.soft }}>/ 12</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Segmented Severity Bar */}
                  <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 99, overflow: 'hidden', background: 'rgba(0,0,0,0.06)', marginTop: 4 }}>
                    <div style={{ flex: 2, background: '#1B7A4B', opacity: assessmentResult.totalScore <= 2 ? 1 : 0.25 }} title="Minimal (0-2)" />
                    <div style={{ flex: 3, background: C.primary, opacity: assessmentResult.totalScore >= 3 && assessmentResult.totalScore <= 5 ? 1 : 0.25 }} title="Mild (3-5)" />
                    <div style={{ flex: 3, background: '#B45309', opacity: assessmentResult.totalScore >= 6 && assessmentResult.totalScore <= 8 ? 1 : 0.25 }} title="Moderate (6-8)" />
                    <div style={{ flex: 4, background: C.urgent, opacity: assessmentResult.totalScore >= 9 ? 1 : 0.25 }} title="Severe (9-12)" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.soft, fontWeight: 700 }}>
                    <span>0 Minimal</span>
                    <span>3 Mild</span>
                    <span>6 Moderate</span>
                    <span>12 Severe</span>
                  </div>
                </div>

                {/* Subscale Breakdown Breakdown Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: C.bg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>Anxiety Subscale (GAD-2)</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                      {assessmentResult.anxietyScore} <span style={{ fontSize: 12, color: C.soft }}>/ 6</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>
                      {assessmentResult.anxietyScore >= 3 ? '⚠️ Elevated Anxiety: Frequent autonomic worry' : '✓ Normal Anxiety Baseline'}
                    </div>
                  </div>

                  <div style={{ background: C.bg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>Depression Subscale (PHQ-2)</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                      {assessmentResult.depressionScore} <span style={{ fontSize: 12, color: C.soft }}>/ 6</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>
                      {assessmentResult.depressionScore >= 3 ? '⚠️ Elevated Low Mood: Anhedonia & low energy' : '✓ Normal Mood Baseline'}
                    </div>
                  </div>
                </div>

                {/* Clinical Interpretation & Narrative */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>📋 Clinical Narrative Interpretation</div>
                  <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5, background: '#FAFAFA', padding: 12, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    {assessmentResult.clinicalSummary}
                  </div>
                </div>

                {/* Tailored Medical Action Plan */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>🎯 Tailored Action Plan</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {assessmentResult.recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: C.ink }}>
                        <CheckCircle2 size={16} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instant Triage Referral Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
                  <button
                    onClick={() => setActiveView('counsellors')}
                    style={{ background: C.primary, color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CalendarCheck size={15} /> Book Free Session with Dr. Meera Nambiar
                  </button>

                  <button
                    onClick={() => setActiveView('grounding')}
                    style={{ background: C.bg, color: C.ink, padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Compass size={15} /> Open 5-4-3-2-1 Somatic Drill
                  </button>

                  {assessmentResult.totalScore >= 6 && (
                    <button
                      onClick={() => setActiveView('crisis')}
                      style={{ background: C.urgent, color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <ShieldAlert size={15} /> 24/7 Tele-MANAS (14416)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 3: AWARE 5-4-3-2-1 SOMATIC SENSORY GROUNDING ENGINE
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'grounding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 22, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                  5-4-3-2-1 Somatic Sensory Grounding
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                  Used clinically to de-escalate panic attacks and academic tunnel-vision by activating all 5 senses.
                </div>
              </div>
              <span style={{ fontSize: 11, background: '#EBF3FF', color: '#2563EB', padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
                Step {groundingIndex + 1} of 5
              </span>
            </div>

            {groundingCompleted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={46} color={C.primary} />
                <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>
                  Somatic Regulation Complete ✨
                </div>
                <div style={{ fontSize: 13, color: C.soft, maxWidth: 440 }}>
                  Your sensory cortex has pulled your nervous system out of fight-or-flight into the present moment. Take a slow sip of water.
                </div>
                <button
                  onClick={handleResetGrounding}
                  style={{ background: C.primary, color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}
                >
                  Restart Grounding
                </button>
              </div>
            ) : (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{GROUNDING_STEPS[groundingIndex].icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                      Step {GROUNDING_STEPS[groundingIndex].step} · {GROUNDING_STEPS[groundingIndex].sense}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                      {GROUNDING_STEPS[groundingIndex].prompt}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.soft, marginBottom: 6 }}>Campus Examples to spot:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {GROUNDING_STEPS[groundingIndex].examples.map((ex, i) => (
                      <span key={i} style={{ background: C.bg, padding: '3px 8px', borderRadius: 6, fontSize: 11, color: C.ink, fontWeight: 600 }}>
                        ✓ {ex}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextGroundingStep}
                  style={{ background: C.primary, color: '#fff', padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span>I have identified these ({GROUNDING_STEPS[groundingIndex].step})</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 4: MENTALLAMA & CCI CBT THOUGHT CHALLENGER
      ──────────────────────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────
          VIEW 4: CENTRE FOR CLINICAL INTERVENTIONS (CCI) THOUGHT RECORD
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'cbt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 22, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            
            {/* Header & Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primarySoft, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={18} />
                  </div>
                  <div>
                    <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                      CCI Cognitive Thought Challenger & Restructuring
                    </div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                      Centre for Clinical Interventions (CCI) standard 5-step empirical protocol to reframe automatic negative thoughts.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, background: '#F3E8FF', color: '#7E22CE', padding: '4px 10px', borderRadius: 99, fontWeight: 800 }}>
                  🧠 MentaLLaMA-7B Neural Engine
                </span>
                <span style={{ fontSize: 11, background: C.primarySoft, color: C.primary, padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
                  📋 Beck & CCI Protocol
                </span>
                <span style={{ fontSize: 11, background: '#EBF3FF', color: '#2563EB', padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
                  🔒 100% Confidential
                </span>
              </div>
            </div>

            {/* ─── MentaLLaMA-7B Quick Neural Distortion Scanner ─── */}
            <div style={{ background: '#FAF5FF', borderRadius: 16, padding: 16, border: '1.5px solid #E9D5FF', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} color="#7E22CE" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#6B21A8' }}>
                    MentaLLaMA Neural Distortion Classifier (Yang et al. WWW 2024)
                  </span>
                </div>
                <span style={{ fontSize: 10.5, color: '#7E22CE', fontWeight: 700, background: '#fff', padding: '2px 8px', borderRadius: 6, border: '1px solid #E9D5FF' }}>
                  IMHI Benchmark Calibrated
                </span>
              </div>

              <form onSubmit={handleRunMentaLLaMA} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  rows={2}
                  placeholder="Type any raw intrusive thought (e.g. 'If I do not score 90% in this exam, my entire engineering degree is ruined and everyone will judge me')..."
                  value={mentaInput}
                  onChange={(e) => setMentaInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D8B4FE', fontSize: 12.5, background: '#fff', resize: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={mentaLoading || !mentaInput.trim()}
                    style={{
                      background: '#7E22CE',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(126,34,206,0.25)',
                    }}
                  >
                    <Sparkles size={13} />
                    {mentaLoading ? 'Running MentaLLaMA Inference…' : 'Run MentaLLaMA Neural Analysis'}
                  </button>
                </div>
              </form>

              {/* MentaLLaMA Results Display */}
              {mentaResult && (
                <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1.5px solid #D8B4FE', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3E8FF', paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase' }}>
                      ⚡ Neural Diagnostic: {mentaResult.model}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAutoFillCCI(mentaResult)}
                      style={{
                        background: C.primary,
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>Transfer to 5-Step Worksheet</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>

                  {/* Detected Distortions Badges */}
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Detected Distortions & Confidence:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {mentaResult.detectedDistortions?.map((d, i) => (
                        <div key={i} style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#6B21A8' }}>{d.name}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 800, background: '#7E22CE', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>
                            {Math.round((d.confidence || 0.85) * 100)}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Causal Attribution Tags */}
                  {mentaResult.causalAttribution && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: C.bg, padding: '6px 10px', borderRadius: 8, fontSize: 11 }}>
                      <span><strong>Locus:</strong> {mentaResult.causalAttribution.locus}</span>
                      <span>• <strong>Stability:</strong> {mentaResult.causalAttribution.stability}</span>
                      <span>• <strong>Globality:</strong> {mentaResult.causalAttribution.globality}</span>
                    </div>
                  )}

                  {/* Socratic Reframe & Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.4 }}>
                      <strong>💡 MentaLLaMA Reframe:</strong> {mentaResult.socraticReframe}
                    </div>
                    {mentaResult.copingMantra && (
                      <div style={{ fontSize: 11.5, color: '#7E22CE', fontWeight: 700 }}>
                        🎯 Mantra: "{mentaResult.copingMantra}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Progress Bar (Steps 1 to 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, background: C.bg, padding: 4, borderRadius: 14, border: `1px solid ${C.border}` }}>
              {[
                { step: 1, label: '1. Situation & Emotion' },
                { step: 2, label: '2. Hot Thought' },
                { step: 3, label: '3. Distortions' },
                { step: 4, label: '4. Evidence Test' },
                { step: 5, label: '5. Balanced Reframe' },
              ].map((s) => {
                const isCurrent = cbtStep === s.step;
                const isPast = cbtStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCbtStep(s.step)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: isCurrent ? 800 : 600,
                      background: isCurrent ? C.primary : (isPast ? C.primarySoft : 'transparent'),
                      color: isCurrent ? '#fff' : (isPast ? C.primary : C.soft),
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* STEP 1: Situation & Emotion */}
            {cbtStep === 1 && (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    Step 1 of 5 · Situation & Emotional Trigger
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                    What event or situation triggered this wave of distress?
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                    Be objective (e.g. "Received grade on mid-term paper", "Hostel placement interview tomorrow morning").
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Triggering Situation</label>
                  <input
                    type="text"
                    placeholder="e.g. Struggling with the CS lab assignment while my lab partners seem to finish quickly..."
                    value={cbtSituation}
                    onChange={(e) => setCbtSituation(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Primary Emotion Felt</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {['Anxiety / Panic', 'Academic Overwhelm', 'Depressed / Hopeless', 'Anger / Frustration', 'Imposter Syndrome', 'Guilt / Self-Blame'].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setCbtEmotion(emo)}
                        style={{
                          background: cbtEmotion === emo ? C.primary : '#fff',
                          color: cbtEmotion === emo ? '#fff' : C.ink,
                          border: `1px solid ${cbtEmotion === emo ? C.primary : C.border}`,
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>Initial Emotional Distress Intensity</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: C.urgent }}>{cbtInitialDistress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cbtInitialDistress}
                    onChange={(e) => setCbtInitialDistress(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: C.urgent, marginTop: 6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.soft, marginTop: 2 }}>
                    <span>0% (Calm / Neutral)</span>
                    <span>50% (Moderate Distress)</span>
                    <span>100% (Overwhelming Crisis)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCbtStep(2)}
                    style={{ background: C.primary, color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Proceed to Identify Hot Thought</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Automatic Negative "Hot" Thought */}
            {cbtStep === 2 && (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    Step 2 of 5 · Catch the Automatic "Hot" Thought
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                    What exact thought, unhelpful rule, or fear flashed in your mind?
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                    What did you tell yourself this situation meant about your competence or future?
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Automatic Negative Thought</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 'If I cannot solve this single lab problem, I will fail the course, disappoint my parents, and my entire engineering degree is a mistake.'..."
                    value={cbtAutomaticThought}
                    onChange={(e) => setCbtAutomaticThought(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', resize: 'none' }}
                  />
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>How strongly do you believe this thought right now?</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: C.ink }}>{cbtInitialBelief}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cbtInitialBelief}
                    onChange={(e) => setCbtInitialBelief(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: C.primary, marginTop: 6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.soft, marginTop: 2 }}>
                    <span>0% (Not convinced)</span>
                    <span>50% (Partially true)</span>
                    <span>100% (Absolute certainty)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCbtStep(1)}
                    style={{ background: '#fff', color: C.soft, border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCbtStep(3)}
                    disabled={!cbtAutomaticThought.trim()}
                    style={{ background: C.primary, color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: !cbtAutomaticThought.trim() ? 0.6 : 1 }}
                  >
                    <span>Analyze Cognitive Distortions</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Cognitive Distortions Identifier */}
            {cbtStep === 3 && (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    Step 3 of 5 · Pinpoint Cognitive Distortions
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                    Which unhelpful thinking styles are present in your hot thought?
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                    Select all distortions that apply to understand how your brain is distorting reality.
                  </div>
                </div>

                {/* Distortions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                  {COGNITIVE_DISTORTIONS.map((d) => {
                    const isSelected = cbtDistortions.includes(d.id);
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleToggleDistortion(d.id)}
                        style={{
                          background: isSelected ? '#F0F9F5' : '#fff',
                          border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                          borderRadius: 12,
                          padding: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(47,122,104,0.12)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{d.icon}</span>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: isSelected ? C.primary : C.ink }}>
                              {d.name}
                            </span>
                          </div>
                          <div style={{ width: 18, height: 18, borderRadius: 6, border: `1.5px solid ${isSelected ? C.primary : C.border}`, background: isSelected ? C.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isSelected && <Check size={12} color="#fff" />}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.35 }}>
                          {d.desc}
                        </div>
                        <div style={{ fontSize: 10.5, color: isSelected ? C.primary : C.soft, fontStyle: 'italic', marginTop: 2, background: isSelected ? '#E4EFEA' : C.bg, padding: '3px 6px', borderRadius: 4 }}>
                          {d.example}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCbtStep(2)}
                    style={{ background: '#fff', color: C.soft, border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCbtStep(4)}
                    style={{ background: C.primary, color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Proceed to Test Evidence</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Dual-Column Evidence Examination */}
            {cbtStep === 4 && (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    Step 4 of 5 · Empirical Evidence Examination
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                    Put your thought on trial: Facts supporting vs. Facts contradicting
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                    Only include concrete facts that would stand up in a court of law. Feelings and assumptions are not evidence.
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Thought on Trial:</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.urgent, marginTop: 2 }}>"{cbtAutomaticThought}"</div>
                </div>

                {/* Dual-Column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  
                  {/* Evidence FOR */}
                  <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: `1.5px solid #F5C6BA`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>📝</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>
                        Evidence That Truly SUPPORTS the Thought
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: C.soft }}>
                      What concrete objective facts (not feelings) support this belief?
                    </div>
                    <textarea
                      rows={4}
                      placeholder="e.g. I did score 12/20 on Quiz 1, and there are 2 tricky topics I haven't fully mastered yet..."
                      value={cbtEvidenceFor}
                      onChange={(e) => setCbtEvidenceFor(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none' }}
                    />
                  </div>

                  {/* Evidence AGAINST */}
                  <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: `1.5px solid #B8E0D2`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🔍</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                        Evidence That CONTRADICTS the Thought
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: C.soft }}>
                      What past resilience, counter-examples, or alternative facts exist?
                    </div>
                    <textarea
                      rows={4}
                      placeholder="e.g. I passed previous semesters, the final exam is worth 50%, professor holds office hours on Tuesday, and quiz 1 was only worth 5%..."
                      value={cbtEvidenceAgainst}
                      onChange={(e) => setCbtEvidenceAgainst(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none' }}
                    />
                  </div>
                </div>

                {/* Socratic Helper Questions */}
                <div style={{ background: '#FFFDF5', borderRadius: 12, padding: 12, border: `1px solid #F5E6B3`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>💡 Socratic Questions to Stimulate Counter-Evidence:</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      'What would I tell my best friend in this exact situation?',
                      'Have I survived and overcome a similar challenge before?',
                      'What is the most realistic middle-ground outcome between 0 and 100%?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCbtEvidenceAgainst(prev => prev ? `${prev}\n• ${q}` : `• ${q}`)}
                        style={{ background: '#fff', border: '1px solid #F5D590', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#92400E', cursor: 'pointer', textAlign: 'left' }}
                      >
                        + "{q}"
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setCbtStep(3)}
                    style={{ background: '#fff', color: C.soft, border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCbtStep(5)}
                    style={{ background: C.primary, color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Proceed to Balanced Reframe</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Balanced Alternative Reframe & Measured Relief */}
            {cbtStep === 5 && (
              <div style={{ background: C.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    Step 5 of 5 · Balanced Perspective & Distress Reduction
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                    Synthesize the evidence into a balanced, compassionate, and realistic fact.
                  </div>
                </div>

                {/* AI Assistant Reframe Trigger */}
                <div style={{ background: '#F0F9F5', borderRadius: 14, padding: 14, border: `1.5px solid ${C.primary}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} color={C.primary} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>
                        AI Socratic CBT Assistant (Beck Institute Engine)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestAIReframe}
                      disabled={cbtAILoading}
                      style={{
                        background: C.primary,
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Sparkles size={13} /> {cbtAILoading ? 'Synthesizing CBT Analysis…' : 'Generate Clinical Socratic Reframe'}
                    </button>
                  </div>

                  {cbtAIAnalysis && (
                    <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${C.primarySoft}`, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      <div>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>Distortion Diagnosis:</span>
                        <div style={{ fontSize: 12.5, color: C.ink, marginTop: 2 }}>{cbtAIAnalysis.distortionExplanation}</div>
                      </div>

                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>💡 Recommended Balanced Thought:</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2, lineHeight: 1.4 }}>{cbtAIAnalysis.balancedThought}</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 2 }}>
                        <div style={{ background: C.primarySoft, borderRadius: 8, padding: 8, fontSize: 11.5, color: C.primary, fontWeight: 700 }}>
                          🎯 Coping Mantra: "{cbtAIAnalysis.copingMantra}"
                        </div>
                        <div style={{ background: '#FFF8E6', borderRadius: 8, padding: 8, fontSize: 11.5, color: '#B45309', fontWeight: 700 }}>
                          ⏱️ 10-Min Micro Action: {cbtAIAnalysis.microAction}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User's Final Balanced Thought */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Your Final Balanced & Realistic Perspective</label>
                  <textarea
                    rows={3}
                    placeholder="Write a balanced, compassionate summary of the situation (e.g. 'While this lab is challenging, getting stuck is normal in programming. One difficult lab does not mean I am failing my degree, and I will attend tomorrow's TA session to clarify my questions.')..."
                    value={cbtBalancedThought}
                    onChange={(e) => setCbtBalancedThought(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.primary}`, fontSize: 13, background: '#fff', resize: 'none' }}
                  />
                </div>

                {/* Re-Rate Emotional Distress & Relief Metric */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#1B7A4B', textTransform: 'uppercase' }}>
                        Re-Rate Your Emotional Distress Now
                      </span>
                      <div style={{ fontSize: 12, color: C.soft }}>After examining the facts, how intense is your distress now?</div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#1B7A4B' }}>{cbtOutcomeDistress}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={cbtOutcomeDistress}
                    onChange={(e) => setCbtOutcomeDistress(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#1B7A4B' }}
                  />

                  {/* Calculated Relief Score */}
                  <div style={{ background: '#EAF8F0', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={18} color="#1B7A4B" />
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1B7A4B' }}>
                        Cognitive Shift Achieved:
                      </span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#1B7A4B' }}>
                      📉 {Math.max(0, cbtInitialDistress - cbtOutcomeDistress)}% Drop in Distress ({cbtInitialDistress}% → {cbtOutcomeDistress}%)
                    </span>
                  </div>
                </div>

                {/* Save & Export Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setCbtStep(4)}
                    style={{ background: '#fff', color: C.soft, border: `1px solid ${C.border}`, padding: '10px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{ background: '#fff', color: C.ink, border: `1px solid ${C.border}`, padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Printer size={14} /> Print Worksheet
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveToDiary}
                      style={{ background: C.primary, color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Bookmark size={14} /> Save to Thought Diary
                    </button>

                    <button
                      type="button"
                      onClick={handleResetCBT}
                      style={{ background: C.bg, color: C.ink, border: `1px solid ${C.border}`, padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      New Record
                    </button>
                  </div>
                </div>

                {cbtSavedNotice && (
                  <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: C.primary, background: C.primarySoft, padding: 8, borderRadius: 8 }}>
                    {cbtSavedNotice}
                  </div>
                )}
              </div>
            )}

            {/* Thought Diary History Section */}
            {cbtDiary.length > 0 && (
              <div style={{ marginTop: 10, borderTop: `1.5px solid ${C.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <History size={16} color={C.primary} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>
                      Confidential Thought Diary ({cbtDiary.length} Records)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear all saved thought records?')) {
                        localStorage.removeItem('champ_cbt_diary');
                        setCbtDiary([]);
                      }
                    }}
                    style={{ background: 'transparent', color: C.urgent, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Clear History
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cbtDiary.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: C.bg,
                        borderRadius: 12,
                        padding: 14,
                        border: `1px solid ${C.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.soft }}>{item.date} · {item.emotion}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, background: '#EAF8F0', color: '#1B7A4B', padding: '2px 8px', borderRadius: 6 }}>
                          📉 -{item.relief}% Relief
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: C.urgent, fontWeight: 600 }}>
                        ❌ Hot Thought: "{item.automaticThought}"
                      </div>
                      <div style={{ fontSize: 12.5, color: C.primary, fontWeight: 700 }}>
                        💡 Balanced Fact: "{item.balancedThought || 'Reframed with evidence.'}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 5: 4-7-8 BREATHING RESET
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'breathing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
              borderRadius: 24,
              padding: '36px 20px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 16,
              boxShadow: '0 12px 36px -8px rgba(23,50,44,0.35)',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A3D9C9' }}>
              Vagal Nerve Biofeedback
            </span>
            <div className="champ-heading" style={{ fontSize: 24, fontWeight: 800 }}>
              4-7-8 Parasympathetic Vagal Reset
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.88, maxWidth: 500 }}>
              Inhale gently (4s) → Hold breath (7s) → Slow complete exhale (8s). Lowers blood pressure within 2 minutes.
            </div>

            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                border: '2.5px solid rgba(255,255,255,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: breathingActive && breathPhase === 'Inhale' ? 'scale(1.25)' : breathingActive && breathPhase === 'Exhale' ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 3s ease-in-out',
                boxShadow: '0 0 30px rgba(255,255,255,0.15)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#FFE699' }}>
                {breathingActive ? breathPhase : 'Ready'}
              </span>
              <span style={{ fontSize: 32, fontWeight: 800, marginTop: 2 }}>
                {breathingActive ? countdown : '4-7-8'}
              </span>
            </div>

            <button
              onClick={() => setBreathingActive(!breathingActive)}
              style={{ background: '#fff', color: C.primary, padding: '10px 24px', borderRadius: 12, fontSize: 13.5, fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              {breathingActive ? 'Pause Session' : 'Start 2-Min Reset'}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 6: COUNSELLOR DIRECTORY & BOOKING
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'counsellors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {counsellorBookings.length > 0 && (
            <div style={{ background: C.primarySoft, borderRadius: 18, padding: 16, border: `1.5px solid ${C.primary}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                📅 Confirmed Upcoming Counselling Appointments
              </span>
              {counsellorBookings.map((b) => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{b.counsellorName}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{b.date} at {b.time} · {b.type} · {b.room}</div>
                  </div>
                  <button onClick={() => handleCancelBooking(b.id)} style={{ background: C.urgentSoft, color: C.urgent, border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COUNSELLORS.map((c) => (
              <div key={c.id} style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: C.soft }}>{c.qualifications}</div>
                  </div>
                  <span style={{ fontSize: 11, background: C.bg, padding: '3px 8px', borderRadius: 6, color: C.soft, fontWeight: 600 }}>{c.room}</span>
                </div>

                <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.45 }}>{c.description}</div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <button
                    onClick={() => { setSelectedCounsellor(c); setBookingSlot(c.availableSlots[0] || '10:00 AM'); }}
                    style={{ background: C.primary, color: '#fff', padding: '8px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CalendarCheck size={14} /> Book Free Session
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Modal */}
          {selectedCounsellor && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }} onClick={() => setSelectedCounsellor(null)}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Book Confidential Session</div>
                    <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 600 }}>{selectedCounsellor.name}</div>
                  </div>
                  <button onClick={() => setSelectedCounsellor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>

                {bookingSuccess ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                    <CheckCircle2 size={36} color={C.primary} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Appointment Confirmed!</div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>Scheduled for {bookingDate} at {bookingSlot}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Date</label>
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Available Slot</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 4 }}>
                        {selectedCounsellor.availableSlots.map((slot) => (
                          <button key={slot} type="button" onClick={() => setBookingSlot(slot)} style={{ padding: '8px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 700, background: bookingSlot === slot ? C.primary : C.bg, color: bookingSlot === slot ? '#fff' : C.ink, border: `1px solid ${bookingSlot === slot ? C.primary : C.border}`, cursor: 'pointer' }}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleConfirmBooking} disabled={!bookingSlot} style={{ background: C.primary, color: '#fff', padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 4 }}>
                      Confirm Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 7: CAMPUS SOLIDARITY WALL
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                Campus Solidarity Wall
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                Anonymous reflections and encouragement from students across campus.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {stickyNotes.map((note) => (
              <div key={note.id} style={{ background: note.color || '#FFF8E6', borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>{note.tag}</span>
                    <span style={{ fontSize: 10.5, color: C.soft }}>{note.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.ink, marginTop: 8, lineHeight: 1.5 }}>"{note.text}"</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: C.soft }}>{note.author}</span>
                  <button onClick={() => handleLikeNote(note.id)} style={{ background: note.liked ? '#1B7A4B' : '#fff', color: note.liked ? '#fff' : C.ink, border: `1px solid ${C.border}`, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ThumbsUp size={11} /> {note.likes} I relate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 8: 24/7 CRISIS SOS
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'crisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)', border: '1.5px solid #F5A9A0', borderRadius: 20, padding: 20, color: C.ink, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={22} color={C.urgent} />
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.urgent }}>
                Immediate Crisis & Emergency Support
              </div>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              If you or someone in your hostel is in acute distress or having thoughts of self-harm, connect with these free verified resources immediately. <strong>Your life matters.</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CRISIS_RESOURCES.map((res, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1.5px solid ${res.isEmergency ? '#F5C6BA' : C.border}`, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>{res.name}</div>
                    <div style={{ fontSize: 11, color: res.isEmergency ? C.urgent : C.primary, fontWeight: 700, marginTop: 1 }}>{res.badge}</div>
                  </div>
                  <a href={`tel:${res.phone}`} style={{ background: res.isEmergency ? C.urgent : C.primary, color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                    <Phone size={13} /> Call {res.phone}
                  </a>
                </div>
                <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.4 }}>{res.purpose}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
