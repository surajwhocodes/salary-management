"use client";

import { useEffect, useState } from "react";
import { dashboardApi, type DashboardData } from "@/lib/client-api";
import { formatCurrency } from "@/utils/format";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { void dashboardApi.get().then(setData); }, []);
  if (!data) return <main className="p-8 text-slate-500 text-sm">Loading analytics…</main>;
  const { summary, analytics, insights } = data;
  return <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl"><div><p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">Analytics</p><h1 className="font-semibold text-3xl">Compensation intelligence</h1></div><div className="gap-4 grid md:grid-cols-3">{[{ label: "Payroll cost", value: formatCurrency(summary.payrollCost) }, { label: "Average salary", value: formatCurrency(summary.averageSalary) }, { label: "Countries represented", value: summary.countryDistribution.length }].map((item) => <section key={item.label} className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl"><h2 className="mb-2 font-semibold text-lg">{item.label}</h2><p className="font-semibold text-2xl">{item.value}</p></section>)}</div><div className="gap-6 grid lg:grid-cols-2"><section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl"><h2 className="mb-4 font-semibold text-lg">Net payroll by department</h2><ul className="space-y-3">{analytics.map((item) => <li key={item.label} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"><span>{item.label}</span><span className="font-medium">{formatCurrency(item.value)}</span></li>)}</ul></section><section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl"><h2 className="mb-4 font-semibold text-lg">Data-driven insights</h2><ul className="space-y-3">{insights.map((item) => <li key={item} className="p-3 border border-slate-200 rounded-lg text-slate-700 text-sm">{item}</li>)}</ul></section></div></main>;
}
