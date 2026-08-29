import api from './axios.js';

// ── Auth ─────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// ── Doctors ──────────────────────────────────────────────────────
export const getDoctors    = ()              => api.get('/doctors');
export const getDoctorSlots = (id, date)    => api.get(`/doctors/${id}/slots`, { params: { date } });

// ── Appointments ─────────────────────────────────────────────────
export const getMyAppointments = ()          => api.get('/appointments/mine');
export const bookAppointment   = (data)      => api.post('/appointments', data);
export const cancelAppointment = (id)        => api.patch(`/appointments/${id}/cancel`);
export const getQueuePosition  = (doctorId, date) =>
  api.get(`/appointments/queue/${doctorId}`, { params: { date } });

// ── Notifications ────────────────────────────────────────────────
export const getNotifications  = ()   => api.get('/notifications');
export const getUnreadCount    = ()   => api.get('/notifications/unread-count');
export const markRead          = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead       = ()   => api.patch('/notifications/read-all');

// ── Emergency ────────────────────────────────────────────────────
export const getEmergencyContacts = () => api.get('/emergency');
