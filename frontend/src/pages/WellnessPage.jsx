import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Smile, Frown, Meh, Sparkles, Wind, Phone, ShieldCheck, Calendar, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';

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

const HELPLINES = [
  { name: 'Campus Counselling Centre', phone: '+91 98765 11223', available: '9 AM – 6 PM (Confidential)' },
  { name: 'Tele-MANAS (National Mental Health)', phone: '14416', available: '24/7 Toll-Free Helpline' },
  { name: 'KIRAN National Helpline', phone: '1800-599-0019', available: '24/7 Government Support' },
];

export default function WellnessPage() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);

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

          // Transition phases
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
          Wellness & Counselling
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
          Mental health, daily mood check-ins & confidential campus support
        </div>
      </div>

      {/* ─── 1. Daily Mood Check-In ─── */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>How are you feeling right now?</div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: C.primary, background: C.primarySoft, padding: '2px 8px', borderRadius: 99 }}>
            Daily Check-in
          </span>
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
                }}
              >
                <span style={{ fontSize: 22 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? m.textColor : C.soft }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div style={{ background: selectedMood.color, color: selectedMood.textColor, padding: '10px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.4 }}>
            <strong>💡 Wellness Tip:</strong> {selectedMood.advice}
          </div>
        )}
      </div>

      {/* ─── 2. Guided 4-7-8 Breathing Relaxation Widget ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 20,
          padding: 20,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 10px 30px -10px rgba(23,50,44,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A3D9C9', marginBottom: 12 }}>
          <Wind size={15} /> 4-7-8 Breathing Guide
        </div>

        {/* Animated Visual Circle */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            transition: 'transform 3s ease-in-out',
            transform: breathingActive && breathPhase === 'Inhale' ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800 }}>{breathingActive ? breathPhase : 'Relax'}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{breathingActive ? countdown : '2m'}</div>
        </div>

        <div style={{ fontSize: 12, color: '#D2EDE4', maxWidth: 280, marginBottom: 14, lineHeight: 1.4 }}>
          {breathPhase === 'Inhale'
            ? 'Breathe in slowly through your nose (4s)'
            : breathPhase === 'Hold'
            ? 'Hold your breath gently (7s)'
            : 'Exhale completely through your mouth (8s)'}
        </div>

        <button
          onClick={toggleBreathing}
          style={{
            background: '#fff',
            color: C.primary,
            padding: '10px 24px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {breathingActive ? <><Pause size={15} /> Pause Exercise</> : <><Play size={15} /> Start Breathing Session</>}
        </button>
      </div>

      {/* ─── 3. Book Confidential Campus Counsellor ─── */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse size={20} color={C.primary} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Confidential Counselling</div>
            <div style={{ fontSize: 11.5, color: C.soft }}>1-on-1 private mental health support</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/appointments')}
          style={{
            background: C.primary,
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Book Slot <ArrowRight size={13} />
        </button>
      </div>

      {/* ─── 4. 24/7 Crisis & Support Helplines ─── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
          Emergency & Crisis Helplines
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {HELPLINES.map((h, i) => (
            <a
              key={i}
              href={`tel:${h.phone.replace(/\s/g, '')}`}
              style={{
                background: C.surface,
                borderRadius: 14,
                padding: '12px 14px',
                border: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: C.ink,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>{h.phone} · {h.available}</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.urgentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={15} color={C.urgent} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
