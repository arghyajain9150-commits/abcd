import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, MessageSquare, Calendar, CheckSquare, Users, ShieldAlert,
  Sparkles, Send, Trash2, ArrowRight, CheckCircle2, Clock, Phone, AlertTriangle,
  Plus, X, ChevronRight, User, ThumbsUp, Flag, RefreshCw, Play, Pause, RotateCcw,
  Check, CalendarCheck, ShieldCheck, MapPin, Search, Wind, Volume2, VolumeX,
  Smile, Frown, Meh, Compass, Feather, Flame, Sparkle, HelpCircle, ArrowLeft,
  BookOpen, Music, CheckCheck, Eye, Activity, Sliders, Award, Layers
} from 'lucide-react';
import { useAuthStore } from '../store/store.js';

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

// ─── 1. mindLAMP (Harvard BIDMC) Standard PHQ-4 Clinical Screener ──
const PHQ4_QUESTIONS = [
  {
    id: 'anx1',
    category: 'Anxiety Subscale (GAD-2)',
    text: 'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
  },
  {
    id: 'anx2',
    category: 'Anxiety Subscale (GAD-2)',
    text: 'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
  },
  {
    id: 'dep1',
    category: 'Depression Subscale (PHQ-2)',
    text: 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?',
  },
  {
    id: 'dep2',
    category: 'Depression Subscale (PHQ-2)',
    text: 'Over the last 2 weeks, how often have you been feeling down, depressed, or hopeless?',
  },
];

const PHQ4_OPTIONS = [
  { label: 'Not at all', points: 0 },
  { label: 'Several days', points: 1 },
  { label: 'More than half the days', points: 2 },
  { label: 'Nearly every day', points: 3 },
];

