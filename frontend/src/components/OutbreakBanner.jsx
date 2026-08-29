import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Sparkles, ChevronRight, Radio, MapPin } from 'lucide-react';
import { getOutbreakAlerts } from '../api/index.js';
import CampusRadarModal from './CampusRadarModal.jsx';

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

  const { data: alerts = [] } = useQuery({
    queryKey: ['outbreak-alerts'],
    queryFn: () => getOutbreakAlerts().then((r) => r.data),
    staleTime: 30_000,
  });

  const activeAlert = alerts[0];
  if (!activeAlert) return null;

  const isCritical = activeAlert.severity === 'critical';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                letterSpacing: '0.06em',
              }}
            >
              Active Campus Alert ({activeAlert.active_cases || 7} Cases)
            </span>
          </div>

          <button
            onClick={() => setRadarOpen(true)}
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              background: '#fff',
              padding: '3px 8px',
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

        <div style={{ fontWeight: 800, fontSize: 14, color: C.ink, lineHeight: 1.3 }}>
          {activeAlert.disease_name}
        </div>

        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.4 }}>
          {activeAlert.advisory}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => onOpenAI(activeAlert.disease_name)}
            style={{
              background: '#fff',
              border: '1px solid #F5C6BA',
              borderRadius: 12,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              color: C.ink,
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} color={C.accent} />
            <span>Check Symptoms (AI)</span>
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
              gap: 6,
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            <MapPin size={13} />
            <span>Hostel Heatmap</span>
          </button>
        </div>
      </div>

      {radarOpen && (
        <CampusRadarModal
          onClose={() => setRadarOpen(false)}
          onOpenAI={() => {
            setRadarOpen(false);
            onOpenAI(activeAlert.disease_name);
          }}
          onBook={() => {
            setRadarOpen(false);
            if (onBook) onBook();
          }}
        />
      )}
    </>
  );
}
