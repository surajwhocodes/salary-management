"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type DashboardData } from "@/lib/client-api";
import { formatCurrency } from "@/utils/format";

const palette = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#0f766e"];

export function DashboardShell() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void dashboardApi.get().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard")); }, []);

  if (error) return <div role="alert" className="bg-rose-50 p-4 border border-rose-200 rounded-xl text-rose-800">{error}</div>;
  if (!data) return <div className="animate-pulse space-y-6"><div className="bg-slate-200 rounded h-12 w-64" /><div className="gap-4 grid md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="bg-slate-200 rounded-xl h-32" />)}</div></div>;
  const { summary, insights } = data;

  return <div className="space-y-6"><div className="flex justify-between items-center"><div><p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">People operations</p><h1 className="font-semibold text-3xl">Salary Management Console</h1></div><Link href="/employees" className="bg-slate-900 px-4 py-2 rounded-lg font-medium text-white text-sm">Manage employees</Link></div>
    <div className="gap-4 grid md:grid-cols-2 xl:grid-cols-4">{[{ label: "Total employees", value: summary.totalEmployees.toString() }, { label: "Average salary", value: formatCurrency(summary.averageSalary) }, { label: "Highest salary", value: formatCurrency(summary.highestSalary) }, { label: "Payroll cost", value: formatCurrency(summary.payrollCost) }].map((item) => <Card key={item.label}><CardHeader><CardTitle className="text-slate-500 text-sm">{item.label}</CardTitle></CardHeader><CardContent><p className="font-semibold text-2xl">{item.value}</p></CardContent></Card>)}</div>
    <div className="gap-6 grid lg:grid-cols-[1.3fr_0.7fr]"><Card><CardHeader><CardTitle>Country distribution</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={summary.countryDistribution} dataKey="value" nameKey="name" outerRadius={90}>{summary.countryDistribution.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Recent salary changes</CardTitle></CardHeader><CardContent className="space-y-3">{summary.recentSalaryChanges.map((entry) => <div key={entry.employeeId} className="flex justify-between items-center p-3 border rounded-lg"><div><p className="font-medium">{entry.name}</p><p className="text-slate-500 text-sm">{entry.date}</p></div><span className="font-semibold text-emerald-600 text-sm">+{formatCurrency(entry.delta)}</span></div>)}</CardContent></Card></div>
    <div className="gap-6 grid lg:grid-cols-2"><Card><CardHeader><CardTitle>Department distribution</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.departmentDistribution}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card><Card><CardHeader><CardTitle>Compensation change trend</CardTitle></CardHeader><CardContent className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={summary.recentSalaryChanges}><XAxis dataKey="employeeId" /><YAxis /><Tooltip /><Line type="monotone" dataKey="delta" stroke="#14b8a6" strokeWidth={2} /></LineChart></ResponsiveContainer></CardContent></Card></div>
    <Card><CardHeader><CardTitle>AI insights</CardTitle></CardHeader><CardContent className="space-y-3">{insights.map((insight) => <div key={insight} className="bg-slate-50 p-3 border rounded-lg text-slate-700 text-sm">{insight}</div>)}</CardContent></Card></div>;
}
