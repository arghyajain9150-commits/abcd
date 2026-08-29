import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, Calendar, Pill, HeartPulse, HelpCircle, Bell, ShieldAlert } from 'lucide-react';
import { getUnreadCount } from '../api/index.js';
import { useUIStore } from '../store/store.js';
import { socket } from '../socket/socket.js';

import EmergencyModal from '../components/EmergencyModal.jsx';
import NotificationsPanel from '../components/NotificationsPanel.jsx';

const C = {
  bg: '#EDEDE6', frame: '#F5F7F3', surface: '#FFFFFF',
  ink: '#17322C', soft: '#5B7169', primary: '#2F7A68',
  primarySoft: '#E4EFEA', urgent: '#D6483C', border: '#E1E3DA',
};

const NAV = [
  { path: '/',             label: 'Home',     Icon: Home },
  { path: '/appointments', label: 'Appts',    Icon: Calendar },
  { path: '/pharmacy',     label: 'Pharmacy', Icon: Pill },
  { path: '/wellness',     label: 'Wellness', Icon: HeartPulse },
  { path: '/support',      label: 'Support',  Icon: HelpCircle },
];

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { emergencyOpen, setEmergencyOpen } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => getUnreadCount().then((r) => r.data.count),
    refetchInterval: 60_000,
  });

  // Real-time: bump badge when new notification arrives via socket
  useEffect(() => {
    setLiveUnread(unreadData || 0);
  }, [unreadData]);

  useEffect(() => {
    const handler = () => setLiveUnread((n) => n + 1);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, []);

  const hasAlert = liveUnread > 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', justifyContent: 'center', padding: '24px 12px', fontFamily: "'Inter', sans-serif" }}>
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

      <div style={{ width: '100%', maxWidth: 420, minHeight: 780, background: C.frame, borderRadius: 28, boxShadow: '0 20px 60px -20px rgba(23,50,44,0.35)', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '22px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>CHAMP</div>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>Campus health, sorted</div>
          </div>
          <button
            onClick={() => { setNotifOpen(true); setLiveUnread(0); }}
            style={{ position: 'relative', width: 38, height: 38, borderRadius: 12, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}
          >
            <Bell size={18} color={C.ink} />
            {hasAlert && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: C.urgent }}>
                <span style={{ position: 'absolute', top: -12, right: -4, background: C.urgent, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 999 }}>
                  {liveUnread > 9 ? '9+' : liveUnread}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Page content rendered through Outlet */}
        <div className="content-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 100px' }}>
          <Outlet />
        </div>

        {/* Emergency FAB */}
        <button
          onClick={() => setEmergencyOpen(true)}
          className="emergency-fab"
          style={{ position: 'absolute', right: 18, bottom: 84, width: 56, height: 56, borderRadius: '50%', background: C.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -6px rgba(214,72,60,0.6)', zIndex: 10 }}
        >
          <ShieldAlert size={24} color="#fff" />
        </button>

        {/* Bottom Nav */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '10px 6px', zIndex: 5 }}>
          {NAV.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                <Icon size={20} color={active ? C.primary : C.soft} />
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? C.primary : C.soft }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {emergencyOpen && <EmergencyModal onClose={() => setEmergencyOpen(false)} />}
      {notifOpen     && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
    </div>
  );
}
