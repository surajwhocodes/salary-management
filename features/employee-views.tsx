"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { employeeApi } from "@/lib/client-api";
import type { Employee } from "@/types/employee";
import type { PagedEmployees } from "@/services/employeeService";
import { 
  ChevronLeft, ChevronRight, Loader2, Search, UserPlus, Download, 
  Filter, X, AlertCircle, Users, ChevronDown, ChevronUp,
  Calendar, Mail, Globe, Building, DollarSign
} from "lucide-react";

const PAGE_LIMIT = 20;

function employeeDraft(employee?: Employee): Omit<Employee, "id"> {
  if (employee) {
    const draft = { ...employee };
    Reflect.deleteProperty(draft, "id");
    return draft;
  }
  // Use a static timestamp for server-side rendering to avoid hydration mismatch
  const now = new Date();
  return {
    employeeId: `NST-${now.getTime().toString().slice(-5)}`,
    firstName: "",
    lastName: "",
    email: "",
    department: "Engineering",
    country: "United States",
    currency: "USD",
    joiningDate: now.toISOString().slice(0, 10),
    employmentType: "Full-Time",
    status: "Active",
    baseSalary: 80000,
    bonus: 8000,
    allowance: 2400,
    tax: 18000,
    netSalary: 72400,
    manager: "Mina Patel",
    lastUpdated: now.toISOString().slice(0, 10),
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

  const field = "mt-1 px-3 py-2.5 border border-slate-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200 hover:border-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white shadow-2xl my-8 p-8 rounded-2xl w-full max-w-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${employee ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                {employee ? <Users size={20} /> : <UserPlus size={20} />}
              </div>
              <h2 className="font-semibold text-2xl text-slate-900">{employee ? "Edit employee" : "Add new employee"}</h2>
            </div>
            <p className="text-slate-500 text-sm ml-11">Compensation changes are retained in the audit trail when Supabase is connected.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Close form" 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div className="gap-5 grid sm:grid-cols-2">
            {(
              [
                ["employeeId", "Employee ID", "text", "ID-001"],
                ["firstName", "First name", "text", "John"],
                ["lastName", "Last name", "text", "Doe"],
                ["email", "Email address", "email", "john.doe@example.com"],
                ["department", "Department", "text", "Engineering"],
                ["country", "Country", "text", "United States"],
                ["currency", "Currency", "text", "USD"],
                ["manager", "Manager", "text", "Jane Smith"],
                ["baseSalary", "Base salary", "number", "80000"],
                ["bonus", "Bonus", "number", "8000"],
                ["allowance", "Allowance", "number", "2400"],
                ["tax", "Tax", "number", "18000"],
                ["netSalary", "Net salary", "number", "72400"],
              ] as const
            ).map(([name, label, type, placeholder]) => (
              <div key={name} className="space-y-1.5">
                <label className="font-medium text-slate-700 text-sm flex items-center gap-1.5">
                  {label}
                  {["baseSalary", "bonus", "allowance", "tax", "netSalary"].includes(name) && (
                    <DollarSign size={12} className="text-slate-400" />
                  )}
                </label>
                <input
                  required
                  name={name}
                  type={type}
                  defaultValue={String(draft[name as keyof typeof draft])}
                  placeholder={placeholder}
                  className={field}
                />
              </div>
            ))}
          </div>
          
          {error ? (
            <div role="alert" className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-rose-900">Unable to save employee</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          ) : null}
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  {employee ? "Update employee" : "Add employee"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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
  const [confirmTarget, setConfirmTarget] = useState<Employee | null>(null);
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
    setConfirmTarget(employee);
  }

  async function confirmRemove() {
    if (!confirmTarget) return;
    setRemoving(confirmTarget.id);
    setConfirmTarget(null);
    try {
      await employeeApi.remove(confirmTarget.id);
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
    <div className="space-y-6">
      {formEmployee !== undefined ? (
        <EmployeeForm
          employee={formEmployee ?? undefined}
          onClose={() => setFormEmployee(undefined)}
          onSaved={() => { refresh(); }}
        />
      ) : null}

      {/* Remove confirmation dialog */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2.5 bg-rose-100 rounded-xl shrink-0">
                <AlertCircle size={22} className="text-rose-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Remove employee?</h2>
                <p className="text-slate-500 text-sm mt-1">
                  You're about to permanently remove{" "}
                  <span className="font-semibold text-slate-800">
                    {confirmTarget.firstName} {confirmTarget.lastName}
                  </span>{" "}
                  ({confirmTarget.employeeId}). This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmRemove()}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <AlertCircle size={15} />
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-blue-700/80 text-xs font-medium">Total</p>
                <p className="text-xl font-bold text-slate-900">{total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <Users size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-700/80 text-xs font-medium">Active</p>
                <p className="text-xl font-bold text-slate-900">
                  {employees.filter(e => e.status === "Active").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-violet-100/50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-lg">
                <Building size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-violet-700/80 text-xs font-medium">Departments</p>
                <p className="text-xl font-bold text-slate-900">
                  {[...new Set(employees.map(e => e.department))].length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Globe size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-amber-700/80 text-xs font-medium">Countries</p>
                <p className="text-xl font-bold text-slate-900">
                  {[...new Set(employees.map(e => e.country))].length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                aria-label="Search employees"
                className="pl-12 pr-10 py-3 border border-slate-300 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-300 hover:border-slate-400"
                placeholder="Search by name, department, country, or email…"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {/* Show spinner while fetching, clear-X when idle with a query */}
              {loading ? (
                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 pointer-events-none" />
              ) : query ? (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
            {debouncedQuery && (
              <p className="text-slate-500 text-sm mt-2 ml-1">
                Searching for "<span className="font-medium text-slate-700">{debouncedQuery}</span>" 
                {loading && "…"}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCsv}
              className="flex items-center gap-2.5 px-4 py-3 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl text-sm font-medium transition-all duration-200 group"
            >
              <Download size={16} className="text-slate-600 group-hover:text-slate-800" />
              Export CSV
            </button>
            <button
              onClick={() => setFormEmployee(null)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow group"
            >
              <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div role="alert" className="flex items-start gap-4 p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <div className="p-2.5 bg-rose-100 rounded-lg">
            <AlertCircle size={20} className="text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-rose-900 text-sm">Unable to load employees</h3>
            <p className="text-rose-700 text-sm mt-1">{error}</p>
            <button 
              onClick={refresh}
              className="mt-3 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                {[
                  { label: "Employee", icon: Users },
                  { label: "Department", icon: Building },
                  { label: "Country", icon: Globe },
                  { label: "Net Salary", icon: DollarSign },
                  { label: "Status", icon: null },
                  { label: "", icon: null },
                ].map(({ label, icon: Icon }) => (
                  <th key={label} className="px-3 py-3 font-semibold text-left text-slate-600 text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      {Icon && <Icon size={14} className="text-slate-400" />}
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Single tbody — rows stay visible (dimmed) while loading so layout is stable */}
            <tbody className={`divide-y divide-slate-100 transition-opacity duration-200 ${loading && employees.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              {/* First-load skeleton: no rows yet and still fetching */}
              {loading && employees.length === 0 && (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                          <div className="h-3 w-40 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  </tr>
                ))
              )}

              {/* Empty state: done loading, no results */}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Users size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        {debouncedQuery ? "No employees found" : "No employees yet"}
                      </h3>
                      <p className="text-slate-500 text-sm max-w-sm">
                        {debouncedQuery
                          ? `We couldn't find anyone matching "${debouncedQuery}". Try a different search term.`
                          : "Get started by adding your first employee to the system."
                        }
                      </p>
                      {!debouncedQuery && (
                        <button
                          onClick={() => setFormEmployee(null)}
                          className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          <UserPlus size={16} />
                          Add Employee
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows — rendered even while loading so the table never shrinks */}
              {employees.map((employee, index) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-slate-50/80 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{employee.firstName} {employee.lastName}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <Mail size={10} />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{employee.country}</td>
                    <td className="px-3 py-3">
                      <span className="font-bold text-slate-900">{formatCurrency(employee.netSalary, employee.currency)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[employee.status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {employee.status === "Active" && "● "}
                        {employee.status === "On Leave" && "◐ "}
                        {employee.status === "Terminated" && "○ "}
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/employees/${employee.id}/edit`}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all text-sm font-medium"
                          title="Edit employee"
                        >
                          Edit
                        </Link>
                        <button
                          disabled={removing === employee.id}
                          onClick={() => void remove(employee)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition-all text-sm font-medium"
                          title="Remove employee"
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
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-slate-600 text-sm font-medium">
            Showing <span className="text-slate-900">{start}</span> to <span className="text-slate-900">{end}</span> of <span className="text-slate-900">{total.toLocaleString()}</span> employees
          </p>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
            <button
              aria-label="First page"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              className="px-3 py-2 text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              First
            </button>
            <button
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm min-w-[90px] text-center">
              <span className="font-bold text-slate-900 text-sm">{page}</span>
              <span className="text-slate-400 text-xs mx-1">of</span>
              <span className="font-medium text-slate-600 text-sm">{totalPages}</span>
            </div>
            <button
              aria-label="Next page"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
            <button
              aria-label="Last page"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              className="px-3 py-2 text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
