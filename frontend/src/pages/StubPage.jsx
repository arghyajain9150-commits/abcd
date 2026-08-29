const C = { ink: '#17322C', soft: '#5B7169', primary: '#2F7A68', primarySoft: '#E4EFEA', accent: '#E3A542', surface: '#FFFFFF', border: '#E1E3DA' };

export default function StubPage({ icon: Icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '70px 24px' }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <Icon size={26} color={C.primary} />
      </div>
      <div className="champ-heading" style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.soft, lineHeight: 1.6 }}>{desc}</div>
      <div style={{ marginTop: 20, fontSize: 11, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coming soon</div>
    </div>
  );
}
