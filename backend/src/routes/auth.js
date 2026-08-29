import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  hostel_block: z.string().optional(),
  room_number: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  hostel_block: z.string().optional(),
  room_number: z.string().optional(),
  emergency_contact: z.string().optional(),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register (Rate limited)
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const exists = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password, phone, blood_group, allergies, hostel_block, room_number) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
       RETURNING id, name, email, role, phone, blood_group, allergies, hostel_block, room_number`,
      [
        data.name,
        data.email.toLowerCase().trim(),
        hashed,
        data.phone || null,
        data.blood_group || 'O+',
        data.allergies || 'None reported',
        data.hostel_block || 'Hostel Block A',
        data.room_number || '204',
      ]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

// POST /api/auth/login (Rate limited)
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);

    const result = await query(
      `SELECT id, name, email, password, role, phone, blood_group, allergies, hostel_block, room_number, emergency_contact 
       FROM users WHERE email = $1`,
      [data.email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    delete user.password;
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, blood_group, allergies, hostel_block, room_number, emergency_contact, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const data = ProfileUpdateSchema.parse(req.body);

    const updates = [];
    const values = [];
    let idx = 1;

    if (data.name) {
      updates.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.blood_group) {
      updates.push(`blood_group = $${idx++}`);
      values.push(data.blood_group);
    }
    if (data.allergies !== undefined) {
      updates.push(`allergies = $${idx++}`);
      values.push(data.allergies);
    }
    if (data.hostel_block) {
      updates.push(`hostel_block = $${idx++}`);
      values.push(data.hostel_block);
    }
    if (data.room_number) {
      updates.push(`room_number = $${idx++}`);
      values.push(data.room_number);
    }
    if (data.emergency_contact) {
      updates.push(`emergency_contact = $${idx++}`);
      values.push(data.emergency_contact);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')} 
       WHERE id = $${idx} 
       RETURNING id, name, email, role, phone, blood_group, allergies, hostel_block, room_number, emergency_contact, created_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

export default router;
