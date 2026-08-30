import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Smile, Frown, Meh, Sparkles, Wind, Phone, ShieldCheck, Calendar, ArrowRight, Play, Pause, RotateCcw, ThumbsUp, MessageSquare, Plus, Check, Award, Users } from 'lucide-react';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
};

const MOODS = [
  { label: 'Calm', emoji: '😌', color: '#D8F3E5', textColor: '#1B7A4B', advice: 'Great mindset! Take a short walk around the campus lawns to maintain this positive flow.' },
  { label: 'Energetic', emoji: '⚡', color: '#FFF4E5', textColor: '#E3A542', advice: 'Channel this focus into challenging study tasks or sports at the campus ground today.' },
  { label: 'Stressed', emoji: '😰', color: '#FBE7E4', textColor: '#D6483C', advice: 'Exam or project pressure? Try our 2-minute 4-7-8 breathing exercise below to lower cortisol.' },
  { label: 'Exhausted', emoji: '😴', color: '#EBF3FF', textColor: '#2563EB', advice: 'Your body needs rest. Target 8 hours of sleep tonight and reduce caffeine intake after 6 PM.' },
  { label: 'Anxious', emoji: '🥺', color: '#F3E8FF', textColor: '#7C3AED', advice: 'You are safe and not alone. Consider scheduling a confidential chat with our campus counsellor.' },
];

const INITIAL_PEER_TIPS = [
  {
    id: 1,
    title: 'Hostel Block B Hydration & Electrolyte Hub',
    author: 'Aarav S. (Block B Rm 204)',
    category: 'Outbreak Prevention',
    upvotes: 48,
    upvoted: false,
    text: 'During this eye-flu & flu wave, we set up an ORS and paper napkin station near the Block B 2nd floor water cooler. Please avoid shared towels!',
  },
  {
    id: 2,
    title: '20-20-20 Rule for Exam Season Screen Glare',
    author: 'Priya M. (Biotech Dept)',
    category: 'Eye Care & Study',
    upvotes: 39,
    upvoted: false,
    text: 'Every 20 minutes of coding or studying, look at an object 20 feet away for 20 seconds. Drastically cuts down headaches and dry eye fatigue.',
  },
  {
    id: 3,
    title: 'Isolation Meal Buddy System for Quarantined Students',
    author: 'Sidharth V. (Hostel Council)',
    category: 'Community Support',
    upvotes: 62,
    upvoted: false,
    text: 'If you are isolated with viral fever in your room, tag your room number in the hostel WhatsApp group. Volunteers will leave mess food trays outside your door.',
  },
  {
    id: 4,
    title: 'Late Night Chamomile Tea at Campus Canteen',
    author: 'Rohan K. (Mechanical)',
    category: 'Sleep Hygiene',
    upvotes: 27,
    upvoted: false,
    text: 'Switching from energy drinks to herbal tea after midnight helped me fix sleep latency during midterm week.',
  },
];

const HELPLINES = [
  { name: 'Campus Counselling Centre', phone: '+91 98765 11223', available: '9 AM – 6 PM (Confidential)' },
  { name: 'Tele-MANAS (National Mental Health)', phone: '14416', available: '24/7 Toll-Free Helpline' },
  { name: 'KIRAN National Helpline', phone: '1800-599-0019', available: '24/7 Government Support' },
];

