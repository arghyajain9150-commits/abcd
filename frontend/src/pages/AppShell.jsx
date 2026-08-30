import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, Calendar, Pill, HeartPulse, HelpCircle, Bell, ShieldAlert, Sparkles, Stethoscope, LogOut, User, CreditCard, WifiOff, Globe, ArrowLeft, ChevronLeft } from 'lucide-react';
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
  { path: '/',             label: 'Home',          Icon: Home },
  { path: '/appointments', label: 'Appts',         Icon: Calendar },
  { path: '/pharmacy',     label: 'Pharmacy',      Icon: Pill },
  { path: '/wellness',     label: 'Wellness',      Icon: HeartPulse },
  { path: '/support',      label: 'Support',       Icon: HelpCircle },
  { path: '/open-data',    label: 'Open Data API', Icon: Globe },
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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
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
          width: 100%;
          background: #F4F6F2;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
        }

        .app-shell-container {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
          min-height: 100vh;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 0 45px rgba(23,50,44,0.05);
          border-left: 1px solid #E5E7DF;
          border-right: 1px solid #E5E7DF;
        }

        .content-scroll {
          flex: 1;
          width: 100%;
          padding: 16px 16px 88px;
        }
        .content-scroll::-webkit-scrollbar { width: 6px; }
        .content-scroll::-webkit-scrollbar-thumb { background: #C8D1CC; border-radius: 6px; }

        .desktop-header-nav { display: none; }
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid #E1E3DA;
          padding: 6px 10px calc(8px + env(safe-area-inset-bottom, 0px));
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
        }

        .emergency-fab {
          position: fixed;
          right: 18px;
          bottom: 76px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #D6483C;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px -4px rgba(214,72,60,0.6);
          z-index: 95;
        }

        /* ── Tablet & Desktop Breakpoint (>= 860px) ── */
        @media (min-width: 860px) {
          .content-scroll {
            padding: 24px 32px 48px;
          }
          .mobile-bottom-nav {
            display: none !important;
          }
          .desktop-header-nav {
            display: flex !important;
          }
          .emergency-fab {
            bottom: 28px !important;
            right: 28px !important;
          }
        }

        /* ── Mobile Landscape Breakpoint ── */
        @media (max-height: 560px) and (orientation: landscape) {
          .top-header-bar {
            padding: 8px 16px 6px !important;
          }
          .content-scroll {
            padding: 12px 16px 64px !important;
          }
          .mobile-bottom-nav {
            padding: 4px 8px !important;
          }
          .mobile-bottom-nav button {
            padding: 2px 6px !important;
          }
          .emergency-fab {
            bottom: 58px !important;
            right: 14px !important;
            width: 44px !important;
            height: 44px !important;
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

        {/* ─── Top Header with Brand, Nav & Demo Role Switcher ─── */}
        <div className="top-header-bar" style={{ padding: '16px 24px 12px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            
            {/* Brand Logo & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, boxShadow: '0 4px 12px rgba(47,122,104,0.25)' }}>
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
              <div className="desktop-header-nav" style={{ display: 'flex', gap: 4, background: C.bg, padding: '4px 6px', borderRadius: 14, border: `1px solid ${C.border}` }}>
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
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 700,
                        background: isActive ? C.primary : 'transparent',
                        color: isActive ? '#fff' : C.soft,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={14} />
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
                    padding: '7px 12px',
                    borderRadius: 10,
                    background: C.primarySoft,
                    border: `1px solid ${C.primary}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.primary,
                    transition: 'transform 0.15s ease',
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
                  padding: '7px 14px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(23,50,44,0.2)',
                }}
              >
                <Sparkles size={14} color="#FFE699" />
                <span>AI Consult</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                title="Notifications"
                style={{ position: 'relative', width: 36, height: 36, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
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
                style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
              >
                <LogOut size={15} color={C.soft} />
              </button>
            </div>
          </div>

          {/* Persona Switcher Bar for Hackathon Demo */}
          <div style={{ display: 'flex', background: C.bg, borderRadius: 12, padding: 3, gap: 4, border: `1px solid ${C.border}` }}>
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
                transition: 'all 0.15s ease',
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
                transition: 'all 0.15s ease',
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
                transition: 'all 0.15s ease',
              }}
            >
              💊 Pharmacy Dispensary
            </button>
          </div>
        </div>

        {/* ─── Scrollable Page content ─── */}
        <div className="content-scroll">
          {/* Universal Back Navigation Bar (Shows on non-root subpages) */}
          {activePersona === 'student' && location.pathname !== '/' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: C.primary,
                  fontSize: 13,
                  fontWeight: 700,
                  background: C.primarySoft,
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: `1px solid ${C.primary}33`,
                }}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.soft, textTransform: 'capitalize' }}>
                {location.pathname.replace('/', '').replace('-', ' ') || 'Overview'}
              </div>
            </div>
          )}

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
            title="24/7 Emergency Medical Response"
          >
            <ShieldAlert size={24} color="#fff" />
          </button>
        )}

        {/* ─── Bottom Navigation (Mobile View Only) ─── */}
        {activePersona === 'student' && (
          <nav className="mobile-bottom-nav">
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
                    padding: '4px 8px',
                    borderRadius: 10,
                    background: isActive ? C.primarySoft : 'transparent',
                    color: isActive ? C.primary : C.soft,
                    transition: 'all 0.15s ease',
                    minWidth: 48,
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 500 }}>{label}</span>
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
