import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';

import { initSocketHandlers } from './sockets/socket.js';
import { startCronJobs } from './services/cronService.js';

import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import notificationRoutes from './routes/notifications.js';
import emergencyRoutes from './routes/emergency.js';
import prescriptionRoutes from './routes/prescriptions.js';
import doctorScheduleRoutes from './routes/doctorSchedule.js';
import aiRoutes from './routes/ai.js';
import pharmacyRoutes from './routes/pharmacy.js';
import documentRoutes from './routes/documents.js';
import supportRoutes from './routes/support.js';
import openDataRoutes from './routes/openData.js';

const app = express();
const httpServer = http.createServer(app);

// Dynamic CORS to support any Vercel domain, localhost, and custom domains with credentials
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
};

// ─── Socket.io Setup ──────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});
initSocketHandlers(io);

// ─── Middleware ───────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctor', doctorScheduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/open', openDataRoutes);

// ─── Health check ─────────────────────────────────────────────────
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 CHAMP Backend running on http://localhost:${PORT}`);
  startCronJobs();
});
