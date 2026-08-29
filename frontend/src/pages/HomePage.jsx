import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Pill, HeartPulse, ShieldAlert, Clock, ShieldCheck } from 'lucide-react';
import { getMyAppointments } from '../api/index.js';
import { useAuthStore } from '../store/store.js';

const C = { ink: '#17322C', soft: '#5B7169', primary: '#2F7A68', primarySoft: '#E4EFEA', urgent: '#D6483C', urgentSoft: '#FBE7E4', accent: '#E3A542', accentSoft: '#FBF0DC', surface: '#FFFFFF', border: '#E1E3DA' };

function QuickAction({ icon: Icon, label, onClick, highlight }) {
  return (
    <button onClick={onClick} style={{ background: highlight ? C.urgentSoft : C.surface, border: `1px solid ${highlight ? 'transparent' : C.border}`, borderRadius: 16, padding: '16px 14px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      <Icon size={20} color={highlight ? C.urgent : C.primary} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

export default function HomePage({ onEmergency }) {
  const navigate  = useNavigate();
  const user      = useAuthStore((s) => s.user);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getMyAppointments().then((r) => r.data),
  });

  const next = appointments.find((a) => a.status === 'confirmed');

  return (
    <div>
      <div className="champ-heading" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4, marginTop: 4 }}>
        Hey {user?.name?.split(' ')[0] || 'there'} 👋
      </div>
      <div style={{ fontSize: 14, color: C.soft, marginBottom: 18 }}>How can we help today?</div>

      {/* Alert banner */}
      <div style={{ background: C.accentSoft, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, marginBottom: 20 }}>
        <ShieldCheck size={20} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, lineHeight: 1.5, color: C.ink }}>
          Seasonal flu cases are rising on campus — stay hydrated and mask up in crowded spaces.
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <QuickAction icon={Calendar}   label="Book Appointment" onClick={() => navigate('/appointments')} />
        <QuickAction icon={Pill}        label="Order Medicine"   onClick={() => navigate('/pharmacy')} />
        <QuickAction icon={HeartPulse}  label="Talk to Someone"  onClick={() => navigate('/wellness')} />
        <QuickAction icon={ShieldAlert} label="Emergency Help"   onClick={onEmergency} highlight />
      </div>

      {/* Upcoming appointment */}
      {next && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upcoming</div>
          <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{next.doctor_name}</div>
                <div style={{ fontSize: 13, color: C.soft, marginTop: 2 }}>{next.specialty}</div>
              </div>
              <div style={{ background: C.primarySoft, color: C.primary, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>
                #{next.queue_pos} in queue
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: C.soft }}>
              <Clock size={14} />
              {String(next.slot_time).slice(0, 5)} · {new Date(next.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
