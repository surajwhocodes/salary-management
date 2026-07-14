import type { AnalyticsPoint, Employee, EmployeeSummary } from "@/types/employee";
import { employeeSchema } from "@/lib/validation";
import { SupabaseEmployeeRepository } from "@/repositories/employeeRepository";

interface PaginatedEmployees {
    items: Employee[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

const repository = new SupabaseEmployeeRepository();

export async function listEmployees(): Promise<Employee[]> {
    return repository.list();
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
    return repository.get(id);
}

export async function createEmployee(input: unknown): Promise<Employee> {
    const parsed = employeeSchema.parse(input);
    return repository.create(parsed as Employee);
}

export async function updateEmployee(id: string, input: unknown): Promise<Employee | undefined> {
    const parsed = employeeSchema.partial().parse(input);
    return repository.update(id, parsed as Partial<Employee>);
}

export async function deleteEmployee(id: string): Promise<boolean> {
    return repository.delete(id);
}

export async function searchEmployees(query: string): Promise<Employee[]> {
    const normalized = query.trim().toLowerCase();
    const employees = await listEmployees();
    if (!normalized) return employees;

    return employees.filter((employee) => {
        const haystack = `${employee.firstName} ${employee.lastName} ${employee.department} ${employee.country} ${employee.email}`.toLowerCase();
        return haystack.includes(normalized);
    });
}

export function paginateEmployees(items: Employee[], page: number, pageSize: number): PaginatedEmployees {
    const safePage = Math.max(1, page);
    const safeSize = Math.max(1, pageSize);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
    const currentPage = Math.min(safePage, totalPages);
    const startIndex = (currentPage - 1) * safeSize;
    const endIndex = startIndex + safeSize;

    return {
        items: items.slice(startIndex, endIndex),
        page: currentPage,
        pageSize: safeSize,
        totalPages,
        totalItems,
    };
}

export function exportEmployeesCsv(items: Employee[]): string {
    const headers = ["employeeId", "firstName", "lastName", "email", "department", "country", "netSalary", "status"];
    const rows = items.map((employee) => [employee.employeeId, employee.firstName, employee.lastName, employee.email, employee.department, employee.country, employee.netSalary.toString(), employee.status]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export async function applyBulkSalaryUpdate(input: { department?: string; country?: string; percentage: number }): Promise<number> {
    const employees = await listEmployees();
    const parsed = { department: input.department, country: input.country, percentage: input.percentage };
    let updatedCount = 0;

    for (const employee of employees) {
        const matchesDepartment = !parsed.department || employee.department === parsed.department;
        const matchesCountry = !parsed.country || employee.country === parsed.country;
        if (matchesDepartment && matchesCountry) {
            const updated = {
                ...employee,
                baseSalary: Math.round(employee.baseSalary * (1 + parsed.percentage / 100)),
                netSalary: Math.round(employee.netSalary * (1 + parsed.percentage / 100)),
                lastUpdated: new Date().toISOString().slice(0, 10),
            };
            await repository.update(employee.id, updated);
            updatedCount += 1;
        }
    }

    return updatedCount;
}

export async function getEmployeeSummary(): Promise<EmployeeSummary> {
    const employees = await listEmployees();
    const totalEmployees = employees.length;
    const averageSalary = employees.reduce((sum, employee) => sum + employee.netSalary, 0) / totalEmployees;
    const highestSalary = Math.max(...employees.map((employee) => employee.netSalary));
    const lowestSalary = Math.min(...employees.map((employee) => employee.netSalary));
    const payrollCost = employees.reduce((sum, employee) => sum + employee.baseSalary + employee.bonus + employee.allowance, 0);

    const countryDistribution = Object.entries(
        employees.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.country] = (acc[employee.country] || 0) + 1;
            return acc;
        }, {}),
    ).map(([name, value]) => ({ name, value }));

    const departmentDistribution = Object.entries(
        employees.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.department] = (acc[employee.department] || 0) + 1;
            return acc;
        }, {}),
    ).map(([name, value]) => ({ name, value }));

    const recentSalaryChanges = employees
        .slice(0, 5)
        .map((employee) => ({ employeeId: employee.employeeId, name: `${employee.firstName} ${employee.lastName}`, delta: employee.bonus, date: employee.lastUpdated }));

    return {
        totalEmployees,
        averageSalary,
        highestSalary,
        lowestSalary,
        payrollCost,
        countryDistribution,
        departmentDistribution,
        recentSalaryChanges,
    };
}

export async function getAnalytics(): Promise<AnalyticsPoint[]> {
    const employees = await listEmployees();
    const totals = employees.reduce<Record<string, number>>((acc, employee) => {
        acc[employee.department] = (acc[employee.department] || 0) + employee.netSalary;
        return acc;
    }, {});

    return Object.entries(totals).map(([label, value]) => ({ label, value }));
}

export async function getInsights(): Promise<string[]> {
    const employees = await listEmployees();
    const averageSalary = employees.reduce((sum, employee) => sum + employee.netSalary, 0) / employees.length;
    const topCountry = Object.entries(
        employees.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.country] = (acc[employee.country] || 0) + 1;
            return acc;
        }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USA";

    return [
        `${employees.filter((employee) => employee.department === "Engineering").length} engineering employees are contributing to the largest payroll cohort.`,
        `${topCountry} has the highest concentration of employees in the current roster.`,
        `The average salary is ${Math.round(averageSalary).toLocaleString()} and remains above the midpoint of the workforce.`,
    ];
}
