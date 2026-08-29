import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, Calendar, Pill, HeartPulse, HelpCircle, Bell, ShieldAlert, Sparkles, Stethoscope, LogOut } from 'lucide-react';
import { getUnreadCount } from '../api/index.js';
import { useAuthStore, useUIStore } from '../store/store.js';
import { socket } from '../socket/socket.js';

import EmergencyModal from '../components/EmergencyModal.jsx';
import NotificationsPanel from '../components/NotificationsPanel.jsx';
import AIAssistantModal from '../components/AIAssistantModal.jsx';
import DoctorPortal from './DoctorPortal.jsx';
import PharmacyPortal from './PharmacyPortal.jsx';
import HomePage from './HomePage.jsx';

const C = {
  bg: '#EDEDE6', frame: '#F5F7F3', surface: '#FFFFFF',
  ink: '#17322C', soft: '#5B7169', primary: '#2F7A68',
  primarySoft: '#E4EFEA', urgent: '#D6483C', border: '#E1E3DA',
  accent: '#E3A542',
};

const STUDENT_NAV = [
  { path: '/',             label: 'Home',     Icon: Home },
  { path: '/appointments', label: 'Appts',    Icon: Calendar },
  { path: '/pharmacy',     label: 'Pharmacy', Icon: Pill },
  { path: '/wellness',     label: 'Wellness', Icon: HeartPulse },
  { path: '/support',      label: 'Support',  Icon: HelpCircle },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { emergencyOpen, setEmergencyOpen } = useUIStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');

  // Active Role Switcher for Hackathon Demo: 'student' | 'doctor' | 'pharmacist'
  const [activePersona, setActivePersona] = useState('student');

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => getUnreadCount().then((r) => r.data.count),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setLiveUnread(unreadData || 0);
  }, [unreadData]);

  useEffect(() => {
    const handler = () => setLiveUnread((n) => n + 1);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, []);

  const hasAlert = liveUnread > 0;

  const handleOpenAI = (queryText = '') => {
    setAiInitialQuery(queryText);
    setAiModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', padding: '16px 8px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .champ-heading { font-family: 'Space Grotesk', sans-serif; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        :focus-visible { outline: 2px solid ${C.primary}; outline-offset: 2px; }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(214,72,60,0.45); }
          70%  { box-shadow: 0 0 0 14px rgba(214,72,60,0); }
          100% { box-shadow: 0 0 0 0 rgba(214,72,60,0); }
        }
        .emergency-fab { animation: pulse-ring 2.4s infinite; }
        @media (prefers-reduced-motion: reduce) { .emergency-fab { animation: none; } }
        .content-scroll::-webkit-scrollbar { width: 4px; }
        .content-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 430, minHeight: 820, background: C.frame, borderRadius: 28, boxShadow: '0 20px 60px -20px rgba(23,50,44,0.35)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* ─── Top Header with Brand & Demo Role Switcher ─── */}
        <div style={{ padding: '18px 18px 12px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                +
              </div>
              <div>
                <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  CHAMP
                </div>
                <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>
                  Campus Health Ecosystem
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* AI Trigger Icon */}
              <button
                onClick={() => handleOpenAI()}
                title="Ask Gemini Health AI"
                style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.primary}` }}
              >
                <Sparkles size={16} color={C.primary} />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => { setNotifOpen(true); setLiveUnread(0); }}
                style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <Bell size={16} color={C.ink} />
                {hasAlert && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: C.urgent }}>
                    <span style={{ position: 'absolute', top: -10, right: -4, background: C.urgent, color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 3px', borderRadius: 999 }}>
                      {liveUnread > 9 ? '9+' : liveUnread}
                    </span>
                  </div>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log out"
                style={{ width: 34, height: 34, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <LogOut size={15} color={C.soft} />
              </button>
            </div>
          </div>

          {/* Persona Switcher Bar for Hackathon Demo */}
          <div style={{ display: 'flex', background: C.bg, borderRadius: 12, padding: 3, gap: 2 }}>
            <button
              onClick={() => { setActivePersona('student'); navigate('/'); }}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 11.5,
                fontWeight: 700,
                background: activePersona === 'student' ? '#fff' : 'transparent',
                color: activePersona === 'student' ? C.primary : C.soft,
                boxShadow: activePersona === 'student' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              🎓 Student
            </button>
            <button
              onClick={() => setActivePersona('doctor')}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 11.5,
                fontWeight: 700,
                background: activePersona === 'doctor' ? '#fff' : 'transparent',
                color: activePersona === 'doctor' ? C.primary : C.soft,
                boxShadow: activePersona === 'doctor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              🩺 Doctor
            </button>
            <button
              onClick={() => setActivePersona('pharmacist')}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 11.5,
                fontWeight: 700,
                background: activePersona === 'pharmacist' ? '#fff' : 'transparent',
                color: activePersona === 'pharmacist' ? C.primary : C.soft,
                boxShadow: activePersona === 'pharmacist' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              💊 Pharmacy
            </button>
          </div>
        </div>

        {/* ─── Page content ─── */}
        <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 100px' }}>
          {activePersona === 'doctor' ? (
            <DoctorPortal />
          ) : activePersona === 'pharmacist' ? (
            <PharmacyPortal />
          ) : location.pathname === '/' ? (
            <HomePage onEmergency={() => setEmergencyOpen(true)} onOpenAI={handleOpenAI} />
          ) : (
            <Outlet />
          )}
        </div>

        {/* Floating Emergency FAB (Student View Only) */}
        {activePersona === 'student' && (
          <button
            onClick={() => setEmergencyOpen(true)}
            className="emergency-fab"
            title="Emergency Help"
            style={{ position: 'absolute', right: 18, bottom: 76, width: 52, height: 52, borderRadius: '50%', background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -6px rgba(214,72,60,0.6)', zIndex: 10 }}
          >
            <ShieldAlert size={22} color="#fff" />
          </button>
        )}

        {/* ─── Bottom Navigation ─── */}
        {activePersona === 'student' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '8px 4px', zIndex: 5 }}>
            {STUDENT_NAV.map(({ path, label, Icon }) => {
              const active = location.pathname === path;
              return (
                <button key={path} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0' }}>
                  <Icon size={18} color={active ? C.primary : C.soft} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? C.primary : C.soft }}>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {emergencyOpen && <EmergencyModal onClose={() => setEmergencyOpen(false)} />}
      {notifOpen     && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
      {aiModalOpen   && <AIAssistantModal initialQuery={aiInitialQuery} onClose={() => setAiModalOpen(false)} />}
    </div>
  );
}
