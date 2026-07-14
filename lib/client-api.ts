import type { AnalyticsPoint, Employee, EmployeeSummary } from "@/types/employee";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (response.redirected || response.url.includes("/login")) {
      throw new Error("Authentication required");
    }
    throw new Error("The server returned an unexpected response.");
  }
  const body = await response.json() as ApiResponse<T>;
  if (!response.ok || !body.success) throw new Error(body.success ? "Request failed" : body.error);
  return body.data;
}

export const employeeApi = {
  list: () => request<Employee[]>("/api/employees"),
  create: (input: Omit<Employee, "id">) => request<Employee>("/api/employees", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: Partial<Employee>) => request<Employee>(`/api/employees/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => request<void>(`/api/employees/${id}`, { method: "DELETE" }),
};

export type DashboardData = { summary: EmployeeSummary; analytics: AnalyticsPoint[]; insights: string[] };
export const dashboardApi = { get: () => request<DashboardData>("/api/dashboard") };
