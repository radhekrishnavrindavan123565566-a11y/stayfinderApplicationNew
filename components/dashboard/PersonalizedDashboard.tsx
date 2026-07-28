"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DashboardCard,
  DashboardGrid,
  AnalyticsChart,
  ResponsiveGrid,
  AnimatedSection,
  StatCard,
} from "@/components/ui";
import {
  TrendingUp,
  Users,
  DollarSign,
  Home,
  Calendar,
  Star,
  MapPin,
  BarChart3,
} from "lucide-react";

interface PersonalizedDashboardProps {
  userName?: string;
  userType?: "landlord" | "tenant";
}

export function PersonalizedDashboard({
  userName = "Guest",
  userType = "landlord",
}: PersonalizedDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">(
    "month"
  );

  const revenueData =
    selectedPeriod === "week"
      ? [
          { label: "Mon", value: 1200, color: "#3b82f6" },
          { label: "Tue", value: 1900, color: "#3b82f6" },
          { label: "Wed", value: 1500, color: "#3b82f6" },
          { label: "Thu", value: 2000, color: "#3b82f6" },
          { label: "Fri", value: 1800, color: "#3b82f6" },
          { label: "Sat", value: 2200, color: "#3b82f6" },
          { label: "Sun", value: 2000, color: "#3b82f6" },
        ]
      : selectedPeriod === "month"
        ? [
            { label: "Week 1", value: 8600, color: "#3b82f6" },
            { label: "Week 2", value: 9200, color: "#3b82f6" },
            { label: "Week 3", value: 8800, color: "#3b82f6" },
            { label: "Week 4", value: 9600, color: "#3b82f6" },
          ]
        : [
            { label: "Q1", value: 28000, color: "#3b82f6" },
            { label: "Q2", value: 31000, color: "#3b82f6" },
            { label: "Q3", value: 29500, color: "#3b82f6" },
            { label: "Q4", value: 35000, color: "#3b82f6" },
          ];

  const occupancyData = [
    { label: "Occupied", value: 85, color: "#10b981" },
    { label: "Available", value: 15, color: "#f3f4f6" },
  ];

  const propertyPerformance = [
    { label: "Luxury Suite", value: 95, color: "#3b82f6" },
    { label: "Deluxe Room", value: 87, color: "#10b981" },
    { label: "Standard Room", value: 78, color: "#f59e0b" },
    { label: "Budget Room", value: 72, color: "#ef4444" },
  ];

  const topProperties = [
    { name: "Luxury Suite Downtown", revenue: 12500, occupancy: 95 },
    { name: "Oceanview Penthouse", revenue: 11200, occupancy: 92 },
    { name: "Mountain Lodge", revenue: 9800, occupancy: 88 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <AnimatedSection title={`Welcome back, ${userName}!`}>
        <p className="text-zinc-600 dark:text-zinc-400">
          {userType === "landlord"
            ? "Here's your rental performance overview"
            : "Manage your bookings and preferences"}
        </p>
      </AnimatedSection>

      {/* Key Metrics */}
      <AnimatedSection title="Key Metrics" delay={0.1}>
        <DashboardGrid columns={4}>
          <DashboardCard
            title="Total Revenue"
            value="$45,231"
            label="This month"
            trend="up"
            trendValue="+12.5%"
            icon={<DollarSign className="w-6 h-6 text-green-500" />}
            variant="success"
            delay={0}
          />
          <DashboardCard
            title="Active Properties"
            value="24"
            label="Occupied"
            trend="neutral"
            trendValue="85% occupancy"
            icon={<Home className="w-6 h-6 text-blue-500" />}
            variant="primary"
            delay={0.1}
          />
          <DashboardCard
            title="Total Bookings"
            value="156"
            label="This month"
            trend="up"
            trendValue="+8.2%"
            icon={<Calendar className="w-6 h-6 text-orange-500" />}
            variant="warning"
            delay={0.2}
          />
          <DashboardCard
            title="Avg. Rating"
            value="4.8"
            label="Out of 5.0"
            trend="up"
            trendValue="+0.3"
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            variant="success"
            delay={0.3}
          />
        </DashboardGrid>
      </AnimatedSection>

      {/* Revenue Chart */}
      <AnimatedSection delay={0.2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Revenue Overview
            </h3>
            <div className="flex gap-2">
              {(["week", "month", "year"] as const).map((period) => (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
          <AnalyticsChart
            title=""
            data={revenueData}
            type="bar"
            height={300}
            showLegend={false}
            unit="$"
          />
        </div>
      </AnimatedSection>

      {/* Charts Grid */}
      <AnimatedSection delay={0.3}>
        <ResponsiveGrid columns={2} mobileColumns={1} gap={6}>
          <AnalyticsChart
            title="Occupancy Rate"
            data={occupancyData}
            type="progress"
            height={200}
            showLegend
          />
          <AnalyticsChart
            title="Property Performance"
            data={propertyPerformance}
            type="bar"
            height={200}
            showValues
            unit="%"
          />
        </ResponsiveGrid>
      </AnimatedSection>

      {/* Top Properties */}
      <AnimatedSection title="Top Performing Properties" delay={0.4}>
        <div className="space-y-3">
          {topProperties.map((property, index) => (
            <motion.div
              key={property.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white">
                    {property.name}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {property.occupancy}% occupancy rate
                  </p>
                </div>
                <span className="text-lg font-bold text-green-500">
                  ${property.revenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${property.occupancy}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Stats Grid */}
      <AnimatedSection title="Quick Stats" delay={0.5}>
        <ResponsiveGrid columns={3} mobileColumns={1} gap={6}>
          <StatCard
            label="Avg. Length of Stay"
            value="4.2"
            unit="nights"
            icon={<Calendar className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="Total Guests"
            value="1,243"
            icon={<Users className="w-4 h-4" />}
            color="green"
          />
          <StatCard
            label="Growth Rate"
            value="+24.5"
            unit="%"
            icon={<TrendingUp className="w-4 h-4" />}
            color="purple"
          />
        </ResponsiveGrid>
      </AnimatedSection>

      {/* Quick Actions */}
      <AnimatedSection delay={0.6}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "View Bookings",
              description: "Manage all your reservations",
              icon: <Calendar className="w-6 h-6" />,
              color: "blue",
            },
            {
              title: "Messages",
              description: "Check guest communications",
              icon: <Users className="w-6 h-6" />,
              color: "green",
            },
            {
              title: "Analytics",
              description: "Detailed performance report",
              icon: <BarChart3 className="w-6 h-6" />,
              color: "purple",
            },
            {
              title: "Settings",
              description: "Configure preferences",
              icon: <MapPin className="w-6 h-6" />,
              color: "orange",
            },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`text-${action.color}-500`}>{action.icon}</div>
                <div className="text-left">
                  <h4 className="font-semibold text-zinc-900 dark:text-white">
                    {action.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}

