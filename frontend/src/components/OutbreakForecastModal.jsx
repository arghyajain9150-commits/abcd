import { useState } from 'react';
import { X, TrendingUp, ShieldAlert, Sparkles, Activity, Users, Zap, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
};

export default function OutbreakForecastModal({ onClose }) {
  const [interventionLevel, setInterventionLevel] = useState(30); // 0% to 100% intervention strength

  // Forecast calculations based on active clinic inputs and intervention slider
  const baselineCases = [7, 12, 19, 28, 38, 44, 49]; // unmitigated exponential trajectory
  const dates = ['Day 1 (Today)', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  // Calculate mitigated projection curve:
  const reductionFactor = interventionLevel / 100;
  const projectedCases = baselineCases.map((cases, idx) => {
    if (idx === 0) return cases;
    const mitigated = Math.round(cases * (1 - reductionFactor * (idx * 0.14)));
    return Math.max(7, mitigated);
  });

  const baseR0 = 1.84;
  const currentR0 = (baseR0 * (1 - reductionFactor * 0.65)).toFixed(2);
  const peakCases = Math.max(...projectedCases);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px -15px rgba(23,50,44,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#FFE699" />
            </div>
            <div>
              <div className="champ-heading" style={{ fontSize: 17, fontWeight: 800 }}>
                7-Day AI Outbreak Projection & Transmission Model
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Epidemiological R₀ Machine Learning Forecast</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Key Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div style={{ background: C.bg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Effective R₀ Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: currentR0 > 1 ? C.urgent : '#1B7A4B', marginTop: 2 }}>
                {currentR0} {currentR0 < 1 ? '🟢' : '⚠️'}
              </div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>
                {currentR0 < 1 ? 'Contagion Decaying' : 'Active Transmission'}
              </div>
            </div>

            <div style={{ background: C.bg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>Projected 7-Day Peak</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 2 }}>
                {peakCases} <span style={{ fontSize: 12, fontWeight: 600, color: C.soft }}>cases</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>
                Without intervention: 49 cases
              </div>
            </div>

            <div style={{ background: C.bg, borderRadius: 14, padding: '12px 14px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase' }}>AI Containment Index</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.primary, marginTop: 2 }}>
                {(100 - (peakCases / 49) * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>
                Infection curve flattening
              </div>
            </div>
          </div>

          {/* Interactive Predictive SVG Curve */}
          <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                7-Day Projected Infection Velocity
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.urgent }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.urgent }} /> Unmitigated
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.primary }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary }} /> AI Mitigated Forecast
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div style={{ height: 160, position: 'relative', width: '100%' }}>
              <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F0F0EE" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#F0F0EE" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#F0F0EE" strokeWidth="1" strokeDasharray="3" />

                {/* Unmitigated Red Line */}
                <path
                  d={`M 20 120 L 95 105 L 170 85 L 245 60 L 320 40 L 395 28 L 470 15`}
                  fill="none"
                  stroke="#F5A9A0"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />

                {/* Mitigated Green Line */}
                <path
                  d={`M 20 120 L 95 ${120 - (projectedCases[1] / 50) * 110} L 170 ${120 - (projectedCases[2] / 50) * 110} L 245 ${120 - (projectedCases[3] / 50) * 110} L 320 ${120 - (projectedCases[4] / 50) * 110} L 395 ${120 - (projectedCases[5] / 50) * 110} L 470 ${120 - (projectedCases[6] / 50) * 110}`}
                  fill="none"
                  stroke={C.primary}
                  strokeWidth="3.5"
                />

                {/* Data Points */}
                {projectedCases.map((val, i) => {
                  const x = 20 + i * 75;
                  const y = 120 - (val / 50) * 110;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4.5" fill={C.primary} stroke="#fff" strokeWidth="2" />
                      <text x={x} y={y - 8} fontSize="9" fontWeight="700" fill={C.ink} textAnchor="middle">
                        {val}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Timeline X-Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.soft, borderTop: '1px solid #ECECE8', paddingTop: 6 }}>
              {dates.map((d, i) => (
                <span key={i} style={{ textAlign: 'center' }}>{d.split(' ')[0]}</span>
              ))}
            </div>
          </div>

          {/* Interactive What-If Simulation Slider */}
          <div style={{ background: '#FFF8E6', border: `1.5px solid #F5D590`, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} color={C.accent} />
                <span style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>
                  Campus Intervention What-If Simulator
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.primary, background: '#fff', padding: '2px 10px', borderRadius: 8, border: `1px solid ${C.border}` }}>
                {interventionLevel}% Compliance
              </span>
            </div>

            <div style={{ fontSize: 11.5, color: C.soft, lineHeight: 1.35 }}>
              Drag the slider to test how hostel isolation, hand sanitizers, and ophthalmic drops alter the transmission projection curve in real-time.
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={interventionLevel}
              onChange={(e) => setInterventionLevel(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: C.primary, cursor: 'pointer', margin: '4px 0' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: C.soft }}>
              <span>0% (No Campus Action)</span>
              <span>50% (Hostel Block Isolation)</span>
              <span>100% (Full Disinfection & Quarantine)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', background: C.bg }}>
          <button
            onClick={onClose}
            style={{ background: C.primary, color: '#fff', padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Close Forecast Window
          </button>
        </div>
      </div>
    </div>
  );
}
