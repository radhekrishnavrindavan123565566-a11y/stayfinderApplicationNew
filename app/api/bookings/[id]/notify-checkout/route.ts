import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { checkoutDate, reason, message, propertyTitle, ownerId } =
      await request.json();

    // Validate
    if (!checkoutDate) {
      return NextResponse.json(
        { error: "Checkout date is required" },
        { status: 400 }
      );
    }

    // Await params for Next.js 16
    const { id } = await params;

    // Get booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.tenantId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get owner info
    const owner = await User.findById(ownerId);
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get tenant info
    const tenant = await User.findById(decoded.userId);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Update booking with checkout info
    booking.checkoutDate = new Date(checkoutDate);
    booking.checkoutReason = reason;
    booking.checkoutNotificationSent = true;
    booking.checkoutNotificationDate = new Date();
    await booking.save();

    // Create notification for owner
    const notification = await Notification.create({
      userId: ownerId,
      type: "checkout_notification",
      title: `Checkout Notice - ${propertyTitle}`,
      message: `${tenant.username} has requested to checkout on ${new Date(checkoutDate).toLocaleDateString()}${message ? `. Message: ${message}` : ""}`,
      data: {
        bookingId: booking._id,
        tenantId: tenant._id,
        tenantName: tenant.username,
        tenantEmail: tenant.email,
        checkoutDate,
        reason,
        propertyTitle,
      },
      read: false,
    });

    // Send email to owner (optional - if you have email service)
    // await sendEmailNotification(owner.email, {
    //   subject: `Checkout Notice - ${propertyTitle}`,
    //   tenant: tenant.username,
    //   checkoutDate,
    //   reason,
    //   message,
    //   propertyTitle,
    // });

    return NextResponse.json(
      {
        data: {
          notification,
          message: "Checkout notification sent successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
