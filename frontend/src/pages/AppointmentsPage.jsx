import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, ChevronLeft, ChevronRight, Stethoscope, Calendar, X } from 'lucide-react';
import { getDoctors, getDoctorSlots, bookAppointment, getMyAppointments, cancelAppointment } from '../api/index.js';
import { socket, joinQueueRoom, leaveQueueRoom } from '../socket/socket.js';

const C = { ink: '#17322C', soft: '#5B7169', primary: '#2F7A68', primarySoft: '#E4EFEA', urgent: '#D6483C', urgentSoft: '#FBE7E4', surface: '#FFFFFF', border: '#E1E3DA' };

const today = new Date().toISOString().split('T')[0];

export default function AppointmentsPage() {
  const [view, setView] = useState('book'); // 'book' | 'current'

  return (
    <div>
      <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, marginTop: 4 }}>Appointments</div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: C.surface, borderRadius: 999, padding: 4, marginBottom: 20, border: `1px solid ${C.border}` }}>
        {[['book', 'Book New'], ['current', 'Current']].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '9px 0', borderRadius: 999, fontSize: 13, fontWeight: 600, background: view === v ? C.primary : 'transparent', color: view === v ? '#fff' : C.soft, border: 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {view === 'book'    && <BookFlow onBooked={() => setView('current')} />}
      {view === 'current' && <CurrentAppointments onBook={() => setView('book')} />}
    </div>
  );
}

// ── Book Flow ────────────────────────────────────────────────────
function BookFlow({ onBooked }) {
  const [step, setStep]           = useState('doctors'); // doctors | slots | confirm | done
  const [doctor, setDoctor]       = useState(null);
  const [slot, setSlot]           = useState(null);
  const [bookedAppt, setBookedAppt] = useState(null);
  const qc = useQueryClient();

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors().then((r) => r.data),
  });

  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', doctor?.id, today],
    queryFn: () => getDoctorSlots(doctor.id, today).then((r) => r.data),
    enabled: !!doctor,
  });

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookAppointment({ doctor_id: doctor.id, slot_id: slot.id }),
    onSuccess: (res) => {
      setBookedAppt(res.data);
      setStep('done');
      qc.invalidateQueries(['appointments']);
      // Join real-time queue room
      joinQueueRoom(doctor.id, today);
    },
    onError: (e) => alert(e.response?.data?.error || 'Booking failed'),
  });

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 10px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle2 size={32} color={C.primary} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Booked! 🎉</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 6 }}>Confirmed with {doctor?.name}</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 24 }}>
          Queue position: <strong style={{ color: C.primary }}>#{bookedAppt?.queuePos}</strong> · Check your email for details!
        </div>
        <button onClick={onBooked} style={{ background: C.primary, color: '#fff', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none' }}>
          View My Appointments
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div>
        <BackBtn onClick={() => setStep('slots')} />
        <div style={{ background: C.surface, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{doctor.name}</div>
          <div style={{ fontSize: 13, color: C.soft, marginTop: 2 }}>{doctor.specialty}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13 }}>
            <Clock size={14} color={C.primary} />
            {String(slot.slot_time).slice(0, 5)} · Today
          </div>
        </div>
        <button onClick={() => book()} disabled={isPending} style={{ width: '100%', background: C.primary, color: '#fff', padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none', opacity: isPending ? 0.7 : 1 }}>
          {isPending ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </div>
    );
  }

  if (step === 'slots') {
    return (
      <div>
        <BackBtn onClick={() => setStep('doctors')} />
        <div style={{ fontWeight: 600, fontSize: 15 }}>{doctor.name}</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 16, marginTop: 2 }}>{doctor.specialty}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available today</div>
        {loadingSlots ? <div style={{ color: C.soft, fontSize: 13 }}>Loading slots…</div> : (
          slots.length === 0
            ? <div style={{ color: C.soft, fontSize: 13 }}>No available slots today.</div>
            : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {slots.map((s) => (
                  <button key={s.id} onClick={() => { setSlot(s); setStep('confirm'); }}
                    style={{ padding: '10px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, fontWeight: 600, color: C.ink }}>
                    {String(s.slot_time).slice(0, 5)}
                  </button>
                ))}
              </div>
        )}
      </div>
    );
  }

  // Default: doctor list
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Choose a doctor</div>
      {loadingDoctors ? <div style={{ color: C.soft, fontSize: 13 }}>Loading doctors…</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {doctors.map((doc) => (
            <button key={doc.id} onClick={() => { setDoctor(doc); setStep('slots'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={18} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>{doc.specialty}</div>
                </div>
              </div>
              <ChevronRight size={18} color={C.soft} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Current Appointments ─────────────────────────────────────────
function CurrentAppointments({ onBook }) {
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => getMyAppointments().then((r) => r.data),
  });

  // Socket: update queue positions live
  useEffect(() => {
    const handler = () => qc.invalidateQueries(['appointments']);
    socket.on('queue_update', handler);
    socket.on('appt_confirmed', handler);
    return () => {
      socket.off('queue_update', handler);
      socket.off('appt_confirmed', handler);
    };
  }, [qc]);

  const { mutate: cancel } = useMutation({
    mutationFn: (id) => cancelAppointment(id),
    onSuccess: () => qc.invalidateQueries(['appointments']),
    onError: (e) => alert(e.response?.data?.error || 'Cancel failed'),
  });

  const confirmed = appointments.filter((a) => a.status === 'confirmed');

  if (isLoading) return <div style={{ color: C.soft, fontSize: 13, textAlign: 'center', padding: 40 }}>Loading…</div>;

  if (confirmed.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Calendar size={36} color={C.soft} style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No appointments yet</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 20 }}>Book one and it'll show up here.</div>
        <button onClick={onBook} style={{ background: C.primary, color: '#fff', padding: '10px 22px', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none' }}>
          Book Appointment
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {confirmed.map((a) => (
        <div key={a.id} style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{a.doctor_name}</div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{a.specialty}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: C.primarySoft, color: C.primary, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>
                #{a.queue_pos}
              </div>
              <button onClick={() => { if (confirm('Cancel this appointment?')) cancel(a.id); }}
                style={{ width: 28, height: 28, borderRadius: 8, background: C.urgentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                <X size={14} color={C.urgent} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: C.soft }}>
            <Clock size={14} />
            {String(a.slot_time).slice(0, 5)} · {new Date(a.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 13, fontWeight: 600, color: C.soft, background: 'none', border: 'none' }}>
      <ChevronLeft size={16} /> Back
    </button>
  );
}
