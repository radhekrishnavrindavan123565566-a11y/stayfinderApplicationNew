import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import Inquiry from "@/models/Inquiry";
import { logActivity } from "@/lib/activityLogger";

const VALID_STATUSES = [
  "new_lead",
  "call_done",
  "visit_scheduled",
  "visit_completed",
  "closed_booked",
  "closed_not_interested",
];

/**
 * PATCH /api/admin/inquiries/[id]
 * Update an inquiry's status, priority, notes, followUpDate, or tags.
 * Admin only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = requireRole(req, ["admin"]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, priority, notes, followUpDate, tags, closureReason } = body;

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;
    if (followUpDate !== undefined) updates.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (tags !== undefined) updates.tags = tags;
    if (closureReason !== undefined) updates.closureReason = closureReason;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    )
      .populate("tenantId", "username phone email")
      .populate("propertyId", "title location price")
      .populate("ownerId", "username phone email");

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Log status changes as activity
    if (status) {
      logActivity({
        type: "inquiry_updated",
        title: "Inquiry Status Updated",
        description: `Inquiry for "${(inquiry.propertyId as any)?.title || "property"}" updated to "${status}" by admin`,
        metadata: {
          inquiryId: id,
          newStatus: status,
          tenantName: (inquiry.tenantId as any)?.username,
          propertyTitle: (inquiry.propertyId as any)?.title,
        },
        severity: status === "closed_booked" ? "high" : "medium",
        actorId: admin.userId,
        targetId: id,
        targetType: "inquiry",
      });
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error("[Admin Inquiry PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/admin/inquiries/[id]
 * Get a single inquiry with full population.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = requireRole(req, ["admin"]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const inquiry = await Inquiry.findById(id)
      .populate("tenantId", "username phone email avatar createdAt")
      .populate("propertyId", "title location price images isAvailable")
      .populate("ownerId", "username phone email");

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    console.error("[Admin Inquiry GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
