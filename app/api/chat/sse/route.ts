import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";
import TypingEvent from "@/models/TypingEvent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_INTERVAL_MS = 2000; // poll DB every 2 seconds

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return new Response("Unauthorized", { status: 401 });

  let userId: string;
  try {
    const payload = verifyAccessToken(token) as { userId: string };
    userId = payload.userId;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  req.signal.addEventListener("abort", () => { closed = true; });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Send connected confirmation
      send("connected", { userId });

      await connectDB();

      // Track the last message we've seen so we only emit new ones
      let lastChecked = new Date();

      // Track reaction state per message to detect changes
      const reactionSnapshots = new Map<string, string>();

      while (!closed) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (closed) break;

        try {
          const since = lastChecked;
          lastChecked = new Date();

          // 1. New messages sent TO this user
          const newMessages = await Message.find({
            receiverId: userId,
            createdAt: { $gt: since },
          })
            .populate("senderId", "username avatar")
            .lean();

          for (const msg of newMessages) {
            send("message:new", { message: msg });

            // Auto-mark as delivered
            await Message.updateOne({ _id: msg._id }, { $set: { status: "delivered" } });
            send("message:status", {
              messageId: msg._id.toString(),
              status: "delivered",
              conversationId: msg.conversationId,
            });
          }

          // 2. Status updates on messages sent BY this user (delivered/seen)
          const statusUpdates = await Message.find({
            senderId: userId,
            status: { $in: ["delivered", "seen"] },
            updatedAt: { $gt: since },
          })
            .select("_id status conversationId")
            .lean();

          for (const msg of statusUpdates) {
            send("message:status", {
              messageId: msg._id.toString(),
              status: msg.status,
              conversationId: msg.conversationId,
            });
          }

          // 3. Typing indicators directed at this user
          const typingEvents = await TypingEvent.find({
            receiverId: userId,
            expiresAt: { $gt: new Date() },
          })
            .select("conversationId senderId isTyping")
            .lean();

          for (const t of typingEvents) {
            send("typing", {
              conversationId: t.conversationId,
              userId: t.senderId,
              isTyping: true,
            });
          }

          // 4. Reaction changes on messages in conversations involving this user
          const recentReacted = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
            updatedAt: { $gt: since },
            "reactions.0": { $exists: true },
          })
            .select("_id conversationId reactions")
            .lean();

          for (const msg of recentReacted) {
            const key = msg._id.toString();
            const snapshot = JSON.stringify(msg.reactions);
            if (reactionSnapshots.get(key) !== snapshot) {
              reactionSnapshots.set(key, snapshot);
              send("message:reaction", {
                messageId: key,
                conversationId: msg.conversationId,
                reactions: msg.reactions,
              });
            }
          }
        } catch {
          // DB hiccup — keep polling
        }

        // Keepalive comment every cycle
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            closed = true;
          }
        }
      }

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
