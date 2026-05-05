"use client";
import dynamic from "next/dynamic";

// Lazy-load heavy client-only components — not needed for initial paint
// This wrapper is a Client Component so ssr:false is allowed here
const ChatWidget     = dynamic(() => import("@/components/chat/ChatWidget"),           { ssr: false });
const AIChatbot      = dynamic(() => import("@/components/ai/AIChatbot"),              { ssr: false });
const SocketProvider = dynamic(() => import("@/components/providers/SocketProvider"),  { ssr: false });
const PWAProvider    = dynamic(() => import("@/components/providers/PWAProvider"),     { ssr: false });

export default function ClientProviders() {
  return (
    <>
      <ChatWidget />
      <AIChatbot />
      <SocketProvider />
      <PWAProvider />
    </>
  );
}
