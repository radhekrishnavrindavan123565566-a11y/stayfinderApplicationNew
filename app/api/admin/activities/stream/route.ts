import { NextRequest } from 'next/server';

/**
 * GET /api/admin/activities/stream
 * Server-Sent Events endpoint for real-time activity updates.
 *
 * Clients connect once and receive:
 *  - A "ping" every 15 s to keep the connection alive.
 *  - An "activity" event whenever the server-side activityEmitter fires.
 *
 * Usage:
 *   const es = new EventSource('/api/admin/activities/stream');
 *   es.addEventListener('activity', (e) => { ... JSON.parse(e.data) ... });
 */

// Simple in-process pub/sub for SSE — works in single-instance deployments
// and local development.  For multi-instance / edge deployments swap this
// for a Redis pub/sub channel.
type Listener = (data: string) => void;
const listeners = new Set<Listener>();

/** Call this from anywhere on the server to push an activity to all connected admins. */
export function emitActivity(payload: Record<string, unknown>): void {
  const data = JSON.stringify(payload);
  listeners.forEach((fn) => {
    try { fn(data); } catch { /* client gone */ }
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encode = (event: string, data: string) =>
        new TextEncoder().encode(`event: ${event}\ndata: ${data}\n\n`);

      // Send an initial "connected" event
      controller.enqueue(encode('connected', JSON.stringify({ ok: true })));

      // Heartbeat every 15 s
      const ping = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encode('ping', JSON.stringify({ ts: Date.now() })));
        } catch {
          clearInterval(ping);
        }
      }, 15_000);

      // Register this client as a listener
      const listener: Listener = (data) => {
        if (closed) return;
        try {
          controller.enqueue(encode('activity', data));
        } catch {
          /* client gone */
        }
      };
      listeners.add(listener);

      // Cleanup when the client disconnects
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(ping);
        listeners.delete(listener);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
