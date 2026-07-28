import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Booking from "@/models/Booking";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const booking = await Booking.findById(id).populate("propertyId");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only tenant can request checkout
    if (booking.tenantId.toString() !== user.userId.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { checkoutDate, reason, calculatedRent } = body;

    if (!checkoutDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create or update checkout request
    booking.checkoutRequest = {
      requestedDate: new Date(),
      checkoutDate: new Date(checkoutDate),
      reason,
      status: "pending",
      calculatedRent,
    };

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Checkout request submitted",
      data: booking,
    });
  } catch (error) {
    console.error("Checkout request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
