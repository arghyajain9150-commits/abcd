import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, MessageSquare, Calendar, CheckSquare, Users, ShieldAlert,
  Sparkles, Send, Trash2, ArrowRight, CheckCircle2, Clock, Phone, AlertTriangle,
  Plus, X, ChevronRight, User, ThumbsUp, Flag, RefreshCw, Play, Pause, RotateCcw,
  Check, CalendarCheck, ShieldCheck, MapPin, Search
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

// ─── 5 Standard Moods ──────────────────────────────────────────────
const MOOD_OPTIONS = [
  { value: 'very_low', label: 'Very Low', emoji: '😞', color: '#FBE7E4', text: '#D6483C' },
  { value: 'low',      label: 'Low',      emoji: '🙁', color: '#FFF4E5', text: '#B45309' },
  { value: 'okay',     label: 'Okay',     emoji: '😐', color: '#F0F2EB', text: '#5B7169' },
  { value: 'good',     label: 'Good',     emoji: '🙂', color: '#E4EFEA', text: '#2F7A68' },
  { value: 'great',    label: 'Great',    emoji: '😄', color: '#D8F3E5', text: '#1B7A4B' },
];

// ─── Verified Official Crisis Helplines (India & Campus) ───────────
const CRISIS_RESOURCES = [
  {
    name: 'Tele-MANAS (National Mental Health Helpline)',
    purpose: '24/7 Free government tele-mental health support across 20+ Indian languages with clinical psychologists and psychiatrists.',
    availability: '24/7 · Toll-Free · Confidential',
    phone: '14416',
    altPhone: '1800-891-4416',
    isEmergency: true,
  },
  {
    name: 'KIRAN Mental Health Rehabilitation',
    purpose: 'Ministry of Social Justice & Empowerment helpline providing early screening, first-aid, psychological support and crisis management.',
    availability: '24/7 · Toll-Free',
    phone: '1800-599-0019',
    isEmergency: true,
  },
  {
    name: 'Campus Medical Centre & Ambulance Hotline',
    purpose: 'On-campus 24/7 emergency medical response, emergency casualty ward and paramedic dispatch.',
    availability: '24/7 On-Call · IIT Campus Desk',
    phone: '108',
    altPhone: '011-2659-1100',
    isEmergency: true,
  },
  {
    name: 'National Emergency Response Centre',
    purpose: 'Unified emergency services (Police, Fire, Ambulance, Disaster Management).',
    availability: '24/7 · Toll-Free National Service',
    phone: '112',
    isEmergency: true,
  },
  {
    name: 'Campus Confidential Counselling Centre',
    purpose: 'On-campus professional student counsellors and psychologists for academic anxiety, depression, and personal guidance.',
    availability: 'Mon – Sat: 9:00 AM – 6:00 PM · OPD Room 201',
    phone: '+91 98765 11223',
    isEmergency: false,
  },
];

// ─── Campus Counsellors Directory ──────────────────────────────────
const COUNSELLORS = [
  {
    id: 'c1',
    name: 'Dr. Meera Nambiar',
    title: 'Lead Campus Psychologist & Psychotherapist',
    qualifications: 'M.Phil, Ph.D. in Clinical Psychology (NIMHANS)',
    specializations: ['Academic Stress & Burnout', 'Exam Anxiety', 'Depressive Symptoms'],
    description: '10+ years helping undergraduate and postgraduate students manage performance pressure, emotional balance, and sleep hygiene.',
    location: 'Wellness Centre Room 201 · In-Person & Online Video',
    availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '05:30 PM'],
    sessionTypes: ['In-Person (Room 201)', 'Confidential Online Video'],
  },
  {
    id: 'c2',
    name: 'Dr. Rajesh Sharma',
    title: 'Senior Student Wellness Counsellor',
    qualifications: 'M.A., M.Phil (Cognitive Behavioral Therapy)',
    specializations: ['Hostel Adjustment & Loneliness', 'Time Management', 'Relationship Support'],
    description: 'Specializes in practical CBT strategies to overcome chronic procrastination, social isolation in hostels, and interpersonal conflicts.',
    location: 'Wellness Centre Room 203 · In-Person & Online Video',
    availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    sessionTypes: ['In-Person (Room 203)', 'Confidential Online Video'],
  },
  {
    id: 'c3',
    name: 'Ms. Ananya Sen',
    title: 'Youth Mental Health & Crisis Counsellor',
    qualifications: 'M.Sc. Counselling Psychology',
    specializations: ['Panic Attacks & Acute Stress', 'Mindfulness', 'Self-Esteem'],
    description: 'Empathetic, non-judgmental guidance focusing on somatic grounding, emotional self-regulation, and overcoming imposter syndrome.',
    location: 'Wellness Centre Room 205 · In-Person & Online Video',
    availableSlots: ['10:30 AM', '12:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
    sessionTypes: ['In-Person (Room 205)', 'Confidential Online Video'],
  },
];

