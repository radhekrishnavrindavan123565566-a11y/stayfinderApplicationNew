import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import Notification from "@/models/Notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) break;

        const booking = await Booking.findByIdAndUpdate(
          bookingId,
          { paymentStatus: "paid", escrowStatus: "held", status: "confirmed" },
          { new: true }
        );

        if (booking) {
          // Update transaction
          await Transaction.findOneAndUpdate(
            { bookingId },
            { status: "completed", paymentIntentId: pi.id },
            { upsert: true }
          );

          // Notify tenant
          await Notification.create({
            userId: booking.tenantId,
            type: "payment",
            title: "Payment Confirmed",
            body: "Your payment has been received and is held in escrow.",
            link: `/dashboard/bookings`,
          });

          // Notify owner
          await Notification.create({
            userId: booking.ownerId,
            type: "booking",
            title: "New Booking Confirmed",
            body: "A booking has been confirmed and payment is in escrow.",
            link: `/dashboard/bookings`,
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) break;

        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = charge.payment_intent as string;
        if (!pi) break;

        const transaction = await Transaction.findOne({ paymentIntentId: pi });
        if (transaction) {
          await Transaction.findByIdAndUpdate(transaction._id, { status: "refunded" });
          await Booking.findByIdAndUpdate(transaction.bookingId, {
            paymentStatus: "refunded",
            escrowStatus: "released",
          });
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

