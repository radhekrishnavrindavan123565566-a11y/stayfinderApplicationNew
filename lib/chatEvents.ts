/**
 * In-memory pub/sub for SSE-based real-time chat.
 * Each connected client registers a listener keyed by userId.
 * When a message/event is emitted for a userId, all their SSE connections receive it.
 */

type EventPayload = Record<string, unknown>;
type Listener = (event: string, data: EventPayload) => void;

// userId -> Set of listeners (multiple tabs/connections)
const listeners = new Map<string, Set<Listener>>();

// userId -> last seen timestamp (for online status)
const onlineStatus = new Map<string, number>();

export function subscribe(userId: string, listener: Listener): () => void {
  if (!listeners.has(userId)) listeners.set(userId, new Set());
  listeners.get(userId)!.add(listener);
  onlineStatus.set(userId, Date.now());
  return () => {
    listeners.get(userId)?.delete(listener);
    if (listeners.get(userId)?.size === 0) listeners.delete(userId);
  };
}

export function emit(userId: string, event: string, data: EventPayload) {
  listeners.get(userId)?.forEach((fn) => fn(event, data));
}

export function heartbeat(userId: string) {
  onlineStatus.set(userId, Date.now());
}

export function isOnline(userId: string): boolean {
  const last = onlineStatus.get(userId);
  if (!last) return false;
  return Date.now() - last < 35000; // 35s threshold
}

export function getOnlineUsers(userIds: string[]): Record<string, boolean> {
  return Object.fromEntries(userIds.map((id) => [id, isOnline(id)]));
}
