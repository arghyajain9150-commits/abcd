/**
 * Socket.io handler — manages real-time rooms for:
 *  - Per-user personal channel:   "user:{userId}"
 *  - Per-doctor queue room:       "queue:{doctorId}:{date}"
 */
export function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join personal room ─────────────────────────────────────────
    // Frontend calls: socket.emit('join_user', { userId })
    socket.on('join_user', ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    });

    // ── Join doctor queue room ─────────────────────────────────────
    // Frontend calls: socket.emit('join_queue', { doctorId, date })
    socket.on('join_queue', ({ doctorId, date }) => {
      if (!doctorId || !date) return;
      const room = `queue:${doctorId}:${date}`;
      socket.join(room);
      console.log(`🏥 Socket joined queue room: ${room}`);
    });

    // ── Leave queue room ───────────────────────────────────────────
    socket.on('leave_queue', ({ doctorId, date }) => {
      const room = `queue:${doctorId}:${date}`;
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}
