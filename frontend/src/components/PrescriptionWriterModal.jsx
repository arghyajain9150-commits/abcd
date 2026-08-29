import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Pill, Send, CheckCircle2, AlertCircle, AlertTriangle, Search, Check, ShieldAlert, Radio } from 'lucide-react';
import { createPrescription, getPharmacyInventory } from '../api/index.js';

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

const CONTAGIOUS_OPTIONS = [
  { id: 'none', label: 'None (Non-Contagious Condition)', disease: null },
  { id: 'conjunctivitis', label: '🦠 Viral Conjunctivitis (Eye Flu)', disease: 'Viral Conjunctivitis' },
  { id: 'influenza', label: '🦠 Influenza / Seasonal Flu', disease: 'Influenza / Viral Flu' },
  { id: 'gastro', label: '🦠 Acute Viral Gastroenteritis', disease: 'Gastroenteritis' },
  { id: 'chickenpox', label: '🦠 Varicella / Chickenpox', disease: 'Varicella (Chickenpox)' },
  { id: 'dengue', label: '🦠 Dengue / Vector-Borne Fever', disease: 'Dengue Viral Fever' },
];

export default function PrescriptionWriterModal({ appointment, onClose }) {
  const qc = useQueryClient();
  const [studentName, setStudentName] = useState(appointment?.student_name || 'Campus Student');
  const [studentEmail, setStudentEmail] = useState(appointment?.student_email || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [contagiousTag, setContagiousTag] = useState('none');
  const [errorMsg, setErrorMsg] = useState('');
  const [items, setItems] = useState([
    { medicine_name: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 (Morning & Night)', duration_days: 3, instructions: 'After food' },
  ]);
  const [success, setSuccess] = useState(false);

  // 1. Fetch live pharmacy inventory for autocomplete
  const { data: inventory = [] } = useQuery({
    queryKey: ['pharmacy-inventory'],
    queryFn: () => getPharmacyInventory().then((r) => r.data),
  });

  const { mutate: submitRx, isPending } = useMutation({
    mutationFn: (payload) => createPrescription(payload),
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries(['doctor-queue']);
      qc.invalidateQueries(['student-prescriptions']);
      qc.invalidateQueries(['pharmacy-prescriptions']);
      qc.invalidateQueries(['outbreaks']);
      qc.invalidateQueries(['campus-radar']);
      setTimeout(() => {
        onClose();
      }, 1400);
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
          dosage: drug.dosage || '500mg',
          frequency: drug.freq || '1-0-1 (After Food)',
          duration_days: drug.dur || 3,
          instructions: drug.instructions || 'After meals with water',
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

    const matchedTag = CONTAGIOUS_OPTIONS.find((c) => c.id === contagiousTag);

    submitRx({
      appointment_id: appointment?.id || null,
      student_id: appointment?.student_id || null,
      student_name: studentName,
      student_email: studentEmail,
      doctor_id: appointment?.doctor_id || null,
      diagnosis,
      notes,
      is_contagious: contagiousTag !== 'none',
      contagious_disease: matchedTag?.disease || (contagiousTag !== 'none' ? diagnosis : null),
      items: items.filter((it) => it.medicine_name.trim()),
    });
  };

  const studentAllergies = appointment?.allergies || 'None reported';
  const hasAllergies = studentAllergies && studentAllergies.toLowerCase() !== 'none' && studentAllergies.toLowerCase() !== 'none reported';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 85,
        padding: 14,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 22,
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px -15px rgba(23,50,44,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={20} color={C.primary} />
            </div>
            <div>
              <div className="champ-heading" style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>
                OPD Prescription & Outbreak Tag
              </div>
              <div style={{ fontSize: 11, color: C.soft }}>Patient: {studentName} ({appointment?.hostel_block || 'Hostel Block B'} Rm {appointment?.room_number || '204'})</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, background: '#F2F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Allergy Warning Banner */}
          {hasAllergies && (
            <div
              style={{
                background: C.urgentSoft,
                border: `1.5px solid #F5A9A0`,
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertTriangle size={18} color={C.urgent} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: C.urgent, fontWeight: 700 }}>
                ⚠️ Patient Allergy Alert: <span style={{ color: C.ink }}>{studentAllergies}</span>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: C.soft, marginTop: 1 }}>
                  Verify drug compatibility before prescribing.
                </div>
              </div>
            </div>
          )}

          {/* Clinical Diagnosis Input */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              placeholder="e.g. Acute Viral Bronchitis, Follicular Conjunctivitis, Migraine"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '9px 12px',
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* ─── AI Outbreak Radar Contagious Tagging ─── */}
          <div style={{ background: '#FFF7E6', border: `1.5px solid #F5D590`, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={16} color={C.accent} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: C.ink, textTransform: 'uppercase' }}>
                AI Outbreak Surveillance Radar Tag
              </span>
            </div>
            <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.3 }}>
              Tagging contagious infections automatically triggers the campus spatial clustering radar across this student's hostel floor.
            </div>

            <select
              value={contagiousTag}
              onChange={(e) => {
                setContagiousTag(e.target.value);
                const matched = CONTAGIOUS_OPTIONS.find((c) => c.id === e.target.value);
                if (matched && matched.disease && !diagnosis) {
                  setDiagnosis(matched.disease);
                }
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                fontSize: 12.5,
                fontWeight: 700,
                color: contagiousTag !== 'none' ? C.urgent : C.ink,
                background: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {CONTAGIOUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick-Select Common Formulary from Live Inventory */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>
                Dispensary Formulary (Live Stock)
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {inventory.slice(0, 6).map((drug) => (
                <button
                  key={drug.id}
                  type="button"
                  onClick={() => addItem({ name: drug.name, dosage: '1 tablet', freq: '1-0-1', dur: 3, instructions: 'After meals' })}
                  style={{
                    background: drug.is_available ? C.primarySoft : '#F2F2EE',
                    color: drug.is_available ? C.primary : C.soft,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: `1px solid ${drug.is_available ? '#C3DED3' : '#DDD'}`,
                    cursor: drug.is_available ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{drug.name}</span>
                  <span style={{ fontSize: 9.5, opacity: 0.8 }}>({drug.stock_quantity})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prescribed Medications Dynamic List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Prescription Items ({items.length})
              </label>
              <button
                type="button"
                onClick={() => addItem()}
                style={{ fontSize: 11.5, fontWeight: 700, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <Plus size={14} /> Add Drug
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: C.bg,
                    borderRadius: 12,
                    padding: 10,
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Medicine name..."
                      value={item.medicine_name}
                      onChange={(e) => updateItem(idx, 'medicine_name', e.target.value)}
                      style={{ flex: 2, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12.5, fontWeight: 600 }}
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={item.dosage}
                      onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                      style={{ flex: 1, padding: '7px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        style={{ color: C.urgent, padding: 4, cursor: 'pointer', border: 'none', background: 'none' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Schedule: 1-0-1 (After Food)"
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                      style={{ padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11.5 }}
                    />
                    <input
                      type="number"
                      placeholder="Days"
                      min={1}
                      value={item.duration_days}
                      onChange={(e) => updateItem(idx, 'duration_days', parseInt(e.target.value) || 1)}
                      style={{ padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 11.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Clinical Notes / Instructions */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Doctor Notes & Advice
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Adequate rest, drink 3L water, review in 3 days if fever persists."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '8px 12px',
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                fontSize: 12.5,
                resize: 'none',
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ background: C.urgentSoft, color: C.urgent, padding: '8px 12px', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '12px 20px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: C.soft }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || success}
            style={{
              flex: 2,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: success ? '#1B7A4B' : C.primary,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {success ? (
              <>
                <CheckCircle2 size={16} /> Dispatched & Synced!
              </>
            ) : isPending ? (
              'Transmitting Rx…'
            ) : (
              <>
                <Send size={15} /> Issue Rx & Sync Radar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
