import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Code, Terminal, Copy, Check, ShieldCheck, Database, Globe, Cpu, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { getOpenStats, getOpenOutbreaks, getOpenPharmacyStock } from '../api/index.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  accent: '#E3A542',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
};

const ENDPOINTS = [
  {
    id: 'stats',
    name: 'GET /api/open/stats',
    desc: 'Real-time anonymized campus health metrics (consultations, active queue, R0 transmission rate, bed occupancy).',
    queryFn: getOpenStats,
    curl: 'curl -X GET "https://champ-backend-5xqx.onrender.com/api/open/stats"',
    python: `import requests\nres = requests.get('https://champ-backend-5xqx.onrender.com/api/open/stats')\nprint(res.json())`,
    js: `fetch('https://champ-backend-5xqx.onrender.com/api/open/stats')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
  },
  {
    id: 'outbreaks',
    name: 'GET /api/open/outbreaks',
    desc: 'Geospatial hostel contagion clusters and localized R0 reproduction metrics for university epidemiologists.',
    queryFn: getOpenOutbreaks,
    curl: 'curl -X GET "https://champ-backend-5xqx.onrender.com/api/open/outbreaks"',
    python: `import requests\nres = requests.get('https://champ-backend-5xqx.onrender.com/api/open/outbreaks')\nprint(res.json())`,
    js: `fetch('https://champ-backend-5xqx.onrender.com/api/open/outbreaks')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
  },
  {
    id: 'pharmacy',
    name: 'GET /api/open/pharmacy-stock',
    desc: 'Essential campus medicine availability index and real-time inventory counts.',
    queryFn: getOpenPharmacyStock,
    curl: 'curl -X GET "https://champ-backend-5xqx.onrender.com/api/open/pharmacy-stock"',
    python: `import requests\nres = requests.get('https://champ-backend-5xqx.onrender.com/api/open/pharmacy-stock')\nprint(res.json())`,
    js: `fetch('https://champ-backend-5xqx.onrender.com/api/open/pharmacy-stock')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
  },
];

export default function OpenDataHubPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [codeLang, setCodeLang] = useState('curl'); // 'curl' | 'python' | 'js'
  const [copied, setCopied] = useState(false);
  const [researchConsent, setResearchConsent] = useState(true);

  const { data: liveData, isLoading, refetch } = useQuery({
    queryKey: ['open-data', selectedEndpoint.id],
    queryFn: () => selectedEndpoint.queryFn().then((r) => r.data),
  });

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        .open-data-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 860px) {
          .open-data-grid {
            display: grid;
            grid-template-columns: 1fr 1.35fr;
            align-items: flex-start;
            gap: 20px;
          }
        }
      `}</style>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
          borderRadius: 22,
          padding: '20px 24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 30px -8px rgba(23,50,44,0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={20} color="#FFE699" />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A3D9C9' }}>
              Open Innovation Track
            </span>
          </div>
          <div className="champ-heading" style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
            Campus Health Open Data & Developer Hub
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 2, maxWidth: 620 }}>
            Public REST APIs for student researchers, campus developers, and public health epidemiologists. Privacy-preserving, anonymized aggregate feeds.
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
            CC BY 4.0 Open License
          </span>
          <span style={{ fontSize: 10.5, opacity: 0.8 }}>Zero PII / HIPAA Compliant</span>
        </div>
      </div>

      {/* Research Opt-In Consent Toggle */}
      <div style={{ background: C.surface, borderRadius: 16, padding: '14px 18px', border: `1.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={24} color={C.primary} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>
              Opt-in to Anonymized Campus Health Research
            </div>
            <div style={{ fontSize: 11.5, color: C.soft }}>
              Allows your anonymized recovery timelines to train campus outbreak prevention models without exposing your name, email, or room number.
            </div>
          </div>
        </div>

        <button
          onClick={() => setResearchConsent(!researchConsent)}
          style={{
            background: researchConsent ? '#D8F3E5' : C.bg,
            color: researchConsent ? '#1B7A4B' : C.soft,
            border: `1.5px solid ${researchConsent ? '#1B7A4B' : C.border}`,
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {researchConsent ? '✅ Enrolled (Anonymized)' : '❌ Opted Out'}
        </button>
      </div>

      <div className="open-data-grid">
        {/* ─── LEFT COLUMN: Endpoints Selector & Code Snippets ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              Select Live API Endpoint
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ENDPOINTS.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  style={{
                    background: selectedEndpoint.id === ep.id ? C.primarySoft : C.surface,
                    border: `1.5px solid ${selectedEndpoint.id === ep.id ? C.primary : C.border}`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color: C.primary }}>
                      {ep.name}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#1B7A4B', background: '#D8F3E5', padding: '2px 6px', borderRadius: 4 }}>
                      200 OK
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.soft }}>{ep.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippet Box */}
          <div style={{ background: '#17322C', borderRadius: 16, padding: 14, color: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['curl', 'python', 'js'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLang(lang)}
                    style={{
                      background: codeLang === lang ? C.primary : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '3px 9px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopyCode(selectedEndpoint[codeLang])}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={12} color="#A3D9C9" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre style={{ margin: 0, fontSize: 11.5, fontFamily: 'monospace', overflowX: 'auto', background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 10, color: '#A3D9C9', lineHeight: 1.4 }}>
              {selectedEndpoint[codeLang]}
            </pre>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Live JSON Response Viewer ─── */}
        <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={16} color={C.primary} />
              <span style={{ fontWeight: 800, fontSize: 13, color: C.ink, textTransform: 'uppercase' }}>
                Live Response Payload
              </span>
            </div>

            <button
              onClick={() => refetch()}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: C.primary, background: C.primarySoft, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
            >
              <RefreshCw size={12} /> Live Refresh
            </button>
          </div>

          <pre
            style={{
              margin: 0,
              background: '#0D1E1A',
              color: '#4ADE80',
              padding: 16,
              borderRadius: 14,
              fontSize: 11.5,
              fontFamily: 'monospace',
              maxHeight: 460,
              overflowY: 'auto',
              lineHeight: 1.45,
            }}
          >
            {isLoading ? 'Fetching live campus endpoint…' : JSON.stringify(liveData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
