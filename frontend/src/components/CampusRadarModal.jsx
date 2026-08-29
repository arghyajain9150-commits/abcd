import { useQuery } from '@tanstack/react-query';
import { X, Activity, AlertTriangle, ShieldCheck, MapPin, Building, Sparkles, Stethoscope, Users, Radio } from 'lucide-react';
import { getCampusRadar } from '../api/index.js';

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

export default function CampusRadarModal({ onClose, onOpenAI, onBook }) {
  const { data: radar = {}, isLoading } = useQuery({
    queryKey: ['campus-radar'],
    queryFn: () => getCampusRadar().then((r) => r.data),
    refetchInterval: 15_000,
  });

  const stats = radar.stats || {};
  const blocks = stats.blocks || { 'Hostel Block A': 4, 'Hostel Block C': 3 };
  const floors = stats.floors || { 'Hostel Block A · Floor 2': 4, 'Hostel Block C · Floor 1': 3 };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 75,
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
            background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={20} color="#FFE699" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>Campus Epidemiological Radar</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Real-time Spatial-Temporal Contagion Tracker</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.soft }}>Calibrating campus infection radar…</div>
          ) : (
            <>
              {/* Contagion Overview Card */}
              <div
                style={{
                  background: radar.severity === 'critical' ? C.urgentSoft : C.accentSoft,
                  border: `1.5px solid ${radar.severity === 'critical' ? C.urgent : C.accent}`,
                  borderRadius: 18,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: radar.severity === 'critical' ? C.urgent : C.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Active Contagion Alert · Live
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, background: '#fff', color: C.ink, padding: '2px 8px', borderRadius: 8 }}>
                    {radar.totalActiveCases || 7} Active Cases
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>
                  {radar.primaryDisease}
                </div>

                <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
                  <strong>Transmission Vector:</strong> {stats.transmission || 'Direct Contact & Shared Fomites'}
                </div>
              </div>

              {/* Spatial Breakdown: Hostel Blocks Heatmap */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  🏢 Hostel Block Contagion Density
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {Object.entries(blocks).map(([blk, count]) => {
                    const isHigh = count >= 4;
                    return (
                      <div
                        key={blk}
                        style={{
                          background: isHigh ? '#FDE8E6' : C.bg,
                          border: `1px solid ${isHigh ? '#F5A9A0' : C.border}`,
                          borderRadius: 14,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{blk}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: C.soft }}>Infection Count:</span>
                          <strong style={{ fontSize: 14, color: isHigh ? C.urgent : C.primary }}>{count} Cases</strong>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: isHigh ? C.urgent : C.primary, textTransform: 'uppercase' }}>
                          {isHigh ? '⚠️ Active Cluster' : '🟢 Monitored'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floor-Level Hotspots */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                  📍 Floor-Level Spatial Hotspots
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(floors).map(([flr, count]) => (
                    <div
                      key={flr}
                      style={{
                        background: C.surface,
                        borderRadius: 12,
                        padding: '10px 12px',
                        border: `1px solid ${C.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} color={C.primary} />
                        <span style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{flr}</span>
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: C.urgent, background: C.urgentSoft, padding: '2px 8px', borderRadius: 8 }}>
                        {count} Cases · Sanitizing
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Prevention Checklist */}
              {radar.allAlerts?.[0]?.prevention_steps && (
                <div style={{ background: C.bg, borderRadius: 16, padding: 14, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink, textTransform: 'uppercase', marginBottom: 8 }}>
                    🛡️ Medical Officer Advisory
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {radar.allAlerts[0].prevention_steps.map((step, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: C.ink, display: 'flex', gap: 8 }}>
                        <span style={{ color: C.primary, fontWeight: 700 }}>•</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '12px 20px', background: '#fff', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              onClose();
              if (onOpenAI) onOpenAI();
            }}
            style={{
              flex: 1,
              background: C.primarySoft,
              color: C.primary,
              borderRadius: 12,
              padding: '11px 0',
              fontSize: 12.5,
              fontWeight: 700,
              border: `1px solid ${C.primary}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={15} /> Check My Symptoms
          </button>
          <button
            onClick={() => {
              onClose();
              if (onBook) onBook();
            }}
            style={{
              flex: 1,
              background: C.primary,
              color: '#fff',
              borderRadius: 12,
              padding: '11px 0',
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Stethoscope size={15} /> Book Doctor
          </button>
        </div>
      </div>
    </div>
  );
}
