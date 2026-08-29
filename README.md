# CHAMP 🏥 — Campus Health & Appointment Management Platform

## Project Structure
```
champ/
├── frontend/   ← React + Vite (runs on :5173)
└── backend/    ← Node.js + Express + Socket.io (runs on :5000)
```

---

## 🚀 Quick Start

### 1. Set up Supabase Database
1. Go to [supabase.com](https://supabase.com) → New project
2. Open SQL Editor → paste contents of `backend/src/db/schema.sql` → Run
3. Go to Settings → Database → copy the **Connection String (URI)**

### 2. Configure Backend
```bash
# Edit backend/.env with your real values:
DATABASE_URL=postgresql://...   # from Supabase
JWT_SECRET=your_long_secret
RESEND_API_KEY=re_...           # from resend.com (free)
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Run Backend
```bash
cd backend
npm run dev
# → http://localhost:5000
```

### 4. Run Frontend
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 🔧 What's Built

| Feature | Status |
|---------|--------|
| Register / Login (JWT) | ✅ Done |
| Doctor listing (from DB) | ✅ Done |
| Book appointment | ✅ Done |
| Cancel appointment | ✅ Done |
| Live queue position (Socket.io) | ✅ Done |
| Email confirmation (Nodemailer) | ✅ Done |
| 30-min email reminder (cron) | ✅ Done |
| In-app notifications (real-time bell) | ✅ Done |
| Emergency contacts (from DB) | ✅ Done |
| Daily slot auto-generation (cron) | ✅ Done |
| Pharmacy page | 🔜 Coming soon |
| Wellness / Counselling | 🔜 Coming soon |

---

## 📡 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/auth/me` | ✅ | Get profile |
| GET | `/api/doctors` | No | List doctors |
| GET | `/api/doctors/:id/slots?date=` | No | Available slots |
| POST | `/api/appointments` | ✅ | Book slot |
| GET | `/api/appointments/mine` | ✅ | My appointments |
| PATCH | `/api/appointments/:id/cancel` | ✅ | Cancel |
| GET | `/api/appointments/queue/:docId` | ✅ | Queue position |
| GET | `/api/notifications` | ✅ | My notifications |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark read |
| PATCH | `/api/notifications/read-all` | ✅ | Mark all read |
| GET | `/api/emergency` | No | Emergency contacts |

## 🔌 Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_user` | Client → Server | `{ userId }` |
| `join_queue` | Client → Server | `{ doctorId, date }` |
| `leave_queue` | Client → Server | `{ doctorId, date }` |
| `appt_confirmed` | Server → Client | `{ appointment, queuePos, ... }` |
| `queue_update` | Server → Room | `{ doctorId, totalInQueue }` |
| `new_notification` | Server → Client | Notification object |

---

## 🚢 Deployment
- **Frontend** → [Vercel](https://vercel.com) (import `frontend/` folder)
- **Backend** → [Render](https://render.com) (Web Service, `npm start`)
- **Database** → Already on Supabase ✅
