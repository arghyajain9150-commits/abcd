-- ============================================================
-- CHAMP Database Schema — Realistic Campus Health Ecosystem
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT UNIQUE NOT NULL,
  password          TEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'student'
                      CHECK (role IN ('student', 'doctor', 'pharmacist', 'admin')),
  phone             TEXT,
  blood_group       TEXT DEFAULT 'O+',
  allergies         TEXT DEFAULT 'None reported',
  hostel_block      TEXT DEFAULT 'Hostel Block A',
  room_number       TEXT DEFAULT '204',
  emergency_contact TEXT DEFAULT '+91 98765 00000',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Doctors ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  qualifications  TEXT NOT NULL DEFAULT 'MBBS, MD',
  specialty       TEXT NOT NULL,
  opd_room        TEXT NOT NULL DEFAULT 'Room 101',
  shift_hours     TEXT NOT NULL DEFAULT '08:30 – 13:30',
  bio             TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE
);

-- ─── Slots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID REFERENCES doctors(id) ON DELETE CASCADE,
  slot_time   TIME NOT NULL,
  slot_date   DATE NOT NULL,
  is_booked   BOOLEAN DEFAULT FALSE,
  UNIQUE (doctor_id, slot_date, slot_time)
);

-- ─── Appointments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id   UUID REFERENCES doctors(id),
  slot_id     UUID REFERENCES slots(id),
  status      TEXT NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'in_consultation', 'completed', 'cancelled')),
  queue_pos   INTEGER,
  notes       TEXT,
  booked_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Prescriptions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  doctor_id       UUID REFERENCES doctors(id) ON DELETE CASCADE,
  student_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  diagnosis       TEXT NOT NULL,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'preparing', 'ready_for_pickup', 'dispensed')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  dispensed_at    TIMESTAMPTZ
);

-- ─── Prescription Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescription_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id  UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name    TEXT NOT NULL,
  dosage           TEXT NOT NULL,
  frequency        TEXT NOT NULL,
  duration_days    INTEGER NOT NULL DEFAULT 3,
  instructions     TEXT
);

-- ─── Pharmacy Inventory ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  stock_quantity  INTEGER NOT NULL DEFAULT 50,
  unit            TEXT NOT NULL DEFAULT 'tablets',
  is_available    BOOLEAN DEFAULT TRUE
);

-- ─── Outbreak Alerts & Health Advisories ───────────────────────────
CREATE TABLE IF NOT EXISTS outbreak_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name     TEXT NOT NULL,
  severity         TEXT NOT NULL DEFAULT 'warning'
                     CHECK (severity IN ('info', 'warning', 'critical')),
  active_cases     INTEGER NOT NULL DEFAULT 0,
  hotspots         TEXT DEFAULT 'Hostel Block A Floor 2',
  advisory         TEXT NOT NULL,
  prevention_steps TEXT[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN DEFAULT TRUE,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Student Documents & Lab Reports ──────────────────────────────
CREATE TABLE IF NOT EXISTS student_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'Lab Report',
  file_data   TEXT NOT NULL,
  file_size   TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Support Tickets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT DEFAULT 'info'
                CHECK (type IN ('info', 'reminder', 'cancelled', 'urgent', 'prescription')),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Emergency Contacts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  number      TEXT NOT NULL,
  priority    INTEGER DEFAULT 0
);
