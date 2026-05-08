import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    await connectDB();
    const { id } = await params;
    const { confirmed, issues } = await req.json();

    const booking = await Booking.findById(id);
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.tenantId.toString() !== user.userId) return errorResponse("Forbidden", 403);
    if (booking.status !== "approved") return errorResponse("Booking must be approved first");

    // Use the proper nested moveInConfirmation field
    if (!booking.moveInConfirmation) {
      booking.moveInConfirmation = {
        status: "pending",
        checkInPhotos: [],
      };
    }
    booking.moveInConfirmation.tenantConfirmedAt = new Date();
    booking.moveInConfirmation.status = confirmed
      ? (issues?.length > 0 ? "tenant_confirmed" : "tenant_confirmed")
      : "disputed";

    if (confirmed && (!issues || issues.length === 0)) {
      booking.escrowStatus = "released";
    }

    await booking.save();
    return successResponse({ booking });
  } catch (e) { return handleApiError(e); }
}
