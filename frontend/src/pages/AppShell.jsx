import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, Calendar, Pill, HeartPulse, HelpCircle, Bell, ShieldAlert, Sparkles, Stethoscope, LogOut, User, CreditCard, WifiOff } from 'lucide-react';
import { getUnreadCount } from '../api/index.js';
import { useAuthStore, useUIStore } from '../store/store.js';
import { socket } from '../socket/socket.js';

import EmergencyModal from '../components/EmergencyModal.jsx';
import NotificationsPanel from '../components/NotificationsPanel.jsx';
import AIAssistantModal from '../components/AIAssistantModal.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const hasAlert = liveUnread > 0;

  const handleOpenAI = (queryText = '') => {
    setAiInitialQuery(queryText);
    setAiModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', height: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
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
        .content-scroll::-webkit-scrollbar { width: 5px; }
        .content-scroll::-webkit-scrollbar-thumb { background: #C8D1CC; border-radius: 6px; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440, height: '94vh', maxHeight: 860, background: C.frame, borderRadius: 28, boxShadow: '0 20px 60px -20px rgba(23,50,44,0.35)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Offline Banner */}
        {!isOnline && (
          <div style={{ background: C.urgent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 100 }}>
            <WifiOff size={13} />
            <span>Offline · Reconnecting to Campus Health Network…</span>
          </div>
        )}

        {/* ─── Top Header with Brand & Demo Role Switcher ─── */}
        <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
                +
              </div>
              <div>
                <div className="champ-heading" style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  CHAMP
                </div>
                <div style={{ fontSize: 9.5, color: C.soft, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
                  {activePersona === 'doctor' ? '🩺 Doctor Consultation Desk' : activePersona === 'pharmacist' ? '💊 Pharmacy Dispensary' : 'Campus Health Portal'}
                </div>
              </div>
            </div>

            {/* Header action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Health Pass / Student Profile Button */}
              {activePersona === 'student' && (
                <button
                  onClick={() => setProfileOpen(true)}
                  title="My Medical Profile & Health ID"
                  style={{
                    padding: '5px 9px',
                    borderRadius: 10,
                    background: C.primarySoft,
                    border: `1px solid ${C.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.primary,
                  }}
                >
                  <CreditCard size={13} />
                  <span>ID</span>
                </button>
              )}

              {/* Gemini AI Assistant Button */}
              <button
                onClick={() => handleOpenAI()}
                title="Gemini AI Health Assistant"
                style={{
                  padding: '5px 9px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                <Sparkles size={13} color="#FFE699" />
                <span>AI</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                title="Notifications"
                style={{ position: 'relative', width: 32, height: 32, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <Bell size={15} color={hasAlert ? C.urgent : C.ink} />
                {hasAlert && (
                  <div style={{ position: 'absolute', top: -3, right: -3, width: 15, height: 15, borderRadius: '50%', background: C.urgent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {liveUnread > 9 ? '9+' : liveUnread}
                  </div>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log out"
                style={{ width: 32, height: 32, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <LogOut size={14} color={C.soft} />
              </button>
            </div>
          </div>

          {/* Persona Switcher Bar for Hackathon Demo */}
          <div style={{ display: 'flex', background: C.bg, borderRadius: 12, padding: 2.5, gap: 2 }}>
            <button
              onClick={() => { setActivePersona('student'); navigate('/'); }}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: 9,
                fontSize: 11,
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
                padding: '5px 0',
                borderRadius: 9,
                fontSize: 11,
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
                padding: '5px 0',
                borderRadius: 9,
                fontSize: 11,
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

        {/* ─── Scrollable Page content ─── */}
        <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 80px' }}>
          {activePersona === 'doctor' ? (
            <DoctorPortal />
          ) : activePersona === 'pharmacist' ? (
            <PharmacyPortal persona="pharmacist" />
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
            style={{ position: 'absolute', right: 16, bottom: 68, width: 48, height: 48, borderRadius: '50%', background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -6px rgba(214,72,60,0.6)', zIndex: 10 }}
          >
            <ShieldAlert size={20} color="#fff" />
          </button>
        )}

        {/* ─── Bottom Navigation (Student View Only) ─── */}
        {activePersona === 'student' && (
          <nav
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: C.surface,
              borderTop: `1px solid ${C.border}`,
              padding: '6px 8px 8px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            {STUDENT_NAV.map(({ path, label, Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: isActive ? C.primarySoft : 'transparent',
                    color: isActive ? C.primary : C.soft,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Overlays and Modals */}
        {emergencyOpen && <EmergencyModal onClose={() => setEmergencyOpen(false)} />}
        {notifOpen     && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
        {profileOpen   && <ProfileModal onClose={() => setProfileOpen(false)} />}
        {aiModalOpen   && <AIAssistantModal initialQuery={aiInitialQuery} onClose={() => setAiModalOpen(false)} />}
      </div>
    </div>
  );
}
