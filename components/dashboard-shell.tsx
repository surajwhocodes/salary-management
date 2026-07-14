"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type DashboardData } from "@/lib/client-api";
import { formatCurrency } from "@/utils/format";
import {
  Users,
  DollarSign,
  TrendingUp,
  Coins,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Briefcase,
  History,
} from "lucide-react";

const palette = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

export function DashboardShell() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    void dashboardApi
      .get()
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.message === "Authentication required") {
          router.replace("/login?redirectTo=/");
          return;
        }
        setError(reason instanceof Error ? reason.message : "Unable to load dashboard");
      });
  }, [router]);

  if (error) {
    return (
      <div
        role="alert"
        className="bg-rose-50 p-6 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-3 shadow-sm"
      >
        <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
        <div>
          <h3 className="font-semibold text-rose-900">Dashboard Error</h3>
          <p className="text-sm text-rose-700 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="bg-slate-200 rounded h-4 w-32" />
            <div className="bg-slate-200 rounded h-10 w-80" />
          </div>
          <div className="bg-slate-200 rounded-lg h-10 w-40" />
        </div>
        <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-slate-200 border border-slate-100 rounded-2xl h-32" />
          ))}
        </div>
        <div className="gap-6 grid lg:grid-cols-2">
          <div className="bg-slate-200 border border-slate-100 rounded-2xl h-80" />
          <div className="bg-slate-200 border border-slate-100 rounded-2xl h-80" />
        </div>
      </div>
    );
  }

  const { summary, insights } = data;

  const statCards = [
    {
      label: "Total Employees",
      value: summary.totalEmployees.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      accent: "border-t-4 border-t-blue-500",
    },
    {
      label: "Average Salary",
      value: formatCurrency(summary.averageSalary),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accent: "border-t-4 border-t-emerald-500",
    },
    {
      label: "Highest Salary",
      value: formatCurrency(summary.highestSalary),
      icon: TrendingUp,
      color: "text-violet-600 bg-violet-50 border-violet-100",
      accent: "border-t-4 border-t-violet-500",
    },
    {
      label: "Payroll Cost",
      value: formatCurrency(summary.payrollCost),
      icon: Coins,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      accent: "border-t-4 border-t-amber-500",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome / Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 rounded-2xl text-white shadow-lg border border-slate-700/50">
        <div>
          <p className="font-semibold text-teal-400 text-xs sm:text-sm uppercase tracking-widest mb-1.5">
            People Operations Console
          </p>
          <h1 className="font-bold text-3xl sm:text-4xl tracking-tight">
            Dashboard overview
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time analytics and employee compensation statistics.
          </p>
        </div>
        <Link
          href="/employees"
          className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 shrink-0"
        >
          <span>Manage employees</span>
          <ArrowUpRight size={16} className="text-slate-600" />
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className={`transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-slate-200/60 rounded-2xl overflow-hidden ${item.accent}`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-slate-500 font-medium text-sm tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-bold text-3xl text-slate-900 tracking-tight">
                    {item.value}
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl border ${item.color}`}>
                  <Icon size={24} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Lists */}
      <div className="gap-6 grid lg:grid-cols-2">
        {/* Country distribution */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                Country distribution
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.countryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {summary.countryDistribution.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={palette[index % palette.length]}
                      className="transition-all duration-200 hover:opacity-90 outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Changes */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                Recent salary changes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {summary.recentSalaryChanges.map((entry) => (
              <div
                key={entry.employeeId}
                className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {entry.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{entry.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{entry.date}</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-full text-xs">
                  +{formatCurrency(entry.delta)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="gap-6 grid lg:grid-cols-2">
        {/* Department distribution */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                Department distribution
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.departmentDistribution} margin={{ bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {summary.departmentDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={palette[index % palette.length]}
                      className="transition-colors duration-200 hover:opacity-90"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compensation change trend */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-800">
                Compensation change trend
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.recentSalaryChanges} margin={{ bottom: 20, right: 10 }}>
                <defs>
                  <linearGradient id="colorDelta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="employeeId"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="delta"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDelta)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-teal-50/20">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">
              AI Insights & Recommendations
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={insight}
              className="bg-white p-5 border border-slate-200/50 hover:border-slate-300 shadow-sm hover:shadow rounded-xl text-slate-700 text-sm flex items-start gap-3 transition-all duration-200"
            >
              <span className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/50 h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                {index + 1}
              </span>
              <p className="leading-relaxed text-slate-600 font-medium">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
