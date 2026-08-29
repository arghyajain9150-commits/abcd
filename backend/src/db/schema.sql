-- ============================================================
-- CHAMP Database Schema — Enhanced with Prescriptions, Pharmacy & Outbreaks
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'doctor', 'pharmacist', 'admin')),
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Doctors ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  specialty   TEXT NOT NULL,
  bio         TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN DEFAULT TRUE
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
  dosage           TEXT NOT NULL, -- e.g. "500mg"
  frequency        TEXT NOT NULL, -- e.g. "1-0-1 (Morning & Night)"
  duration_days    INTEGER NOT NULL DEFAULT 3,
  instructions     TEXT -- e.g. "After food with water"
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
  active_cases     INTEGER NOT NULL DEFAULT 12,
  hotspots         TEXT DEFAULT 'Hostel Blocks B & C, Mess Hall 2',
  advisory         TEXT NOT NULL,
  prevention_steps TEXT[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN DEFAULT TRUE,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
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

-- ============================================================
-- SEED DATA
-- ============================================================

-- Emergency Contacts
INSERT INTO emergency_contacts (label, number, priority) VALUES
  ('Campus Health Centre', '+91 98765 43210', 1),
  ('Ambulance', '108', 0),
  ('Campus Security', '+91 98765 00000', 2)
ON CONFLICT DO NOTHING;

-- Seed Pharmacy Inventory
INSERT INTO pharmacy_inventory (name, category, stock_quantity, unit, is_available) VALUES
  ('Paracetamol 500mg', 'Analgesics / Fever', 250, 'tablets', TRUE),
  ('Azithromycin 500mg', 'Antibiotics', 60, 'tablets', TRUE),
  ('Cetirizine 10mg', 'Antihistamines / Allergy', 180, 'tablets', TRUE),
  ('Ciprofloxacin Eye Drops 0.3%', 'Ophthalmic', 45, 'bottles', TRUE),
  ('ORS (Oral Rehydration Salts)', 'Electrolytes', 120, 'packets', TRUE),
  ('Pantoprazole 40mg', 'Antacids / Gastric', 150, 'tablets', TRUE),
  ('Amoxicillin + Clavulanic 625mg', 'Antibiotics', 40, 'tablets', TRUE),
  ('Ibuprofen 400mg', 'Anti-inflammatory', 100, 'tablets', TRUE),
  ('Volini Pain Relief Gel', 'Topical / Muscle Pain', 30, 'tubes', TRUE),
  ('Vitamin C + Zinc Chewable', 'Supplements / Immunity', 300, 'tablets', TRUE)
ON CONFLICT DO NOTHING;

-- Seed Active Campus Outbreak Alert
INSERT INTO outbreak_alerts (disease_name, severity, active_cases, hotspots, advisory, prevention_steps, is_active) VALUES
  (
    'Viral Conjunctivitis (Pink Eye)',
    'warning',
    34,
    'Hostel Blocks A & C, Library Central',
    'Sudden rise in red, itchy eye cases with watery discharge across hostel blocks. Highly contagious through direct contact and shared surfaces.',
    ARRAY[
      'Wash hands frequently with soap and warm water for at least 20 seconds.',
      'Do not touch or rub your eyes with unwashed hands.',
      'Avoid sharing towels, bedsheets, eye drops, or eyeglasses.',
      'Wear protective eyeglasses and isolate in room if experiencing symptoms.',
      'Book a slot with Dr. Aditi Rao (General Physician) or visit the Health Centre for prescribed antibiotic eye drops.'
    ],
    TRUE
  )
ON CONFLICT DO NOTHING;
