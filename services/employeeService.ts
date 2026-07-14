import type { AnalyticsPoint, Employee, EmployeeSummary } from "@/types/employee";
import { employeeSchema } from "@/lib/validation";

interface PaginatedEmployees {
    items: Employee[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

const employeeSeed: Employee[] = [
    {
        id: "emp-001",
        employeeId: "E-1001",
        firstName: "Amelia",
        lastName: "Chen",
        email: "amelia.chen@northstar.io",
        department: "Engineering",
        country: "USA",
        currency: "USD",
        joiningDate: "2021-02-14",
        employmentType: "Full-Time",
        status: "Active",
        baseSalary: 180000,
        bonus: 12000,
        allowance: 8000,
        tax: 42000,
        netSalary: 152000,
        manager: "Mina Patel",
        lastUpdated: "2026-06-02",
    },
    {
        id: "emp-002",
        employeeId: "E-1002",
        firstName: "Diego",
        lastName: "Martinez",
        country: "UK",
        department: "Marketing",
        email: "diego.martinez@northstar.io",
        currency: "GBP",
        joiningDate: "2019-10-01",
        employmentType: "Full-Time",
        status: "Active",
        baseSalary: 124000,
        bonus: 9000,
        allowance: 6000,
        tax: 28000,
        netSalary: 111000,
        manager: "Sarah Kim",
        lastUpdated: "2026-05-28",
    },
    {
        id: "emp-003",
        employeeId: "E-1003",
        firstName: "Naomi",
        lastName: "Singh",
        email: "naomi.singh@northstar.io",
        department: "Finance",
        country: "India",
        currency: "INR",
        joiningDate: "2020-07-11",
        employmentType: "Full-Time",
        status: "Active",
        baseSalary: 950000,
        bonus: 48000,
        allowance: 32000,
        tax: 180000,
        netSalary: 840000,
        manager: "Alicia Brooks",
        lastUpdated: "2026-06-10",
    },
];

const employeeStore: Employee[] = [...employeeSeed];

export function listEmployees(): Employee[] {
    return [...employeeStore];
}

export function getEmployee(id: string): Employee | undefined {
    return employeeStore.find((employee) => employee.id === id);
}

export function createEmployee(input: unknown): Employee {
    const parsed = employeeSchema.parse(input);
    const employee: Employee = {
        ...parsed,
        id: `emp-${employeeStore.length + 1}`.padStart(12, "0"),
    };
    employeeStore.push(employee);
    return employee;
}

export function updateEmployee(id: string, input: unknown): Employee | undefined {
    const parsed = employeeSchema.partial().parse(input);
    const index = employeeStore.findIndex((employee) => employee.id === id);
    if (index < 0) return undefined;
    employeeStore[index] = { ...employeeStore[index], ...parsed };
    return employeeStore[index];
}

export function deleteEmployee(id: string): boolean {
    const index = employeeStore.findIndex((employee) => employee.id === id);
    if (index < 0) return false;
    employeeStore.splice(index, 1);
    return true;
}

export function searchEmployees(query: string): Employee[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return listEmployees();

    return listEmployees().filter((employee) => {
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

export function applyBulkSalaryUpdate(input: { department?: string; country?: string; percentage: number }): number {
    const parsed = { department: input.department, country: input.country, percentage: input.percentage };
    let updatedCount = 0;

    employeeStore.forEach((employee) => {
        const matchesDepartment = !parsed.department || employee.department === parsed.department;
        const matchesCountry = !parsed.country || employee.country === parsed.country;
        if (matchesDepartment && matchesCountry) {
            employee.baseSalary = Math.round(employee.baseSalary * (1 + parsed.percentage / 100));
            employee.netSalary = Math.round(employee.netSalary * (1 + parsed.percentage / 100));
            employee.lastUpdated = new Date().toISOString().slice(0, 10);
            updatedCount += 1;
        }
    });

    return updatedCount;
}

export function getEmployeeSummary(): EmployeeSummary {
    const totalEmployees = employeeStore.length;
    const averageSalary = employeeStore.reduce((sum, employee) => sum + employee.netSalary, 0) / totalEmployees;
    const highestSalary = Math.max(...employeeStore.map((employee) => employee.netSalary));
    const lowestSalary = Math.min(...employeeStore.map((employee) => employee.netSalary));
    const payrollCost = employeeStore.reduce((sum, employee) => sum + employee.baseSalary + employee.bonus + employee.allowance, 0);

    const countryDistribution = Object.entries(
        employeeStore.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.country] = (acc[employee.country] || 0) + 1;
            return acc;
        }, {}),
    ).map(([name, value]) => ({ name, value }));

    const departmentDistribution = Object.entries(
        employeeStore.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.department] = (acc[employee.department] || 0) + 1;
            return acc;
        }, {}),
    ).map(([name, value]) => ({ name, value }));

    const recentSalaryChanges = employeeStore
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

export function getAnalytics(): AnalyticsPoint[] {
    return [
        { label: "Engineering", value: 180000 },
        { label: "Marketing", value: 111000 },
        { label: "Finance", value: 840000 },
    ];
}

export function getInsights(): string[] {
    return [
        "Engineering payroll increased 12% this quarter.",
        "USA has the highest average salary.",
        "Marketing salaries are below company average.",
    ];
}
