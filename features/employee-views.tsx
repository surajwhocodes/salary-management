"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/utils/format";
import type { Employee } from "@/types/employee";

interface EmployeeViewsProps {
  readonly employees: Employee[];
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
      const haystack =
        `${employee.firstName} ${employee.lastName} ${employee.department} ${employee.country} ${employee.email}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [employees, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-5">
      <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
        <input
          aria-label="Search employees"
          className="px-3 py-2 border border-slate-300 rounded-lg w-full md:max-w-sm"
          placeholder="Search employee, department, or country"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <Link
          href="/analytics"
          className="font-medium text-slate-600 hover:text-slate-900 text-sm"
        >
          View insights →
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="divide-y divide-slate-200 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-left">Employee</th>
              <th className="px-4 py-3 font-semibold text-left">Department</th>
              <th className="px-4 py-3 font-semibold text-left">Country</th>
              <th className="px-4 py-3 font-semibold text-left">Net Salary</th>
              <th className="px-4 py-3 font-semibold text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-slate-500 text-xs">{employee.email}</p>
                </td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.country}</td>
                <td className="px-4 py-3">
                  {formatCurrency(employee.netSalary, employee.currency)}
                </td>
                <td className="px-4 py-3">{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">
          Showing {paged.length} of {filtered.length} employees
        </p>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous page"
            className="disabled:opacity-50 px-3 py-2 border rounded text-sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </button>
          <span className="font-medium text-sm">
            Page {currentPage} / {totalPages}
          </span>
          <button
            aria-label="Next page"
            className="disabled:opacity-50 px-3 py-2 border rounded text-sm"
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
