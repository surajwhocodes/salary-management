import type { AnalyticsPoint, Employee, EmployeeSummary } from "@/types/employee";
import { employeeSchema } from "@/lib/validation";
import { getEmployeeRepository, type EmployeeRepository } from "@/repositories/employeeRepository";

interface PaginatedEmployees {
    items: Employee[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface EmployeeService {
    listEmployees: () => Promise<Employee[]>;
    getEmployee: (id: string) => Promise<Employee | undefined>;
    createEmployee: (input: unknown) => Promise<Employee>;
    updateEmployee: (id: string, input: unknown) => Promise<Employee | undefined>;
    deleteEmployee: (id: string) => Promise<boolean>;
    searchEmployees: (query: string) => Promise<Employee[]>;
    applyBulkSalaryUpdate: (input: { department?: string; country?: string; percentage: number }) => Promise<number>;
    getEmployeeSummary: () => Promise<EmployeeSummary>;
    getAnalytics: () => Promise<AnalyticsPoint[]>;
    getInsights: () => Promise<string[]>;
}

export function createEmployeeService(repository: EmployeeRepository = getEmployeeRepository()): EmployeeService {
    const listEmployees = async (): Promise<Employee[]> => repository.list();
    const getEmployee = async (id: string): Promise<Employee | undefined> => repository.get(id);
    const createEmployee = async (input: unknown): Promise<Employee> => {
        const parsed = employeeSchema.parse(input);
        return repository.create(parsed as Employee);
    };
    const updateEmployee = async (id: string, input: unknown): Promise<Employee | undefined> => {
        const parsed = employeeSchema.partial().parse(input);
        return repository.update(id, parsed as Partial<Employee>);
    };
    const deleteEmployee = async (id: string): Promise<boolean> => repository.delete(id);
    const searchEmployees = async (query: string): Promise<Employee[]> => {
        const normalized = query.trim().toLowerCase();
        const employees = await listEmployees();
        if (!normalized) {
            return employees;
        }

        return employees.filter((employee) => {
            const haystack = `${employee.firstName} ${employee.lastName} ${employee.department} ${employee.country} ${employee.email}`.toLowerCase();
            return haystack.includes(normalized);
        });
    };
    const applyBulkSalaryUpdate = async (input: { department?: string; country?: string; percentage: number }): Promise<number> => {
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
    };
    const getEmployeeSummary = async (): Promise<EmployeeSummary> => {
        const employees = await listEmployees();
        const totalEmployees = employees.length;
        const averageSalary = totalEmployees > 0 ? employees.reduce((sum, employee) => sum + employee.netSalary, 0) / totalEmployees : 0;
        const highestSalary = totalEmployees > 0 ? Math.max(...employees.map((employee) => employee.netSalary)) : 0;
        const lowestSalary = totalEmployees > 0 ? Math.min(...employees.map((employee) => employee.netSalary)) : 0;
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
    };
    const getAnalytics = async (): Promise<AnalyticsPoint[]> => {
        const employees = await listEmployees();
        const totals = employees.reduce<Record<string, number>>((acc, employee) => {
            acc[employee.department] = (acc[employee.department] || 0) + employee.netSalary;
            return acc;
        }, {});

        return Object.entries(totals).map(([label, value]) => ({ label, value }));
    };
    const getInsights = async (): Promise<string[]> => {
        const employees = await listEmployees();
        const averageSalary = employees.length > 0 ? employees.reduce((sum, employee) => sum + employee.netSalary, 0) / employees.length : 0;
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
    };

    return {
        listEmployees,
        getEmployee,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        searchEmployees,
        applyBulkSalaryUpdate,
        getEmployeeSummary,
        getAnalytics,
        getInsights,
    };
}

const defaultService = createEmployeeService();

export const listEmployees = defaultService.listEmployees;
export const getEmployee = defaultService.getEmployee;
export const createEmployee = defaultService.createEmployee;
export const updateEmployee = defaultService.updateEmployee;
export const deleteEmployee = defaultService.deleteEmployee;
export const searchEmployees = defaultService.searchEmployees;
export const applyBulkSalaryUpdate = defaultService.applyBulkSalaryUpdate;
export const getEmployeeSummary = defaultService.getEmployeeSummary;
export const getAnalytics = defaultService.getAnalytics;
export const getInsights = defaultService.getInsights;

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
