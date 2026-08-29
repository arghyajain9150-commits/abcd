import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Bell, CheckCheck } from 'lucide-react';
import { getNotifications, markAllRead, markRead } from '../api/index.js';
import { socket } from '../socket/socket.js';

const C = { ink: '#17322C', soft: '#5B7169', primary: '#2F7A68', primarySoft: '#E4EFEA', urgent: '#D6483C', surface: '#FFFFFF', border: '#E1E3DA', bg: '#F5F7F3' };

const TYPE_COLORS = {
  info:      { bg: C.primarySoft, dot: C.primary },
  reminder:  { bg: '#FBF0DC',     dot: '#E3A542' },
  cancelled: { bg: '#FBE7E4',     dot: C.urgent },
  urgent:    { bg: '#FBE7E4',     dot: C.urgent },
};

export default function NotificationsPanel({ onClose }) {
  const qc = useQueryClient();

  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then((r) => r.data),
  });

  // Real-time: add new notification to list
  useEffect(() => {
    const handler = () => qc.invalidateQueries(['notifications']);
    socket.on('new_notification', handler);
    return () => socket.off('new_notification', handler);
  }, [qc]);

  const { mutate: readAll } = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unread-count']);
    },
  });

  const { mutate: readOne } = useMutation({
    mutationFn: (id) => markRead(id),
    onSuccess: () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unread-count']);
    },
  });

  // Escape key close
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,50,44,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, paddingTop: 0 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, width: '100%', maxWidth: 420, height: '80vh', borderRadius: '0 0 24px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px -10px rgba(23,50,44,0.3)' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, background: C.surface, borderRadius: '0 0 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color={C.ink} />
            <span className="champ-heading" style={{ fontWeight: 700, fontSize: 16 }}>Notifications</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => readAll()} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: C.soft, border: 'none', background: 'none', padding: '4px 8px' }}>
              <CheckCheck size={14} /> All read
            </button>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: '#F2F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.soft, fontSize: 13 }}>
              <Bell size={28} color={C.border} style={{ marginBottom: 10 }} />
              <div>No notifications yet</div>
            </div>
          ) : notifs.map((n) => {
            const colors = TYPE_COLORS[n.type] || TYPE_COLORS.info;
            return (
              <button key={n.id} onClick={() => !n.is_read && readOne(n.id)}
                style={{ background: n.is_read ? C.surface : colors.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', textAlign: 'left', width: '100%', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? C.border : colors.dot, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.ink }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: C.border, marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
