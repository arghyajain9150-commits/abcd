import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect only after login
});

/**
 * Call after login to subscribe to personal notifications
 * and optionally a doctor's queue room.
 */
export function connectSocket(userId) {
  if (!socket.connected) socket.connect();
  socket.emit('join_user', { userId });
}

export function joinQueueRoom(doctorId, date) {
  socket.emit('join_queue', { doctorId, date });
}

export function leaveQueueRoom(doctorId, date) {
  socket.emit('leave_queue', { doctorId, date });
}

export function disconnectSocket() {
  socket.disconnect();
}
