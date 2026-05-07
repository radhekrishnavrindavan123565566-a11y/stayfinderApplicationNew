import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExpenseSettlement from "@/models/ExpenseSettlement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// PATCH /api/expenses/settlements/[id] - Update settlement status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    const { id } = await params;

    const body = await req.json();
    const { action, upiTransactionId, note } = body;

    if (!action || !["mark_paid", "confirm_payment"].includes(action)) {
      return errorResponse("Invalid action. Must be 'mark_paid' or 'confirm_payment'");
    }

    const settlement = await ExpenseSettlement.findById(id);

    if (!settlement) return errorResponse("Settlement not found", 404);

    // Mark as paid (by debtor)
    if (action === "mark_paid") {
      if (settlement.debtor.toString() !== user.userId) {
        return errorResponse("Only the debtor can mark payment as paid", 403);
      }

      if (settlement.paymentStatus !== "pending") {
        return errorResponse("Settlement already processed");
      }

      settlement.paymentStatus = "paid";
      settlement.paidAt = new Date();
      
      if (upiTransactionId) {
        // Validate UPI transaction ID format (12 digits)
        if (!/^\d{12}$/.test(upiTransactionId)) {
          return errorResponse("Invalid UPI transaction ID format. Must be 12 digits");
        }
        settlement.upiTransactionId = upiTransactionId;
      }
      
      if (note) settlement.note = note;
    }

    // Confirm payment (by creditor)
    if (action === "confirm_payment") {
      if (settlement.creditor.toString() !== user.userId) {
        return errorResponse("Only the creditor can confirm payment", 403);
      }

      if (settlement.paymentStatus !== "paid") {
        return errorResponse("Settlement must be marked as paid first");
      }

      settlement.paymentStatus = "confirmed";
      settlement.confirmedAt = new Date();
    }

    await settlement.save();

    return successResponse({ settlement });
  } catch (error) {
    return handleApiError(error);
  }
}
