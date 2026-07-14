"use client";

import Link from "next/link";
import { EmployeeViews } from "@/features/employee-views";

export default function EmployeesPage() {
  return (
    <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">Talent operations</p>
          <h1 className="font-semibold text-3xl">Employees</h1>
        </div>
        <Link href="/" className="px-4 py-2 border rounded-lg font-medium text-sm">
          Back to dashboard
        </Link>
      </div>
      <div className="bg-white shadow-sm p-4 border border-slate-200 rounded-xl">
        <EmployeeViews />
      </div>
    </main>
  );
}
