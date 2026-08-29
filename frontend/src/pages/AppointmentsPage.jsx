import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, ChevronLeft, ChevronRight, Stethoscope, Calendar, X, AlertCircle, FileText, MapPin, Award } from 'lucide-react';
import { getDoctors, getDoctorSlots, bookAppointment, getMyAppointments, cancelAppointment } from '../api/index.js';
import { socket, joinQueueRoom, leaveQueueRoom } from '../socket/socket.js';

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

const SPECIALTIES = ['All', 'General Physician', 'Dermatology', 'Orthopaedics', 'Gynaecology', 'Wellness & Psychiatry'];

export default function AppointmentsPage() {
  const [view, setView] = useState('book'); // 'book' | 'current'

  return (
    <div>
      <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, marginTop: 4, color: C.ink }}>
        Campus Appointments
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: C.surface, borderRadius: 999, padding: 4, marginBottom: 20, border: `1px solid ${C.border}` }}>
        {[['book', 'Book Appointment'], ['current', 'My Appointments']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              background: view === v ? C.primary : 'transparent',
              color: view === v ? '#fff' : C.soft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
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
  const qc = useQueryClient();
  const [step, setStep]           = useState('doctors'); // doctors | slots | confirm | done
  const [doctor, setDoctor]       = useState(null);
  const [slot, setSlot]           = useState(null);
  const [bookedAppt, setBookedAppt] = useState(null);
  const [notes, setNotes]         = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Date Selection: Today, Tomorrow, or Custom Date
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState(todayStr);

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors().then((r) => r.data),
  });

  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', doctor?.id, targetDate],
    queryFn: () => getDoctorSlots(doctor.id, targetDate).then((r) => r.data),
    enabled: !!doctor,
  });

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => bookAppointment({ doctor_id: doctor.id, slot_id: slot.id, notes }),
    onSuccess: (res) => {
      setBookedAppt(res.data);
      setStep('done');
      qc.invalidateQueries(['appointments']);
      joinQueueRoom(doctor.id, targetDate);
    },
    onError: (e) => alert(e.response?.data?.error || 'Booking failed'),
  });

  const filteredDoctors = doctors.filter((doc) =>
    selectedSpecialty === 'All' ? true : doc.specialty === selectedSpecialty
  );

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 10px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle2 size={32} color={C.primary} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, color: C.ink }}>Appointment Confirmed! 🎉</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 6 }}>
          Booked with <strong>{doctor?.name} ({doctor?.specialty})</strong>
        </div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 24 }}>
          Queue Token: <strong style={{ color: C.primary, fontSize: 15 }}>#{bookedAppt?.queuePos || 1}</strong> · Date: {targetDate}
        </div>
        <button onClick={onBooked} style={{ background: C.primary, color: '#fff', padding: '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          View My Appointments
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div>
        <BackBtn onClick={() => setStep('slots')} />
        <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>{doctor.name}</div>
            <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{doctor.qualifications || 'MBBS, MD'} · {doctor.specialty}</div>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{doctor.opd_room || 'OPD Room 101'} · Block A Ground Floor</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.primary, fontWeight: 700, background: C.primarySoft, padding: '8px 12px', borderRadius: 10 }}>
            <Clock size={15} />
            Slot: {String(slot.slot_time).slice(0, 5)} · Date: {targetDate === todayStr ? 'Today' : targetDate}
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Reason for Visit / Symptoms (Optional)
            </label>
            <textarea
              placeholder="e.g. Mild headache and cough since yesterday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '8px 12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                outline: 'none',
                color: C.ink,
                resize: 'none',
              }}
            />
          </div>
        </div>

        <button
          onClick={() => book()}
          disabled={isPending}
          style={{ width: '100%', background: C.primary, color: '#fff', padding: '14px 0', borderRadius: 14, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Confirming Appointment…' : 'Confirm & Generate Queue Token'}
        </button>
      </div>
    );
  }

  if (step === 'slots') {
    return (
      <div>
        <BackBtn onClick={() => setStep('doctors')} />

        {/* Doctor Summary */}
        <div style={{ background: C.surface, borderRadius: 16, padding: 14, border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{doctor.name}</div>
              <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>{doctor.qualifications || 'MBBS, MD'} · {doctor.specialty}</div>
              <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>{doctor.opd_room || 'OPD Room 101'} · Shift: {doctor.shift_hours || '08:30 – 13:30'}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1B7A4B', background: '#D8F3E5', padding: '3px 8px', borderRadius: 8 }}>
              Active on Duty
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
            Select Clinic Date
          </label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => setTargetDate(todayStr)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: targetDate === todayStr ? C.primary : C.bg,
                color: targetDate === todayStr ? '#fff' : C.ink,
                border: `1px solid ${targetDate === todayStr ? C.primary : C.border}`,
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button
              onClick={() => setTargetDate(tomorrowStr)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: targetDate === tomorrowStr ? C.primary : C.bg,
                color: targetDate === tomorrowStr ? '#fff' : C.ink,
                border: `1px solid ${targetDate === tomorrowStr ? C.primary : C.border}`,
                cursor: 'pointer',
              }}
            >
              Tomorrow
            </button>
          </div>
          <input
            type="date"
            min={todayStr}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
          />
        </div>

        {/* Time Slots Grid */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
            Available Consultation Slots ({slots.filter((s) => !s.is_booked).length})
          </label>

          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: 20, color: C.soft }}>Loading available slots…</div>
          ) : slots.filter((s) => !s.is_booked).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, color: C.soft, fontSize: 12 }}>
              No available slots for this date. Please choose another day or select another doctor.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {slots
                .filter((s) => !s.is_booked)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSlot(s);
                      setStep('confirm');
                    }}
                    style={{
                      padding: '10px 0',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 700,
                      background: C.surface,
                      color: C.primary,
                      border: `1.5px solid ${C.primary}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {String(s.slot_time).slice(0, 5)}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 1: Select Doctor & Specialty Filter
  return (
    <div>
      {/* Specialty Filter Chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14 }}>
        {SPECIALTIES.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 700,
              background: selectedSpecialty === spec ? C.primary : C.surface,
              color: selectedSpecialty === spec ? '#fff' : C.soft,
              border: `1px solid ${selectedSpecialty === spec ? C.primary : C.border}`,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {spec}
          </button>
        ))}
      </div>

      {loadingDoctors ? (
        <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading campus doctors…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDoctors.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                setDoctor(d);
                setStep('slots');
              }}
              style={{
                background: C.surface,
                borderRadius: 16,
                padding: 14,
                border: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 8px -2px rgba(23,50,44,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: C.primarySoft, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 700 }}>{d.qualifications || 'MBBS, MD'} · {d.specialty}</div>
                  <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>{d.opd_room || 'Room 101'} · Shift: {d.shift_hours || '08:30 – 13:30'}</div>
                </div>
              </div>
              <ChevronRight size={18} color={C.soft} />
            </div>
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

  const { mutate: cancel } = useMutation({
    mutationFn: (id) => cancelAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries(['appointments']);
    },
    onError: (e) => alert(e.response?.data?.error || 'Could not cancel'),
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading your appointments…</div>;

  if (appointments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 10px', background: C.surface, borderRadius: 18, border: `1px solid ${C.border}` }}>
        <Calendar size={36} color={C.border} style={{ margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>No Active Appointments</div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2, marginBottom: 16 }}>Need to see a campus doctor? Book a slot in seconds.</div>
        <button onClick={onBook} style={{ background: C.primary, color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          Book Appointment
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {appointments.map((appt) => {
        const isLive = appt.status === 'confirmed' || appt.status === 'in_consultation';
        return (
          <div
            key={appt.id}
            style={{
              background: appt.status === 'in_consultation' ? C.primarySoft : C.surface,
              borderRadius: 18,
              padding: 16,
              border: `1.5px solid ${appt.status === 'in_consultation' ? C.primary : C.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{appt.doctor_name}</div>
                <div style={{ fontSize: 12, color: C.soft }}>{appt.specialty} · OPD Room 102</div>
              </div>
              <div
                style={{
                  background: isLive ? C.primary : C.bg,
                  color: isLive ? '#fff' : C.soft,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                {appt.status === 'in_consultation' ? '🩺 Your Turn Now' : appt.status === 'confirmed' ? `#${appt.queue_pos} In Queue` : appt.status}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.soft }}>
              <Clock size={13} />
              Slot: {String(appt.slot_time).slice(0, 5)} · Date: {new Date(appt.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {appt.notes && (
              <div style={{ fontSize: 11.5, color: C.soft, fontStyle: 'italic', background: '#fff', padding: '6px 10px', borderRadius: 8 }}>
                Complaint: "{appt.notes}"
              </div>
            )}

            {appt.status === 'confirmed' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this appointment?')) {
                      cancel(appt.id);
                    }
                  }}
                  style={{
                    background: '#FBE7E4',
                    color: C.urgent,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <X size={13} /> Cancel Appointment
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.soft, fontSize: 12, fontWeight: 700, marginBottom: 12, cursor: 'pointer' }}>
      <ChevronLeft size={16} /> Back
    </button>
  );
}
