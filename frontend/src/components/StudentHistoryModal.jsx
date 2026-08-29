import { useQuery } from '@tanstack/react-query';
import { X, FileText, AlertTriangle, ShieldCheck, Calendar, Pill, Stethoscope, User } from 'lucide-react';
import { getStudentHistory } from '../api/index.js';

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

export default function StudentHistoryModal({ studentId, studentName, onPrescribe, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['student-history', studentId],
    queryFn: () => getStudentHistory(studentId).then((r) => r.data),
    enabled: !!studentId,
  });

  const student = data?.student;
  const prescriptions = data?.prescriptions || [];
  const appointments = data?.appointments || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 65,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 24,
          width: '100%',
          maxWidth: 480,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px -15px rgba(23,50,44,0.4)',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Student Medical History</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {student?.name || studentName || 'Patient Record'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.soft }}>Loading patient medical record…</div>
          ) : (
            <>
              {/* Medical Card / Vitals */}
              <div
                style={{
                  background: C.bg,
                  borderRadius: 18,
                  padding: 14,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{student?.name}</div>
                    <div style={{ fontSize: 12, color: C.soft }}>
                      {student?.email} · {student?.phone || 'No phone listed'}
                    </div>
                  </div>
                  <div
                    style={{
                      background: '#FFF',
                      border: `1px solid ${C.primary}`,
                      color: C.primary,
                      fontWeight: 800,
                      fontSize: 13,
                      padding: '4px 10px',
                      borderRadius: 10,
                    }}
                  >
                    Blood: {student?.blood_group || 'O+'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <span style={{ color: C.soft, display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Hostel / Room</span>
                    <strong style={{ color: C.ink }}>{student?.hostel_block} - Rm {student?.room_number}</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <span style={{ color: C.soft, display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Emergency Contact</span>
                    <strong style={{ color: C.ink }}>{student?.emergency_contact || '+91 98765 00000'}</strong>
                  </div>
                </div>

                {/* Allergies Highlight */}
                <div
                  style={{
                    background: student?.allergies && student?.allergies.toLowerCase() !== 'none reported' ? C.urgentSoft : C.primarySoft,
                    border: `1px solid ${student?.allergies && student?.allergies.toLowerCase() !== 'none reported' ? '#F5C6BA' : C.primary}`,
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={16} color={student?.allergies && student?.allergies.toLowerCase() !== 'none reported' ? C.urgent : C.primary} />
                  <div style={{ fontSize: 12, color: C.ink }}>
                    <strong>Known Allergies:</strong> {student?.allergies || 'None reported'}
                  </div>
                </div>
              </div>

              {/* Past Digital Prescriptions */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
                  Previous Prescriptions ({prescriptions.length})
                </div>

                {prescriptions.length === 0 ? (
                  <div style={{ background: C.bg, padding: 16, borderRadius: 14, textAlign: 'center', color: C.soft, fontSize: 12 }}>
                    No prior prescriptions on file.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        style={{
                          background: C.surface,
                          borderRadius: 14,
                          padding: 12,
                          border: `1px solid ${C.border}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>
                            Diagnosis: {rx.diagnosis}
                          </span>
                          <span style={{ fontSize: 11, color: C.soft }}>
                            {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 8 }}>
                          Prescribed by {rx.doctor_name} ({rx.doctor_specialty}) · Status: <strong>{rx.status}</strong>
                        </div>

                        <div style={{ background: C.bg, borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {rx.items?.map((it, idx) => (
                            <div key={idx} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 600, color: C.ink }}>• {it.medicine_name} ({it.dosage})</span>
                              <span style={{ color: C.soft, fontSize: 11 }}>{it.frequency} × {it.duration_days}d</span>
                            </div>
                          ))}
                        </div>

                        {rx.notes && (
                          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 6, fontStyle: 'italic' }}>
                            Note: "{rx.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Visits */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  Consultation History ({appointments.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {appointments.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      style={{
                        background: C.bg,
                        borderRadius: 10,
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                      }}
                    >
                      <div>
                        <strong>{a.doctor_name}</strong> ({a.specialty || a.doctor_specialty})
                        <div style={{ fontSize: 11, color: C.soft }}>{a.notes || 'Routine visit'}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 11, color: C.soft }}>
                        {new Date(a.slot_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        <div style={{ textTransform: 'uppercase', fontWeight: 700, color: a.status === 'completed' ? C.primary : C.accent }}>
                          {a.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Action */}
        <div style={{ padding: '12px 20px', background: '#fff', borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => {
              onClose();
              if (onPrescribe) onPrescribe(student);
            }}
            style={{
              width: '100%',
              background: C.primary,
              color: '#fff',
              borderRadius: 14,
              padding: '12px 0',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Pill size={16} /> Write New Prescription for {student?.name || 'this Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
