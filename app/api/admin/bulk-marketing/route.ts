import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { emit } from "@/lib/chatEvents";

/**
 * Bulk Marketing — send message to:
 * 1. All registered users (by role filter)
 * 2. Uploaded CSV contacts (name + phone — stored as notification for matched users)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    requireRole(req, ["admin"]);

    const contentType = req.headers.get("content-type") || "";

    let message = "";
    let title = "";
    let targetRole: string | null = null;
    let csvContacts: { name: string; phone?: string; email?: string }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      message = (formData.get("message") as string) || "";
      title = (formData.get("title") as string) || "Nestora — Special Update";
      targetRole = (formData.get("role") as string) || null;

      // Parse CSV file if uploaded
      const file = formData.get("csv") as File | null;
      if (file) {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        // Skip header row
        const dataLines = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;
        for (const line of dataLines) {
          const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
          if (cols[0]) {
            csvContacts.push({ name: cols[0], phone: cols[1], email: cols[2] });
          }
        }
      }
    } else {
      const body = await req.json();
      message = body.message || "";
      title = body.title || "Nestora — Special Update";
      targetRole = body.role || null;
      csvContacts = body.contacts || [];
    }

    if (!message.trim()) return errorResponse("Message is required");

    let sentToUsers = 0;
    let sentToCsv = csvContacts.length;

    // Send to registered users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userQuery: any = {};
    if (targetRole && targetRole !== "all") userQuery.role = targetRole;

    const users = await User.find(userQuery).select("_id").lean();
    for (const u of users) {
      const notif = await Notification.create({
        userId: u._id,
        type: "system",
        title,
        body: message,
        link: "/",
      });
      emit(u._id.toString(), "notification:new", { notification: notif.toObject() });
      sentToUsers++;
    }

    // For CSV contacts — we try to match by email/phone to existing users
    // If no match, we just log them (WhatsApp/SMS integration would go here)
    let matchedFromCsv = 0;
    for (const contact of csvContacts) {
      if (contact.email) {
        const matched = await User.findOne({ email: contact.email.toLowerCase() }).select("_id").lean();
        if (matched) {
          const notif = await Notification.create({
            userId: matched._id,
            type: "system",
            title,
            body: message,
            link: "/",
          });
          emit(matched._id.toString(), "notification:new", { notification: notif.toObject() });
          matchedFromCsv++;
        }
      }
    }

    return successResponse({
      sentToUsers,
      csvContacts: sentToCsv,
      matchedFromCsv,
      total: sentToUsers + matchedFromCsv,
      message: `Sent to ${sentToUsers} registered users + ${matchedFromCsv} matched from CSV`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