export default function WellnessPage() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [peerTips, setPeerTips] = useState(INITIAL_PEER_TIPS);
  const [newTipTitle, setNewTipTitle] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('Community Support');
  const [newTipText, setNewTipText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // ─── 4-7-8 Breathing Exercise State ──────────────────────────────
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale (4s), Hold (7s), Exhale (8s)
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

  const toggleBreathing = () => {
    if (!breathingActive) {
      setBreathPhase('Inhale');
      setCountdown(4);
    }
    setBreathingActive(!breathingActive);
  };

  const handleUpvote = (id) => {
    setPeerTips((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              upvotes: t.upvoted ? t.upvotes - 1 : t.upvotes + 1,
              upvoted: !t.upvoted,
            }
          : t
      )
    );
  };

  const handleAddTip = (e) => {
    e.preventDefault();
    if (!newTipTitle.trim() || !newTipText.trim()) return;

    const newTip = {
      id: Date.now(),
      title: newTipTitle,
      author: 'You (Campus Student)',
      category: newTipCategory,
      upvotes: 1,
      upvoted: true,
      text: newTipText,
    };

    setPeerTips([newTip, ...peerTips]);
    setNewTipTitle('');
    setNewTipText('');
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
          Mental Health & Wellness Hub
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
          Daily check-ins, guided relaxation & student peer support
        </div>
      </div>

      {/* ─── 1. Daily Mood Check-In ─── */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>How are you feeling today?</div>
          <span style={{ fontSize: 11, color: C.soft }}>Daily Self-Check</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {MOODS.map((m) => {
            const isSelected = selectedMood?.label === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setSelectedMood(m)}
                style={{
                  background: isSelected ? m.color : C.bg,
                  border: `1.5px solid ${isSelected ? m.textColor : C.border}`,
                  borderRadius: 14,
                  padding: '10px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: isSelected ? m.textColor : C.soft }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div style={{ background: selectedMood.color, borderRadius: 12, padding: '12px 14px', fontSize: 12, color: selectedMood.textColor, lineHeight: 1.4, marginTop: 2 }}>
            <strong>Campus Wellness Tip:</strong> {selectedMood.advice}
          </div>
        )}
      </div>

      {/* ─── 2. 4-7-8 Relaxing Breathing Exercise ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 20,
          padding: '20px 18px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          boxShadow: '0 8px 24px -6px rgba(23,50,44,0.3)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A3D9C9' }}>
            Interactive Calming Tool
          </div>
          <div className="champ-heading" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            4-7-8 Parasympathetic Breathing
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>
            Inhale (4s) → Hold breath (7s) → Slow exhale (8s) to quickly reduce exam anxiety.
          </div>
        </div>

        {/* Dynamic Breathing Bubble */}
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: breathingActive && breathPhase === 'Inhale' ? 'scale(1.2)' : breathingActive && breathPhase === 'Exhale' ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 3s ease-in-out',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FFE699' }}>
            {breathingActive ? breathPhase : 'Ready'}
          </span>
          <span style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>
            {breathingActive ? countdown : '4-7-8'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={toggleBreathing}
            style={{
              background: '#fff',
              color: C.primary,
              padding: '8px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {breathingActive ? <Pause size={15} /> : <Play size={15} />}
            {breathingActive ? 'Pause Exercise' : 'Start 2-Min Reset'}
          </button>
        </div>
      </div>

      {/* ─── 3. Open Innovation: Crowd-Sourced Student Wellness & Peer Forum ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🤝 Student Peer Support Forum
            </div>
            <div style={{ fontSize: 11.5, color: C.soft }}>Community-driven wellness tips & hostel initiatives</div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: C.primary,
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 11.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Share Tip +
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {peerTips.map((tip) => (
            <div
              key={tip.id}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: 14,
                border: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, background: C.primarySoft, color: C.primary, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
                    {tip.category}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.soft }}>{tip.author}</span>
                </div>

                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginTop: 4 }}>
                  {tip.title}
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 3, lineHeight: 1.4 }}>
                  "{tip.text}"
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: C.soft }}>Community Verified</span>
                <button
                  onClick={() => handleUpvote(tip.id)}
                  style={{
                    background: tip.upvoted ? '#D8F3E5' : C.bg,
                    color: tip.upvoted ? '#1B7A4B' : C.ink,
                    border: `1px solid ${tip.upvoted ? '#1B7A4B' : C.border}`,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <ThumbsUp size={13} /> {tip.upvotes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Confidential Campus Helplines ─── */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>Confidential 24/7 Mental Health Helplines</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HELPLINES.map((h, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 12, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: C.ink }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{h.available}</div>
              </div>
              <a
                href={`tel:${h.phone}`}
                style={{
                  background: C.primarySoft,
                  color: C.primary,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                }}
              >
                <Phone size={13} /> {h.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Tip Modal */}
      {modalOpen && (
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
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>Share a Campus Wellness Tip</div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddTip} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Category</label>
                <select
                  value={newTipCategory}
                  onChange={(e) => setNewTipCategory(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5 }}
                >
                  <option value="Outbreak Prevention">Outbreak Prevention & Hygiene</option>
                  <option value="Community Support">Community Support & Buddy System</option>
                  <option value="Eye Care & Study">Eye Care & Study Ergonomics</option>
                  <option value="Sleep Hygiene">Sleep Hygiene & Nutrition</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Tip Title</label>
                <input
                  type="text"
                  placeholder="e.g. Setting up hostel washroom sanitizers"
                  value={newTipTitle}
                  onChange={(e) => setNewTipTitle(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Details / Explanation</label>
                <textarea
                  rows={3}
                  placeholder="Explain how this tip helped you or your hostel mates..."
                  value={newTipText}
                  onChange={(e) => setNewTipText(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: C.primary, color: '#fff', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 4 }}
              >
                Post to Peer Support Forum
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
