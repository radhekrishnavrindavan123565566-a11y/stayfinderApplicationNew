"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  X,
  Send,
  Filter,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface SharedExpense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: { _id: string; username: string };
  participants: Array<{ user: { _id: string; username: string }; amount: number }>;
  splitMethod: string;
  date: string;
  createdAt: string;
}

interface Settlement {
  _id: string;
  expense: { _id: string; description: string; amount: number };
  debtor: { _id: string; username: string };
  creditor: { _id: string; username: string };
  amount: number;
  status: "pending" | "paid" | "confirmed";
  paidAt?: string;
  confirmedAt?: string;
}

const EXPENSE_CATEGORIES = [
  { value: "electricity", label: "Electricity", icon: "⚡", color: "from-yellow-500 to-amber-400" },
  { value: "water", label: "Water", icon: "💧", color: "from-blue-500 to-cyan-400" },
  { value: "internet", label: "Internet", icon: "📡", color: "from-purple-500 to-violet-400" },
  { value: "groceries", label: "Groceries", icon: "🛒", color: "from-green-500 to-emerald-400" },
  { value: "rent", label: "Rent", icon: "🏠", color: "from-rose-500 to-pink-400" },
  { value: "other", label: "Other", icon: "📝", color: "from-zinc-500 to-zinc-400" },
];

const SPLIT_METHODS = [
  { value: "equal", label: "Split Equally", icon: "=" },
  { value: "percentage", label: "By Percentage", icon: "%" },
  { value: "custom_amounts", label: "Custom Amounts", icon: "✏️" },
];

export default function ExpensesPage() {
  const { ready, user: authUser } = useRequireAuth();
  const { user, accessToken } = useAuthStore();
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ owedToMe: 0, iOwe: 0 });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettlementsModal, setShowSettlementsModal] = useState(false);
  
  // Create form
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("electricity");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [participants, setParticipants] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/expenses", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setExpenses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  }, [accessToken]);

  const fetchSettlements = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get("/api/expenses/settlements", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSettlements(data.data || []);
      setSummary(data.summary || { owedToMe: 0, iOwe: 0 });
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (ready && authUser && accessToken) {
      fetchExpenses();
      fetchSettlements();
    }
  }, [ready, authUser, accessToken, fetchExpenses, fetchSettlements]);

  const handleCreateExpense = async () => {
    if (!amount || !description || !accessToken || !user) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setCreating(true);
    try {
      await axios.post(
        "/api/expenses",
        {
          amount: amountNum,
          description,
          category,
          paidBy: user._id,
          splitMethod,
          participants: participants.length > 0 ? participants : [user._id],
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Expense created successfully");
      setShowCreateModal(false);
      setAmount("");
      setDescription("");
      setCategory("electricity");
      setSplitMethod("equal");
      setParticipants([]);
      fetchExpenses();
      fetchSettlements();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create expense");
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async (settlementId: string) => {
    if (!accessToken) return;
    try {
      await axios.patch(
        `/api/expenses/settlements/${settlementId}`,
        { status: "paid" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Marked as paid");
      fetchSettlements();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update settlement");
    }
  };

  const handleConfirmPayment = async (settlementId: string) => {
    if (!accessToken) return;
    try {
      await axios.patch(
        `/api/expenses/settlements/${settlementId}`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Payment confirmed");
      fetchSettlements();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to confirm payment");
    }
  };

  const getCategoryInfo = (cat: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.value === cat) || EXPENSE_CATEGORIES[5];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!ready || !authUser) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  const pendingSettlements = settlements.filter((s) => s.status === "pending");
  const owedToMeSettlements = pendingSettlements.filter((s) => s.creditor._id === user?._id);
  const iOweSettlements = pendingSettlements.filter((s) => s.debtor._id === user?._id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
              Bill Splitter
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Split expenses with your roommates
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettlementsModal(true)}
              variant="outline"
            >
              <Users className="w-4 h-4" />
              Settlements
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Owed to Me</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">₹{summary.owedToMe.toFixed(0)}</p>
            <p className="text-xs opacity-75 mt-1">
              {owedToMeSettlements.length} pending settlement(s)
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">I Owe</span>
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black">₹{summary.iOwe.toFixed(0)}</p>
            <p className="text-xs opacity-75 mt-1">
              {iOweSettlements.length} pending payment(s)
            </p>
          </div>
        </motion.div>

        {/* Expenses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            Recent Expenses
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                No expenses yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                Create your first expense to start splitting bills
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense, index) => {
                const catInfo = getCategoryInfo(expense.category);
                return (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catInfo.color} flex items-center justify-center text-2xl flex-shrink-0`}
                        >
                          {catInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-zinc-900 dark:text-white mb-1">
                            {expense.description}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full capitalize">
                              {expense.category}
                            </span>
                            <span>•</span>
                            <span>Paid by {expense.paidBy.username}</span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Users className="w-3 h-3 text-zinc-400" />
                            <span className="text-xs text-zinc-500">
                              {expense.participants.length} participant(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">
                          ₹{expense.amount.toFixed(0)}
                        </p>
                        <p className="text-xs text-zinc-500 capitalize">
                          {expense.splitMethod.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Expense Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Add Expense
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Electricity bill for January"
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          category === cat.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {cat.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Method */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Split Method
                  </label>
                  <select
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value)}
                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white dark:bg-zinc-800 dark:text-white"
                  >
                    {SPLIT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.icon} {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExpense}
                    disabled={!amount || !description || creating}
                    isLoading={creating}
                    className="flex-1"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settlements Modal */}
      <AnimatePresence>
        {showSettlementsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettlementsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-2xl w-full border border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Settlements
                </h2>
                <button
                  onClick={() => setShowSettlementsModal(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Owed to Me */}
              {owedToMeSettlements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Owed to Me
                  </h3>
                  <div className="space-y-2">
                    {owedToMeSettlements.map((settlement) => (
                      <div
                        key={settlement._id}
                        className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {settlement.debtor.username}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {settlement.expense.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ₹{settlement.amount.toFixed(0)}
                            </p>
                            {settlement.status === "paid" && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayment(settlement._id)}
                                className="mt-2"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Confirm
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* I Owe */}
              {iOweSettlements.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    I Owe
                  </h3>
                  <div className="space-y-2">
                    {iOweSettlements.map((settlement) => (
                      <div
                        key={settlement._id}
                        className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {settlement.creditor.username}
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {settlement.expense.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              ₹{settlement.amount.toFixed(0)}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(settlement._id)}
                              className="mt-2"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Paid
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingSettlements.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    All settled up! No pending payments.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
