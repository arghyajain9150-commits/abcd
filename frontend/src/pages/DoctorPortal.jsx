import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Calendar, Clock, User, CheckCircle2, Plus, Phone, FileText, Pill, History, AlertTriangle, ChevronDown, Check, Building, Radio, ShieldAlert, Sliders, Activity, Send, Zap, TrendingUp, Save, RefreshCw } from 'lucide-react';
import { getDoctorQueue, createDoctorSlots, updateAppointmentStatus, getDoctors } from '../api/index.js';
import { useOutbreakStore } from '../store/store.js';
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

const DISEASE_PRESETS = [
  {
    key: 'conjunctivitis',
    name: 'Viral Conjunctivitis (Eye Flu)',
    category: 'Contact & Droplet Transmission',
    r0: 1.84,
    incubationDays: 2,
    infectiousDays: 6,
    isolationDays: 5,
    advisory: 'Mandatory isolation for infected students. Frequent eye washes with sterile saline, avoid touching eyes, and wear protective tinted glasses.',
  },
  {
    key: 'gastroenteritis',
    name: 'Viral Gastroenteritis / Norovirus',
    category: 'Mess Water & Foodborne Contagion',
    r0: 2.40,
    incubationDays: 1,
    infectiousDays: 4,
    isolationDays: 3,
    advisory: 'Drink only RO filtered or boiled water; avoid hostel cooler tap water. Collect free electrolyte ORS sachets from dispensary.',
  },
  {
    key: 'influenza',
    name: 'Influenza A (H3N2 Viral Flu)',
    category: 'Airborne Droplet Transmission',
    r0: 1.65,
    incubationDays: 3,
    infectiousDays: 7,
    isolationDays: 6,
    advisory: 'Wear surgical/N95 masks in hostel corridors and mess halls. Keep windows open for natural ventilation and report high fevers.',
  },
  {
    key: 'chickenpox',
    name: 'Varicella (Chickenpox / Viral Rash)',
    category: 'Airborne & Direct Blister Contact',
    r0: 10.5,
    incubationDays: 14,
    infectiousDays: 10,
    isolationDays: 12,
    advisory: 'Mandatory 12-day medical isolation in quarantine wing until all skin blisters have crusted. Oral antivirals delivered by medical team.',
  },
  {
    key: 'dengue',
    name: 'Dengue / Vector-Borne Viral Fever',
    category: 'Aedes Mosquito Vector',
    r0: 1.25,
    incubationDays: 5,
    infectiousDays: 7,
    isolationDays: 4,
    advisory: 'Campus estate fogging active around hostel perimeter. Apply mosquito repellent lotion and eliminate stagnant water in cooler trays.',
  },
];

