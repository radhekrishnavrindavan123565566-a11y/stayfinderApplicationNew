import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SharedExpense from "@/models/SharedExpense";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/expenses/analytics - Get expense analytics
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // month, quarter, year
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate date range
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        expenseDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      const now = new Date();
      let start = new Date();
      
      switch (period) {
        case "week":
          start.setDate(now.getDate() - 7);
          break;
        case "month":
          start.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          start.setMonth(now.getMonth() - 3);
          break;
        case "year":
          start.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      dateFilter = { expenseDate: { $gte: start, $lte: now } };
    }

    const query = {
      $or: [
        { createdBy: user.userId },
        { "participants.userId": user.userId },
      ],
      ...dateFilter,
    };

    // Get all expenses for the period
    const expenses = await SharedExpense.find(query).lean();

    // Calculate total spending
    const totalSpending = expenses.reduce((sum, exp) => {
      const userParticipant = exp.participants.find(
        (p: any) => p.userId.toString() === user.userId
      );
      return sum + (userParticipant?.shareAmount || 0);
    }, 0);

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc: any, exp) => {
      const userParticipant = exp.participants.find(
        (p: any) => p.userId.toString() === user.userId
      );
      const amount = userParticipant?.shareAmount || 0;
      
      if (!acc[exp.category]) {
        acc[exp.category] = { total: 0, count: 0 };
      }
      acc[exp.category].total += amount;
      acc[exp.category].count += 1;
      
      return acc;
    }, {});

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.expenseDate);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      
      const monthTotal = monthExpenses.reduce((sum, exp) => {
        const userParticipant = exp.participants.find(
          (p: any) => p.userId.toString() === user.userId
        );
        return sum + (userParticipant?.shareAmount || 0);
      }, 0);
      
      monthlyTrend.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        total: monthTotal,
        count: monthExpenses.length,
      });
    }

    // Top expenses
    const topExpenses = expenses
      .map((exp) => {
        const userParticipant = exp.participants.find(
          (p: any) => p.userId.toString() === user.userId
        );
        return {
          ...exp,
          userAmount: userParticipant?.shareAmount || 0,
        };
      })
      .sort((a, b) => b.userAmount - a.userAmount)
      .slice(0, 5);

    // Average per category
    const categoryAverages = Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
      category,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    }));

    // Recurring expenses summary
    const recurringExpenses = await SharedExpense.find({
      $or: [
        { createdBy: user.userId },
        { "participants.userId": user.userId },
      ],
      isRecurring: true,
      recurringStatus: "active",
    }).lean();

    const recurringTotal = recurringExpenses.reduce((sum, exp) => {
      const userParticipant = exp.participants.find(
        (p: any) => p.userId.toString() === user.userId
      );
      return sum + (userParticipant?.shareAmount || 0);
    }, 0);

    return successResponse({
      summary: {
        totalSpending,
        expenseCount: expenses.length,
        averageExpense: expenses.length > 0 ? totalSpending / expenses.length : 0,
        recurringExpensesCount: recurringExpenses.length,
        recurringMonthlyTotal: recurringTotal,
      },
      categoryBreakdown: categoryAverages,
      monthlyTrend,
      topExpenses: topExpenses.map((exp) => ({
        _id: exp._id,
        description: exp.description,
        category: exp.category,
        amount: exp.userAmount,
        date: exp.expenseDate,
      })),
      recurringExpenses: recurringExpenses.map((exp) => ({
        _id: exp._id,
        description: exp.description,
        category: exp.category,
        frequency: exp.recurringFrequency,
        amount: exp.participants.find((p: any) => p.userId.toString() === user.userId)?.shareAmount || 0,
        nextDate: exp.nextRecurringDate,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
