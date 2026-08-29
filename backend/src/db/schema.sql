-- ============================================================
-- CHAMP Database Schema
-- Run this SQL in Supabase SQL Editor (or any PostgreSQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'doctor', 'admin')),
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

-- ─── Slots (Available time blocks per doctor per day) ─────────────
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
                CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  queue_pos   INTEGER,
  notes       TEXT,
  booked_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT DEFAULT 'info'
                CHECK (type IN ('info', 'reminder', 'cancelled', 'urgent')),
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

-- ─── Seed: Emergency Contacts ─────────────────────────────────────
INSERT INTO emergency_contacts (label, number, priority) VALUES
  ('Campus Health Centre', '+91 98765 43210', 1),
  ('Ambulance', '108', 0),
  ('Campus Security', '+91 98765 00000', 2)
ON CONFLICT DO NOTHING;

-- ─── Seed: Doctors ────────────────────────────────────────────────
-- First create doctor user accounts (passwords: "doctor123" - change in prod!)
INSERT INTO users (id, name, email, password, role) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Dr. Aditi Rao',    'aditi@campus.edu',   '$2a$10$placeholder', 'doctor'),
  ('11111111-0000-0000-0000-000000000002', 'Dr. Kabir Mehta',  'kabir@campus.edu',   '$2a$10$placeholder', 'doctor'),
  ('11111111-0000-0000-0000-000000000003', 'Dr. Sanjana Iyer', 'sanjana@campus.edu', '$2a$10$placeholder', 'doctor'),
  ('11111111-0000-0000-0000-000000000004', 'Dr. Rohan Verma',  'rohan@campus.edu',   '$2a$10$placeholder', 'doctor')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (user_id, name, specialty) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Dr. Aditi Rao',    'General Physician'),
  ('11111111-0000-0000-0000-000000000002', 'Dr. Kabir Mehta',  'Gynaecology'),
  ('11111111-0000-0000-0000-000000000003', 'Dr. Sanjana Iyer', 'Dermatology'),
  ('11111111-0000-0000-0000-000000000004', 'Dr. Rohan Verma',  'Orthopaedics')
ON CONFLICT DO NOTHING;
