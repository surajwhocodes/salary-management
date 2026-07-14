import { getAnalytics, getInsights } from "@/services/employeeService";

export default function AnalyticsPage() {
  const analytics = getAnalytics();
  const insights = getInsights();

  return (
    <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl">
      <div>
        <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
          Analytics
        </p>
        <h1 className="font-semibold text-3xl">Compensation Intelligence</h1>
      </div>

      <div className="gap-6 grid lg:grid-cols-2">
        <section className="bg-white shadow-sm p-6 border rounded-xl">
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
                  ${item.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white shadow-sm p-6 border rounded-xl">
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
