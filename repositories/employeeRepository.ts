import type { Employee } from "@/types/employee";
import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

export interface EmployeeRepository {
  list(options?: { page?: number; limit?: number }): Promise<Employee[] | { items: Employee[]; total: number }>;
  get(id: string): Promise<Employee | undefined>;
  create(input: Employee): Promise<Employee>;
  update(id: string, input: Partial<Employee>): Promise<Employee | undefined>;
  delete(id: string): Promise<boolean>;
}

const countries = [
  ["United States", "USD"], ["India", "INR"], ["United Kingdom", "GBP"],
  ["Germany", "EUR"], ["Canada", "CAD"], ["Australia", "AUD"],
] as const;
const departments = ["Engineering", "Product", "Marketing", "Finance", "People", "Operations"];
const firstNames = ["Aisha", "Liam", "Maya", "Noah", "Priya", "Owen", "Sofia", "Ethan"];
const lastNames = ["Shah", "Williams", "Müller", "Patel", "Chen", "Brown", "Singh", "Garcia"];

function createDemoEmployees(): Employee[] {
  return Array.from({ length: 48 }, (_, index) => {
    const [country, currency] = countries[index % countries.length];
    const baseSalary = 58000 + (index % 12) * 8500;
    const bonus = Math.round(baseSalary * (0.06 + (index % 4) * 0.02));
    const allowance = 1800 + (index % 5) * 400;
    const tax = Math.round((baseSalary + bonus + allowance) * (0.18 + (index % 3) * 0.04));
    return {
      id: `demo-${index + 1}`,
      employeeId: `NST-${String(index + 1001).padStart(5, "0")}`,
      firstName: firstNames[index % firstNames.length],
      lastName: lastNames[index % lastNames.length],
      email: `${firstNames[index % firstNames.length].toLowerCase()}.${lastNames[index % lastNames.length].toLowerCase()}.${index + 1}@northstar.example`,
      department: departments[index % departments.length],
      country,
      currency,
      joiningDate: `${2021 + (index % 5)}-${String((index % 12) + 1).padStart(2, "0")}-15`,
      employmentType: index % 7 === 0 ? "Contract" : "Full-Time",
      status: index % 19 === 0 ? "On Leave" : "Active",
      baseSalary,
      bonus,
      allowance,
      tax,
      netSalary: baseSalary + bonus + allowance - tax,
      manager: ["Mina Patel", "Daniel Cruz", "Sarah Kim", "Alicia Brooks"][index % 4],
      lastUpdated: "2026-07-14",
    };
  });
}

class DemoEmployeeRepository implements EmployeeRepository {
  private readonly employees = createDemoEmployees();

  async list(options?: { page?: number; limit?: number }) {
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      return {
        items: this.employees.slice(start, end),
        total: this.employees.length,
      };
    }
    return [...this.employees];
  }
  async get(id: string) { return this.employees.find((employee) => employee.id === id); }
  async create(input: Employee) {
    const employee = { ...input, id: input.id || `demo-${Date.now()}` };
    this.employees.unshift(employee);
    return employee;
  }
  async update(id: string, input: Partial<Employee>) {
    const index = this.employees.findIndex((employee) => employee.id === id);
    if (index < 0) return undefined;
    this.employees[index] = { ...this.employees[index], ...input, id };
    return this.employees[index];
  }
  async delete(id: string) {
    const index = this.employees.findIndex((employee) => employee.id === id);
    if (index < 0) return false;
    this.employees.splice(index, 1);
    return true;
  }
}

function toEmployee(row: Record<string, unknown>): Employee {
  const department = row.departments as { name?: string } | null;
  const country = row.countries as { name?: string; currency?: string } | null;
  return {
    id: String(row.id), employeeId: String(row.employee_id), firstName: String(row.first_name),
    lastName: String(row.last_name), email: String(row.email), department: department?.name ?? "Unassigned",
    country: country?.name ?? "Unknown", currency: String(row.currency ?? country?.currency ?? "USD"),
    joiningDate: String(row.joining_date), employmentType: row.employment_type as Employee["employmentType"],
    status: row.status as Employee["status"], baseSalary: Number(row.base_salary), bonus: Number(row.bonus),
    allowance: Number(row.allowance), tax: Number(row.tax), netSalary: Number(row.net_salary),
    manager: String(row.manager), lastUpdated: String(row.last_updated),
  };
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
  private async referenceId(table: "departments" | "countries", name: string, currency?: string) {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured");
    const { data: existing, error: lookupError } = await client.from(table).select("id").eq("name", name).maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    if (existing) return Number((existing as { id: number }).id);
    const insert = table === "countries"
      ? client.from("countries").insert({ name, currency: currency ?? "USD" })
      : client.from("departments").insert({ name });
    const { data, error } = await insert.select("id").single();
    if (error || !data) throw new Error(error?.message ?? `Unable to create ${table} reference`);
    return Number((data as { id: number }).id);
  }

  private async writeRow(input: Employee, partial = false) {
    const departmentId = await this.referenceId("departments", input.department);
    const countryId = await this.referenceId("countries", input.country, input.currency);
    const row = {
      employee_id: input.employeeId, first_name: input.firstName, last_name: input.lastName, email: input.email,
      department_id: departmentId, country_id: countryId, currency: input.currency, joining_date: input.joiningDate,
      employment_type: input.employmentType, status: input.status, base_salary: input.baseSalary, bonus: input.bonus,
      allowance: input.allowance, tax: input.tax, net_salary: input.netSalary, manager: input.manager,
      last_updated: input.lastUpdated,
    };
    return partial ? row : row;
  }
  async list(options?: { page?: number; limit?: number }) {
    const client = getSupabaseServerClient();
    if (!client) return [];
    
    let query = client
      .from("employees")
      .select("*, departments(name), countries(name, currency)", { count: "exact" })
      .order("last_updated", { ascending: false });

    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;
    if (error || !data) throw new Error(error?.message ?? "Unable to load employees");
    
    const items = (data as unknown as Record<string, unknown>[]).map(toEmployee);
    
    if (options?.page && options?.limit) {
      return {
        items,
        total: count ?? 0,
      };
    }
    return items;
  }
  async get(id: string) {
    const client = getSupabaseServerClient();
    if (!client) return undefined;
    const { data, error } = await client.from("employees").select("*, departments(name), countries(name, currency)").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toEmployee(data as unknown as Record<string, unknown>) : undefined;
  }
  async create(input: Employee): Promise<Employee> {
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured");
    const row = await this.writeRow(input);
    const { data, error } = await client.from("employees").insert(row).select("*, departments(name), countries(name, currency)").single();
    if (error || !data) throw new Error(error?.message ?? "Unable to create employee");
    return toEmployee(data as unknown as Record<string, unknown>);
  }
  async update(id: string, input: Partial<Employee>): Promise<Employee | undefined> {
    const existing = await this.get(id);
    if (!existing) return undefined;
    const client = getSupabaseServerClient();
    if (!client) throw new Error("Supabase is not configured");
    const merged = { ...existing, ...input, id };
    const row = await this.writeRow(merged, true);
    const { data, error } = await client.from("employees").update(row).eq("id", id).select("*, departments(name), countries(name, currency)").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toEmployee(data as unknown as Record<string, unknown>) : undefined;
  }
  async delete(id: string) {
    const client = getSupabaseServerClient();
    if (!client) return false;
    const { error } = await client.from("employees").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}

const demoRepository = new DemoEmployeeRepository();

export function getEmployeeRepository(): EmployeeRepository {
  return hasSupabaseConfig() ? new SupabaseEmployeeRepository() : demoRepository;
}
