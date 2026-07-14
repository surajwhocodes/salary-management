"use client";

import { useEffect, useState } from "react";
import {
  getAnalytics,
  getEmployeeSummary,
  getInsights,
} from "@/services/employeeService";
import { formatCurrency } from "@/utils/format";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<
    Awaited<ReturnType<typeof getAnalytics>>
  >([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getEmployeeSummary>
  > | null>(null);

  useEffect(() => {
    async function load() {
      const [analyticData, insightData, summaryData] = await Promise.all([
        getAnalytics(),
        getInsights(),
        getEmployeeSummary(),
      ]);

      setAnalytics(analyticData);
      setInsights(insightData);
      setSummary(summaryData);
    }

    void load();
  }, []);

  if (!summary) {
    return <div className="p-8 text-slate-500 text-sm">Loading analytics…</div>;
  }

  return (
    <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl">
      <div>
        <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
          Analytics
        </p>
        <h1 className="font-semibold text-3xl">Compensation Intelligence</h1>
      </div>

      <div className="gap-4 grid md:grid-cols-3">
        <section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
          <h2 className="mb-2 font-semibold text-lg">Payroll Cost</h2>
          <p className="font-semibold text-2xl">
            {formatCurrency(summary.payrollCost)}
          </p>
        </section>
        <section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
          <h2 className="mb-2 font-semibold text-lg">Average Salary</h2>
          <p className="font-semibold text-2xl">
            {formatCurrency(summary.averageSalary)}
          </p>
        </section>
        <section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
          <h2 className="mb-2 font-semibold text-lg">Country Mix</h2>
          <p className="font-semibold text-2xl">
            {summary.countryDistribution.length}
          </p>
        </section>
      </div>

      <div className="gap-6 grid lg:grid-cols-2">
        <section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
          <h2 className="mb-4 font-semibold text-lg">
            Average salary by department
          </h2>
          <ul className="space-y-3">
            {analytics.map((item) => (
              <li
                key={item.label}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
              >
                <span>{item.label}</span>
                <span className="font-medium">
                  {formatCurrency(item.value)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
          <h2 className="mb-4 font-semibold text-lg">AI-generated insights</h2>
          <ul className="space-y-3">
            {insights.map((item) => (
              <li
                key={item}
                className="p-3 border border-slate-200 rounded-lg text-slate-700 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
