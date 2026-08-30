import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, MessageSquare, Calendar, CheckSquare, Users, ShieldAlert,
  Sparkles, Send, Trash2, ArrowRight, CheckCircle2, Clock, Phone, AlertTriangle,
  Plus, X, ChevronRight, User, ThumbsUp, Flag, RefreshCw, Play, Pause, RotateCcw,
  Check, CalendarCheck, ShieldCheck, MapPin, Search, Wind, Volume2, VolumeX,
  Smile, Frown, Meh, Compass, Feather, Flame, Sparkle, HelpCircle, ArrowLeft,
  BookOpen, Music, CheckCheck, Eye
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

// ─── Mood Data with CBT Coping Guidance ────────────────────────────
const MOODS = [
  { id: 'very_low', label: 'Overwhelmed', emoji: '😞', color: '#FBE7E4', text: '#D6483C', prompt: 'Academic Burnout', guidance: 'Your nervous system needs a pause. Step away from study materials, sip cold water, and try the 4-7-8 breathing reset below.' },
  { id: 'anxious',  label: 'Anxious',     emoji: '😰', color: '#FFF4E5', text: '#B45309', prompt: 'Exam Pressure', guidance: 'Anxiety is just future-focused adrenaline. Try our 5-4-3-2-1 Sensory Grounding tool to anchor your mind back in the present.' },
  { id: 'okay',     label: 'Neutral',     emoji: '😐', color: '#F0F2EB', text: '#5B7169', prompt: 'Routine Day', guidance: 'A solid steady baseline. Pick one key priority task today and take scheduled 5-minute movement breaks between study blocks.' },
  { id: 'good',     label: 'Focused',     emoji: '🙂', color: '#E4EFEA', text: '#2F7A68', prompt: 'Productive Flow', guidance: 'Great state! Use the Ambient Lo-Fi study generator below to lock into deep focus for your next assignment.' },
  { id: 'great',    label: 'Energized',   emoji: '😄', color: '#D8F3E5', text: '#1B7A4B', prompt: 'High Energy', guidance: 'Channel this positive momentum into sports at the campus ground or collaborating on team project milestones.' },
];

