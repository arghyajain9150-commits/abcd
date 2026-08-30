import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, Sparkles, CheckCircle2, UploadCloud, FileText, Pill, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { scanPrescriptionVision, createPrescription } from '../api/index.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
};

const SAMPLE_PRESCRIPTIONS = [
  { id: 'rx1', label: 'Sample 1: Handwritten Eye Infection Rx', doc: 'Dr. Aditi Rao', condition: 'Viral Conjunctivitis' },
  { id: 'rx2', label: 'Sample 2: Handwritten Allergy & Rash Rx', doc: 'Dr. Sanjana Iyer', condition: 'Allergic Dermatitis' },
  { id: 'rx3', label: 'Sample 3: Handwritten Sports Injury Rx', doc: 'Dr. Rohan Verma', condition: 'Sprained Ankle' },
];

export default function PrescriptionVisionScannerModal({ onClose, studentName = 'Campus Student', studentEmail = '' }) {
  const qc = useQueryClient();
  const [selectedPreset, setSelectedPreset] = useState('rx1');
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const { mutate: scan, isPending } = useMutation({
    mutationFn: (preset) => scanPrescriptionVision({ samplePreset: preset }),
    onSuccess: (res) => {
      setExtractedData(res.data.data);
      setScanning(false);
    },
    onError: () => setScanning(false),
  });

  const { mutate: submitToPharmacy, isPending: submitting } = useMutation({
    mutationFn: () =>
      createPrescription({
        student_name: studentName,
        student_email: studentEmail,
        diagnosis: extractedData.diagnosis,
        notes: `Vision AI Scanned from Doctor Slip. ${extractedData.notes || ''}`,
        items: extractedData.items,
      }),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries(['student-prescriptions']);
      qc.invalidateQueries(['pharmacy-prescriptions']);
      setTimeout(() => {
        onClose();
      }, 1500);
    },
  });

  const handleStartScan = (presetKey) => {
    setSelectedPreset(presetKey);
    setScanning(true);
    setExtractedData(null);
    setTimeout(() => {
      scan(presetKey);
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 16,
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes scan-laser {
          0%   { top: 0%; opacity: 0.8; }
          50%  { top: 90%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #2F7A68, #FFE699, #2F7A68, transparent);
          box-shadow: 0 0 14px 2px #2F7A68;
          animation: scan-laser 2s infinite ease-in-out;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 600,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px -15px rgba(23,50,44,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} color="#FFE699" />
            </div>
            <div>
              <div className="champ-heading" style={{ fontSize: 17, fontWeight: 800 }}>
                Gemini Vision AI Prescription Scanner
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Handwritten Doctor Notes OCR & Automated Formulary Parser</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Preset Selector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
              Select Sample Doctor Handwritten Slip or Upload
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {SAMPLE_PRESCRIPTIONS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleStartScan(preset.id)}
                  style={{
                    background: selectedPreset === preset.id ? C.primarySoft : C.surface,
                    border: `1.5px solid ${selectedPreset === preset.id ? C.primary : C.border}`,
                    borderRadius: 12,
                    padding: '10px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{preset.condition}</div>
                  <div style={{ fontSize: 10.5, color: C.primary, marginTop: 2 }}>{preset.doc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Simulation Area */}
          <div
            style={{
              background: '#F5F7F3',
              borderRadius: 18,
              padding: 16,
              border: `2px dashed ${scanning ? C.primary : C.border}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
              overflow: 'hidden',
            }}
          >
            {scanning && <div className="laser-line" />}

            {scanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}>
                <Sparkles size={28} color={C.primary} style={{ animation: 'spin 3s linear infinite' }} />
                <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>
                  Gemini Vision AI parsing doctor handwriting…
                </div>
                <div style={{ fontSize: 11.5, color: C.soft }}>
                  Segmenting active drugs, dosage frequency & duration
                </div>
              </div>
            ) : extractedData ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: '#D8F3E5', color: '#1B7A4B', padding: '3px 9px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> OCR Confidence: {(extractedData.confidence_score * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: 11, color: C.soft }}>
                    Model: <strong>{extractedData.ai_model}</strong>
                  </span>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Detected Clinical Diagnosis</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginTop: 1 }}>{extractedData.diagnosis}</div>
                  <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Doctor: {extractedData.doctor_name}</div>
                </div>

                {/* Parsed Medications Table */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 6 }}>
                    Extracted Medications ({extractedData.items.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {extractedData.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderBottom: idx < extractedData.items.length - 1 ? '1px solid #F0F0EE' : 'none', paddingBottom: 4 }}>
                        <div>
                          <strong style={{ color: C.ink }}>💊 {item.medicine_name}</strong>
                          <span style={{ color: C.soft, marginLeft: 6 }}>({item.dosage})</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: C.primary }}>{item.frequency}</span>
                          <span style={{ fontSize: 11, color: C.soft, marginLeft: 6 }}>{item.duration_days}d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 14 }}>
                <Camera size={32} color={C.primary} style={{ margin: '0 auto 6px' }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Click a sample prescription above to test Vision OCR</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>Extracts messy cursive writing into validated campus pharmacy items</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.bg }}>
          <button
            onClick={() => handleStartScan(selectedPreset)}
            disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: C.soft, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Re-scan Image
          </button>

          {extractedData && (
            <button
              onClick={() => submitToPharmacy()}
              disabled={submitting || submitted}
              style={{
                background: submitted ? '#1B7A4B' : C.primary,
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {submitted ? (
                <>
                  <CheckCircle2 size={16} /> Order Transmitted to Dispensary!
                </>
              ) : submitting ? (
                'Submitting Order…'
              ) : (
                <>
                  <Pill size={16} /> Digitize & Send to Dispensary
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
