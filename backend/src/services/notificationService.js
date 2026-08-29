import { query } from '../db/db.js';
import { io } from '../index.js';

/**
 * Creates a notification in DB and emits it via Socket.io in real-time.
 */
export async function createNotification({ userId, title, body, type = 'info' }) {
  const result = await query(
    `INSERT INTO notifications (user_id, title, body, type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, title, body, type]
  );
  const notification = result.rows[0];

  // Push to the user's personal socket room instantly
  io.to(`user:${userId}`).emit('new_notification', notification);

  return notification;
}
