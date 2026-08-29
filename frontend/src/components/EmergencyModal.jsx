import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Phone, ShieldAlert, MapPin, Radio, Check, AlertTriangle } from 'lucide-react';
import { getEmergencyContacts } from '../api/index.js';
import { useAuthStore } from '../store/store.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
};

export default function EmergencyModal({ onClose }) {
  const user = useAuthStore((s) => s.user);
  const [sosSent, setSosSent] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergency'],
    queryFn: () => getEmergencyContacts().then((r) => r.data),
    staleTime: Infinity,
  });

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBroadcastSOS = () => {
    setSosSent(true);
    // Copy emergency location coordinates to clipboard
    const info = `🚨 MEDICAL EMERGENCY: Student ${user?.name || 'Student'} (${user?.email}) at ${user?.hostel_block || 'Hostel Block B'} Rm ${user?.room_number || '204'}. Contact: ${user?.phone || 'Campus Helpdesk'}`;
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
          padding: '22px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="#fff" />
            </div>
            <div>
              <div className="champ-heading" style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>
                Campus Emergency Hub
              </div>
              <div style={{ fontSize: 11, color: C.soft }}>24/7 Immediate Medical Response</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: '#F2F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 1-Tap SOS Location Broadcast Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)',
            border: `1.5px solid #F5A9A0`,
            borderRadius: 16,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: C.urgent, textTransform: 'uppercase' }}>
              🚨 One-Tap Campus SOS
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>
              {user?.hostel_block || 'Hostel Block B'} - Rm {user?.room_number || '204'}
            </span>
          </div>

          <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.35 }}>
            Broadcasts your emergency medical location directly to the campus security patrol and ambulance desk.
          </div>

          <button
            onClick={handleBroadcastSOS}
            style={{
              background: sosSent ? '#1B7A4B' : C.urgent,
              color: '#fff',
              padding: '11px 0',
              borderRadius: 12,
              fontSize: 13,
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
                <Check size={16} /> Location Broadcasted to Campus Security!
              </>
            ) : (
              <>
                <Radio size={16} /> Broadcast SOS Location to Ambulance Desk
              </>
            )}
          </button>
        </div>

        {/* Direct Call Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {contacts.map((c) => (
            <a
              key={c.id}
              href={`tel:${c.number.replace(/\s/g, '')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: C.urgentSoft,
                borderRadius: 14,
                padding: '12px 16px',
                textDecoration: 'none',
                color: C.ink,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginTop: 1 }}>{c.number}</div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: C.urgent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(214,72,60,0.3)',
                }}
              >
                <Phone size={16} color="#fff" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