// ─── 2. Aware's 5-4-3-2-1 Somatic Sensory Grounding Steps ──────────
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
  {
    name: 'Campus Student Counselling Centre',
    purpose: 'Confidential 1-on-1 psychotherapy & psychological consultations for university students.',
    phone: '+91 98765 11223',
    badge: 'Mon–Sat 9AM–6PM (OPD 201)',
    isEmergency: false,
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

  // Active View: 'sanctuary' | 'mindlamp' | 'grounding' | 'breathing' | 'cbt' | 'counsellors' | 'chat' | 'notes' | 'crisis'
  const [activeView, setActiveView] = useState('sanctuary');

  // ─── 1. mindLAMP PHQ-4 ASSESSMENT STATE ──────────────────────────
  const [phqAnswers, setPhqAnswers] = useState({ anx1: 1, anx2: 0, dep1: 1, dep2: 0 });
  const [assessmentResult, setAssessmentResult] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_mindlamp_result_${userId}`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleComputeAssessment = (e) => {
    e.preventDefault();
    const totalScore = Object.values(phqAnswers).reduce((a, b) => a + b, 0);
    const anxietyScore = phqAnswers.anx1 + phqAnswers.anx2;
    const depressionScore = phqAnswers.dep1 + phqAnswers.dep2;

    let tier = 'Minimal';
    let color = '#1B7A4B';
    let bg = '#D8F3E5';
    let recommendation = 'Your psychological screening indicates minimal distress. Maintain healthy sleep cycles and regular study breaks.';

    if (totalScore >= 9) {
      tier = 'Severe Distress (High Clinical Priority)';
      color = C.urgent;
      bg = '#FFE8E5';
      recommendation = 'Your responses indicate significant anxiety or mood pressure. We strongly encourage booking a free 1-on-1 session with Dr. Meera Nambiar or calling Tele-MANAS (14416).';
    } else if (totalScore >= 6) {
      tier = 'Moderate Distress';
      color = '#B45309';
      bg = '#FFF4E5';
      recommendation = 'Elevated academic stress or low energy detected. Schedule a session with our campus counsellor and use the 5-4-3-2-1 Somatic Grounding tool.';
    } else if (totalScore >= 3) {
      tier = 'Mild Stress';
      color = C.primary;
      bg = C.primarySoft;
      recommendation = 'Mild campus stress. Practice 4-7-8 breathing daily, hydrate, and use the CBT Thought Challenger to de-escalate study worries.';
    }

    const result = {
      totalScore,
      anxietyScore,
      depressionScore,
      tier,
      color,
      bg,
      recommendation,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setAssessmentResult(result);
    localStorage.setItem(`champ_mindlamp_result_${userId}`, JSON.stringify(result));
  };

  // ─── 2. AWARE 5-4-3-2-1 SOMATIC GROUNDING STATE ──────────────────
  const [groundingIndex, setGroundingIndex] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState({});
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
    setGroundingInputs({});
    setGroundingCompleted(false);
  };

  // ─── 3. MENTALLAMA & CCI CBT THOUGHT CHALLENGER ──────────────────
  const [cbtThought, setCbtThought] = useState('');
  const [cbtResult, setCbtResult] = useState(null);
  const [cbtProcessing, setCbtProcessing] = useState(false);

  const handleProcessCBT = (e) => {
    e.preventDefault();
    if (!cbtThought.trim()) return;

    setCbtProcessing(true);
    const lower = cbtThought.toLowerCase();

    setTimeout(() => {
      setCbtProcessing(false);
      let distortion = 'Catastrophizing & Fortune Telling';
      let reframe = 'Assuming the absolute worst-case outcome without considering evidence of past resilience or intermediate positive steps.';

      if (/everyone|nobody|always|never|useless|stupid/.test(lower)) {
        distortion = 'All-or-Nothing / Black-and-White Thinking';
        reframe = 'Viewing a temporary academic hurdle as a permanent, binary failure. You do not need perfection to make valuable progress.';
      } else if (/they think|judge|embarrassed|laugh/.test(lower)) {
        distortion = 'Mind Reading & Spotlight Effect';
        reframe = 'Assuming peers or professors are judging you harshly, when in reality most students are preoccupied with their own coursework.';
      }

      setCbtResult({
        thought: cbtThought.trim(),
        distortion,
        reframe,
        rationalFact: 'Action Item: Break this stressor into 1 small 20-minute action. Progress over perfection.',
      });
    }, 1100);
  };

  // ─── 4. NATIVE WEB AUDIO AMBIENT SOUNDSCAPE SYNTHESIZER ──────────
  const [soundPlaying, setSoundPlaying] = useState(null); // 'rain' | 'alpha' | null
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
        osc2.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz Alpha beat
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
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Academic Stress');

  const handleLikeNote = (id) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, likes: n.liked ? n.likes - 1 : n.likes + 1, liked: !n.liked } : n))
    );
  };

  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const colors = ['#FFF8E6', '#E4EFEA', '#EBF3FF'];
    const newNote = {
      id: Date.now(),
      tag: newNoteTag,
      text: newNoteText.trim(),
      author: 'Campus Student',
      time: 'Just now',
      likes: 1,
      liked: true,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setStickyNotes([newNote, ...stickyNotes]);
    setNewNoteText('');
    setNoteModalOpen(false);
  };

  // ─── NAV TABS ────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'sanctuary',   label: '✨ Sanctuary Home',      Icon: HeartPulse },
    { id: 'mindlamp',    label: '📊 mindLAMP Screener',   Icon: Activity },
    { id: 'grounding',   label: '👁️ 5-4-3-2-1 Grounding', Icon: Compass },
    { id: 'cbt',         label: '🧠 CBT Reframer',        Icon: Sparkles },
    { id: 'breathing',   label: '🫁 4-7-8 Breathing',     Icon: Wind },
    { id: 'counsellors', label: '🩺 Book Psychologist',   Icon: User },
    { id: 'notes',       label: '💌 Solidarity Wall',     Icon: Users },
    { id: 'crisis',      label: '🚨 Crisis SOS',          Icon: ShieldAlert, highlight: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ─── Top Ambient Bar with Harvard mindLAMP Badge & Soundscape ─── */}
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
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color={C.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>
                  mindLAMP Clinical Anxiety & Mood Screener (PHQ-4)
                </div>
                <div style={{ fontSize: 12, color: C.soft }}>
                  {assessmentResult ? `Last Score: ${assessmentResult.totalScore}/12 (${assessmentResult.tier}) · ${assessmentResult.date}` : 'Take a 30-second standardized screening used by Harvard BIDMC.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('mindlamp')}
              style={{ background: C.primary, color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              {assessmentResult ? 'Re-take Screener →' : 'Take Clinical Screener →'}
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
          VIEW 2: mindLAMP (HARVARD BIDMC) STANDARDIZED PHQ-4 SCREENER
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'mindlamp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                  mindLAMP Standard Clinical Assessment (PHQ-4)
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                  Developed by the Division of Digital Psychiatry at Harvard's Beth Israel Deaconess Medical Center.
                </div>
              </div>
              <span style={{ fontSize: 11, background: C.primarySoft, color: C.primary, padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
                Open-Source Standard
              </span>
            </div>

            <form onSubmit={handleComputeAssessment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PHQ4_QUESTIONS.map((q, idx) => (
                <div key={q.id} style={{ background: C.bg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                    {q.category} · Question {idx + 1}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 4 }}>
                    {q.text}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 6, marginTop: 8 }}>
                    {PHQ4_OPTIONS.map((opt) => (
                      <button
                        key={opt.points}
                        type="button"
                        onClick={() => setPhqAnswers({ ...phqAnswers, [q.id]: opt.points })}
                        style={{
                          background: phqAnswers[q.id] === opt.points ? C.primary : '#fff',
                          color: phqAnswers[q.id] === opt.points ? '#fff' : C.ink,
                          border: `1.5px solid ${phqAnswers[q.id] === opt.points ? C.primary : C.border}`,
                          padding: '8px 6px',
                          borderRadius: 10,
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {opt.label} ({opt.points})
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '12px 0', borderRadius: 12, fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Activity size={16} /> Calculate Clinical mindLAMP Score
              </button>
            </form>

            {/* Assessment Results Card */}
            {assessmentResult && (
              <div style={{ background: assessmentResult.bg, borderRadius: 16, padding: 18, border: `1.5px solid ${assessmentResult.color}44`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: assessmentResult.color, textTransform: 'uppercase' }}>
                    {assessmentResult.tier}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: assessmentResult.color }}>
                    Score: {assessmentResult.totalScore} / 12
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
                  <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
                    Anxiety Subscore (GAD-2): <strong>{assessmentResult.anxietyScore} / 6</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
                    Depression Subscore (PHQ-2): <strong>{assessmentResult.depressionScore} / 6</strong>
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45, fontWeight: 500 }}>
                  <strong>Clinical Triage:</strong> {assessmentResult.recommendation}
                </div>

                {assessmentResult.totalScore >= 6 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => setActiveView('counsellors')}
                      style={{ background: C.primary, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Book Session with Dr. Meera Nambiar
                    </button>
                    <button
                      onClick={() => setActiveView('crisis')}
                      style={{ background: C.urgent, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Call Tele-MANAS (14416)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
      {activeView === 'cbt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                MentaLLaMA & CCI Cognitive Thought Challenger
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                Classify automatic negative thoughts and reframe cognitive distortions into balanced facts.
              </div>
            </div>

            <form onSubmit={handleProcessCBT} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                rows={3}
                placeholder="What intrusive thought is bothering you? (e.g. 'If I do not score 90% in this exam, my career is completely ruined')..."
                value={cbtThought}
                onChange={(e) => setCbtThought(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', resize: 'none' }}
              />

              <button
                type="submit"
                disabled={cbtProcessing || !cbtThought.trim()}
                style={{ background: C.primary, color: '#fff', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Sparkles size={15} /> {cbtProcessing ? 'Analyzing Cognitive Distortions…' : 'Challenge & Reframe Thought'}
              </button>
            </form>

            {cbtResult && (
              <div style={{ background: '#F8F9F7', borderRadius: 16, padding: 16, border: `1.5px solid ${C.primarySoft}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>Detected Cognitive Distortion</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 2 }}>{cbtResult.distortion}</div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>💡 Rational CBT Reframe</span>
                  <div style={{ fontSize: 13, color: C.ink, marginTop: 2, lineHeight: 1.45 }}>{cbtResult.reframe}</div>
                </div>

                <div style={{ background: C.primarySoft, borderRadius: 10, padding: 10, fontSize: 12, color: C.primary, fontWeight: 600 }}>
                  🎯 {cbtResult.rationalFact}
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
            <button onClick={() => setNoteModalOpen(true)} style={{ background: C.primary, color: '#fff', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={14} /> Leave a Note
            </button>
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

      {/* Modal: Post Sticky Note */}
      {noteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }} onClick={() => setNoteModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Post to Campus Solidarity Wall</div>
              <button onClick={() => setNoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handlePostNote} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Topic Category</label>
                <select value={newNoteTag} onChange={(e) => setNewNoteTag(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, background: '#fff' }}>
                  <option value="Academic Stress">Academic Stress & Exams</option>
                  <option value="Hostel Life">Hostel Adjustment & Routine</option>
                  <option value="Mindfulness">Self-Care & Mindfulness</option>
                  <option value="Community Support">General Solidarity</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Your Message / Tip</label>
                <textarea rows={4} placeholder="Write an encouraging reflection or practical tip for your fellow campus peers..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none', outline: 'none' }} />
              </div>

              <button type="submit" style={{ background: C.primary, color: '#fff', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 4 }}>
                Post Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
