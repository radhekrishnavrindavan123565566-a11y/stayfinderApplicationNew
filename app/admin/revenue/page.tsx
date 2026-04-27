"use client";

import { useEffect, useState } from "react";

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [period]);

  const fetchRevenue = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/revenue?period=${period}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Platform Revenue</h1>

      <div className="mb-6 flex gap-2">
        {["all", "month", "week", "today"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded ${
              period === p ? "bg-blue-600 text-white" : "bg-gray-200"
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
    <div className={`p-6 rounded-lg shadow ${highlight ? "bg-yellow-50 border-2 border-yellow-400" : "bg-white"}`}>
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
