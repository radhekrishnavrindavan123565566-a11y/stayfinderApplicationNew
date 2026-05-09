"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RevenuePage() {
  const { ready, user } = useRequireAuth(["admin"]);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !user) return;
    fetchRevenue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, ready, user]);

  const fetchRevenue = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/revenue?period=${period}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-rose-500 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Panel
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Platform Revenue</h1>

      <div className="mb-6 flex gap-2">
        {["all", "month", "week", "today"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              period === p 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Platform Revenue"
          value={`$${data.revenue.total.toFixed(2)}`}
          subtitle={`From ${data.revenue.transactions} transactions`}
        />
        <StatCard
          title="Gross Transaction Volume"
          value={`$${data.revenue.grossVolume.toFixed(2)}`}
          subtitle={`Avg commission: ${data.revenue.averageCommission}`}
        />
        <StatCard
          title="Landlord Payouts"
          value={`$${data.revenue.landlordPayouts.toFixed(2)}`}
          subtitle="Total paid to property owners"
        />
        <StatCard
          title="Funds in Escrow"
          value={`$${data.escrow.totalHeld.toFixed(2)}`}
          subtitle={`${data.escrow.pendingBookings} pending bookings`}
          highlight
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue (Last 12 Months)</h2>
        <div className="space-y-2">
          {data.monthlyRevenue.map((month: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">
                {new Date(month._id.year, month._id.month - 1).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
              <div className="text-right">
                <div className="font-bold text-green-600">${month.revenue.toFixed(2)}</div>
                <div className="text-sm text-gray-500">{month.transactions} transactions</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-6 rounded-lg shadow ${highlight ? "bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-400 dark:border-yellow-600" : "bg-white dark:bg-zinc-900"}`}>
      <h3 className="text-sm text-gray-600 dark:text-zinc-400 mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">{value}</div>
      <p className="text-xs text-gray-500 dark:text-zinc-500">{subtitle}</p>
    </div>
  );
}
