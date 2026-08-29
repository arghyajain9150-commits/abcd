import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

const UploadDocSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.string().default('Lab Report'),
  file_data: z.string().min(10), // Base64 data URL
  file_size: z.string().optional(),
});

// POST /api/documents/upload - Student uploads medical record or lab report
router.post('/upload', authMiddleware, async (req, res, next) => {
  try {
    const data = UploadDocSchema.parse(req.body);

    const result = await query(
      `INSERT INTO student_documents (student_id, file_name, file_type, file_data, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, student_id, file_name, file_type, file_size, uploaded_at`,
      [req.user.id, data.file_name, data.file_type, data.file_data, data.file_size || '150 KB']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// GET /api/documents/student - Student fetches their own uploaded medical files
router.get('/student', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, student_id, file_name, file_type, file_size, file_data, uploaded_at
       FROM student_documents
       WHERE student_id = $1
       ORDER BY uploaded_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/student/:studentId - Doctor fetches patient's uploaded files (With RBAC & Ownership checks)
router.get('/student/:studentId', authMiddleware, async (req, res, next) => {
  try {
    // Only allow if user is the document owner, or has a doctor/admin role
    const isOwner = req.user.id === req.params.studentId;
    const isMedicalStaff = req.user.role === 'doctor' || req.user.role === 'admin';

    if (!isOwner && !isMedicalStaff) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to view this student\'s medical documents.' });
    }

    const result = await query(
      `SELECT id, student_id, file_name, file_type, file_size, file_data, uploaded_at
       FROM student_documents
       WHERE student_id = $1
       ORDER BY uploaded_at DESC`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id - Delete a document (Strict ownership validation)
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleteRes = await query(
      'DELETE FROM student_documents WHERE id = $1 AND student_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or unauthorized to delete' });
    }

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
