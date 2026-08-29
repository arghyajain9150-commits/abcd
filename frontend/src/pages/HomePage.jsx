import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Pill, HeartPulse, ShieldAlert, Clock, Sparkles, Activity, ShieldCheck, MapPin } from 'lucide-react';
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
  bg: '#F5F7F3',
};

function QuickAction({ icon: Icon, label, desc, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: highlight ? C.urgentSoft : C.surface,
        border: `1px solid ${highlight ? 'transparent' : C.border}`,
        borderRadius: 18,
        padding: '16px 14px',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: highlight ? '#F5A9A0' : C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={highlight ? C.urgent : C.primary} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>{desc}</div>}
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .home-desktop-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 840px) {
          .home-desktop-grid {
            display: grid;
            grid-template-columns: 1.15fr 1.1fr;
            align-items: flex-start;
            gap: 24px;
          }
        }
      `}</style>

      {/* Header Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="champ-heading" style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
            Hey {user?.name?.split(' ')[0] || 'there'} 👋
          </div>
          <div style={{ fontSize: 13, color: C.soft, marginTop: 2 }}>
            Campus Health Centre · Block A Ground Floor · 24/7 Triage
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.primarySoft, padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, color: C.primary }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1B7A4B' }} />
          <span>OPD Clinic Active</span>
        </div>
      </div>

      <div className="home-desktop-grid">
        {/* ─── LEFT COLUMN: Quick Services & Active Consultation ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Gemini AI Quick Assistant Banner */}
          <button
            onClick={() => onOpenAI()}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
              borderRadius: 18,
              padding: '16px 18px',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 8px 24px -6px rgba(23,50,44,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#FFE699" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Feeling unwell or need guidance?</div>
                <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 1 }}>Check symptoms with Gemini AI Health Assistant</div>
              </div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: 8 }}>
              Ask AI →
            </span>
          </button>

          {/* Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <QuickAction icon={Calendar}   label="Book OPD Slot" desc="Pick doctor & time" onClick={() => navigate('/appointments')} />
            <QuickAction icon={Pill}        label="Pharmacy & Rx"  desc="Pickup pass & stock" onClick={() => navigate('/pharmacy')} />
            <QuickAction icon={HeartPulse}  label="Campus Wellness" desc="Guides & tips" onClick={() => navigate('/wellness')} />
            <QuickAction icon={ShieldAlert} label="Emergency Desk"  desc="Call 108 Ambulance" onClick={onEmergency} highlight />
          </div>

          {/* Upcoming Consultation */}
          {next && (
            <div style={{ background: next.status === 'in_consultation' ? C.primarySoft : C.surface, borderRadius: 18, padding: 18, border: `1.5px solid ${next.status === 'in_consultation' ? C.primary : C.border}`, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>
                    {next.status === 'in_consultation' ? '🩺 Your Turn Now' : 'Upcoming Consultation'}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.ink, marginTop: 2 }}>{next.doctor_name}</div>
                  <div style={{ fontSize: 12, color: C.primary, fontWeight: 600 }}>{next.specialty} · OPD Room 101</div>
                </div>
                <div style={{ background: C.primary, color: '#fff', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999 }}>
                  {next.status === 'in_consultation' ? 'In Room' : `#${next.queue_pos} in queue`}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: C.soft, background: C.bg, padding: '8px 12px', borderRadius: 10 }}>
                <Clock size={14} />
                <span>Slot: <strong>{String(next.slot_time).slice(0, 5)}</strong> on <strong>{new Date(next.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Live Campus Contagion Radar Heatmap ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <OutbreakBanner onOpenAI={onOpenAI} onBook={() => navigate('/appointments')} />
        </div>
      </div>
    </div>
  );
}
