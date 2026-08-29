import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Pill, HeartPulse, ShieldAlert, Clock, Sparkles } from 'lucide-react';
import { getMyAppointments } from '../api/index.js';
import { useAuthStore } from '../store/store.js';
import OutbreakBanner from '../components/OutbreakBanner.jsx';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FBF0DC',
  surface: '#FFFFFF',
  border: '#E1E3DA',
};

function QuickAction({ icon: Icon, label, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: highlight ? C.urgentSoft : C.surface,
        border: `1px solid ${highlight ? 'transparent' : C.border}`,
        borderRadius: 16,
        padding: '16px 14px',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <Icon size={20} color={highlight ? C.urgent : C.primary} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

export default function HomePage({ onEmergency, onOpenAI }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getMyAppointments().then((r) => r.data),
  });

  const next = appointments.find((a) => a.status === 'confirmed' || a.status === 'in_consultation');

  return (
    <div>
      <div className="champ-heading" style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, marginTop: 4, color: C.ink }}>
        Hey {user?.name?.split(' ')[0] || 'there'} 👋
      </div>
      <div style={{ fontSize: 13, color: C.soft, marginBottom: 14 }}>
        Campus Health Desk · Block A Ground Floor
      </div>

      {/* Live Campus Outbreak Alert Banner with Radar */}
      <OutbreakBanner onOpenAI={onOpenAI} onBook={() => navigate('/appointments')} />

      {/* Gemini AI Quick Assistant Card */}
      <button
        onClick={() => onOpenAI()}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 18,
          padding: '14px 16px',
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          cursor: 'pointer',
          boxShadow: '0 8px 20px -6px rgba(23,50,44,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#FFE699" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Unsure which doctor to visit?</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>Check symptoms with Gemini AI Health Assistant</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 8 }}>
          Ask AI →
        </span>
      </button>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <QuickAction icon={Calendar}   label="Book Appointment" onClick={() => navigate('/appointments')} />
        <QuickAction icon={Pill}        label="Pharmacy & Rx"    onClick={() => navigate('/pharmacy')} />
        <QuickAction icon={HeartPulse}  label="Wellness"         onClick={() => navigate('/wellness')} />
        <QuickAction icon={ShieldAlert} label="Emergency 108"    onClick={onEmergency} highlight />
      </div>

      {/* Upcoming appointment */}
      {next && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {next.status === 'in_consultation' ? '🩺 In Consultation Now' : 'Upcoming Consultation'}
          </div>
          <div
            style={{
              background: next.status === 'in_consultation' ? C.primarySoft : C.surface,
              borderRadius: 16,
              padding: 16,
              border: `1.5px solid ${next.status === 'in_consultation' ? C.primary : C.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{next.doctor_name}</div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{next.specialty}</div>
              </div>
              <div style={{ background: C.primary, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                {next.status === 'in_consultation' ? 'Your Turn' : `#${next.queue_pos} in queue`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: C.soft }}>
              <Clock size={14} />
              {String(next.slot_time).slice(0, 5)} · {new Date(next.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
