import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentPayment from "@/models/RentPayment";
import Booking from "@/models/Booking";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { format, addMonths, startOfMonth } from "date-fns";

// GET — fetch rent payment history
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "tenant";
    const bookingId = searchParams.get("bookingId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = role === "owner" ? { ownerId: user.userId } : { tenantId: user.userId };
    if (bookingId) query.bookingId = bookingId;

    const payments = await RentPayment.find(query)
      .populate("propertyId", "title images location price")
      .populate("tenantId", "username avatar email")
      .populate("ownerId", "username avatar")
      .sort({ month: -1 })
      .lean();

    // Mark overdue payments
    const now = new Date();
    const updated = payments.map((p) => ({
      ...p,
      isOverdue: p.status === "pending" && new Date(p.dueDate) < now,
    }));

    const stats = {
      total: payments.length,
      paid: payments.filter((p) => p.status === "paid").length,
      pending: payments.filter((p) => p.status === "pending").length,
      late: payments.filter((p) => p.status === "late").length,
      totalAmount: payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
    };

    return successResponse({ payments: updated, stats });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST — generate monthly rent entries for an active booking
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { bookingId } = await req.json();

    if (!bookingId) return errorResponse("bookingId is required");

    const booking = await Booking.findById(bookingId).populate("propertyId", "title price");
    if (!booking) return errorResponse("Booking not found", 404);
    if (booking.ownerId.toString() !== user.userId && booking.tenantId.toString() !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    const property = booking.propertyId as { price: number; title: string };
    const start = startOfMonth(new Date(booking.startDate));
    const end = new Date(booking.endDate);
    const entries = [];
    let current = start;

    while (current <= end) {
      const month = format(current, "yyyy-MM");
      const dueDate = new Date(current.getFullYear(), current.getMonth(), 1);

      const existing = await RentPayment.findOne({ bookingId, month });
      if (!existing) {
        entries.push({
          bookingId,
          propertyId: booking.propertyId,
          tenantId: booking.tenantId,
          ownerId: booking.ownerId,
          amount: property.price,
          month,
          dueDate,
          status: "pending",
        });
      }
      current = addMonths(current, 1);
    }

    if (entries.length > 0) {
      await RentPayment.insertMany(entries);
    }

    return successResponse({ created: entries.length, message: `${entries.length} monthly entries generated` });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH — mark payment as paid (owner confirms)
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { paymentId, status, note } = await req.json();

    if (!paymentId || !status) return errorResponse("paymentId and status are required");

    const payment = await RentPayment.findById(paymentId);
    if (!payment) return errorResponse("Payment not found", 404);
    if (payment.ownerId.toString() !== user.userId) return errorResponse("Only owner can confirm payment", 403);

    const updated = await RentPayment.findByIdAndUpdate(
      paymentId,
      {
        status,
        note,
        ...(status === "paid" ? { paidDate: new Date() } : {}),
      },
      { new: true }
    );

    // Notify tenant
    if (status === "paid") {
      await Notification.create({
        userId: payment.tenantId,
        type: "payment",
        title: "Rent Payment Confirmed",
        body: `Your rent for ${payment.month} has been confirmed by the owner.`,
        link: "/dashboard/rent-tracker",
      });
    }

    return successResponse({ payment: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
