import { getAnalytics, getEmployeeSummary, getInsights } from "@/services/employeeService";
import { formatCurrency } from "@/utils/format";

export default function AnalyticsPage() {
  const analytics = getAnalytics();
  const insights = getInsights();
  const summary = getEmployeeSummary();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Analytics
        </p>
        <h1 className="text-3xl font-semibold">Compensation Intelligence</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Payroll Cost</h2>
          <p className="text-2xl font-semibold">{formatCurrency(summary.payrollCost)}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Average Salary</h2>
          <p className="text-2xl font-semibold">{formatCurrency(summary.averageSalary)}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Country Mix</h2>
          <p className="text-2xl font-semibold">{summary.countryDistribution.length}</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Average salary by department</h2>
          <ul className="space-y-3">
            {analytics.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span>{item.label}</span>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">AI-generated insights</h2>
          <ul className="space-y-3">
            {insights.map((item) => (
              <li key={item} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
