"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { employeeApi } from "@/lib/client-api";
import type { Employee } from "@/types/employee";
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  User, Mail, Building, Globe, DollarSign, Calendar, Briefcase,
  ShieldCheck, Hash, TrendingUp, Wallet,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(n);
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const STATUS_STYLES: Record<string, string> = {
  "Active":     "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Leave":   "bg-amber-50   text-amber-700   border-amber-200",
  "Terminated": "bg-rose-50    text-rose-700    border-rose-200",
};

const AVATAR_COLORS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-pink-400 to-fuchsia-500",
];

function avatarColor(name: string) {
  const i = (name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

// ─── shared input style ───────────────────────────────────────────────────────

const input =
  "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent " +
  "hover:border-slate-300 transition-all duration-200 bg-white " +
  "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

const selectCls = input;

function Field({
  label, hint, icon: Icon, name, type, defaultValue, readOnly, options, onChange,
}: {
  label: string;
  hint?: string;
  icon: React.ElementType;
  name: string;
  type: "text" | "email" | "number" | "date" | "select";
  defaultValue: string;
  readOnly?: boolean;
  options?: string[];
  onChange?: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <Icon size={11} className="text-slate-400" />
        {label}
      </label>
      {type === "select" ? (
        <select
          name={name}
          defaultValue={defaultValue}
          disabled={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={selectCls}
        >
          {options!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          required={!readOnly}
          readOnly={readOnly}
          disabled={readOnly}
          defaultValue={defaultValue}
          onChange={(e) => !readOnly && onChange?.(e.target.value)}
          className={input}
        />
      )}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── section wrapper ──────────────────────────────────────────────────────────

function Section({
  title, description, accent, children,
}: {
  title: string;
  description: string;
  accent: string;         // tailwind text colour for the dot
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <span className={`h-2 w-2 rounded-full ${accent} shrink-0`} />
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [employee, setEmployee]   = useState<Employee | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [saved,  setSaved]        = useState(false);
  const [dirty,  setDirty]        = useState(false);

  // Live values for derived display
  const [live, setLive] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    fetch(`/api/employees/${id}`, { headers: { "Content-Type": "application/json" } })
      .then((r) => r.json())
      .then((body: { success: boolean; data: Employee; error?: string }) => {
        if (!body.success) throw new Error(body.error ?? "Not found");
        setEmployee(body.data);
      })
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : "Unable to load employee"),
      );
  }, [id]);

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => { if (dirty && !saved) e.preventDefault(); };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty, saved]);

  const handleChange = useCallback((name: string, value: string) => {
    setDirty(true);
    setLive((prev) => {
      const next = { ...prev, [name]: value };
      if (["baseSalary", "bonus", "allowance", "tax"].includes(name)) {
        const base  = Number(next.baseSalary  ?? employee?.baseSalary  ?? 0);
        const bonus = Number(next.bonus        ?? employee?.bonus       ?? 0);
        const alw   = Number(next.allowance    ?? employee?.allowance   ?? 0);
        const tax   = Number(next.tax          ?? employee?.tax         ?? 0);
        next.netSalary = String(base + bonus + alw - tax);
      }
      return next;
    });
  }, [employee]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    setSaveError(null);
    const form = new FormData(e.currentTarget);
    const str  = (k: string) => String(form.get(k) ?? "");
    const num  = (k: string) => Number(form.get(k) ?? 0);

    try {
      const updated = await employeeApi.update(employee.id, {
        employeeId:     str("employeeId"),
        firstName:      str("firstName"),
        lastName:       str("lastName"),
        email:          str("email"),
        manager:        str("manager"),
        joiningDate:    str("joiningDate"),
        department:     str("department"),
        country:        str("country"),
        currency:       str("currency"),
        employmentType: str("employmentType") as Employee["employmentType"],
        status:         str("status")         as Employee["status"],
        baseSalary:     num("baseSalary"),
        bonus:          num("bonus"),
        allowance:      num("allowance"),
        tax:            num("tax"),
        netSalary:      num("netSalary"),
        lastUpdated:    new Date().toISOString().slice(0, 10),
      });
      setEmployee(updated);
      setDirty(false);
      setSaved(true);
      setTimeout(() => router.push("/employees"), 1400);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save employee");
    } finally {
      setSaving(false);
    }
  }

  // ── derived ───────────────────────────────────────────────────────────────

  const g = <K extends keyof Employee>(k: K): string =>
    String(live[k as string] ?? employee?.[k] ?? "");

  const liveNet    = Number(live.netSalary ?? employee?.netSalary ?? 0);
  const liveName   = `${g("firstName")} ${g("lastName")}`.trim();
  const liveStatus = g("status") as string;
  const liveDept   = g("department");
  const liveEmail  = g("email");

  // ── loading skeleton ──────────────────────────────────────────────────────

  if (loadError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex items-start gap-4 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <AlertCircle size={20} className="shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Could not load employee</p>
            <p className="text-sm mt-1">{loadError}</p>
            <Link href="/employees" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium underline">
              <ArrowLeft size={13} /> Back to employees
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 space-y-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-6">
            <div className="h-56 bg-slate-200 rounded-2xl" />
            <div className="h-44 bg-slate-200 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // ── form ──────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-32">

      {/* Back */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-5 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to employees
      </Link>

      {/* Hero header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 mb-6 text-white border border-slate-700/40 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${avatarColor(employee.firstName)} flex items-center justify-center font-bold text-white text-lg shrink-0 shadow`}>
            {initials(employee.firstName, employee.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Editing employee</p>
            <h1 className="text-xl font-bold truncate mt-0.5">{liveName || "—"}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-slate-400 text-xs font-mono">{employee.employeeId}</span>
              {liveDept && <><span className="text-slate-600 text-xs">·</span><span className="text-slate-300 text-xs">{liveDept}</span></>}
              {liveEmail && <><span className="text-slate-600 text-xs">·</span><span className="text-slate-400 text-xs">{liveEmail}</span></>}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[liveStatus] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                {liveStatus}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-slate-400 text-xs uppercase tracking-wider">Net salary</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{fmt(liveNet, g("currency") || "USD")}</p>
            <p className="text-slate-500 text-xs mt-0.5">annual</p>
          </div>
        </div>
      </div>

      {/* Banners */}
      {saved && (
        <div className="flex items-center gap-3 mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          Changes saved — returning to employee list…
        </div>
      )}
      {saveError && (
        <div className="flex items-start gap-3 mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          <AlertCircle size={16} className="mt-0.5 text-rose-600 shrink-0" />
          <div><p className="font-semibold">Unable to save</p><p className="mt-0.5">{saveError}</p></div>
        </div>
      )}
      {dirty && !saved && (
        <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          You have unsaved changes
        </div>
      )}

      {/* ── Two-column form ────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Profile identity */}
            <Section title="Identity" description="Name & contact" accent="bg-blue-400">
              <div className="space-y-4">
                <Field label="Employee ID" icon={Hash}      name="employeeId" type="text"  defaultValue={g("employeeId")} readOnly hint="System-assigned" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name"  icon={User} name="firstName" type="text" defaultValue={g("firstName")} onChange={(v) => handleChange("firstName", v)} />
                  <Field label="Last name"   icon={User} name="lastName"  type="text" defaultValue={g("lastName")}  onChange={(v) => handleChange("lastName",  v)} />
                </div>
                <Field label="Email"    icon={Mail}     name="email"   type="email" defaultValue={g("email")}   onChange={(v) => handleChange("email",   v)} />
                <Field label="Manager"  icon={User}     name="manager" type="text"  defaultValue={g("manager")} onChange={(v) => handleChange("manager", v)} />
                <Field label="Joining date" icon={Calendar} name="joiningDate" type="date" defaultValue={g("joiningDate")} onChange={(v) => handleChange("joiningDate", v)} />
              </div>
            </Section>

            {/* Employment */}
            <Section title="Employment" description="Role & contract type" accent="bg-violet-400">
              <div className="space-y-4">
                <Field label="Department" icon={Building}   name="department"     type="text"   defaultValue={g("department")}     onChange={(v) => handleChange("department",     v)} />
                <Field label="Country"    icon={Globe}      name="country"        type="text"   defaultValue={g("country")}        onChange={(v) => handleChange("country",        v)} />
                <Field label="Currency"   icon={Globe}      name="currency"       type="text"   defaultValue={g("currency")}       onChange={(v) => handleChange("currency",       v)} hint="ISO code e.g. USD" />
                <Field label="Type"       icon={Briefcase}  name="employmentType" type="select" defaultValue={g("employmentType")} onChange={(v) => handleChange("employmentType", v)}
                  options={["Full-Time", "Part-Time", "Contract"]} />
                <Field label="Status"     icon={ShieldCheck} name="status"        type="select" defaultValue={g("status")}         onChange={(v) => handleChange("status",         v)}
                  options={["Active", "On Leave", "Terminated"]} />
              </div>
            </Section>

          </div>

          {/* ── RIGHT MAIN ──────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Compensation inputs */}
            <Section title="Compensation" description="Salary components" accent="bg-emerald-400">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Base salary" icon={DollarSign}  name="baseSalary" type="number" defaultValue={g("baseSalary")} onChange={(v) => handleChange("baseSalary", v)} hint="Annual gross" />
                <Field label="Bonus"       icon={TrendingUp}  name="bonus"      type="number" defaultValue={g("bonus")}      onChange={(v) => handleChange("bonus",      v)} hint="Annual bonus" />
                <Field label="Allowance"   icon={Wallet}      name="allowance"  type="number" defaultValue={g("allowance")}  onChange={(v) => handleChange("allowance",  v)} hint="Annual allowance" />
                <Field label="Tax"         icon={DollarSign}  name="tax"        type="number" defaultValue={g("tax")}        onChange={(v) => handleChange("tax",        v)} hint="Annual deduction" />
              </div>

              {/* Net salary summary card */}
              <div className="mt-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Net salary (auto-calculated)</p>
                    <p className="text-xs text-slate-500 mt-0.5">Base + Bonus + Allowance − Tax</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">{fmt(liveNet, g("currency") || "USD")}</p>
                  <input type="hidden" name="netSalary" value={live.netSalary ?? String(employee.netSalary)} readOnly />
                </div>
              </div>
            </Section>

            {/* Compensation breakdown bar */}
            {liveNet > 0 && (() => {
              const base  = Number(live.baseSalary ?? employee.baseSalary);
              const bonus = Number(live.bonus      ?? employee.bonus);
              const alw   = Number(live.allowance  ?? employee.allowance);
              const tax   = Number(live.tax        ?? employee.tax);
              const gross = base + bonus + alw;
              const pct   = (v: number) => gross > 0 ? Math.round((v / gross) * 100) : 0;
              return (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Compensation breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: "Base salary", value: base,  pct: pct(base),  color: "bg-blue-500"    },
                      { label: "Bonus",        value: bonus, pct: pct(bonus), color: "bg-violet-500"  },
                      { label: "Allowance",    value: alw,   pct: pct(alw),   color: "bg-amber-500"   },
                      { label: "Tax (deducted)",value: tax,  pct: pct(tax),   color: "bg-rose-400"    },
                    ].map(({ label, value, pct: p, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-600 font-medium">{label}</span>
                          <span className="text-xs font-semibold text-slate-800">{fmt(value, g("currency") || "USD")} <span className="text-slate-400 font-normal">({p}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${p}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* Sticky footer action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between gap-4 shadow-lg">
          <p className="text-sm text-slate-500 hidden sm:block">
            {saved
              ? <span className="text-emerald-600 font-medium flex items-center gap-1.5"><CheckCircle2 size={14} /> Saved</span>
              : dirty
                ? <span className="text-amber-600 font-medium">● Unsaved changes</span>
                : <span>Last updated {employee.lastUpdated}</span>}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/employees"
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || saved}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm"
            >
              {saving  ? <><Loader2    size={15} className="animate-spin" /> Saving…</> :
               saved   ? <><CheckCircle2 size={15} /> Saved</> :
               "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
