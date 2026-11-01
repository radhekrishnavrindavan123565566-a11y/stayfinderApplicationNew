import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import Property from "@/models/Property";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { sendEmail } from "@/lib/mailer";
import {
  newInquiryOwnerEmail,
  inquiryConfirmationEmail,
  adminNewInquiryEmail,
} from "@/lib/emailTemplates";
import { logActivity } from "@/lib/activityLogger";

/**
 * POST /api/inquiries
 * Tenant submits an inquiry for a property.
 * Sends emails to the tenant, owner, and admin.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { propertyId, message, source } = body;

    if (!propertyId) return errorResponse("propertyId is required");

    const property = await Property.findById(propertyId);
    if (!property) return errorResponse("Property not found", 404);

    const tenant = await User.findById(user.userId).select("email username phone").lean() as {
      email?: string; username?: string; phone?: string;
    } | null;
    if (!tenant) return errorResponse("Tenant not found", 404);

    const owner = await User.findById(property.ownerId).select("email username phone").lean() as {
      email?: string; username?: string; phone?: string;
    } | null;

    // Prevent duplicate inquiries (same tenant + property still in active pipeline)
    const existing = await Inquiry.findOne({
      tenantId: user.userId,
      propertyId,
      status: { $nin: ["closed_booked", "closed_not_interested"] },
    });
    if (existing) {
      return errorResponse("You have already submitted an inquiry for this property", 409);
    }

    const inquiry = await Inquiry.create({
      tenantId: user.userId,
      propertyId,
      ownerId: property.ownerId,
      source: source || "app",
      notes: message || "",
      status: "new_lead",
      priority: "medium",
    });

    // ── Emails (non-blocking) ──────────────────────────────────────────────────
    const appAdminEmail = process.env.ADMIN_EMAIL;

    // 1. Confirmation to tenant
    if (tenant?.email) {
      sendEmail(
        tenant.email,
        `Inquiry Sent: ${property.title}`,
        inquiryConfirmationEmail({
          tenantName: tenant.username || "Tenant",
          propertyTitle: property.title,
          propertyCity: property.location?.city || "",
          propertyId: property._id.toString(),
        })
      ).catch(console.error);
    }

    // 2. Alert to owner
    if (owner?.email) {
      sendEmail(
        owner.email,
        `New Inquiry for Your Property: ${property.title}`,
        newInquiryOwnerEmail({
          ownerName: owner.username || "Owner",
          tenantName: tenant?.username || "A tenant",
          tenantPhone: tenant?.phone || "N/A",
          tenantEmail: tenant?.email || "N/A",
          propertyTitle: property.title,
          propertyId: property._id.toString(),
          inquiryId: inquiry._id.toString(),
          message,
        })
      ).catch(console.error);
    }

    // 3. Alert to admin
    if (appAdminEmail) {
      sendEmail(
        appAdminEmail,
        `[Admin] New Inquiry: ${property.title}`,
        adminNewInquiryEmail({
          tenantName: tenant?.username || "Unknown",
          tenantPhone: tenant?.phone || "N/A",
          tenantEmail: tenant?.email || "N/A",
          propertyTitle: property.title,
          propertyCity: property.location?.city || "",
          ownerName: owner?.username || "Unknown",
          inquiryId: inquiry._id.toString(),
        })
      ).catch(console.error);
    }

    // ── Activity log ───────────────────────────────────────────────────────────
    logActivity({
      type: "inquiry_received",
      title: "New Inquiry Received",
      description: `${tenant?.username || "Tenant"} inquired about "${property.title}" in ${property.location?.city || ""}`,
      metadata: {
        inquiryId: inquiry._id.toString(),
        propertyId: property._id.toString(),
        propertyTitle: property.title,
        propertyCity: property.location?.city,
        tenantId: user.userId,
        tenantName: tenant?.username,
        tenantPhone: tenant?.phone,
        tenantEmail: tenant?.email,
        ownerName: owner?.username,
      },
      severity: "high",
      actorId: user.userId,
      targetId: inquiry._id.toString(),
      targetType: "inquiry",
    });

    return successResponse({ inquiry }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/inquiries
 * Get all inquiries for the currently authenticated tenant or owner.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));

    const query =
      user.role === "owner"
        ? { ownerId: user.userId }
        : { tenantId: user.userId };

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .populate("propertyId", "title location images price")
      .populate("tenantId", "username phone email avatar")
      .populate("ownerId", "username phone email")
      .sort({ inquiryDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return successResponse({ inquiries, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}
