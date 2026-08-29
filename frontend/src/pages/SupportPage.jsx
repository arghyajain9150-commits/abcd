import { MapPin } from 'lucide-react';

const C = { ink: '#17322C', soft: '#5B7169', primary: '#2F7A68', surface: '#FFFFFF', border: '#E1E3DA' };

const FAQS = [
  { q: 'How fast are appointments confirmed?', a: 'Instantly! You get an email confirmation and your queue position right away.' },
  { q: 'Can I cancel a booking?', a: 'Yes — go to Appointments → Current, and tap the X icon on your booking.' },
  { q: 'Is my health data private?', a: 'Only you and the treating doctor can see your records. Nothing is shared beyond campus healthcare staff.' },
  { q: 'Will I get a reminder?', a: "Yes — you'll receive an email reminder 30 minutes before your slot." },
];

export default function SupportPage() {
  return (
    <div>
      <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, marginTop: 4 }}>Support</div>

      <div style={{ background: C.surface, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, marginBottom: 20, display: 'flex', gap: 12 }}>
        <MapPin size={18} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Campus Health Centre</div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>Block A, Ground Floor · Open 8 AM – 8 PM</div>
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Common questions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAQS.map((f, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5 }}>{f.q}</div>
            <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.5 }}>{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
