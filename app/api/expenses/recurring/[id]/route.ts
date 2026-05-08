import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SharedExpense from "@/models/SharedExpense";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// PATCH /api/expenses/recurring/[id] - Update recurring expense status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;

    const body = await req.json();
    const { action } = body; // "pause", "resume", "complete"

    const expense = await SharedExpense.findById(id);
    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    // Verify user owns this expense
    if (expense.createdBy.toString() !== user.userId) {
      return errorResponse("Unauthorized", 403);
    }

    if (!expense.isRecurring) {
      return errorResponse("This is not a recurring expense", 400);
    }

    switch (action) {
      case "pause":
        expense.recurringStatus = "paused";
        break;
      case "resume":
        expense.recurringStatus = "active";
        break;
      case "complete":
        expense.recurringStatus = "completed";
        break;
      default:
        return errorResponse("Invalid action. Use: pause, resume, or complete", 400);
    }

    await expense.save();

    return successResponse({
      message: `Recurring expense ${action}d successfully`,
      expense,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/expenses/recurring/[id] - Delete recurring expense
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { id } = await params;

    const expense = await SharedExpense.findById(id);
    if (!expense) {
      return errorResponse("Expense not found", 404);
    }

    // Verify user owns this expense
    if (expense.createdBy.toString() !== user.userId) {
      return errorResponse("Unauthorized", 403);
    }

    if (!expense.isRecurring) {
      return errorResponse("This is not a recurring expense", 400);
    }

    await expense.deleteOne();

    return successResponse({
      message: "Recurring expense deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
