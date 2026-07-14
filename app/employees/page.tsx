"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmployeeViews } from "@/features/employee-views";
import { employeeApi } from "@/lib/client-api";
import type { Employee } from "@/types/employee";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = () => employeeApi.list().then(setEmployees).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load employees"));
  useEffect(() => { void load(); }, []);
  return <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl"><div className="flex justify-between items-center"><div><p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">Talent operations</p><h1 className="font-semibold text-3xl">Employees</h1></div><Link href="/" className="px-4 py-2 border rounded-lg font-medium text-sm">Back to dashboard</Link></div>{error ? <p role="alert" className="bg-rose-50 p-3 border border-rose-200 rounded-lg text-rose-800">{error}</p> : null}<div className="bg-white shadow-sm p-4 border border-slate-200 rounded-xl"><EmployeeViews employees={employees} onRefresh={load} /></div></main>;
}
