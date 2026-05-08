import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExpenseSettlement from "@/models/ExpenseSettlement";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

// GET /api/expenses/settlements - Get settlements for user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {
      $or: [{ debtor: user.userId }, { creditor: user.userId }],
    };

    if (status) query.paymentStatus = status;

    const settlements = await ExpenseSettlement.find(query)
      .populate("debtor", "username avatar upiId")
      .populate("creditor", "username avatar upiId")
      .populate("expenseId", "description category expenseDate")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary
    const owedToMe = settlements
      .filter(
        (s: any) =>
          s.creditor._id.toString() === user.userId &&
          s.paymentStatus === "pending"
      )
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    const iOwe = settlements
      .filter(
        (s: any) =>
          s.debtor._id.toString() === user.userId &&
          s.paymentStatus === "pending"
      )
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    return successResponse({
      settlements,
      summary: { owedToMe, iOwe, netBalance: owedToMe - iOwe },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
