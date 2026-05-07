import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SharedExpense from "@/models/SharedExpense";
import ExpenseSettlement from "@/models/ExpenseSettlement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// GET /api/expenses - Get expenses for user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const { searchParams } = new URL(req.url);
    const roommateGroupId = searchParams.get("roommateGroupId");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {
      $or: [
        { createdBy: user.userId },
        { "participants.userId": user.userId },
      ],
    };

    if (roommateGroupId) query.roommateGroupId = roommateGroupId;
    if (category) query.category = category;

    const expenses = await SharedExpense.find(query)
      .populate("createdBy", "username avatar")
      .populate("paidBy", "username avatar")
      .populate("participants.userId", "username avatar")
      .sort({ expenseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await SharedExpense.countDocuments(query);

    return successResponse({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/expenses - Create a new expense
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const body = await req.json();
    const {
      amount,
      description,
      category,
      paidBy,
      splitMethod,
      participants,
      roommateGroupId,
      receiptImages,
      expenseDate,
    } = body;

    if (!amount || !description || !category || !paidBy || !participants) {
      return errorResponse("Missing required fields: amount, description, category, paidBy, participants");
    }

    // Validate split amounts sum to total
    const totalSplit = participants.reduce(
      (sum: number, p: any) => sum + p.shareAmount,
      0
    );
    if (Math.abs(totalSplit - amount) > 1) {
      return errorResponse("Split amounts must sum to total amount");
    }

    // Create expense
    const expense = await SharedExpense.create({
      roommateGroupId,
      createdBy: user.userId,
      amount,
      description,
      category,
      paidBy,
      expenseDate: expenseDate || new Date(),
      splitMethod: splitMethod || "equal",
      participants,
      receiptImages: receiptImages || [],
    });

    // Create settlements for participants who owe money
    const settlements = [];
    for (const participant of participants) {
      if (participant.userId.toString() !== paidBy.toString() && participant.shareAmount > 0) {
        const settlement = await ExpenseSettlement.create({
          expenseId: expense._id,
          debtor: participant.userId,
          creditor: paidBy,
          amount: participant.shareAmount,
        });
        settlements.push(settlement);
      }
    }

    return successResponse({ expense, settlements }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
