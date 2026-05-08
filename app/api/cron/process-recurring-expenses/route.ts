import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SharedExpense from "@/models/SharedExpense";
import ExpenseSettlement from "@/models/ExpenseSettlement";

export const dynamic = "force-dynamic";

// Helper to calculate next recurring date
function calculateNextRecurringDate(
  frequency: "weekly" | "monthly" | "quarterly",
  currentDate: Date,
  dayOfMonth?: number,
  dayOfWeek?: number
): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      if (dayOfWeek !== undefined) {
        // Adjust to specific day of week
        const currentDay = next.getDay();
        const diff = dayOfWeek - currentDay;
        next.setDate(next.getDate() + (diff >= 0 ? diff : diff + 7));
      }
      break;

    case "monthly":
      next.setMonth(next.getMonth() + 1);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;

    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
  }

  return next;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active recurring expenses that are due
    const dueExpenses = await SharedExpense.find({
      isRecurring: true,
      recurringStatus: "active",
      nextRecurringDate: { $lte: today },
    }).populate("participants.userId", "username email");

    let created = 0;
    let errors = 0;

    for (const expense of dueExpenses) {
      try {
        // Check if end date has passed
        if (expense.recurringEndDate && new Date(expense.recurringEndDate) < today) {
          expense.recurringStatus = "completed";
          await expense.save();
          continue;
        }

        // Create new expense instance
        const newExpense = new SharedExpense({
          roommateGroupId: expense.roommateGroupId,
          createdBy: expense.createdBy,
          amount: expense.amount,
          description: `${expense.description} (Auto-generated)`,
          category: expense.category,
          paidBy: expense.paidBy,
          expenseDate: new Date(),
          splitMethod: expense.splitMethod,
          participants: expense.participants,
          receiptImages: [],
          isRecurring: false,
          isRecurringInstance: true,
          parentExpenseId: expense._id,
        });

        await newExpense.save();

        // Create settlements for each participant
        for (const participant of expense.participants) {
          if (participant.userId.toString() !== expense.paidBy.toString()) {
            await ExpenseSettlement.create({
              expenseId: newExpense._id,
              fromUser: participant.userId,
              toUser: expense.paidBy,
              amount: participant.shareAmount,
              status: "pending",
            });
          }
        }

        // Calculate next recurring date
        const nextDate = calculateNextRecurringDate(
          expense.recurringFrequency!,
          expense.nextRecurringDate || new Date(),
          expense.recurringDayOfMonth,
          expense.recurringDayOfWeek
        );

        expense.nextRecurringDate = nextDate;
        await expense.save();

        created++;
      } catch (error) {
        console.error(`Error processing recurring expense ${expense._id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${dueExpenses.length} recurring expenses`,
      created,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in process-recurring-expenses cron:", error);
    return NextResponse.json(
      { error: "Failed to process recurring expenses", details: error.message },
      { status: 500 }
    );
  }
}
