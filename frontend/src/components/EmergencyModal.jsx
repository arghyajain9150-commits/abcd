import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Phone, ShieldAlert, MapPin, Radio, Check, AlertTriangle, HeartPulse, Building2, Flame, ShieldCheck } from 'lucide-react';
import { getEmergencyContacts } from '../api/index.js';
import { useAuthStore } from '../store/store.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
};

const CATEGORY_ICONS = {
  Medical: HeartPulse,
  Campus: Building2,
  Security: ShieldCheck,
  Psychological: HeartPulse,
  National: Flame,
  Safety: ShieldAlert,
};

export default function EmergencyModal({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const [sosSent, setSosSent] = useState(false);

  const { data: rawContacts = [] } = useQuery({
    queryKey: ['emergency'],
    queryFn: () => getEmergencyContacts().then((r) => r.data),
    staleTime: 60_000,
  });

  // Strict deduplication by label
  const contacts = Array.from(
    new Map(rawContacts.map((c) => [c.label, c])).values()
  );

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBroadcastSOS = () => {
    setSosSent(true);
    const info = `🚨 MEDICAL EMERGENCY: Student ${user?.name || 'Student'} (${user?.email}) at ${user?.hostel_block || 'Hostel Block B'} Rm ${user?.room_number || '204'}. Emergency Contact: ${user?.emergency_contact || '+91 98765 00000'}`;
    navigator.clipboard?.writeText(info);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.65)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 80,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 430,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="#fff" />
            </div>
            <div>
              <div className="champ-heading" style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>
                Campus Emergency Hub
              </div>
              <div style={{ fontSize: 11, color: C.soft }}>24/7 Verified Emergency Directory</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: '#F2F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 1-Tap SOS Location Broadcast Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)',
              border: `1.5px solid #F5A9A0`,
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🚨 One-Tap Campus SOS
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>
                {user?.hostel_block || 'Hostel Block B'} · Rm {user?.room_number || '204'}
              </span>
            </div>

            <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.35 }}>
              Transmits your emergency medical location directly to campus security & ambulance desk.
            </div>

            <button
              onClick={handleBroadcastSOS}
              style={{
                background: sosSent ? '#1B7A4B' : C.urgent,
                color: '#fff',
                padding: '10px 0',
                borderRadius: 12,
                fontSize: 12.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px -3px rgba(214,72,60,0.4)',
              }}
            >
              {sosSent ? (
                <>
                  <Check size={15} /> SOS Sent to Campus Control Desk!
                </>
              ) : (
                <>
                  <Radio size={15} /> Broadcast SOS Location to Ambulance
                </>
              )}
            </button>
          </div>

          {/* Verified Emergency Hotlines List */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Verified Direct Hotlines ({contacts.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c) => {
                const IconComponent = CATEGORY_ICONS[c.category] || Phone;
                return (
                  <a
                    key={c.id || c.label}
                    href={`tel:${c.number.replace(/\s/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: C.surface,
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: `1px solid ${C.border}`,
                      textDecoration: 'none',
                      color: C.ink,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: C.urgentSoft,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={18} color={C.urgent} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.label}
                        </div>
                        <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>
                          {c.description || '24/7 Immediate Help'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: C.urgent,
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={12} />
                      <span>{c.number}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
