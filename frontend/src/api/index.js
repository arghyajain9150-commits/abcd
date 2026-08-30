import api from './axios.js';

// Auth & Profile
export const register      = (data)        => api.post('/auth/register', data);
export const login         = (data)        => api.post('/auth/login', data);
export const getMe         = ()            => api.get('/auth/me');
export const updateProfile = (data)        => api.patch('/auth/profile', data);

// Doctors & Slots
export const getDoctors      = ()              => api.get('/doctors');
export const getDoctorSlots  = (id, date)      => api.get(`/doctors/${id}/slots?date=${date}`);

// Appointments
export const bookAppointment        = (data)           => api.post('/appointments', data);
export const getMyAppointments      = ()               => api.get('/appointments/mine');
export const cancelAppointment      = (id)             => api.patch(`/appointments/${id}/cancel`);
export const rescheduleAppointment  = (id, new_slot_id)=> api.patch(`/appointments/${id}/reschedule`, { new_slot_id });
export const getQueuePosition       = (doctorId)       => api.get(`/appointments/queue/${doctorId}`);

// Notifications
export const getNotifications  = ()            => api.get('/notifications');
export const markRead          = (id)          => api.patch(`/notifications/${id}/read`);
export const markAllRead       = ()            => api.patch('/notifications/read-all');
export const getUnreadCount    = ()            => api.get('/notifications/unread-count');

// Emergency
export const getEmergencyContacts = ()         => api.get('/emergency');

// ─── Gemini AI & Outbreak Advisories ─────────────────────────────
export const triageSymptoms          = (data)        => api.post('/ai/triage', data);
export const scanPrescriptionVision  = (data)        => api.post('/ai/scan-prescription', data);
export const getOutbreakAlerts       = ()            => api.get('/ai/outbreaks');
export const getCampusRadar          = ()            => api.get('/ai/radar');

// ─── Open Innovation Public Health API ───────────────────────────
export const getOpenStats            = ()            => api.get('/open/stats');
export const getOpenOutbreaks        = ()            => api.get('/open/outbreaks');
export const getOpenPharmacyStock    = ()            => api.get('/open/pharmacy-stock');

// ─── Digital Prescriptions ───────────────────────────────────────
export const createPrescription        = (data)              => api.post('/prescriptions', data);
export const getStudentPrescriptions   = ()                  => api.get('/prescriptions/student');
export const getPharmacyPrescriptions  = ()                  => api.get('/prescriptions/pharmacy');
export const updatePrescriptionStatus  = (id, status, otp)   => api.patch(`/prescriptions/${id}/status`, { status, otp });

// ─── Doctor Clinic & Schedule ─────────────────────────────────────
export const getDoctorQueue            = (date, docId)=> api.get(`/doctor/queue?date=${date || ''}&doctor_id=${docId || ''}`);
export const createDoctorSlots         = (data)       => api.post('/doctor/slots', data);
export const updateAppointmentStatus   = (id, status) => api.patch(`/doctor/appointments/${id}/status`, { status });
export const getStudentHistory         = (studentId)  => api.get(`/doctor/student/${studentId}/history`);

// ─── Medical Documents & Lab Reports ──────────────────────────────
export const uploadDocument            = (data)       => api.post('/documents/upload', data);
export const getMyDocuments            = ()           => api.get('/documents/student');
export const getStudentDocuments       = (studentId)  => api.get(`/documents/student/${studentId}`);
export const deleteDocument            = (id)         => api.delete(`/documents/${id}`);

// ─── Support Helpdesk ─────────────────────────────────────────────
export const createSupportTicket       = (data)       => api.post('/support/tickets', data);
export const getMySupportTickets       = ()           => api.get('/support/tickets');

// ─── Pharmacy Inventory ───────────────────────────────────────────
export const getPharmacyInventory      = ()           => api.get('/pharmacy/inventory');
export const updatePharmacyInventory   = (id, data)   => api.patch(`/pharmacy/inventory/${id}`, data);
