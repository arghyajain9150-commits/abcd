import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Calendar, Clock, User, CheckCircle2, Plus, Phone, FileText, Pill, History, AlertTriangle, ChevronDown, Check, Building } from 'lucide-react';
import { getDoctorQueue, createDoctorSlots, updateAppointmentStatus, getDoctors } from '../api/index.js';
import PrescriptionWriterModal from '../components/PrescriptionWriterModal.jsx';
import StudentHistoryModal from '../components/StudentHistoryModal.jsx';

const C = {
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  ink: '#17322C',
  soft: '#5B7169',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
};

const DEFAULT_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

export default function DoctorPortal() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('queue'); // 'queue' | 'schedule'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimes, setSelectedTimes] = useState(DEFAULT_SLOTS);
  const [rxWriterOpen, setRxWriterOpen] = useState(false);

  // 1. Fetch all campus doctors for the Doctor Desk Switcher
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors().then((r) => r.data),
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors]);

  const activeDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // 2. Fetch specific doctor's queue
  const { data: queue = [], isLoading: loadingQueue } = useQuery({
    queryKey: ['doctor-queue', slotDate, selectedDoctorId],
    queryFn: () => getDoctorQueue(slotDate, selectedDoctorId).then((r) => r.data),
    enabled: !!selectedDoctorId,
    refetchInterval: 8_000,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['doctor-queue']);
      qc.invalidateQueries(['appointments']);
    },
  });

  const { mutate: addSlots, isPending: addingSlots } = useMutation({
    mutationFn: () => createDoctorSlots({ slot_date: slotDate, slot_times: selectedTimes, doctor_id: selectedDoctorId }),
    onSuccess: () => {
      alert(`Clinic slots published for ${activeDoctor?.name} on ${slotDate}`);
      qc.invalidateQueries(['doctor-queue']);
      qc.invalidateQueries(['slots']);
      setTab('queue');
    },
  });

  const inConsultation = queue.find((a) => a.status === 'in_consultation');
  const waitingList = queue.filter((a) => a.status === 'confirmed');
  const completedList = queue.filter((a) => a.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ─── Doctor Desk Selector Bar ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 20,
          padding: 16,
          color: '#fff',
          boxShadow: '0 8px 24px -6px rgba(23,50,44,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A3D9C9' }}>
            🩺 Doctor OPD Consultation Desk
          </span>
          <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
            {activeDoctor?.opd_room || 'OPD Room 101'}
          </span>
        </div>

        {/* Doctor Switcher Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, opacity: 0.85 }}>Select Active Doctor Desk:</label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              style={{
                width: '100%',
                background: '#fff',
                color: C.ink,
                padding: '9px 12px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty} ({d.qualifications || 'MBBS, MD'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Doctor Summary Card */}
        {activeDoctor && (
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
            <span>Shift: <strong>{activeDoctor.shift_hours || '08:30 – 13:30'}</strong></span>
            <span>Queue: <strong>{waitingList.length} Waiting</strong></span>
          </div>
        )}
      </div>

      {/* ─── Tabs & Actions ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, gap: 2 }}>
          <button
            onClick={() => setTab('queue')}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: tab === 'queue' ? '#fff' : 'transparent',
              color: tab === 'queue' ? C.primary : C.soft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            OPD Queue ({queue.length})
          </button>
          <button
            onClick={() => setTab('schedule')}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: tab === 'schedule' ? '#fff' : 'transparent',
              color: tab === 'schedule' ? C.primary : C.soft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Manage Slots
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedAppt({
              id: null,
              doctor_id: selectedDoctorId,
              student_name: 'Walk-in Student Patient',
              student_email: '',
            });
            setRxWriterOpen(true);
          }}
          style={{
            background: C.primary,
            color: '#fff',
            padding: '7px 12px',
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
          <Pill size={14} /> Walk-in Rx +
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          TAB 1: LIVE OPD PATIENT QUEUE
      ──────────────────────────────────────────────────────────────── */}
      {tab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Active Patient In Consultation */}
          {inConsultation && (
            <div
              style={{
                background: 'linear-gradient(135deg, #E4EFEA 0%, #D5E8DF 100%)',
                border: `1.5px solid ${C.primary}`,
                borderRadius: 18,
                padding: 16,
                boxShadow: '0 4px 14px -3px rgba(47,122,104,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🩺 Inside Consultation Room Now
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.ink, background: '#fff', padding: '2px 8px', borderRadius: 8 }}>
                  Slot: {String(inConsultation.slot_time).slice(0, 5)}
                </span>
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>
                  {inConsultation.student_name}
                </div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
                  {inConsultation.student_email} · {inConsultation.hostel_block || 'Hostel B'} Rm {inConsultation.room_number || '204'}
                </div>
              </div>

              {inConsultation.notes && (
                <div style={{ fontSize: 12, color: C.ink, background: '#fff', padding: '8px 10px', borderRadius: 10 }}>
                  <strong>Reported Complaint:</strong> "{inConsultation.notes}"
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => {
                    setSelectedAppt(inConsultation);
                    setRxWriterOpen(true);
                  }}
                  style={{
                    background: C.primary,
                    color: '#fff',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Pill size={15} /> Write Prescription
                </button>

                <button
                  onClick={() => setHistoryStudent({ id: inConsultation.student_id, name: inConsultation.student_name })}
                  style={{
                    background: '#fff',
                    color: C.ink,
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <History size={15} color={C.primary} /> View History
                </button>
              </div>

              <button
                onClick={() => changeStatus({ id: inConsultation.id, status: 'completed' })}
                style={{
                  background: '#17322C',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '9px 0',
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle2 size={15} /> Complete Consultation
              </button>
            </div>
          )}

          {/* Waiting Patients List */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Waiting in Queue ({waitingList.length})
            </div>

            {loadingQueue ? (
              <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading patient queue…</div>
            ) : waitingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, color: C.soft, fontSize: 12 }}>
                No students waiting in {activeDoctor?.name}'s queue for {slotDate}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {waitingList.map((appt) => (
                  <div
                    key={appt.id}
                    style={{
                      background: C.surface,
                      borderRadius: 16,
                      padding: 14,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: C.primarySoft, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                          #{appt.queue_pos || 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{appt.student_name}</div>
                          <div style={{ fontSize: 11, color: C.soft }}>{appt.hostel_block || 'Hostel B'} Rm {appt.room_number || '204'}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
                          {String(appt.slot_time).slice(0, 5)}
                        </div>
                        <div style={{ fontSize: 10, color: C.soft }}>Blood: {appt.blood_group || 'O+'}</div>
                      </div>
                    </div>

                    {appt.notes && (
                      <div style={{ fontSize: 11.5, color: C.soft, background: C.bg, padding: '6px 10px', borderRadius: 8 }}>
                        Complaint: "{appt.notes}"
                      </div>
                    )}

                    {/* Patient Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                      <button
                        onClick={() => changeStatus({ id: appt.id, status: 'in_consultation' })}
                        style={{
                          background: C.primary,
                          color: '#fff',
                          padding: '8px 0',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Call into OPD
                      </button>

                      <button
                        onClick={() => setHistoryStudent({ id: appt.student_id, name: appt.student_name })}
                        style={{
                          background: C.bg,
                          color: C.ink,
                          padding: '8px 0',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          border: `1px solid ${C.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        View History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed History */}
          {completedList.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                Completed Consultations Today ({completedList.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {completedList.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: C.bg,
                      borderRadius: 12,
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <strong style={{ color: C.ink }}>{a.student_name}</strong>
                      <div style={{ fontSize: 11, color: C.soft }}>Slot: {String(a.slot_time).slice(0, 5)} · Completed</div>
                    </div>
                    <button
                      onClick={() => setHistoryStudent({ id: a.student_id, name: a.student_name })}
                      style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      History
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 2: DOCTOR SLOT SCHEDULE MANAGER
      ──────────────────────────────────────────────────────────────── */}
      {tab === 'schedule' && (
        <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>Publish Clinic Hours</div>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>
              Configure consultation slots for <strong>{activeDoctor?.name}</strong> ({activeDoctor?.opd_room})
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Date</label>
            <input
              type="date"
              value={slotDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSlotDate(e.target.value)}
              style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Slot Times</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
              {DEFAULT_SLOTS.map((time) => {
                const isSelected = selectedTimes.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      if (isSelected) setSelectedTimes(selectedTimes.filter((t) => t !== time));
                      else setSelectedTimes([...selectedTimes, time]);
                    }}
                    style={{
                      padding: '8px 0',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      background: isSelected ? C.primary : C.bg,
                      color: isSelected ? '#fff' : C.ink,
                      border: `1px solid ${isSelected ? C.primary : C.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => addSlots()}
            disabled={addingSlots || selectedTimes.length === 0}
            style={{
              background: C.primary,
              color: '#fff',
              padding: '12px 0',
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              marginTop: 6,
              opacity: addingSlots ? 0.7 : 1,
            }}
          >
            {addingSlots ? 'Publishing Slots…' : `Publish ${selectedTimes.length} Slots for ${activeDoctor?.name}`}
          </button>
        </div>
      )}

      {/* Prescription Writer Modal */}
      {rxWriterOpen && selectedAppt && (
        <PrescriptionWriterModal
          appointment={selectedAppt}
          onClose={() => {
            setRxWriterOpen(false);
            setSelectedAppt(null);
          }}
        />
      )}

      {/* Student History Modal */}
      {historyStudent && (
        <StudentHistoryModal
          studentId={historyStudent.id}
          studentName={historyStudent.name}
          onClose={() => setHistoryStudent(null)}
          onPrescribe={(student) => {
            setHistoryStudent(null);
            setSelectedAppt({
              id: null,
              doctor_id: selectedDoctorId,
              student_id: student.id,
              student_name: student.name,
              student_email: student.email,
            });
            setRxWriterOpen(true);
          }}
        />
      )}
    </div>
  );
}