export default function DoctorPortal() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('queue'); // 'queue' | 'schedule' | 'radar'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimes, setSelectedTimes] = useState(DEFAULT_SLOTS);
  const [rxWriterOpen, setRxWriterOpen] = useState(false);

  // Outbreak Radar State from useOutbreakStore
  const outbreakConfig = useOutbreakStore((s) => s.config);
  const updateOutbreakConfig = useOutbreakStore((s) => s.updateConfig);
  const [radarForm, setRadarForm] = useState(outbreakConfig);
  const [broadcastNotice, setBroadcastNotice] = useState('');

  useEffect(() => {
    setRadarForm(outbreakConfig);
  }, [outbreakConfig]);

  // 1. Fetch all campus doctors with strict deduplication
  const { data: rawDoctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors().then((r) => r.data),
  });

  const doctors = Array.from(
    new Map(rawDoctors.map((d) => [d.name, d])).values()
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    if (doctors.length > 0 && (!selectedDoctorId || !doctors.some(d => d.id === selectedDoctorId))) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const activeDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // 2. Fetch specific doctor's queue
  const { data: queue = [], isLoading: loadingQueue } = useQuery({
    queryKey: ['doctor-queue', slotDate, selectedDoctorId],
    queryFn: () => getDoctorQueue(slotDate, selectedDoctorId).then((r) => r.data),
    enabled: !!selectedDoctorId,
    refetchInterval: 6_000,
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

  const handleOpenRxForAppt = (appt) => {
    setSelectedAppt({
      id: appt.id,
      student_id: appt.student_id,
      student_name: appt.student_name,
      student_email: appt.student_email,
      doctor_id: selectedDoctorId,
      allergies: appt.allergies,
      hostel_block: appt.hostel_block,
      room_number: appt.room_number,
    });
    setRxWriterOpen(true);
  };

  const inConsultation = queue.find((a) => a.status === 'in_consultation');
  const waitingList = queue.filter((a) => a.status === 'confirmed');
  const completedList = queue.filter((a) => a.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .doctor-layout-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 840px) {
          .doctor-layout-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            align-items: flex-start;
            gap: 22px;
          }
        }
      `}</style>

      {/* ─── Doctor Desk Layout (Responsive 2-Column on Desktop) ─── */}
      <div className="doctor-layout-grid">
        
        {/* ─── LEFT COLUMN: Doctor Desk Selector & In-Consultation Patient ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Doctor Desk Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
              borderRadius: 20,
              padding: 18,
              color: '#fff',
              boxShadow: '0 8px 24px -6px rgba(23,50,44,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A3D9C9' }}>
                🩺 Doctor OPD Consultation Desk
              </span>
              <span style={{ fontSize: 11.5, background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 8, fontWeight: 700 }}>
                {activeDoctor?.opd_room || 'OPD Room 101'}
              </span>
            </div>

            {/* Doctor Switcher Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11.5, opacity: 0.9 }}>Select Active Doctor Desk:</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: C.ink,
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: 13.5,
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

            {/* Selected Doctor Summary */}
            {activeDoctor && (
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span>Shift: <strong>{activeDoctor.shift_hours || '08:30 – 13:30'}</strong></span>
                <span>Queue: <strong>{waitingList.length} Waiting</strong></span>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedAppt({
                  id: null,
                  doctor_id: selectedDoctorId,
                  student_name: 'Walk-in Student Patient',
                  student_email: '',
                  hostel_block: 'Hostel Block A',
                  room_number: '204',
                });
                setRxWriterOpen(true);
              }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: C.primary,
                padding: '9px 14px',
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
                marginTop: 2,
              }}
            >
              <Pill size={15} /> Write Walk-in Prescription +
            </button>
          </div>

          {/* Active Patient In Consultation Card */}
          {inConsultation ? (
            <div
              style={{
                background: 'linear-gradient(135deg, #E4EFEA 0%, #D5E8DF 100%)',
                border: `1.5px solid ${C.primary}`,
                borderRadius: 18,
                padding: 18,
                boxShadow: '0 4px 16px -3px rgba(47,122,104,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🩺 Inside Consultation Room Now
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, background: '#fff', padding: '3px 9px', borderRadius: 8 }}>
                  Slot: {String(inConsultation.slot_time).slice(0, 5)}
                </span>
              </div>

              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>
                  {inConsultation.student_name}
                </div>
                <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>
                  {inConsultation.student_email} · {inConsultation.hostel_block || 'Hostel Block B'} Rm {inConsultation.room_number || '204'}
                </div>
              </div>

              {inConsultation.notes && (
                <div style={{ fontSize: 12.5, color: C.ink, background: '#fff', padding: '10px 12px', borderRadius: 10 }}>
                  <strong>Reported Complaint:</strong> "{inConsultation.notes}"
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => handleOpenRxForAppt(inConsultation)}
                  style={{
                    background: C.primary,
                    color: '#fff',
                    borderRadius: 12,
                    padding: '11px 0',
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(47,122,104,0.3)',
                  }}
                >
                  <Pill size={16} /> Write Prescription
                </button>

                <button
                  onClick={() => setHistoryStudent({ id: inConsultation.student_id, name: inConsultation.student_name })}
                  style={{
                    background: '#fff',
                    color: C.ink,
                    borderRadius: 12,
                    padding: '11px 0',
                    fontSize: 13,
                    fontWeight: 700,
                    border: `1px solid ${C.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <History size={16} color={C.primary} /> Medical History
                </button>
              </div>

              <button
                onClick={() => changeStatus({ id: inConsultation.id, status: 'completed' })}
                style={{
                  background: '#17322C',
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
                <CheckCircle2 size={16} /> Complete Consultation
              </button>
            </div>
          ) : (
            <div style={{ background: C.surface, borderRadius: 18, padding: 24, border: `1px solid ${C.border}`, textAlign: 'center', color: C.soft, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={32} color={C.border} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No Patient Currently Inside OPD</div>
              <div style={{ fontSize: 12 }}>Call the next student from the waiting queue on the right to start consultation.</div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Patient Queue & Slots Management ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, gap: 2 }}>
            <button
              onClick={() => setTab('queue')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                background: tab === 'queue' ? '#fff' : 'transparent',
                color: tab === 'queue' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              OPD Waiting Queue ({waitingList.length})
            </button>
            <button
              onClick={() => setTab('schedule')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                background: tab === 'schedule' ? '#fff' : 'transparent',
                color: tab === 'schedule' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Manage Slots & Schedule
            </button>
          </div>

          {/* TAB 1: Live OPD Patient Queue */}
          {tab === 'queue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Waiting Patients List */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  Waiting in Queue ({waitingList.length})
                </div>

                {loadingQueue ? (
                  <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading patient queue…</div>
                ) : waitingList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 36, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, color: C.soft, fontSize: 12.5 }}>
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
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 28, height: 28, borderRadius: '50%', background: C.primarySoft, color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12.5 }}>
                              #{appt.queue_pos || 1}
                            </span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>{appt.student_name}</div>
                              <div style={{ fontSize: 11.5, color: C.soft }}>{appt.hostel_block || 'Hostel B'} Rm {appt.room_number || '204'}</div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>
                              {String(appt.slot_time).slice(0, 5)}
                            </div>
                            <div style={{ fontSize: 10.5, color: C.soft }}>Blood: {appt.blood_group || 'O+'}</div>
                          </div>
                        </div>

                        {appt.notes && (
                          <div style={{ fontSize: 12, color: C.soft, background: C.bg, padding: '7px 10px', borderRadius: 8 }}>
                            Complaint: "{appt.notes}"
                          </div>
                        )}

                        {/* Patient Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 8, marginTop: 4 }}>
                          <button
                            onClick={() => handleOpenRxForAppt(appt)}
                            style={{
                              background: C.primary,
                              color: '#fff',
                              padding: '9px 0',
                              borderRadius: 10,
                              fontSize: 12.5,
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <Pill size={15} /> Prescribe
                          </button>

                          <button
                            onClick={() => changeStatus({ id: appt.id, status: 'in_consultation' })}
                            style={{
                              background: '#17322C',
                              color: '#fff',
                              padding: '9px 0',
                              borderRadius: 10,
                              fontSize: 12.5,
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
                              padding: '9px 0',
                              borderRadius: 10,
                              fontSize: 12.5,
                              fontWeight: 700,
                              border: `1px solid ${C.border}`,
                              cursor: 'pointer',
                            }}
                          >
                            History
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Consultations */}
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
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12.5,
                        }}
                      >
                        <div>
                          <strong style={{ color: C.ink }}>{a.student_name}</strong>
                          <div style={{ fontSize: 11.5, color: C.soft }}>Slot: {String(a.slot_time).slice(0, 5)} · Completed</div>
                        </div>
                        <button
                          onClick={() => setHistoryStudent({ id: a.student_id, name: a.student_name })}
                          style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
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

          {/* TAB 2: Doctor Slot Schedule Manager */}
          {tab === 'schedule' && (
            <div style={{ background: C.surface, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.ink }}>Publish Clinic Hours</div>
                <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>
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
                  style={{ width: '100%', marginTop: 4, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Select Slot Times</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 6 }}>
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
                          padding: '9px 0',
                          borderRadius: 10,
                          fontSize: 12.5,
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
                  fontSize: 14,
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

          {/* TAB 3: Doctor Epidemiological Outbreak Radar Control */}
          {tab === 'radar' && (
            <div style={{ background: C.surface, borderRadius: 20, padding: 20, border: `1.5px solid ${radarForm.active ? '#F5A9A0' : C.border}`, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              
              {/* Radar Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={20} color={radarForm.active ? C.urgent : C.primary} />
                    <div className="champ-heading" style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>
                      Epidemiological Radar & Outbreak Control
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                    Configure transmission dynamics (SORMAS & WHO EWARS standard) and broadcast live campus alerts.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...radarForm, active: !radarForm.active, severity: !radarForm.active ? 'high' : 'resolved' };
                      setRadarForm(updated);
                      updateOutbreakConfig(updated);
                      setBroadcastNotice(updated.active ? 'Outbreak Alert is now LIVE across student portals!' : 'Outbreak resolved. Campus status normalized.');
                    }}
                    style={{
                      background: radarForm.active ? '#FFE8E5' : '#D8F3E5',
                      color: radarForm.active ? C.urgent : '#1B7A4B',
                      border: `1.5px solid ${radarForm.active ? C.urgent : '#1B7A4B'}`,
                      padding: '7px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {radarForm.active ? '🔴 Outbreak Active (Broadcasting)' : '🟢 Outbreak Resolved (Normal)'}
                  </button>
                </div>
              </div>

              {/* Pathogen Preset Dropdown */}
              <div style={{ background: C.bg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>
                  1. Select Clinical Pathogen Profile
                </label>

                <select
                  value={radarForm.diseaseKey || 'conjunctivitis'}
                  onChange={(e) => {
                    const selectedKey = e.target.value;
                    const preset = DISEASE_PRESETS.find((p) => p.key === selectedKey);
                    if (preset) {
                      setRadarForm({
                        ...radarForm,
                        diseaseKey: preset.key,
                        diseaseName: preset.name,
                        category: preset.category,
                        r0: preset.r0,
                        incubationDays: preset.incubationDays,
                        infectiousDays: preset.infectiousDays,
                        isolationDays: preset.isolationDays,
                        clinicalAdvisory: preset.advisory,
                      });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 700, background: '#fff' }}
                >
                  {DISEASE_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name} — {p.category} (R₀: {p.r0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Epidemiological Tuning Sliders (R0, Incubation, Shedding, Isolation) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                
                {/* R0 Contagiousness Slider */}
                <div style={{ background: C.bg, borderRadius: 14, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>Contagiousness (R₀)</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.urgent }}>{radarForm.r0}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.05"
                    value={radarForm.r0}
                    onChange={(e) => setRadarForm({ ...radarForm, r0: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: C.urgent }}
                  />
                  <span style={{ fontSize: 10, color: C.soft }}>Expected secondary cases per patient</span>
                </div>

                {/* Incubation Days */}
                <div style={{ background: C.bg, borderRadius: 14, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase' }}>Incubation Period</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.ink }}>{radarForm.incubationDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={radarForm.incubationDays}
                    onChange={(e) => setRadarForm({ ...radarForm, incubationDays: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: C.primary }}
                  />
                  <span style={{ fontSize: 10, color: C.soft }}>Exposure to symptom onset</span>
                </div>

                {/* Infectious Shedding Window */}
                <div style={{ background: C.bg, borderRadius: 14, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.accent, textTransform: 'uppercase' }}>Infectious Window</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.ink }}>{radarForm.infectiousDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={radarForm.infectiousDays}
                    onChange={(e) => setRadarForm({ ...radarForm, infectiousDays: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: C.accent }}
                  />
                  <span style={{ fontSize: 10, color: C.soft }}>Active viral shedding duration</span>
                </div>

                {/* Mandatory Isolation Days */}
                <div style={{ background: C.bg, borderRadius: 14, padding: 12, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: '#1B7A4B', textTransform: 'uppercase' }}>Isolation Leave</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#1B7A4B' }}>{radarForm.isolationDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={radarForm.isolationDays}
                    onChange={(e) => setRadarForm({ ...radarForm, isolationDays: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#1B7A4B' }}
                  />
                  <span style={{ fontSize: 10, color: C.soft }}>Mandatory leave protocol</span>
                </div>
              </div>

              {/* Active Clinical Cases & Affected Hostel Blocks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Active Cases Count</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={radarForm.activeCases || 7}
                    onChange={(e) => setRadarForm({ ...radarForm, activeCases: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', marginTop: 4, padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Affected Hostel Blocks</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {['Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'PG Wing', 'Mess Hall 1'].map((block) => {
                      const isSelected = (radarForm.affectedBlocks || []).includes(block);
                      return (
                        <button
                          key={block}
                          type="button"
                          onClick={() => {
                            const cur = radarForm.affectedBlocks || [];
                            const updated = isSelected ? cur.filter((b) => b !== block) : [...cur, block];
                            setRadarForm({ ...radarForm, affectedBlocks: updated });
                          }}
                          style={{
                            background: isSelected ? C.urgent : C.bg,
                            color: isSelected ? '#fff' : C.ink,
                            border: `1px solid ${isSelected ? C.urgent : C.border}`,
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{block}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Doctor's Public Health Advisory */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Doctor's Official Campus Advisory</label>
                <textarea
                  rows={3}
                  value={radarForm.clinicalAdvisory}
                  onChange={(e) => setRadarForm({ ...radarForm, clinicalAdvisory: e.target.value })}
                  style={{ width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 12.5, resize: 'none' }}
                />
              </div>

              {/* Broadcast Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>
                  {broadcastNotice || `Last updated: ${outbreakConfig.lastUpdated || 'Just now'}`}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    updateOutbreakConfig(radarForm);
                    setBroadcastNotice('✓ Outbreak Advisory Broadcasted Live to All Student Dashboards!');
                    setTimeout(() => setBroadcastNotice(''), 3000);
                  }}
                  style={{
                    background: C.primary,
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(47,122,104,0.3)',
                  }}
                >
                  <Send size={14} /> Broadcast Outbreak Advisory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
              allergies: student.allergies,
              hostel_block: student.hostel_block,
              room_number: student.room_number,
            });
            setRxWriterOpen(true);
          }}
        />
      )}
    </div>
  );
}
