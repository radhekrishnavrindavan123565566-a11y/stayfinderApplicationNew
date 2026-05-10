"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, Info } from "lucide-react";
import { calculateLateFee, getLateFeeMessage, type LateFeeConfig } from "@/lib/lateFeeCalculator";
import Button from "@/components/ui/Button";

export default function LateFeeCalculator() {
  const [rentAmount, setRentAmount] = useState<number>(10000);
  const [dueDate, setDueDate] = useState<string>(
    new Date(new Date().setDate(5)).toISOString().split("T")[0]
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [config, setConfig] = useState<LateFeeConfig>({
    gracePeriodDays: 3,
    flatFee: 100,
    percentageFee: 2,
    dailyFee: 50,
    maxLateFee: 2000,
  });
  const [result, setResult] = useState<ReturnType<typeof calculateLateFee> | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCalculate = () => {
    const due = new Date(dueDate);
    const payment = new Date(paymentDate);
    const calculated = calculateLateFee(due, payment, rentAmount, config);
    setResult(calculated);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Late Fee Calculator
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Calculate penalties for late rent payments
          </p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        {/* Rent Amount */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
            Rent Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
            <input
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          <Info className="w-4 h-4" />
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  value={config.gracePeriodDays}
                  onChange={(e) =>
                    setConfig({ ...config, gracePeriodDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Flat Fee (₹)
                </label>
                <input
                  type="number"
                  value={config.flatFee}
                  onChange={(e) => setConfig({ ...config, flatFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Percentage Fee (%)
                </label>
                <input
                  type="number"
                  value={config.percentageFee}
                  onChange={(e) =>
                    setConfig({ ...config, percentageFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Daily Fee (₹)
                </label>
                <input
                  type="number"
                  value={config.dailyFee}
                  onChange={(e) => setConfig({ ...config, dailyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Maximum Late Fee (₹)
              </label>
              <input
                type="number"
                value={config.maxLateFee}
                onChange={(e) => setConfig({ ...config, maxLateFee: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Calculate Button */}
      <Button onClick={handleCalculate} className="w-full mb-6" size="lg">
        <Calculator className="w-4 h-4" />
        Calculate Late Fee
      </Button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl border-2 ${
            result.isLate
              ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
              : "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
          }`}
        >
          {result.isLate ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Payment is Late
                </h3>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Days Late:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {result.daysLate} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">Original Rent:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ₹{result.breakdown.originalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                {result.breakdown.flatFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Flat Fee:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      +₹{result.breakdown.flatFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {result.breakdown.percentageFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      Percentage Fee:
                    </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      +₹{result.breakdown.percentageFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {result.breakdown.dailyFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Daily Fee:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      +₹{result.breakdown.dailyFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t-2 border-red-300 dark:border-red-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    Total Late Fee:
                  </span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ₹{result.lateFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900 dark:text-white">
                    Total Amount Due:
                  </span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    ₹{result.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-zinc-900 rounded-lg">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {getLateFeeMessage(result)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  On Time Payment
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                {getLateFeeMessage(result)}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-900 dark:text-white">Amount Due:</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{result.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Grace period: No penalty for {config.gracePeriodDays} days</li>
              <li>After grace: Flat fee + Percentage + Daily charges apply</li>
              <li>Maximum cap: ₹{config.maxLateFee?.toLocaleString("en-IN")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
