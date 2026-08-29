import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Pill, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPrescription } from '../api/index.js';

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
};

const COMMON_DRUGS = [
  { name: 'Paracetamol 500mg', dosage: '500mg', freq: '1-0-1 (After Food)', dur: 3 },
  { name: 'Ciprofloxacin Eye Drops 0.3%', dosage: '2 drops', freq: 'Every 4 hours', dur: 5 },
  { name: 'Cetirizine 10mg', dosage: '10mg', freq: '0-0-1 (Night)', dur: 3 },
  { name: 'ORS (Oral Rehydration)', dosage: '1 sachet', freq: 'In 1L water', dur: 2 },
  { name: 'Azithromycin 500mg', dosage: '500mg', freq: '1-0-0 (Once daily)', dur: 3 },
  { name: 'Pantoprazole 40mg', dosage: '40mg', freq: '1-0-0 (Empty stomach)', dur: 5 },
];

export default function PrescriptionWriterModal({ appointment, onClose }) {
  const qc = useQueryClient();
  const [studentName, setStudentName] = useState(appointment?.student_name || 'Campus Student');
  const [studentEmail, setStudentEmail] = useState(appointment?.student_email || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [items, setItems] = useState([
    { medicine_name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 (Morning & Night)', duration_days: 3, instructions: 'After food' },
  ]);
  const [success, setSuccess] = useState(false);

  const { mutate: submitRx, isPending } = useMutation({
    mutationFn: (payload) => createPrescription(payload),
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries(['doctor-queue']);
      qc.invalidateQueries(['student-prescriptions']);
      qc.invalidateQueries(['pharmacy-prescriptions']);
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to dispatch prescription');
    },
  });

  const addItem = (drug) => {
    if (drug) {
      setItems((prev) => [
        ...prev,
        {
          medicine_name: drug.name,
          dosage: drug.dosage,
          frequency: drug.freq,
          duration_days: drug.dur,
          instructions: 'After food with water',
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        { medicine_name: '', dosage: '500mg', frequency: '1-0-1', duration_days: 3, instructions: 'After food' },
      ]);
    }
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, val) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = () => {
    if (!diagnosis.trim()) {
      setErrorMsg('Please enter a clinical diagnosis.');
      return;
    }
    setErrorMsg('');
    submitRx({
      appointment_id: appointment?.id || null,
      student_id: appointment?.student_id || null,
      student_name: studentName,
      student_email: studentEmail,
      doctor_id: appointment?.doctor_id || null,
      diagnosis,
      notes,
      items: items.filter((it) => it.medicine_name.trim()),
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
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
          maxHeight: '90vh',
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
            background: C.primary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pill size={18} /> Digital Prescription Writer
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              Patient: {studentName} {studentEmail ? `(${studentEmail})` : ''}
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

        {success ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color={C.primary} style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, fontSize: 18, color: C.ink }}>Prescription Dispatched!</div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 6 }}>
              Sent to Campus Pharmacy fulfillment queue & student's medical records.
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {errorMsg && (
              <div style={{ background: C.urgentSoft, color: C.urgent, padding: '10px 14px', borderRadius: 12, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {/* Patient Name if Walk-in */}
            {!appointment && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                  Student Name / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '8px 12px',
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                />
              </div>
            )}

            {/* Diagnosis */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Clinical Diagnosis *
              </label>
              <input
                type="text"
                placeholder="e.g. Viral Conjunctivitis, Upper Respiratory Infection..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Drug Presets */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Quick Add Common Campus Meds:
              </label>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 6, paddingBottom: 4 }}>
                {COMMON_DRUGS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => addItem(d)}
                    style={{
                      fontSize: 11,
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.ink,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    + {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicine Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                  Prescribed Medicines ({items.length})
                </span>
                <button
                  onClick={() => addItem()}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  <Plus size={14} /> Add Custom Med
                </button>
              </div>

              {items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    background: C.bg,
                    borderRadius: 14,
                    padding: 12,
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                      value={it.medicine_name}
                      onChange={(e) => updateItem(idx, 'medicine_name', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(idx)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#FBE7E4',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={14} color={C.urgent} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    <div>
                      <span style={{ fontSize: 10, color: C.soft }}>Dosage</span>
                      <input
                        type="text"
                        placeholder="500mg"
                        value={it.dosage}
                        onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: C.soft }}>Frequency</span>
                      <input
                        type="text"
                        placeholder="1-0-1"
                        value={it.frequency}
                        onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: C.soft }}>Days</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={it.duration_days}
                        onChange={(e) => updateItem(idx, 'duration_days', parseInt(e.target.value) || 1)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Doctor Clinical Notes */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Doctor Advice & Follow-up Notes
              </label>
              <textarea
                placeholder="e.g. Isolate for 3 days. Drink plenty of warm fluids. Review if fever persists."
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

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!diagnosis.trim() || isPending}
              style={{
                background: C.primary,
                color: '#fff',
                borderRadius: 14,
                padding: '13px 0',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: 'none',
                cursor: 'pointer',
                opacity: !diagnosis.trim() || isPending ? 0.6 : 1,
              }}
            >
              <Send size={16} />
              {isPending ? 'Sending to Pharmacy…' : 'Issue Prescription & Complete Visit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
