import api from './axios.js';

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);
export const getMe    = ()     => api.get('/auth/me');

// Doctors & Slots
export const getDoctors      = ()              => api.get('/doctors');
export const getDoctorSlots  = (id, date)      => api.get(`/doctors/${id}/slots?date=${date}`);

// Appointments
export const bookAppointment   = (data)        => api.post('/appointments', data);
export const getMyAppointments = ()            => api.get('/appointments/mine');
export const cancelAppointment = (id)          => api.patch(`/appointments/${id}/cancel`);
export const getQueuePosition  = (doctorId)    => api.get(`/appointments/queue/${doctorId}`);

// Notifications
export const getNotifications  = ()            => api.get('/notifications');
export const markRead          = (id)          => api.patch(`/notifications/${id}/read`);
export const markAllRead       = ()            => api.patch('/notifications/read-all');
export const getUnreadCount    = ()            => api.get('/notifications/unread-count');

// Emergency
export const getEmergencyContacts = ()         => api.get('/emergency');

// ─── Gemini AI & Outbreak Advisories ─────────────────────────────
export const triageSymptoms    = (data)        => api.post('/ai/triage', data);
export const getOutbreakAlerts = ()            => api.get('/ai/outbreaks');

// ─── Digital Prescriptions ───────────────────────────────────────
export const createPrescription        = (data)       => api.post('/prescriptions', data);
export const getStudentPrescriptions   = ()           => api.get('/prescriptions/student');
export const getPharmacyPrescriptions  = ()           => api.get('/prescriptions/pharmacy');
export const updatePrescriptionStatus  = (id, status) => api.patch(`/prescriptions/${id}/status`, { status });

// ─── Doctor Clinic & Schedule ─────────────────────────────────────
export const getDoctorQueue            = (date, docId)=> api.get(`/doctor/queue?date=${date || ''}&doctor_id=${docId || ''}`);
export const createDoctorSlots         = (data)       => api.post('/doctor/slots', data);
export const updateAppointmentStatus   = (id, status) => api.patch(`/doctor/appointments/${id}/status`, { status });

// ─── Pharmacy Inventory ───────────────────────────────────────────
export const getPharmacyInventory      = ()           => api.get('/pharmacy/inventory');
export const updatePharmacyInventory   = (id, data)   => api.patch(`/pharmacy/inventory/${id}`, data);
