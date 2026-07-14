import Link from "next/link";
import { listEmployees } from "@/services/employeeService";
import { EmployeeViews } from "@/features/employee-views";

export default function EmployeesPage() {
  const employees = listEmployees();

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Talent operations
          </p>
          <h1 className="text-3xl font-semibold">Employees</h1>
        </div>
        <Link href="/" className="rounded-lg border px-4 py-2 text-sm font-medium">
          Back to dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <EmployeeViews employees={employees} />
      </div>
    </main>
  );
}
