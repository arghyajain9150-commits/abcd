import { Printer, X, Download, ShieldCheck, Stethoscope, Building } from 'lucide-react';

export default function PrescriptionPrintModal({ prescription, onClose }) {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
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
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-prescription, #printable-prescription * {
            visibility: visible;
          }
          #printable-prescription {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px -15px rgba(23,50,44,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Actions */}
        <div className="no-print" style={{ padding: '14px 20px', background: '#17322C', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
            <Printer size={18} color="#FFE699" />
            <span>Official Prescription Document</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#2F7A68',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── Printable Medical Prescription Document ─── */}
        <div
          id="printable-prescription"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            background: '#fff',
            color: '#17322C',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Clinic Header */}
          <div style={{ borderBottom: '2px solid #2F7A68', paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#17322C', letterSpacing: '-0.02em' }}>
                CAMPUS HEALTH CENTRE
              </div>
              <div style={{ fontSize: 12, color: '#5B7169', marginTop: 2 }}>
                Block A Ground Floor · University Health Services · OPD Unit
              </div>
              <div style={{ fontSize: 11, color: '#5B7169' }}>
                Emergency Hotline: <strong>108 / 011-2659-1100</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2F7A68' }}>
                Rx #{prescription.id?.slice(0, 8)?.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#5B7169', marginTop: 2 }}>
                Date: <strong>{new Date(prescription.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
            </div>
          </div>

          {/* Doctor & Patient Info Bar */}
          <div style={{ background: '#F5F7F3', borderRadius: 14, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, fontSize: 12, border: '1px solid #E1E3DA' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#5B7169', textTransform: 'uppercase' }}>Doctor Details</span>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#17322C', marginTop: 2 }}>
                {prescription.doctor_name || 'Campus Medical Officer'}
              </div>
              <div style={{ color: '#2F7A68', fontWeight: 600, fontSize: 11.5 }}>
                {prescription.doctor_specialty || 'General Medicine'} · OPD Room 101
              </div>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#5B7169', textTransform: 'uppercase' }}>Patient Details</span>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#17322C', marginTop: 2 }}>
                {prescription.student_name || 'Campus Student'}
              </div>
              <div style={{ color: '#5B7169', fontSize: 11.5 }}>
                {prescription.hostel_block || 'Hostel Block A'} · Rm {prescription.room_number || '204'}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ borderLeft: '3px solid #2F7A68', paddingLeft: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#5B7169', textTransform: 'uppercase' }}>Clinical Diagnosis</span>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#17322C' }}>
              {prescription.diagnosis}
            </div>
          </div>

          {/* Prescribed Medications Table */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#5B7169', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Prescribed Medications (Rx)
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#E4EFEA', color: '#17322C', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '8px 0 0 8px' }}>Medicine & Dosage</th>
                  <th style={{ padding: '8px 10px' }}>Schedule / Freq</th>
                  <th style={{ padding: '8px 10px' }}>Days</th>
                  <th style={{ padding: '8px 10px', borderRadius: '0 8px 8px 0' }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {prescription.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E1E3DA' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 700, color: '#17322C' }}>
                      💊 {item.medicine_name}
                      <span style={{ fontSize: 11, color: '#5B7169', display: 'block', fontWeight: 500 }}>{item.dosage}</span>
                    </td>
                    <td style={{ padding: '10px 10px', color: '#17322C' }}>{item.frequency}</td>
                    <td style={{ padding: '10px 10px', fontWeight: 700, color: '#2F7A68' }}>{item.duration_days}d</td>
                    <td style={{ padding: '10px 10px', color: '#5B7169', fontSize: 11.5 }}>{item.instructions || 'After food'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Doctor Advice / Notes */}
          {prescription.notes && (
            <div style={{ background: '#FFF4E5', border: '1px solid #F5C6BA', borderRadius: 10, padding: '10px 12px', fontSize: 11.5 }}>
              <strong style={{ color: '#17322C' }}>Doctor's Advice:</strong> {prescription.notes}
            </div>
          )}

          {/* 2FA Pickup Verification Code & Footer Stamp */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #E1E3DA', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#5B7169', textTransform: 'uppercase' }}>
                Dispensary Pickup Verification Code
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#2F7A68', letterSpacing: '0.15em', fontFamily: 'monospace', marginTop: 2 }}>
                🔐 {prescription.pickup_otp || '4821'}
              </div>
              <div style={{ fontSize: 10, color: '#5B7169', marginTop: 2 }}>
                Valid for collection within 7 days at Block A Pharmacy.
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 90, height: 40, borderBottom: '1.5px dashed #5B7169', margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#17322C' }}>Authorized Medical Seal</div>
              <div style={{ fontSize: 10, color: '#2F7A68', fontWeight: 600 }}>CAMPUS HEALTH DESK</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