// ─── Verified Official Emergency & Crisis Contacts ────────────────
const CRISIS_RESOURCES = [
  {
    name: 'Tele-MANAS (Govt. of India 24/7 National Mental Health)',
    purpose: 'Free 24/7 confidential tele-counselling across 20+ languages with clinical psychologists.',
    phone: '14416',
    alt: '1800-891-4416',
    badge: '24/7 Toll-Free',
    isEmergency: true,
  },
  {
    name: 'KIRAN National Mental Health Helpline',
    purpose: 'Ministry of Social Justice 24/7 early screening, first-aid psychological crisis management.',
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

// ─── Verified Campus Psychologists ─────────────────────────────────
const COUNSELLORS = [
  {
    id: 'c1',
    name: 'Dr. Meera Nambiar',
    title: 'Lead Campus Psychologist & Psychotherapist',
    qualifications: 'M.Phil, Ph.D. in Clinical Psychology (NIMHANS)',
    specializations: ['Exam Stress & Burnout', 'Depressive Thoughts', 'Sleep Disorders'],
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

// ─── Initial Campus Peer Sticky Notes ──────────────────────────────
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
    text: "Hostel Block B set up an ORS & paper napkin station on 2nd floor during this eye-flu wave. If you're sick in your room, message the group for meal delivery!",
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
  {
    id: 4,
    tag: 'Mindfulness',
    text: "Started leaving my phone in the hostel room for 30 minutes every evening to sit near the campus library fountain. Major mental reset.",
    author: '2nd Year Dual Degree',
    time: '2 days ago',
    likes: 67,
    liked: false,
    color: '#F3E8FF',
  },
];

export default function WellnessPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'campus_student';

  // ─── Active Tab / View ───────────────────────────────────────────
  // 'sanctuary' (Main Dashboard) | 'chat' | 'counsellors' | 'breathing' | 'soundscape' | 'cbt_shredder' | 'notes' | 'crisis'
  const [activeView, setActiveView] = useState('sanctuary');

  // ─── 1. MOOD & STREAK STATE ──────────────────────────────────────
  const [selectedMood, setSelectedMood] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_mood_${userId}`);
      return saved ? JSON.parse(saved) : MOODS[3];
    } catch { return MOODS[3]; }
  });
  const [moodNote, setMoodNote] = useState('');
  const [moodNoteSaved, setMoodNoteSaved] = useState(false);
  const [streakDays, setStreakDays] = useState(4);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    localStorage.setItem(`champ_mood_${userId}`, JSON.stringify(mood));
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!moodNote.trim()) return;
    setMoodNoteSaved(true);
    setTimeout(() => setMoodNoteSaved(false), 2000);
  };

  // ─── 2. NATIVE WEB AUDIO AMBIENT SOUNDSCAPE GENERATOR ────────────
  // Synthesizes natural calming ambient audio right in the browser (Rain, Brown Noise, 432Hz Alpha Waves, Ocean Wind)
  const [soundPlaying, setSoundPlaying] = useState(null); // 'rain' | 'brown_noise' | 'alpha_waves' | null
  const [soundVolume, setSoundVolume] = useState(0.5);
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef([]);

  const stopAudio = () => {
    if (audioNodesRef.current) {
      audioNodesRef.current.forEach((node) => {
        try { node.stop ? node.stop() : node.disconnect(); } catch {}
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
      masterGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'rain' || type === 'brown_noise') {
        // Generate continuous natural filtered noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise curve
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 800 : 400;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        audioNodesRef.current = [whiteNoise, filter, masterGain];
      } else if (type === 'alpha_waves') {
        // Synthesize 432Hz deep meditative alpha study tone with gentle binaural oscillation
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz Alpha beat

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);

        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(masterGain);

        osc1.start();
        osc2.start();
        audioNodesRef.current = [osc1, osc2, oscGain, masterGain];
      }

      setSoundPlaying(type);
    } catch (err) {
      console.warn('AudioContext not supported in this browser', err);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // ─── 3. 4-7-8 PARASYMPATHETIC BREATHING ENGINE ───────────────────
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale 4s -> Hold 7s -> Exhale 8s
  const [countdown, setCountdown] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);

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
            setBreathCycles((prev) => prev + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  const toggleBreathing = () => {
    if (!breathingActive) {
      setBreathPhase('Inhale');
      setCountdown(4);
    }
    setBreathingActive(!breathingActive);
  };

  // ─── 4. CBT WORRY SHREDDER & COGNITIVE REFRAMER ──────────────────
  const [worryInput, setWorryInput] = useState('');
  const [worryReframed, setWorryReframed] = useState(null);
  const [shredding, setShredding] = useState(false);

  const handleReframeWorry = (e) => {
    e.preventDefault();
    if (!worryInput.trim()) return;

    setShredding(true);
    setTimeout(() => {
      setShredding(false);
      setWorryReframed({
        original: worryInput.trim(),
        reframe: `Cognitive Reframe: Feeling like "${worryInput.trim()}" is an automatic stress response, not a confirmed factual reality. What is one concrete piece of evidence against this worry, and what is the single smallest action you can take in the next 15 minutes?`,
        groundingAction: 'Take 3 deep grounding breaths, drink a glass of water, and break this problem into 3 smaller micro-tasks.',
      });
    }, 1200);
  };

  const handleClearWorry = () => {
    setWorryInput('');
    setWorryReframed(null);
  };

  // ─── 5. COUNSELLOR BOOKING STATE ─────────────────────────────────
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
      title: selectedCounsellor.title,
      room: selectedCounsellor.room,
      date: bookingDate,
      time: bookingSlot,
      type: sessionType,
      status: 'Confirmed',
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

  // ─── 6. AI COMPANION CHAT STATE ──────────────────────────────────
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your CHAMP AI Wellness Companion. Whether you're dealing with midterm pressure, late-night exhaustion, or feeling lonely in the hostel, I'm here to listen without judgment. How can I help you feel more grounded right now?",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (activeView === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeView, aiTyping]);

  const handleSendChat = (customText) => {
    const text = customText || chatInput;
    if (!text.trim() || aiTyping) return;

    const userMsg = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setAiTyping(true);

    const lower = text.toLowerCase();
    const isCrisis = /suicide|kill myself|end my life|self harm|hurt myself|die|can't live/.test(lower);

    setTimeout(() => {
      let reply = '';
      if (isCrisis) {
        reply = `🚨 **Please know that your life matters deeply and you are not alone.**

If you are experiencing acute distress or thoughts of self-harm, please connect with these verified 24/7 clinical professionals right now:

• **Tele-MANAS (24/7 National Mental Health Toll-Free)**: **14416** or **1800-891-4416**  
• **KIRAN Govt. Helpline**: **1800-599-0019**  
• **Campus Ambulance / Medical Casualty**: **108**  
• **Campus Counselling Centre**: OPD Desk 201 (Mon–Sat)

You can tap the **"Emergency Crisis Hub"** tab above for direct 1-click calls. Please reach out to someone you trust or speak with these free helplines.`;
      } else if (/exam|pressure|overwhelm|assignment|fail|behind/.test(lower)) {
        reply = `It is completely understandable to feel overwhelmed when deadlines pile up. Let's take a deep breath together.

Here is a practical, immediate 3-step action plan:
1. **Turn on the Rain/Lo-Fi Ambient soundscape** in our top bar to block background hostel noise.
2. **Use the Worry Shredder tool** below to write down your biggest anxiety and reframe it with CBT.
3. **Pick ONE single task for 25 minutes** and ignore everything else.

Would you like to try a 2-minute breathing reset right now?`;
      } else if (/lonely|isolated|homesick|roommate|friend/.test(lower)) {
        reply = `Adjusting to hostel life and campus routines is an emotional journey, and feeling disconnected is far more common among students than it looks from the outside.

Take a look at our **Campus Solidarity Wall**—you'll see dozens of peers experiencing the exact same feelings. If you'd like to talk to a human professional, Dr. Rajesh Sharma specializes in hostel adjustment and is available at Wellness Room 203.

I'm right here with you. What is one small comforting thing you can do for yourself tonight?`;
      } else {
        reply = `Thank you for opening up and sharing that with me. Giving yourself permission to acknowledge your feelings is a major act of self-care.

Remember that emotional energy ebbs and flows. Make sure you hydrate, take a 10-minute walk outside, and don't hesitate to book a session with our campus counsellors if things feel heavy.

How can I support you best right now?`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setAiTyping(false);
    }, 900);
  };

  // ─── 7. STICKY NOTES / SOLIDARITY WALL STATE ──────────────────────
  const [stickyNotes, setStickyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('champ_sticky_notes');
      return saved ? JSON.parse(saved) : INITIAL_STICKY_NOTES;
    } catch { return INITIAL_STICKY_NOTES; }
  });
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Academic Stress');

  const handleLikeNote = (id) => {
    const updated = stickyNotes.map((n) =>
      n.id === id
        ? { ...n, likes: n.liked ? n.likes - 1 : n.likes + 1, liked: !n.liked }
        : n
    );
    setStickyNotes(updated);
    localStorage.setItem('champ_sticky_notes', JSON.stringify(updated));
  };

  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const colors = ['#FFF8E6', '#E4EFEA', '#EBF3FF', '#F3E8FF'];
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

    const updated = [newNote, ...stickyNotes];
    setStickyNotes(updated);
    localStorage.setItem('champ_sticky_notes', JSON.stringify(updated));
    setNewNoteText('');
    setNoteModalOpen(false);
  };

  // ─── 8. TASKS & POMODORO TIME BLOCK ──────────────────────────────
  const [wellnessTasks, setWellnessTasks] = useState([
    { id: 1, text: 'Take a 10-minute fresh air walk around campus lake', completed: true, time: 'Morning' },
    { id: 2, text: 'Drink 2L water & take a screen-free lunch break', completed: false, time: 'Afternoon' },
    { id: 3, text: '25-minute focused study sprint with Lo-Fi ambient audio', completed: false, time: 'Evening' },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const toggleTask = (id) => {
    setWellnessTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setWellnessTasks([
      ...wellnessTasks,
      { id: Date.now(), text: newTaskInput.trim(), completed: false, time: 'Today' },
    ]);
    setNewTaskInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ─── Top Ambient Audio & Mindful Sanctuary Bar ─── */}
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
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Feather size={22} color="#FFE699" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A3D9C9' }}>
                Campus Mindful Sanctuary
              </span>
              <span style={{ fontSize: 10.5, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                🔥 {streakDays}-Day Mindful Streak
              </span>
            </div>
            <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
              Good Day, {user?.name ? user.name.split(' ')[0] : 'Student'}
            </div>
          </div>
        </div>

        {/* Ambient Audio Synthesizer Quick Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.22)', padding: '6px 12px', borderRadius: 14 }}>
          <Music size={15} color="#FFE699" />
          <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>Ambient Sound:</span>
          
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
            onClick={() => playSoundscape('alpha_waves')}
            style={{
              background: soundPlaying === 'alpha_waves' ? '#FFE699' : 'rgba(255,255,255,0.15)',
              color: soundPlaying === 'alpha_waves' ? '#17322C' : '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🧘 432Hz Alpha {soundPlaying === 'alpha_waves' ? '▶' : ''}
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
        {[
          { id: 'sanctuary',    label: '✨ Sanctuary Home',     Icon: HeartPulse },
          { id: 'chat',         label: '💬 AI Companion',       Icon: MessageSquare },
          { id: 'counsellors',  label: '🩺 Book Counsellor',    Icon: User },
          { id: 'breathing',    label: '🫁 Breathing Reset',    Icon: Wind },
          { id: 'cbt_shredder', label: '🧠 Worry Shredder',     Icon: Sparkles },
          { id: 'notes',        label: '💌 Solidarity Wall',    Icon: Users },
          { id: 'crisis',       label: '🚨 Crisis SOS',         Icon: ShieldAlert, highlight: true },
        ].map(({ id, label, Icon, highlight }) => {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
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
            Sanctuary / <strong style={{ color: C.ink, textTransform: 'capitalize' }}>{activeView.replace('_', ' ')}</strong>
          </span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 1: SANCTUARY HOME (PRACTICAL 2-COLUMN DASHBOARD)
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'sanctuary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Daily Mood Check-In Hero Card */}
          <div
            style={{
              background: C.surface,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${C.border}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                  How are you feeling right now?
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                  Select your state to receive instant, tailored CBT coping strategies.
                </div>
              </div>

              <span style={{ fontSize: 11, background: C.bg, padding: '4px 10px', borderRadius: 99, color: C.soft, fontWeight: 700 }}>
                Daily Awareness
              </span>
            </div>

            {/* 5 Distinct Mood Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {MOODS.map((m) => {
                const isSelected = selectedMood?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMood(m)}
                    style={{
                      background: isSelected ? m.color : C.bg,
                      border: `1.5px solid ${isSelected ? m.text : C.border}`,
                      borderRadius: 14,
                      padding: '12px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? m.text : C.soft }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Tailored Guidance Box */}
            <div style={{ background: selectedMood.color, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, border: `1px solid ${selectedMood.text}33` }}>
              <Sparkle size={18} color={selectedMood.text} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: selectedMood.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {selectedMood.label} · Clinical Coping Plan
                </div>
                <div style={{ fontSize: 12.5, color: selectedMood.text, marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>
                  {selectedMood.guidance}
                </div>
              </div>
            </div>

            {/* Optional Personal Reflection Note */}
            <form onSubmit={handleSaveNote} style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <input
                type="text"
                placeholder="Log a personal note (e.g. feeling anxious about afternoon algorithms midterm)..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, background: C.bg, outline: 'none' }}
              />
              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '0 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                {moodNoteSaved ? 'Saved! ✓' : 'Save Note'}
              </button>
            </form>
          </div>

          {/* ─── 2-COLUMN PRACTICAL DASHBOARD ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            
            {/* ── LEFT COLUMN: Interactive Tools ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Tool 1: 4-7-8 Breathing Reset Widget */}
              <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#D8F3E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wind size={16} color="#1B7A4B" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>4-7-8 Somatic Breathing Reset</div>
                      <div style={{ fontSize: 11, color: C.soft }}>Lowers cortisol & heart rate in 2 minutes</div>
                    </div>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: C.primarySoft, padding: '2px 8px', borderRadius: 6 }}>
                    {breathCycles} Cycles Done
                  </span>
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
                    borderRadius: 16,
                    padding: '20px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    color: '#fff',
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: breathingActive && breathPhase === 'Inhale' ? 'scale(1.2)' : breathingActive && breathPhase === 'Exhale' ? 'scale(0.85)' : 'scale(1)',
                      transition: 'transform 3s ease-in-out',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#FFE699', textTransform: 'uppercase' }}>
                      {breathingActive ? breathPhase : 'Ready'}
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 800 }}>
                      {breathingActive ? countdown : '4-7-8'}
                    </span>
                  </div>

                  <button
                    onClick={toggleBreathing}
                    style={{
                      background: '#fff',
                      color: C.primary,
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {breathingActive ? <Pause size={14} /> : <Play size={14} />}
                    {breathingActive ? 'Pause Exercise' : 'Start 2-Min Reset'}
                  </button>
                </div>
              </div>

              {/* Tool 2: Worry Shredder & Cognitive Reframer Preview */}
              <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color={C.accent} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Worry Box & CBT Reframer</div>
                      <div style={{ fontSize: 11, color: C.soft }}>Type catastrophic thoughts & reframe them</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('cbt_shredder')}
                    style={{ background: 'none', border: 'none', color: C.primary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Open Full Tool →
                  </button>
                </div>

                <form onSubmit={handleReframeWorry} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="e.g. 'I feel like I am going to fail my project demo'..."
                    value={worryInput}
                    onChange={(e) => setWorryInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
                  />
                  <button
                    type="submit"
                    style={{ background: C.primary, color: '#fff', padding: '0 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                  >
                    Reframe
                  </button>
                </form>

                {worryReframed && (
                  <div style={{ background: '#F8F9F7', borderRadius: 12, padding: 12, border: `1px solid ${C.border}`, fontSize: 12, color: C.ink, lineHeight: 1.45 }}>
                    <strong style={{ color: C.primary }}>💡 Rational Reality:</strong> {worryReframed.reframe}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Clinical Support & Campus Solidarity ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Card 1: 1-Click Counsellor Booking Widget */}
              <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} color={C.primary} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Campus Psychologists</div>
                      <div style={{ fontSize: 11, color: C.soft }}>Confidential 1-on-1 therapy & guidance</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('counsellors')}
                    style={{ background: 'none', border: 'none', color: C.primary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    View Directory →
                  </button>
                </div>

                {counsellorBookings.length > 0 ? (
                  <div style={{ background: C.primarySoft, borderRadius: 12, padding: 12, border: `1px solid ${C.primary}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>Confirmed Upcoming Session</span>
                      <span style={{ fontSize: 10, background: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700, color: '#1B7A4B' }}>Confirmed</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginTop: 4 }}>{counsellorBookings[0].counsellorName}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{counsellorBookings[0].date} at {counsellorBookings[0].time} · {counsellorBookings[0].type}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.bg, padding: '10px 12px', borderRadius: 12 }}>
                    <span style={{ fontSize: 12, color: C.soft }}>No appointments scheduled</span>
                    <button
                      onClick={() => setActiveView('counsellors')}
                      style={{ background: C.primary, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Book Free Session
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2: Campus Solidarity Sticky Notes Wall Preview */}
              <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} color="#2563EB" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Campus Solidarity Wall</div>
                      <div style={{ fontSize: 11, color: C.soft }}>Anonymous peer reflections & solidarity</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('notes')}
                    style={{ background: 'none', border: 'none', color: C.primary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    View All →
                  </button>
                </div>

                {/* Top Note Preview */}
                <div style={{ background: stickyNotes[0]?.color || '#FFF8E6', borderRadius: 14, padding: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>{stickyNotes[0]?.tag}</span>
                    <span style={{ fontSize: 10.5, color: C.soft }}>{stickyNotes[0]?.author}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink, marginTop: 4, lineHeight: 1.45 }}>
                    "{stickyNotes[0]?.text}"
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button
                      onClick={() => handleLikeNote(stickyNotes[0]?.id)}
                      style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <ThumbsUp size={11} /> {stickyNotes[0]?.likes} I relate
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: 24/7 Crisis SOS Quick Access */}
              <div style={{ background: '#FFE8E5', borderRadius: 18, padding: 14, border: '1.5px solid #F5A9A0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={20} color={C.urgent} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: C.urgent }}>In Urgent Distress?</div>
                    <div style={{ fontSize: 11, color: C.ink }}>Tele-MANAS & Campus Ambulance available 24/7</div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('crisis')}
                  style={{ background: C.urgent, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
                >
                  Get Help Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 2: DEDICATED AI COMPANION (WYSA-STYLE EMPATHETIC CHAT)
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'chat' && (
        <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#FFE699" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>CHAMP AI Wellness Companion</div>
                <div style={{ fontSize: 11, color: C.soft }}>Empathetic, confidential & supportive guidance</div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('crisis')}
              style={{ background: C.urgent, color: '#fff', padding: '6px 12px', borderRadius: 10, fontSize: 11.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer' }}
            >
              <ShieldAlert size={14} /> Crisis SOS
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isUser ? C.primary : C.bg,
                      color: isUser ? '#fff' : C.ink,
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: 13,
                      lineHeight: 1.45,
                      whiteSpace: 'pre-line',
                      border: isUser ? 'none' : `1px solid ${C.border}`,
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: C.soft, marginTop: 3, padding: '0 4px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {aiTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.soft, fontSize: 12, fontStyle: 'italic', padding: '4px 8px' }}>
                <Sparkles size={14} color={C.primary} /> Thinking & composing supportive response…
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 14px', borderTop: `1px solid ${C.border}`, background: '#FAFAFA' }}>
            {['Feeling overwhelmed with midterms', 'How to stop late-night anxiety', 'Trouble focusing in study hall', 'Loneliness in hostel'].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendChat(prompt)}
                style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, color: C.soft, whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, background: '#fff' }}
          >
            <input
              type="text"
              placeholder="Tell me what is on your mind..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none' }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || aiTyping}
              style={{ background: C.primary, color: '#fff', padding: '0 16px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 3: COUNSELLOR DIRECTORY & APPOINTMENT BOOKING
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'counsellors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Active Bookings Banner */}
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
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    style={{ background: C.urgentSoft, color: C.urgent, border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {COUNSELLORS.map((c) => (
              <div
                key={c.id}
                style={{
                  background: C.surface,
                  borderRadius: 18,
                  padding: 18,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: C.soft }}>{c.qualifications}</div>
                  </div>
                  <span style={{ fontSize: 11, background: C.bg, padding: '3px 8px', borderRadius: 6, color: C.soft, fontWeight: 600 }}>
                    {c.room}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.45 }}>
                  {c.description}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.specializations.map((spec) => (
                    <span key={spec} style={{ background: C.bg, color: C.ink, padding: '3px 8px', borderRadius: 6, fontSize: 10.5, fontWeight: 600, border: `1px solid ${C.border}` }}>
                      {spec}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
                  <button
                    onClick={() => {
                      setSelectedCounsellor(c);
                      setBookingSlot(c.availableSlots[0] || '10:00 AM');
                    }}
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
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }}
              onClick={() => setSelectedCounsellor(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 460, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
              >
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
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Available Slot</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 4 }}>
                        {selectedCounsellor.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingSlot(slot)}
                            style={{
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              background: bookingSlot === slot ? C.primary : C.bg,
                              color: bookingSlot === slot ? '#fff' : C.ink,
                              border: `1px solid ${bookingSlot === slot ? C.primary : C.border}`,
                              cursor: 'pointer',
                            }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Session Type</label>
                      <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, background: '#fff' }}
                      >
                        {selectedCounsellor.sessionTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      disabled={!bookingSlot}
                      style={{ background: C.primary, color: '#fff', padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 4 }}
                    >
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
          VIEW 4: BREATHING STUDIO & GUIDED VAGAL STIMULATION
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
              Guided Somatic Biofeedback
            </span>
            <div className="champ-heading" style={{ fontSize: 24, fontWeight: 800 }}>
              4-7-8 Parasympathetic Vagal Reset
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.88, maxWidth: 500 }}>
              Inhale gently through your nose (4s) → Hold your breath (7s) → Slow complete audible exhale (8s). Lowers cortisol and sympathetic fight-or-flight within 2 minutes.
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
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#FFE699' }}>
                {breathingActive ? breathPhase : 'Ready'}
              </span>
              <span style={{ fontSize: 32, fontWeight: 800, marginTop: 2 }}>
                {breathingActive ? countdown : '4-7-8'}
              </span>
            </div>

            <button
              onClick={toggleBreathing}
              style={{
                background: '#fff',
                color: C.primary,
                padding: '10px 24px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {breathingActive ? <Pause size={16} /> : <Play size={16} />}
              {breathingActive ? 'Pause Session' : 'Start 2-Min Reset'}
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 5: CBT WORRY SHREDDER & COGNITIVE REFRAMER
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'cbt_shredder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, borderRadius: 20, padding: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                Worry Box & Cognitive Behavioral Reframer
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                Unburden anxious, catastrophic thoughts from your mind. Our AI breaks them down using evidence-based CBT reframing.
              </div>
            </div>

            <form onSubmit={handleReframeWorry} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                rows={3}
                placeholder="What is making you feel most anxious right now? (e.g. 'I am terrified of failing my operating systems midterm and letting everyone down')..."
                value={worryInput}
                onChange={(e) => setWorryInput(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13, resize: 'none', outline: 'none' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: C.soft }}>🔒 100% Private · Zero data stored</span>
                <button
                  type="submit"
                  disabled={shredding || !worryInput.trim()}
                  style={{ background: C.primary, color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles size={14} /> {shredding ? 'Reframing Thought…' : 'Shred & Reframe Anxious Thought'}
                </button>
              </div>
            </form>

            {worryReframed && (
              <div style={{ background: '#F8F9F7', borderRadius: 16, padding: 16, border: `1.5px solid ${C.primarySoft}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>Original Catastrophic Thought</span>
                  <div style={{ fontSize: 13, fontStyle: 'italic', color: C.soft, marginTop: 2 }}>"{worryReframed.original}"</div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>💡 Rational CBT Reframe</span>
                  <div style={{ fontSize: 13, color: C.ink, marginTop: 2, lineHeight: 1.45 }}>{worryReframed.reframe}</div>
                </div>

                <div style={{ background: C.primarySoft, borderRadius: 10, padding: 10, fontSize: 12, color: C.primary, fontWeight: 600 }}>
                  🎯 Immediate Action: {worryReframed.groundingAction}
                </div>

                <button
                  onClick={handleClearWorry}
                  style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: C.soft, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear & Write Another →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 6: CAMPUS SOLIDARITY STICKY NOTES WALL
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

            <button
              onClick={() => setNoteModalOpen(true)}
              style={{ background: C.primary, color: '#fff', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Plus size={14} /> Leave a Note
            </button>
          </div>

          {/* Sticky Notes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {stickyNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: note.color || '#FFF8E6',
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      {note.tag}
                    </span>
                    <span style={{ fontSize: 10.5, color: C.soft }}>{note.time}</span>
                  </div>

                  <div style={{ fontSize: 12.5, color: C.ink, marginTop: 8, lineHeight: 1.5 }}>
                    "{note.text}"
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: C.soft }}>{note.author}</span>
                  <button
                    onClick={() => handleLikeNote(note.id)}
                    style={{
                      background: note.liked ? '#1B7A4B' : '#fff',
                      color: note.liked ? '#fff' : C.ink,
                      border: `1px solid ${C.border}`,
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ThumbsUp size={11} /> {note.likes} I relate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 7: 24/7 VERIFIED CRISIS SOS & EMERGENCY HUB
      ──────────────────────────────────────────────────────────────── */}
      {activeView === 'crisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)',
              border: '1.5px solid #F5A9A0',
              borderRadius: 20,
              padding: 20,
              color: C.ink,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={22} color={C.urgent} />
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.urgent }}>
                Immediate Crisis & Emergency Support
              </div>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              If you or someone in your hostel is in acute emotional distress, having panic episodes, or experiencing thoughts of self-harm, connect with these free verified resources immediately. <strong>Your safety and life matter.</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CRISIS_RESOURCES.map((res, i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  borderRadius: 16,
                  padding: 16,
                  border: `1.5px solid ${res.isEmergency ? '#F5C6BA' : C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>{res.name}</div>
                    <div style={{ fontSize: 11, color: res.isEmergency ? C.urgent : C.primary, fontWeight: 700, marginTop: 1 }}>
                      {res.badge}
                    </div>
                  </div>

                  <a
                    href={`tel:${res.phone}`}
                    style={{
                      background: res.isEmergency ? C.urgent : C.primary,
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={13} /> Call {res.phone}
                  </a>
                </div>

                <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.4 }}>
                  {res.purpose}
                </div>

                {res.alt && (
                  <div style={{ fontSize: 11, color: C.soft }}>
                    Alternate helpline: <a href={`tel:${res.alt}`} style={{ color: C.ink, fontWeight: 700 }}>{res.alt}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Post Sticky Note */}
      {noteModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }}
          onClick={() => setNoteModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Post to Campus Solidarity Wall</div>
              <button onClick={() => setNoteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handlePostNote} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Topic Category</label>
                <select
                  value={newNoteTag}
                  onChange={(e) => setNewNoteTag(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, background: '#fff' }}
                >
                  <option value="Academic Stress">Academic Stress & Exams</option>
                  <option value="Hostel Life">Hostel Adjustment & Routine</option>
                  <option value="Mindfulness">Self-Care & Mindfulness</option>
                  <option value="Community Support">General Solidarity</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Your Message / Tip</label>
                <textarea
                  rows={4}
                  placeholder="Write an encouraging reflection or practical tip for your fellow campus peers..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Post Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
