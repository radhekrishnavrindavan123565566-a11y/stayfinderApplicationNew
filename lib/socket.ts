/**
 * Socket.io is disabled — no custom server is running.
 * Chat uses HTTP polling via the REST API instead.
 * To enable real-time, set up a custom Next.js server with socket.io.
 */

export function getSocket() {
  return null;
}

export function disconnectSocket() {}

export const socket = null;
