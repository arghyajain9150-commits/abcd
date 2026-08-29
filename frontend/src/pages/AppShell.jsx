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
  bg: '#EAECE6', frame: '#F5F7F3', surface: '#FFFFFF',
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
    <div className="app-viewport-wrapper">
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
        
        .app-viewport-wrapper {
          min-height: 100vh;
          background: ${C.bg};
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 16px 12px;
          font-family: 'Inter', sans-serif;
        }

        .app-shell-container {
          width: 100%;
          max-width: 440px;
          height: 94vh;
          max-height: 860px;
          background: ${C.frame};
          border-radius: 28px;
          box-shadow: 0 20px 60px -20px rgba(23,50,44,0.35);
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 16px 18px 80px;
        }
        .content-scroll::-webkit-scrollbar { width: 6px; }
        .content-scroll::-webkit-scrollbar-thumb { background: #C8D1CC; border-radius: 6px; }

        .desktop-header-nav { display: none; }
        .mobile-bottom-nav { display: flex; }

        /* ── Desktop Breakpoint (>= 768px) ── */
        @media (min-width: 768px) {
          .app-viewport-wrapper {
            padding: 24px 20px;
            align-items: flex-start;
          }
          .app-shell-container {
            max-width: 1160px;
            height: auto;
            min-height: 90vh;
            max-height: none;
            border-radius: 24px;
            box-shadow: 0 24px 80px -15px rgba(23,50,44,0.2);
          }
          .mobile-bottom-nav {
            display: none !important;
          }
          .desktop-header-nav {
            display: flex !important;
          }
          .content-scroll {
            padding: 20px 28px 36px;
            overflow-y: visible;
          }
          .emergency-fab {
            bottom: 24px !important;
            right: 28px !important;
          }
        }
      `}</style>

      <div className="app-shell-container">

        {/* Offline Banner */}
        {!isOnline && (
          <div style={{ background: C.urgent, color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '6px 14px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 100 }}>
            <WifiOff size={14} />
            <span>Offline · Reconnecting to Campus Health Network…</span>
          </div>
        )}

        {/* ─── Top Header with Brand & Demo Role Switcher ─── */}
        <div style={{ padding: '16px 22px 12px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                +
              </div>
              <div>
                <div className="champ-heading" style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  CHAMP
                </div>
                <div style={{ fontSize: 10.5, color: C.soft, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
                  {activePersona === 'doctor' ? '🩺 Doctor Consultation Desk' : activePersona === 'pharmacist' ? '💊 Pharmacy Dispensary' : 'Campus Health & Outbreak Portal'}
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links (For Student View) */}
            {activePersona === 'student' && (
              <div className="desktop-header-nav" style={{ display: 'flex', gap: 6, background: C.bg, padding: '4px 6px', borderRadius: 14 }}>
                {STUDENT_NAV.map(({ path, label, Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 700,
                        background: isActive ? C.primary : 'transparent',
                        color: isActive ? '#fff' : C.soft,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={15} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Header action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Health Pass / Student Profile Button */}
              {activePersona === 'student' && (
                <button
                  onClick={() => setProfileOpen(true)}
                  title="My Medical Profile & Health ID"
                  style={{
                    padding: '6px 11px',
                    borderRadius: 10,
                    background: C.primarySoft,
                    border: `1px solid ${C.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.primary,
                  }}
                >
                  <CreditCard size={14} />
                  <span>Health Pass</span>
                </button>
              )}

              {/* Gemini AI Assistant Button */}
              <button
                onClick={() => handleOpenAI()}
                title="Gemini AI Health Assistant"
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                <Sparkles size={14} color="#FFE699" />
                <span>AI Consult</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                title="Notifications"
                style={{ position: 'relative', width: 34, height: 34, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <Bell size={16} color={hasAlert ? C.urgent : C.ink} />
                {hasAlert && (
                  <div style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: C.urgent, color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {liveUnread > 9 ? '9+' : liveUnread}
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
          <div style={{ display: 'flex', background: C.bg, borderRadius: 12, padding: 3, gap: 4 }}>
            <button
              onClick={() => { setActivePersona('student'); navigate('/'); }}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                background: activePersona === 'student' ? '#fff' : 'transparent',
                color: activePersona === 'student' ? C.primary : C.soft,
                boxShadow: activePersona === 'student' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              🎓 Student Portal
            </button>
            <button
              onClick={() => setActivePersona('doctor')}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                background: activePersona === 'doctor' ? '#fff' : 'transparent',
                color: activePersona === 'doctor' ? C.primary : C.soft,
                boxShadow: activePersona === 'doctor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              🩺 Doctor Desk
            </button>
            <button
              onClick={() => setActivePersona('pharmacist')}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                background: activePersona === 'pharmacist' ? '#fff' : 'transparent',
                color: activePersona === 'pharmacist' ? C.primary : C.soft,
                boxShadow: activePersona === 'pharmacist' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              💊 Pharmacy Dispensary
            </button>
          </div>
        </div>

        {/* ─── Scrollable Page content ─── */}
        <div className="content-scroll">
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
            style={{ position: 'fixed', right: 20, bottom: 80, width: 52, height: 52, borderRadius: '50%', background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px -4px rgba(214,72,60,0.6)', zIndex: 50 }}
          >
            <ShieldAlert size={22} color="#fff" />
          </button>
        )}

        {/* ─── Bottom Navigation (Mobile View Only) ─── */}
        {activePersona === 'student' && (
          <nav
            className="mobile-bottom-nav"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: C.surface,
              borderTop: `1px solid ${C.border}`,
              padding: '6px 8px 8px',
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
