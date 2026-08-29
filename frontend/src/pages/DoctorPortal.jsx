import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Calendar, Clock, User, CheckCircle2, Plus, Phone, FileText } from 'lucide-react';
import { getDoctorQueue, createDoctorSlots, updateAppointmentStatus } from '../api/index.js';
import PrescriptionWriterModal from '../components/PrescriptionWriterModal.jsx';

const C = {
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  ink: '#17322C',
  soft: '#5B7169',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  urgent: '#D6483C',
  accent: '#E3A542',
};

const DEFAULT_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

export default function DoctorPortal() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('queue'); // 'queue' | 'schedule'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimes, setSelectedTimes] = useState(DEFAULT_SLOTS);

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['doctor-queue', slotDate],
    queryFn: () => getDoctorQueue(slotDate).then((r) => r.data),
    refetchInterval: 10_000,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['doctor-queue']);
    },
  });

  const { mutate: addSlots, isPending: addingSlots } = useMutation({
    mutationFn: () => createDoctorSlots({ slot_date: slotDate, slot_times: selectedTimes }),
    onSuccess: () => {
      alert('Clinic slots published successfully for ' + slotDate);
      qc.invalidateQueries(['doctor-queue']);
      setTab('queue');
    },
  });

  const inConsultation = queue.find((a) => a.status === 'in_consultation');
  const waitingList = queue.filter((a) => a.status === 'confirmed');
  const completedList = queue.filter((a) => a.status === 'completed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
            Doctor Consultation Desk
          </div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
            Campus Clinic OPD · Live Queue
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3 }}>
          <button
            onClick={() => setTab('queue')}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: tab === 'queue' ? '#fff' : 'transparent',
              color: tab === 'queue' ? C.primary : C.soft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Queue ({waitingList.length})
          </button>
          <button
            onClick={() => setTab('schedule')}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: tab === 'schedule' ? '#fff' : 'transparent',
              color: tab === 'schedule' ? C.primary : C.soft,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Schedule
          </button>
        </div>
      </div>

      {tab === 'queue' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Shift Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ background: C.surface, padding: '12px 10px', borderRadius: 14, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>Waiting</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.accent, marginTop: 2 }}>{waitingList.length}</div>
            </div>
            <div style={{ background: C.surface, padding: '12px 10px', borderRadius: 14, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>Active</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.primary, marginTop: 2 }}>{inConsultation ? 1 : 0}</div>
            </div>
            <div style={{ background: C.surface, padding: '12px 10px', borderRadius: 14, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>Completed</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 2 }}>{completedList.length}</div>
            </div>
          </div>

          {/* Active Patient In Consultation Card */}
          {inConsultation && (
            <div
              style={{
                background: 'linear-gradient(135deg, #E4EFEA 0%, #D2E7DE 100%)',
                borderRadius: 18,
                padding: 16,
                border: `2px solid ${C.primary}`,
                boxShadow: '0 8px 24px -6px rgba(47,122,104,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.primary, background: '#fff', padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
                  🩺 Currently in Consultation
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
                  Slot: {inConsultation.slot_time}
                </span>
              </div>

              <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>
                {inConsultation.student_name}
              </div>
              <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                {inConsultation.student_email} · {inConsultation.student_phone || 'No phone'}
              </div>

              {inConsultation.notes && (
                <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 10, marginTop: 10, fontSize: 12, color: C.ink }}>
                  <strong>Chief Complaint:</strong> "{inConsultation.notes}"
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => setSelectedAppt(inConsultation)}
                  style={{
                    flex: 1,
                    background: C.primary,
                    color: '#fff',
                    padding: '10px 0',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <FileText size={16} /> Write Prescription & Complete
                </button>
              </div>
            </div>
          )}

          {/* Waiting Queue */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase', marginBottom: 10 }}>
              Waiting in Line ({waitingList.length})
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading queue…</div>
            ) : waitingList.length === 0 && !inConsultation ? (
              <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, color: C.soft }}>
                <CheckCircle2 size={32} color={C.primary} style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>No patients waiting in queue</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>All appointments for this date are completed.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {waitingList.map((appt, i) => (
                  <div
                    key={appt.id}
                    style={{
                      background: C.surface,
                      borderRadius: 16,
                      padding: 14,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: C.primarySoft,
                          color: C.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
                          {appt.student_name}
                        </div>
                        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                          Slot: {appt.slot_time} · {appt.notes || 'Routine checkup'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => changeStatus({ id: appt.id, status: 'in_consultation' })}
                      style={{
                        background: C.primary,
                        color: '#fff',
                        borderRadius: 10,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Call Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Schedule Manager */
        <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Select Clinic Date
            </label>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Available Consultation Time Slots
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
              {DEFAULT_SLOTS.map((t) => {
                const active = selectedTimes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTimes((prev) =>
                        active ? prev.filter((x) => x !== t) : [...prev, t]
                      )
                    }
                    style={{
                      padding: '8px 0',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      background: active ? C.primarySoft : C.bg,
                      color: active ? C.primary : C.soft,
                      border: `1px solid ${active ? C.primary : C.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {t}
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
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              marginTop: 6,
              opacity: addingSlots ? 0.7 : 1,
            }}
          >
            {addingSlots ? 'Publishing Slots…' : `Publish ${selectedTimes.length} Slots for ${slotDate}`}
          </button>
        </div>
      )}

      {selectedAppt && (
        <PrescriptionWriterModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </div>
  );
}
