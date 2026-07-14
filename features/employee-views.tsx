"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/utils/format";
import type { Employee } from "@/types/employee";

interface EmployeeViewsProps {
  employees: Employee[];
}

export function EmployeeViews({ employees }: EmployeeViewsProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return employees;
    }

    return employees.filter((employee) => {
      const haystack = `${employee.firstName} ${employee.lastName} ${employee.department} ${employee.country} ${employee.email}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [employees, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          aria-label="Search employees"
          className="border border-slate-300 rounded-lg px-3 py-2 w-full md:max-w-sm"
          placeholder="Search employee, department, or country"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <Link href="/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          View insights →
        </Link>
      </div>

      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
        <table className="min-w-full text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Employee</th>
              <th className="px-4 py-3 text-left font-semibold">Department</th>
              <th className="px-4 py-3 text-left font-semibold">Country</th>
              <th className="px-4 py-3 text-left font-semibold">Net Salary</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                  <p className="text-xs text-slate-500">{employee.email}</p>
                </td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.country}</td>
                <td className="px-4 py-3">{formatCurrency(employee.netSalary, employee.currency)}</td>
                <td className="px-4 py-3">{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {paged.length} of {filtered.length} employees</p>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </button>
          <span className="text-sm font-medium">Page {currentPage} / {totalPages}</span>
          <button
            aria-label="Next page"
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
