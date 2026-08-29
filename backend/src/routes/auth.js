import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

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

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
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
        data.email,
        hashed,
        data.phone || null,
        data.blood_group || 'O+',
        data.allergies || 'None reported',
        data.hostel_block || 'Hostel Block B',
        data.room_number || '204',
      ]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    const token = signToken(safeUser);
    res.json({ token, user: safeUser });
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, phone, blood_group, allergies, hostel_block, room_number, emergency_contact, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/profile - Update medical profile & hostel info
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const data = ProfileUpdateSchema.parse(req.body);

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           blood_group = COALESCE($3, blood_group),
           allergies = COALESCE($4, allergies),
           hostel_block = COALESCE($5, hostel_block),
           room_number = COALESCE($6, room_number),
           emergency_contact = COALESCE($7, emergency_contact)
       WHERE id = $8
       RETURNING id, name, email, role, phone, blood_group, allergies, hostel_block, room_number, emergency_contact, created_at`,
      [
        data.name,
        data.phone,
        data.blood_group,
        data.allergies,
        data.hostel_block,
        data.room_number,
        data.emergency_contact,
        req.user.id
      ]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.name === 'ZodError') {
      const msg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
});

export default router;
