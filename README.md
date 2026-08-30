# CHAMP 🏥 — Campus Health & Outbreak Management Platform
> **Enterprise-Grade Digital Campus Healthcare, Epidemiological Contagion Radar & AI Neural Psychology Operating System**

[![Live Frontend](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://abcd-five-zeta.vercel.app)
[![Live Backend](https://img.shields.io/badge/API_Server-Render-46E3B7?style=for-the-badge&logo=render)](https://champ-backend-5xqx.onrender.com)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Gemini_1.5_Pro_%2B_MentaLLaMA-4285F4?style=for-the-badge&logo=google)]()

---

## 🌐 Live URLs & Demo Access

* 🚀 **Production Web App (Vercel):** [https://abcd-five-zeta.vercel.app](https://abcd-five-zeta.vercel.app)
* 📡 **Live Backend API & WebSockets (Render):** [https://champ-backend-5xqx.onrender.com](https://champ-backend-5xqx.onrender.com)
* 💻 **Local Development:** `http://localhost:5173` (Frontend) & `http://localhost:5000` (Backend)

---

## 🌟 Key Platform Innovations

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        CHAMP UNIFIED HEALTHCARE ECOSYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  1. 🩺 TRI-PERSONA WORKSPACE                                                            │
│     • Student Portal: OPD appointment booking, Digital Health Pass, Pharmacy token.     │
│     • Doctor Consultation Desk: Real-time patient queue, Rx builder, drug interaction.   │
│     • Pharmacy Dispensary: QR token verification, live inventory & batch dispensation.  │
│                                                                                         │
│  2. 🧠 NEURAL COGNITIVE THERAPY & CBT ENGINE                                            │
│     • MentaLLaMA-7B Neural Distortion Classifier: Calibrated confidence percentages     │
│       across 8 cognitive distortions (Catastrophizing, Mind Reading, Fortune Telling).  │
│     • Authentic Centre for Clinical Interventions (CCI) 5-Step Thought Record:          │
│       Dual-Column empirical evidence examination + Socratic AI reframing.               │
│                                                                                         │
│  3. 📊 HARVARD BIDMC mindLAMP CLINICAL BATTERY SUITE                                    │
│     • 5 Standardized Instruments (37 Clinical Questions):                               │
│       - PHQ-4 (Ultra-brief Anxiety & Depression screener)                               │
│       - GAD-7 (Generalized Anxiety Diagnostic Scale)                                    │
│       - PHQ-9 (Full Depression Scale + Item 9 Suicide Safety Check)                     │
│       - PSS-10 (Perceived Stress Scale with reverse scoring)                            │
│       - ISI (Insomnia Severity Index)                                                   │
│                                                                                         │
│  4. 🛰️ EPIDEMIOLOGICAL CONTAGION RADAR & SEIR MODEL                                     │
│     • Real-time campus spatial heatmaps, dynamic R₀ reproduction rate tracking,         │
│       Monte Carlo outbreak simulation, and doctor-controlled quarantine parameters.     │
│                                                                                         │
│  5. 📱 UNIVERSAL RESPONSIVE MULTI-DEVICE UI                                             │
│     • Fluid full-width architecture for Desktop Widescreen, iPad/Tablets, Mobile        │
│       Portrait & Landscape with safe-area insets.                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install
```bash
git clone https://github.com/arghyajain9150-commits/abcd.git
cd abcd

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://...  # Supabase PostgreSQL URI
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend (Port 5000)
cd backend && npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend && npm run dev
```

---

## 📡 API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/ai/triage` | `POST` | Public | Gemini 1.5 conversational symptom triage & risk classification |
| `/api/ai/mentallama-analyze` | `POST` | Student | MentaLLaMA neural distortion classifier with confidence % |
| `/api/ai/cbt-reframe` | `POST` | Student | CCI Socratic cognitive restructuring synthesis |
| `/api/outbreak/radar` | `GET` | Public | Spatial-temporal contagion radar coordinates & active clusters |
| `/api/outbreak/forecast` | `GET` | Public | 7-day SEIR epidemiological transmission model projection |
| `/api/appointments` | `POST/GET` | Student | Real-time OPD slot booking with Socket.io queue sync |
| `/api/prescriptions` | `POST/GET` | Doctor/Pharm | Digital prescription issuance & QR dispensary verification |
| `/api/opendata/timeseries` | `GET` | Public | Open Health Data API for epidemiological researchers |

---

## 🧪 Architecture & Tech Stack

* **Frontend:** React 18, Vite, React Query (TanStack), Zustand, Lucide Icons, Socket.io-client.
* **Backend:** Node.js, Express, Socket.io, PostgreSQL (`pg`), Gemini SDK.
* **Design & Styling:** Custom tokenized design system (Figma variable mapped), CSS Grid & Flexbox, Space Grotesk + Inter typography.
* **Hosting:** Vercel (Frontend SPA) + Render (Backend Web Service) + Supabase (PostgreSQL Cloud DB).

---

*Built with ❤️ for Campus Health & Student Well-Being.*
