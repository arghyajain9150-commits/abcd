import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Sparkles, ChevronRight, Radio, MapPin, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getOutbreakAlerts } from '../api/index.js';
import { useOutbreakStore } from '../store/store.js';
import CampusRadarModal from './CampusRadarModal.jsx';
import OutbreakForecastModal from './OutbreakForecastModal.jsx';

const C = {
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  ink: '#17322C',
  soft: '#5B7169',
};

export default function OutbreakBanner({ onOpenAI, onBook }) {
  const [radarOpen, setRadarOpen] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);

  const outbreakConfig = useOutbreakStore((s) => s.config);

  const { data: alerts = [] } = useQuery({
    queryKey: ['outbreak-alerts'],
    queryFn: () => getOutbreakAlerts().then((r) => r.data),
    staleTime: 30_000,
  });

  const activeAlert = alerts[0];
  const isOutbreakActive = outbreakConfig?.active && outbreakConfig?.severity !== 'resolved';
  const diseaseName = outbreakConfig?.diseaseName || activeAlert?.disease_name || 'Viral Conjunctivitis (Eye Flu)';
  const activeCases = outbreakConfig?.activeCases || activeAlert?.active_cases || 7;
  const advisory = outbreakConfig?.clinicalAdvisory || activeAlert?.advisory || 'Mandatory isolation for infected students.';
  const r0 = outbreakConfig?.r0 || 1.84;
  const affectedBlocks = outbreakConfig?.affectedBlocks || ['Hostel Block B', 'Hostel Block C'];

  if (!isOutbreakActive) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #E4EFEA 0%, #D5E8DF 100%)',
          border: `1.5px solid ${C.primary}`,
          borderRadius: 18,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(47,122,104,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.ink }}>
              Campus Health Status: Normal Baseline
            </div>
            <div style={{ fontSize: 11, color: C.soft }}>
              0 active viral clusters detected · Doctor Epidemiological Surveillance Active (R₀ &lt; 1.0)
            </div>
          </div>
        </div>

        <button
          onClick={() => setRadarOpen(true)}
          style={{ background: '#fff', border: `1px solid ${C.primary}`, color: C.primary, padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Radio size={12} /> View Radar
        </button>
      </div>
    );
  }

  const isCritical = outbreakConfig?.severity === 'critical' || outbreakConfig?.severity === 'high';

  return (
    <>
      <div
        style={{
          background: isCritical
            ? 'linear-gradient(135deg, #FFE8E5 0%, #FFD6D0 100%)'
            : 'linear-gradient(135deg, #FFF4E5 0%, #FFE8E5 100%)',
          border: `1.5px solid ${isCritical ? '#F5A9A0' : '#F5C6BA'}`,
          borderRadius: 18,
          padding: '14px 16px',
          marginBottom: 16,
          boxShadow: '0 4px 16px -4px rgba(214,72,60,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: C.urgent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={15} color="#fff" />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.urgent,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Active Campus Alert ({activeCases} Cases · R₀: {r0})
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setForecastOpen(true)}
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                background: '#fff',
                padding: '4px 8px',
                borderRadius: 99,
                color: '#B45309',
                border: '1px solid #F59E0B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <TrendingUp size={12} /> AI Forecast
            </button>

            <button
              onClick={() => setRadarOpen(true)}
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                background: '#fff',
                padding: '4px 8px',
                borderRadius: 99,
                color: C.primary,
                border: `1px solid ${C.primary}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Radio size={12} /> Live Radar
            </button>
          </div>
        </div>

        <div style={{ fontWeight: 800, fontSize: 14, color: C.ink, lineHeight: 1.3 }}>
          {diseaseName}
        </div>

        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
          {advisory}
        </div>

        {/* Affected Blocks Tags */}
        {affectedBlocks && affectedBlocks.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.urgent }}>Targeted Zones:</span>
            {affectedBlocks.map((b) => (
              <span key={b} style={{ background: '#fff', color: C.ink, border: '1px solid #F5C6BA', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6, marginTop: 4 }}>
          <button
            onClick={() => onOpenAI(diseaseName)}
            style={{
              background: '#fff',
              border: '1px solid #F5C6BA',
              borderRadius: 12,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              color: C.ink,
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} color={C.accent} />
            <span>Check Symptoms</span>
          </button>

          <button
            onClick={() => setRadarOpen(true)}
            style={{
              background: C.primary,
              color: '#fff',
              borderRadius: 12,
              padding: '8px 10px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <MapPin size={13} />
            <span>Hostel Heatmap</span>
          </button>

          <button
            onClick={() => setForecastOpen(true)}
            style={{
              background: '#17322C',
              color: '#fff',
              borderRadius: 12,
              padding: '8px 10px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <TrendingUp size={13} color="#FFE699" />
            <span>AI Projection</span>
          </button>
        </div>
      </div>

      {radarOpen && <CampusRadarModal onClose={() => setRadarOpen(false)} />}
      {forecastOpen && <OutbreakForecastModal onClose={() => setForecastOpen(false)} />}
    </>
  );
}
