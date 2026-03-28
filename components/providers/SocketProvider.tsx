"use client";
import { useChatSSE } from "@/hooks/useChatSSE";

/**
 * Mounts the SSE real-time chat connection for the entire app.
 * Renders nothing — purely a side-effect component.
 */
export default function SocketProvider() {
  useChatSSE();
  return null;
}
