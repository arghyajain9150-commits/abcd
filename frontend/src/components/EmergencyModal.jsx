import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Phone, ShieldAlert } from 'lucide-react';
import { getEmergencyContacts } from '../api/index.js';

const C = { ink: '#17322C', soft: '#5B7169', urgent: '#D6483C', urgentSoft: '#FBE7E4' };

export default function EmergencyModal({ onClose }) {
  const { data: contacts = [] } = useQuery({
    queryKey: ['emergency'],
    queryFn: () => getEmergencyContacts().then((r) => r.data),
    staleTime: Infinity,
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 420, padding: '22px 20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={20} color={C.urgent} />
            <span className="champ-heading" style={{ fontWeight: 700, fontSize: 17 }}>Emergency Help</span>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: '#F2F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map((c) => (
            <a key={c.id} href={`tel:${c.number.replace(/\s/g, '')}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.urgentSoft, borderRadius: 14, padding: '14px 16px', textDecoration: 'none', color: C.ink }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: C.soft, marginTop: 1 }}>{c.number}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={16} color="#fff" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