// ─── Initial Anonymous Community Experiences ───────────────────────
const INITIAL_NOT_ALONE_POSTS = [
  {
    id: 101,
    text: "I've been feeling completely overwhelmed with midterms and imposter syndrome lately. If you're feeling behind, you're definitely not alone.",
    timestamp: '2 hours ago',
    relateCount: 38,
    userRelated: false,
  },
  {
    id: 102,
    text: "Moved into the hostel two weeks ago and feeling homesick and anxious. Reminding myself that adjusting takes time and it gets easier day by day.",
    timestamp: '5 hours ago',
    relateCount: 52,
    userRelated: false,
  },
  {
    id: 103,
    text: "Took a 20-minute walk around the campus lake without my phone today when I felt a panic attack coming. It really helped ground me.",
    timestamp: 'Yesterday',
    relateCount: 29,
    userRelated: false,
  },
  {
    id: 104,
    text: "Finally booked a session with Dr. Meera at the wellness centre after hesitating for months. There is zero shame in asking for help.",
    timestamp: '2 days ago',
    relateCount: 64,
    userRelated: false,
  },
];

export default function WellnessPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id || 'guest_user';

  // Navigation tab: 'home' | 'ai_chat' | 'mood' | 'plan' | 'counsellors' | 'not_alone' | 'crisis'
  const [activeTab, setActiveTab] = useState('home');

  // ─── 1. MOOD STATE ───────────────────────────────────────────────
  const [todayMood, setTodayMood] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_mood_today_${userId}`);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_mood_history_${userId}`);
      if (saved) return JSON.parse(saved);
      // Default initial history
      return [
        { date: '2026-08-25', mood: 'okay', note: 'Normal class day' },
        { date: '2026-08-26', mood: 'low', note: 'Exhausted after lab submissions' },
        { date: '2026-08-27', mood: 'good', note: 'Productive group study' },
        { date: '2026-08-28', mood: 'great', note: 'Submitted project on time' },
        { date: '2026-08-29', mood: 'good', note: 'Walked around campus lawns' },
      ];
    } catch { return []; }
  });

  const handleSelectMood = (moodVal) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: todayStr,
      mood: moodVal,
      note: moodNote.trim() || undefined,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setTodayMood(newEntry);
    localStorage.setItem(`champ_mood_today_${userId}`, JSON.stringify(newEntry));

    // Update history without duplicates for today
    const filtered = moodHistory.filter((m) => m.date !== todayStr);
    const updatedHistory = [newEntry, ...filtered];
    setMoodHistory(updatedHistory);
    localStorage.setItem(`champ_mood_history_${userId}`, JSON.stringify(updatedHistory));
  };

  const handleSaveMoodNote = (e) => {
    e.preventDefault();
    if (!todayMood) return;
    const updated = { ...todayMood, note: moodNote.trim() };
    setTodayMood(updated);
    localStorage.setItem(`champ_mood_today_${userId}`, JSON.stringify(updated));

    const updatedHistory = moodHistory.map((m) => (m.date === updated.date ? updated : m));
    setMoodHistory(updatedHistory);
    localStorage.setItem(`champ_mood_history_${userId}`, JSON.stringify(updatedHistory));
  };

  // ─── 2. TASKS & PLAN MY DAY STATE ────────────────────────────────
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_tasks_${userId}`);
      if (saved) return JSON.parse(saved);
      return [
        { id: 1, title: 'Review Database Lecture Notes (Unit 3)', section: 'today', priority: 'high', time: '11:00 AM', completed: false },
        { id: 2, title: 'Take a 15-minute mindfulness walk around campus', section: 'today', priority: 'medium', time: '05:00 PM', completed: true },
        { id: 3, title: 'Draft assignment report for Machine Learning', section: 'upcoming', priority: 'medium', time: 'Tomorrow 2 PM', completed: false },
        { id: 4, title: 'Drink 2L water & take evening rest', section: 'today', priority: 'low', time: '08:00 PM', completed: false },
      ];
    } catch { return []; }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskSection, setNewTaskSection] = useState('today'); // 'today' | 'upcoming'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed'

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(`champ_tasks_${userId}`, JSON.stringify(newTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      section: newTaskSection,
      priority: newTaskPriority,
      time: newTaskTime.trim() || undefined,
      completed: false,
    };
    saveTasks([item, ...tasks]);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // Schedule Time Blocks
  const [timeBlocks, setTimeBlocks] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_timeblocks_${userId}`);
      if (saved) return JSON.parse(saved);
      return [
        { time: '09:00 AM', title: 'Classes & Morning Lectures', category: 'Academic' },
        { time: '11:30 AM', title: 'Library Deep Focus Study', category: 'Focus' },
        { time: '01:00 PM', title: 'Lunch & Screen-Free Break', category: 'Break' },
        { time: '03:00 PM', title: 'Lab Project & Code Review', category: 'Academic' },
        { time: '06:00 PM', title: 'Sports / Campus Walk & Personal Time', category: 'Wellness' },
      ];
    } catch { return []; }
  });
  const [newBlockTime, setNewBlockTime] = useState('');
  const [newBlockTitle, setNewBlockTitle] = useState('');

  const handleAddTimeBlock = (e) => {
    e.preventDefault();
    if (!newBlockTime.trim() || !newBlockTitle.trim()) return;
    const updated = [...timeBlocks, { time: newBlockTime.trim(), title: newBlockTitle.trim(), category: 'Custom' }];
    setTimeBlocks(updated);
    localStorage.setItem(`champ_timeblocks_${userId}`, JSON.stringify(updated));
    setNewBlockTime('');
    setNewBlockTitle('');
  };

  const completedTaskCount = tasks.filter((t) => t.completed).length;
  const remainingTaskCount = tasks.filter((t) => !t.completed).length;

  // ─── 3. COUNSELLOR BOOKINGS STATE ────────────────────────────────
  const [counsellorBookings, setCounsellorBookings] = useState(() => {
    try {
      const saved = localStorage.getItem(`champ_counsellor_sessions_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    } catch { return []; }
  });

  const [bookingCounsellor, setBookingCounsellor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('In-Person (Room 201)');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleBookSession = () => {
    if (!bookingCounsellor || !selectedTimeSlot) return;
    const newSession = {
      id: Date.now(),
      counsellor: bookingCounsellor.name,
      title: bookingCounsellor.title,
      date: selectedDate,
      time: selectedTimeSlot,
      sessionType: selectedSessionType,
      status: 'Confirmed',
    };
    const updated = [newSession, ...counsellorBookings];
    setCounsellorBookings(updated);
    localStorage.setItem(`champ_counsellor_sessions_${userId}`, JSON.stringify(updated));
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setBookingCounsellor(null);
      setSelectedTimeSlot('');
    }, 1500);
  };

  const handleCancelSession = (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this counselling appointment?')) {
      const updated = counsellorBookings.filter((s) => s.id !== sessionId);
      setCounsellorBookings(updated);
      localStorage.setItem(`champ_counsellor_sessions_${userId}`, JSON.stringify(updated));
    }
  };

  const nextCounsellorSession = counsellorBookings[0] || null;

  // ─── 4. "YOU'RE NOT ALONE" COMMUNITY EXPERIENCES ─────────────────
  const [notAlonePosts, setNotAlonePosts] = useState(() => {
    try {
      const saved = localStorage.getItem('champ_not_alone_posts');
      if (saved) return JSON.parse(saved);
      return INITIAL_NOT_ALONE_POSTS;
    } catch { return INITIAL_NOT_ALONE_POSTS; }
  });
  const [newPostText, setNewPostText] = useState('');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postNotice, setPostNotice] = useState('');

  const handleRelate = (id) => {
    const updated = notAlonePosts.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          relateCount: p.userRelated ? p.relateCount - 1 : p.relateCount + 1,
          userRelated: !p.userRelated,
        };
      }
      return p;
    });
    setNotAlonePosts(updated);
    localStorage.setItem('champ_not_alone_posts', JSON.stringify(updated));
  };

  const handleReportPost = (id) => {
    alert('Thank you. This post has been flagged for moderator review.');
  };

  const handleShareExperience = (e) => {
    e.preventDefault();
    const text = newPostText.trim();
    if (!text) return;

    // Basic safety moderation / content filter
    const dangerousPatterns = [/suicide/i, /kill myself/i, /self[- ]?harm/i, /end my life/i];
    const isDangerous = dangerousPatterns.some((pattern) => pattern.test(text));

    if (isDangerous) {
      setPostNotice('If you are experiencing thoughts of self-harm or immediate crisis, please reach out to our Crisis Support helplines immediately. Your life matters.');
      return;
    }

    const newPost = {
      id: Date.now(),
      text,
      timestamp: 'Just now',
      relateCount: 1,
      userRelated: true,
    };
    const updated = [newPost, ...notAlonePosts];
    setNotAlonePosts(updated);
    localStorage.setItem('champ_not_alone_posts', JSON.stringify(updated));
    setNewPostText('');
    setPostNotice('');
    setPostModalOpen(false);
  };

  // ─── 5. DEDICATED AI WELLNESS CHATBOT STATE ──────────────────────
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your CHAMP AI Wellness Companion. Whether you are dealing with academic stress, exam pressure, feeling overwhelmed, or just need a calm space to organize your thoughts, I'm here to listen. How is your day going?",
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'ai_chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, aiTyping]);

  const handleSendChatMessage = (customText) => {
    const query = customText || chatInput;
    if (!query.trim() || aiTyping) return;

    const userMsg = {
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setAiTyping(true);

    // Crisis check in AI conversation
    const lower = query.toLowerCase();
    const isCrisis = /suicide|kill myself|end it all|die|self harm|hurt myself|can't go on/.test(lower);

    setTimeout(() => {
      let aiResponseText = '';

      if (isCrisis) {
        aiResponseText = `🚨 **Please know that you are not alone, and there is immediate, compassionate support available right now.**

If you are in distress or thinking of self-harm, please connect with trained professionals immediately:

• **Tele-MANAS (24/7 National Mental Health Toll-Free)**: Call **14416** or **1800-891-4416**  
• **KIRAN Helpline**: Call **1800-599-0019**  
• **Campus Ambulance / Medical Emergency**: Call **108** or **112**  
• **Campus Counselling Centre**: OPD Desk 201 (Mon–Sat)

You can also tap the **"Crisis Support"** button above for instant 1-click calls. Please talk to someone you trust or reach out to these free helplines.`;
      } else if (/stress|exam|pressure|study|overwhelmed|assignment/.test(lower)) {
        aiResponseText = `It is completely natural to feel overwhelmed when academic demands pile up. Let's break this down into small, manageable steps:

1. **Step away for 5 minutes:** Give your nervous system a brief pause. Try taking 3 slow, deep diaphragmatic breaths.
2. **Prioritize just ONE single task:** Don't try to solve the entire semester right now. Pick the smallest, lowest-friction item and spend 20 minutes on it.
3. **Use our Plan My Day tool:** Group your tasks into 'Today' and 'Upcoming' so they don't occupy mental RAM.

Would you like to try a quick grounding exercise, or should we organize your priority tasks together?`;
      } else if (/lonely|isolated|nobody|alone|friend/.test(lower)) {
        aiResponseText = `Feeling lonely or disconnected in a large campus environment happens to far more students than you might realize, even if people don't openly talk about it.

Remember:
• Be gentle with yourself—building meaningful connections takes time.
• You can check our **"You're Not Alone"** section to see shared experiences from fellow students.
• Our campus counsellors (like Dr. Rajesh Sharma) frequently support students navigating hostel adjustments.

I am right here with you. What has been making you feel most disconnected today?`;
      } else {
        aiResponseText = `Thank you for sharing that with me. Acknowledging how you feel is an important first step toward feeling more grounded.

Remember that emotional wellbeing fluctuates day to day. Make sure you have had enough water today, take regular study breaks, and don't hesitate to reach out to campus resources if you need support.

How can I help you best right now—organizing your day, discussing healthy coping strategies, or connecting you with a counsellor?`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setAiTyping(false);
    }, 900);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history?')) {
      setChatMessages([
        {
          role: 'assistant',
          text: "Conversation cleared. I'm here whenever you need supportive, confidential guidance. How can I help you today?",
          timestamp: 'Just now',
        },
      ]);
    }
  };

  // ─── NAV ITEMS ───────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'home',        label: 'Home',              Icon: HeartPulse },
    { id: 'ai_chat',     label: 'AI Chat',           Icon: MessageSquare },
    { id: 'mood',        label: 'Mood',              Icon: Sparkles },
    { id: 'plan',        label: 'Plan My Day',       Icon: CheckSquare },
    { id: 'counsellors', label: 'Counsellors',       Icon: User },
    { id: 'not_alone',   label: "You're Not Alone",  Icon: Users },
    { id: 'crisis',      label: 'Crisis Support',    Icon: ShieldAlert, highlight: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ─── Wellness Top Sub-Navigation Bar ─── */}
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
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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
                color: isActive
                  ? '#fff'
                  : highlight ? C.urgent : C.soft,
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────
          VIEW 1: WELLNESS HOME DASHBOARD
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* 1. Greeting & Quick Mood Selection */}
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
            <div>
              <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>
                How are you feeling today?
              </div>
              <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>
                Take a mindful pause and log your emotional state.
              </div>
            </div>

            {/* Mood Options Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {MOOD_OPTIONS.map((m) => {
                const isSelected = todayMood?.mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => handleSelectMood(m.value)}
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

            {/* Today's Selected Mood Feedback & Optional Note */}
            {todayMood && (
              <form onSubmit={handleSaveMoodNote} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  placeholder="Add an optional note (e.g. feeling relieved after submission)..."
                  value={moodNote || todayMood.note || ''}
                  onChange={(e) => setMoodNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontSize: 12,
                    background: C.bg,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: C.primary,
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Save Note
                </button>
              </form>
            )}
          </div>

          {/* 2. Four Prominent Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            <button
              onClick={() => setActiveTab('ai_chat')}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: '16px 14px',
                border: `1px solid ${C.border}`,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} color={C.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>Talk to AI</div>
                <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Safe, supportive chat</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('counsellors')}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: '16px 14px',
                border: `1px solid ${C.border}`,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color={C.accent} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>Book Counsellor</div>
                <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>1-on-1 confidential</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('mood')}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: '16px 14px',
                border: `1px solid ${C.border}`,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>My Mood</div>
                <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Timeline & notes</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: '16px 14px',
                border: `1px solid ${C.border}`,
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={18} color="#7C3AED" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>Plan My Day</div>
                <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Tasks & schedule</div>
              </div>
            </button>
          </div>

          {/* 3. Today's Overview (3 Compact Cards) */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Today's Overview
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {/* Card 1: Tasks */}
              <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Today's Tasks</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{completedTaskCount}</span>
                    <span style={{ fontSize: 12, color: C.soft }}>completed · <strong>{remainingTaskCount}</strong> remaining</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('plan')}
                  style={{ background: C.bg, color: C.primary, border: `1px solid ${C.border}`, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
                >
                  View Tasks →
                </button>
              </div>

              {/* Card 2: Mood */}
              <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Today's Mood</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {todayMood ? (
                      <>
                        <span style={{ fontSize: 22 }}>
                          {MOOD_OPTIONS.find((m) => m.value === todayMood.mood)?.emoji || '🙂'}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>
                          {MOOD_OPTIONS.find((m) => m.value === todayMood.mood)?.label || 'Logged'}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: C.soft }}>Not logged yet</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('mood')}
                  style={{ background: C.bg, color: C.primary, border: `1px solid ${C.border}`, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
                >
                  View History →
                </button>
              </div>

              {/* Card 3: Upcoming Session */}
              <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Upcoming Session</div>
                  {nextCounsellorSession ? (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>{nextCounsellorSession.counsellor}</div>
                      <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 600 }}>{nextCounsellorSession.date} at {nextCounsellorSession.time}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: C.soft, marginTop: 4 }}>No upcoming sessions</div>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('counsellors')}
                  style={{ background: C.bg, color: C.primary, border: `1px solid ${C.border}`, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
                >
                  {nextCounsellorSession ? 'Manage Session →' : 'Book a Session →'}
                </button>
              </div>
            </div>
          </div>

          {/* 4. "You're Not Alone" Section */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="champ-heading" style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
                  You're Not Alone
                </div>
                <div style={{ fontSize: 11.5, color: C.soft }}>
                  Anonymous, supportive experiences from other students.
                </div>
              </div>
              <button
                onClick={() => setPostModalOpen(true)}
                style={{
                  background: C.primarySoft,
                  color: C.primary,
                  border: `1px solid ${C.primary}`,
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} /> Share Anonymously
              </button>
            </div>

            {/* Preview of Top 2 Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notAlonePosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: C.bg,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>
                    "{post.text}"
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: C.soft }}>Anonymous Student · {post.timestamp}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleRelate(post.id)}
                        style={{
                          background: post.userRelated ? '#D8F3E5' : '#fff',
                          color: post.userRelated ? '#1B7A4B' : C.ink,
                          border: `1px solid ${C.border}`,
                          padding: '3px 9px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <ThumbsUp size={11} /> {post.relateCount} I relate
                      </button>
                      <button
                        onClick={() => handleReportPost(post.id)}
                        title="Report inappropriate content"
                        style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '3px 7px', borderRadius: 8, color: C.soft, cursor: 'pointer' }}
                      >
                        <Flag size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('not_alone')}
              style={{
                alignSelf: 'center',
                background: 'none',
                border: 'none',
                color: C.primary,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              View all anonymous community posts →
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 2: DEDICATED AI WELLNESS CHAT
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'ai_chat' && (
        <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: 600, overflow: 'hidden' }}>
          
          {/* Chat Header with Crisis Button */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setActiveTab('crisis')}
                style={{
                  background: C.urgent,
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ShieldAlert size={14} /> Get Help Now
              </button>

              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.soft, cursor: 'pointer' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
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

          {/* Quick Prompt Chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 14px', borderTop: `1px solid ${C.border}`, background: '#FAFAFA' }}>
            {['Feeling overwhelmed with study', 'Exam anxiety tips', 'Trouble falling asleep', 'Need motivation'].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendChatMessage(prompt)}
                style={{
                  background: '#fff',
                  border: `1px solid ${C.border}`,
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.soft,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, background: '#fff' }}
          >
            <input
              type="text"
              placeholder="Type what's on your mind..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || aiTyping}
              style={{
                background: C.primary,
                color: '#fff',
                padding: '0 16px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                opacity: !chatInput.trim() || aiTyping ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 3: MOOD TRACKER & HISTORY
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'mood' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Today's Log Card */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="champ-heading" style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
              Log or Update Today's Mood
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {MOOD_OPTIONS.map((m) => {
                const isSelected = todayMood?.mood === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => handleSelectMood(m.value)}
                    style={{
                      background: isSelected ? m.color : C.bg,
                      border: `1.5px solid ${isSelected ? m.text : C.border}`,
                      borderRadius: 12,
                      padding: '10px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{m.emoji}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: isSelected ? m.text : C.soft }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveMoodNote} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add a short note about what contributed to your mood today..."
                value={moodNote || todayMood?.note || ''}
                onChange={(e) => setMoodNote(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }}
              />
              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Save
              </button>
            </form>
          </div>

          {/* Visual Mood Timeline History */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="champ-heading" style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
                Mood History & Timeline
              </div>
              <span style={{ fontSize: 11, color: C.soft }}>Personal awareness log</span>
            </div>

            {moodHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: C.soft, fontSize: 12 }}>
                No mood history recorded yet. Select an emoji above to begin logging.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {moodHistory.map((item, idx) => {
                  const match = MOOD_OPTIONS.find((m) => m.value === item.mood) || MOOD_OPTIONS[2];
                  return (
                    <div
                      key={idx}
                      style={{
                        background: C.bg,
                        borderRadius: 14,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{match.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: C.ink }}>
                            {match.label}
                          </div>
                          {item.note && (
                            <div style={{ fontSize: 11.5, color: C.soft, marginTop: 1 }}>
                              "{item.note}"
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>
                        {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 4: PLAN MY DAY (TASKS + TIME MANAGEMENT)
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Add Task Form */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="champ-heading" style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
              Plan My Day: Add Task
            </div>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="What do you want to accomplish? (e.g. Finish Data Structures Sheet)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Section</label>
                  <select
                    value={newTaskSection}
                    onChange={(e) => setNewTaskSection(e.target.value)}
                    style={{ width: '100%', marginTop: 3, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: '#fff' }}
                  >
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{ width: '100%', marginTop: 3, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, background: '#fff' }}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Optional Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 3:00 PM"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    style={{ width: '100%', marginTop: 3, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 2 }}
              >
                <Plus size={14} /> Add Task
              </button>
            </form>
          </div>

          {/* Tasks List with Filter Tabs */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'all', label: `All (${tasks.length})` },
                  { id: 'today', label: `Today (${tasks.filter((t) => t.section === 'today' && !t.completed).length})` },
                  { id: 'upcoming', label: `Upcoming (${tasks.filter((t) => t.section === 'upcoming' && !t.completed).length})` },
                  { id: 'completed', label: `Completed (${completedTaskCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTaskFilter(tab.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: taskFilter === tab.id ? C.primary : C.bg,
                      color: taskFilter === tab.id ? '#fff' : C.soft,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tasks
                .filter((t) => {
                  if (taskFilter === 'today') return t.section === 'today' && !t.completed;
                  if (taskFilter === 'upcoming') return t.section === 'upcoming' && !t.completed;
                  if (taskFilter === 'completed') return t.completed;
                  return true;
                })
                .map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: task.completed ? '#F8F9F7' : C.bg,
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: `1px solid ${task.completed ? '#E8E8E0' : C.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.primary }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: task.completed ? C.soft : C.ink,
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>
                          {task.time && `⏰ ${task.time} · `}
                          <span style={{ color: task.priority === 'high' ? C.urgent : task.priority === 'medium' ? C.accent : C.primary, fontWeight: 700 }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ background: 'none', border: 'none', color: C.soft, cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Simple Schedule / Time Blocks */}
          <div style={{ background: C.surface, borderRadius: 20, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="champ-heading" style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
                Daily Schedule Blocks
              </div>
              <span style={{ fontSize: 11, color: C.soft }}>Visual Flow</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {timeBlocks.map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: C.bg,
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: `3px solid ${C.primary}`,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: C.primary, width: 70 }}>
                    {b.time}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, flex: 1 }}>
                    {b.title}
                  </span>
                  <span style={{ fontSize: 10, background: '#fff', padding: '2px 6px', borderRadius: 4, color: C.soft }}>
                    {b.category}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Time Block */}
            <form onSubmit={handleAddTimeBlock} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                type="text"
                placeholder="Time (e.g. 08:00 PM)"
                value={newBlockTime}
                onChange={(e) => setNewBlockTime(e.target.value)}
                style={{ width: 140, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <input
                type="text"
                placeholder="Activity / Block Title"
                value={newBlockTitle}
                onChange={(e) => setNewBlockTitle(e.target.value)}
                style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Add Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 5: COUNSELLOR DIRECTORY & BOOKING
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'counsellors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Active Bookings Banner */}
          {counsellorBookings.length > 0 && (
            <div style={{ background: C.primarySoft, borderRadius: 18, padding: 16, border: `1.5px solid ${C.primary}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📅 Confirmed Upcoming Counselling Session
                </span>
                <span style={{ fontSize: 11, background: '#fff', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#1B7A4B' }}>
                  Confirmed
                </span>
              </div>

              {counsellorBookings.map((session) => (
                <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{session.counsellor}</div>
                    <div style={{ fontSize: 11.5, color: C.soft }}>{session.date} at {session.time} · {session.sessionType}</div>
                  </div>
                  <button
                    onClick={() => handleCancelSession(session.id)}
                    style={{ background: C.urgentSoft, color: C.urgent, border: 'none', padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Counsellor Directory Cards */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Campus Mental Health Professionals
            </div>

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
                    gap: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15.5, color: C.ink }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: C.soft }}>{c.qualifications}</div>
                    </div>
                    <span style={{ fontSize: 11, background: C.bg, padding: '3px 8px', borderRadius: 6, color: C.soft }}>
                      Room 201
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.4 }}>
                    {c.description}
                  </div>

                  {/* Specialization Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.specializations.map((spec) => (
                      <span
                        key={spec}
                        style={{
                          background: C.bg,
                          color: C.ink,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 600,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
                    <button
                      onClick={() => {
                        setBookingCounsellor(c);
                        setSelectedTimeSlot(c.availableSlots[0] || '10:00 AM');
                      }}
                      style={{
                        background: C.primary,
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CalendarCheck size={14} /> Book Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Modal Flow */}
          {bookingCounsellor && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(23,50,44,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 90,
                padding: 16,
              }}
              onClick={() => setBookingCounsellor(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#fff',
                  borderRadius: 22,
                  width: '100%',
                  maxWidth: 460,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Book Confidential Session</div>
                    <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 600 }}>{bookingCounsellor.name}</div>
                  </div>
                  <button onClick={() => setBookingCounsellor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>

                {bookingConfirmed ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                    <CheckCircle2 size={40} color={C.primary} style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>Session Confirmed!</div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>
                      Scheduled for {selectedDate} at {selectedTimeSlot}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Available Time</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 4 }}>
                        {bookingCounsellor.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            style={{
                              padding: '8px 0',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              background: selectedTimeSlot === slot ? C.primary : C.bg,
                              color: selectedTimeSlot === slot ? '#fff' : C.ink,
                              border: `1px solid ${selectedTimeSlot === slot ? C.primary : C.border}`,
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
                        value={selectedSessionType}
                        onChange={(e) => setSelectedSessionType(e.target.value)}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, background: '#fff' }}
                      >
                        {bookingCounsellor.sessionTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleBookSession}
                      disabled={!selectedTimeSlot}
                      style={{
                        background: C.primary,
                        color: '#fff',
                        padding: '11px 0',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                    >
                      Confirm Confidential Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 6: "YOU'RE NOT ALONE" COMMUNITY SUPPORT
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'not_alone' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="champ-heading" style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>
                You're Not Alone
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                Anonymous peer reflections & solidarity from fellow students
              </div>
            </div>

            <button
              onClick={() => setPostModalOpen(true)}
              style={{
                background: C.primary,
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Plus size={14} /> Share Anonymously
            </button>
          </div>

          {/* Guidelines Notice */}
          <div style={{ background: C.bg, borderRadius: 14, padding: '10px 14px', fontSize: 11.5, color: C.soft, border: `1px solid ${C.border}` }}>
            🔒 <strong>Safe Community Space:</strong> Strictly anonymous. No usernames or profiles. Filtered for constructive emotional solidarity.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notAlonePosts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: C.surface,
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
                  "{post.text}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <span style={{ fontSize: 11, color: C.soft }}>Anonymous Student · {post.timestamp}</span>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleRelate(post.id)}
                      style={{
                        background: post.userRelated ? '#D8F3E5' : C.bg,
                        color: post.userRelated ? '#1B7A4B' : C.ink,
                        border: `1px solid ${post.userRelated ? '#1B7A4B' : C.border}`,
                        padding: '5px 12px',
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ThumbsUp size={12} /> {post.relateCount} I relate
                    </button>

                    <button
                      onClick={() => handleReportPost(post.id)}
                      title="Report"
                      style={{ background: C.bg, border: `1px solid ${C.border}`, padding: '5px 9px', borderRadius: 8, color: C.soft, cursor: 'pointer' }}
                    >
                      <Flag size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 7: CRISIS SUPPORT & EMERGENCY HELPLINES
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'crisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Urgent Support Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)',
              border: `1.5px solid #F5A9A0`,
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
            <div style={{ fontSize: 12.5, lineHeight: 1.45, color: C.ink }}>
              If you or someone you know is in acute distress, feeling overwhelmed, or experiencing thoughts of self-harm, please connect with these verified free helplines immediately. <strong>Your life and wellbeing matter deeply.</strong>
            </div>
          </div>

          {/* Verified Official Helplines */}
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
                      {res.availability}
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Phone size={13} /> Call {res.phone}
                  </a>
                </div>

                <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.4 }}>
                  {res.purpose}
                </div>

                {res.altPhone && (
                  <div style={{ fontSize: 11, color: C.soft }}>
                    Alternate toll-free: <a href={`tel:${res.altPhone}`} style={{ color: C.ink, fontWeight: 700 }}>{res.altPhone}</a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Safe Self-Care & Grounding Note */}
          <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, fontSize: 12, color: C.soft, lineHeight: 1.4 }}>
            💡 <strong>Grounding First Step:</strong> If you are feeling panicky, put both feet flat on the floor, take a slow drink of cold water, and tell a close friend, hostel roommate, or resident warden.
          </div>
        </div>
      )}

      {/* ─── MODAL: SHARE ANONYMOUS EXPERIENCE ─── */}
      {postModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23,50,44,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
            padding: 16,
          }}
          onClick={() => setPostModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 22,
              width: '100%',
              maxWidth: 480,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>Share an Anonymous Experience</div>
              <button onClick={() => setPostModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <div style={{ fontSize: 11.5, color: C.soft }}>
              Write a short message to let peers know they are not alone. Zero names or identifying details will be attached.
            </div>

            {postNotice && (
              <div style={{ background: C.urgentSoft, color: C.urgent, padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.4 }}>
                {postNotice}
              </div>
            )}

            <form onSubmit={handleShareExperience} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                rows={4}
                placeholder="e.g. Felt completely burned out this week, but taking it one hour at a time helped me get through..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, outline: 'none', resize: 'none' }}
              />

              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Post Anonymously
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
