import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { getOutbreakAlerts } from '../api/index.js';

const C = {
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  ink: '#17322C',
  soft: '#5B7169',
};

export default function OutbreakBanner({ onOpenAI }) {
  const { data: alerts = [] } = useQuery({
    queryKey: ['outbreak-alerts'],
    queryFn: () => getOutbreakAlerts().then((r) => r.data),
    staleTime: 60_000,
  });

  const activeAlert = alerts[0];
  if (!activeAlert) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFF4E5 0%, #FFE8E5 100%)',
        border: `1.5px solid #F5C6BA`,
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
            Active Campus Alert ({activeAlert.active_cases} Cases)
          </span>
        </div>

        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            background: '#fff',
            padding: '2px 8px',
            borderRadius: 99,
            color: C.urgent,
            border: '1px solid #F5C6BA',
          }}
        >
          {activeAlert.hotspots}
        </span>
      </div>

      <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, lineHeight: 1.3 }}>
        {activeAlert.disease_name}
      </div>

      <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.4 }}>
        {activeAlert.advisory}
      </div>

      <button
        onClick={() => onOpenAI(activeAlert.disease_name)}
        style={{
          marginTop: 4,
          background: '#fff',
          border: '1px solid #F5C6BA',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: C.ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color={C.accent} />
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            Check Symptoms with Gemini AI
          </span>
        </div>
        <ChevronRight size={14} color={C.soft} />
      </button>
    </div>
  );
}
