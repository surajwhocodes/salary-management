"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/utils/format";
import { employeeApi } from "@/lib/client-api";
import type { Employee } from "@/types/employee";
import type { PagedEmployees } from "@/services/employeeService";
import { ChevronLeft, ChevronRight, Loader2, Search, UserPlus, Download } from "lucide-react";

const PAGE_LIMIT = 20;

function employeeDraft(employee?: Employee): Omit<Employee, "id"> {
  if (employee) {
    const draft = { ...employee };
    Reflect.deleteProperty(draft, "id");
    return draft;
  }
  return {
    employeeId: `NST-${Date.now().toString().slice(-5)}`,
    firstName: "",
    lastName: "",
    email: "",
    department: "Engineering",
    country: "United States",
    currency: "USD",
    joiningDate: new Date().toISOString().slice(0, 10),
    employmentType: "Full-Time",
    status: "Active",
    baseSalary: 80000,
    bonus: 8000,
    allowance: 2400,
    tax: 18000,
    netSalary: 72400,
    manager: "Mina Patel",
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

function EmployeeForm({
  employee,
  onClose,
  onSaved,
}: {
  employee?: Employee;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const draft = employeeDraft(employee);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const values = new FormData(event.currentTarget);
    const number = (name: string) => Number(values.get(name));
    const input = {
      ...draft,
      employeeId: String(values.get("employeeId")),
      firstName: String(values.get("firstName")),
      lastName: String(values.get("lastName")),
      email: String(values.get("email")),
      department: String(values.get("department")),
      country: String(values.get("country")),
      currency: String(values.get("currency")),
      baseSalary: number("baseSalary"),
      bonus: number("bonus"),
      allowance: number("allowance"),
      tax: number("tax"),
      netSalary: number("netSalary"),
      manager: String(values.get("manager")),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    try {
      if (employee) await employeeApi.update(employee.id, input);
      else await employeeApi.create(input);
      onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save employee");
    } finally {
      setSaving(false);
    }
  }

  const field = "mt-1 px-3 py-2 border border-slate-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition";

  return (
    <div className="fixed inset-0 z-20 flex justify-center items-start bg-slate-950/40 p-4 overflow-y-auto">
      <form onSubmit={submit} className="bg-white shadow-xl my-8 p-6 rounded-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-semibold text-xl">{employee ? "Edit employee" : "Add employee"}</h2>
            <p className="text-slate-500 text-sm">Compensation changes are retained in the audit trail when Supabase is connected.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close form" className="text-slate-500 hover:text-slate-900 transition-colors">
            ✕
          </button>
        </div>
        <div className="gap-4 grid sm:grid-cols-2">
          {(
            [
              ["employeeId", "Employee ID", "text"],
              ["firstName", "First name", "text"],
              ["lastName", "Last name", "text"],
              ["email", "Email", "email"],
              ["department", "Department", "text"],
              ["country", "Country", "text"],
              ["currency", "Currency", "text"],
              ["manager", "Manager", "text"],
              ["baseSalary", "Base salary", "number"],
              ["bonus", "Bonus", "number"],
              ["allowance", "Allowance", "number"],
              ["tax", "Tax", "number"],
              ["netSalary", "Net salary", "number"],
            ] as const
          ).map(([name, label, type]) => (
            <label key={name} className="font-medium text-slate-700 text-sm">
              {label}
              <input
                required
                name={name}
                type={type}
                defaultValue={String(draft[name as keyof typeof draft])}
                className={field}
              />
            </label>
          ))}
        </div>
        {error ? <p role="alert" className="mt-4 text-rose-600 text-sm">{error}</p> : null}
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-white text-sm disabled:opacity-70 transition-colors"
          >
            {saving ? "Saving…" : "Save employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

type PagedResult = { items: Employee[]; total: number } | null;

export function EmployeeViews() {
  const [result, setResult] = useState<PagedResult>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formEmployee, setFormEmployee] = useState<Employee | null | undefined>(undefined);
  const [removing, setRemoving] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  // Debounce search input by 350 ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setPage(1);
    }, 350);
  };

  const loadRef = useRef(0);

  // Async data fetching: setLoading/setError are called in async callbacks, not synchronously in the effect body.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const id = ++loadRef.current;
    setLoading(true);
    setError(null);
    void employeeApi
      .list({ page, limit: PAGE_LIMIT, ...(debouncedQuery ? { q: debouncedQuery } : {}) })
      .then((data) => {
        if (id !== loadRef.current) return;
        if (Array.isArray(data)) {
          setResult({ items: data as Employee[], total: (data as Employee[]).length });
        } else {
          setResult(data as PagedEmployees);
        }
      })
      .catch((reason: unknown) => {
        if (id !== loadRef.current) return;
        setError(reason instanceof Error ? reason.message : "Unable to load employees");
      })
      .finally(() => {
        if (id === loadRef.current) setLoading(false);
      });
  }, [page, debouncedQuery, refreshKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const employees = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const start = (page - 1) * PAGE_LIMIT + 1;
  const end = Math.min(page * PAGE_LIMIT, total);

  function exportCsv() {
    const headers = ["Employee ID", "Name", "Department", "Country", "Net salary", "Status"];
    const rows = employees.map((item) => [
      item.employeeId,
      `${item.firstName} ${item.lastName}`,
      item.department,
      item.country,
      item.netSalary,
      item.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "northstar-employees.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function remove(employee: Employee) {
    if (!window.confirm(`Remove ${employee.firstName} ${employee.lastName}?`)) return;
    setRemoving(employee.id);
    try {
      await employeeApi.remove(employee.id);
      refresh();
    } finally {
      setRemoving(null);
    }
  }

  const statusColor: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
    Terminated: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-5">
      {formEmployee !== undefined ? (
        <EmployeeForm
          employee={formEmployee ?? undefined}
          onClose={() => setFormEmployee(undefined)}
          onSaved={() => { refresh(); }}
        />
      ) : null}

      {/* Toolbar */}
      <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            aria-label="Search employees"
            className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
            placeholder="Search name, department, or country…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={() => setFormEmployee(null)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <UserPlus size={14} />
            Add employee
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <p role="alert" className="bg-rose-50 p-3 border border-rose-200 rounded-lg text-rose-800 text-sm">
          {error}
        </p>
      ) : null}

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
            <Loader2 size={24} className="animate-spin text-slate-500" />
          </div>
        )}
        <table className="divide-y divide-slate-200 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Employee", "Department", "Country", "Net salary", "Status", ""].map((label) => (
                <th key={label} className="px-4 py-3 font-semibold text-left text-slate-700 text-xs uppercase tracking-wide">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                  {debouncedQuery ? `No employees found for "${debouncedQuery}"` : "No employees yet."}
                </td>
              </tr>
            ) : null}
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{employee.firstName} {employee.lastName}</p>
                      <p className="text-slate-400 text-xs">{employee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{employee.department}</td>
                <td className="px-4 py-3 text-slate-600">{employee.country}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(employee.netSalary, employee.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[employee.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormEmployee(employee)}
                      className="text-slate-600 hover:text-slate-900 hover:underline text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      disabled={removing === employee.id}
                      onClick={() => void remove(employee)}
                      className="text-rose-600 hover:text-rose-800 disabled:opacity-50 hover:underline text-sm transition-colors"
                    >
                      {removing === employee.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">
          {total > 0 ? `Showing ${start}–${end} of ${total.toLocaleString()} employees` : "No results"}
        </p>
        <div className="flex items-center gap-1">
          <button
            aria-label="First page"
            disabled={page <= 1 || loading}
            onClick={() => setPage(1)}
            className="disabled:opacity-40 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
          >
            First
          </button>
          <button
            aria-label="Previous page"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="disabled:opacity-40 p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 py-1.5 font-medium text-sm text-slate-700 border border-slate-200 rounded-lg min-w-[80px] text-center">
            {page} / {totalPages}
          </span>
          <button
            aria-label="Next page"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="disabled:opacity-40 p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            aria-label="Last page"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(totalPages)}
            className="disabled:opacity-40 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
