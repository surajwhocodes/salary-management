import { describe, expect, it } from "vitest";
import { createEmployeeService, exportEmployeesCsv, paginateEmployees } from "@/services/employeeService";
import type { EmployeeRepository } from "@/repositories/employeeRepository";
import type { Employee } from "@/types/employee";

function createTestRepository(initialEmployees: Employee[] = []): EmployeeRepository {
    const employees = [...initialEmployees];

    return {
        async list() {
            return employees;
        },
        async get(id) {
            return employees.find((employee) => employee.id === id);
        },
        async create(input) {
            const employee = {
                ...input,
                id: input.id || `employee-${employees.length + 1}`,
            };
            employees.push(employee);
            return employee;
        },
        async update(id, input) {
            const index = employees.findIndex((employee) => employee.id === id);
            if (index === -1) {
                return undefined;
            }

            employees[index] = { ...employees[index], ...input };
            return employees[index];
        },
        async delete(id) {
            const index = employees.findIndex((employee) => employee.id === id);
            if (index === -1) {
                return false;
            }

            employees.splice(index, 1);
            return true;
        },
    };
}

function createSeedEmployee(id: string): Employee {
    return {
        id,
        employeeId: "E-9999",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        department: "Engineering",
        country: "USA",
        currency: "USD",
        joiningDate: "2024-01-01",
        employmentType: "Full-Time",
        status: "Active",
        baseSalary: 100000,
        bonus: 5000,
        allowance: 2000,
        tax: 25000,
        netSalary: 83000,
        manager: "Donna Lee",
        lastUpdated: "2026-07-14",
    };
}

describe("employeeService", () => {
    it("creates and lists employees", async () => {
        const service = createEmployeeService(createTestRepository());
        const employee = await service.createEmployee({
            employeeId: "E-9999",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            department: "Engineering",
            country: "USA",
            currency: "USD",
            joiningDate: "2024-01-01",
            employmentType: "Full-Time",
            status: "Active",
            baseSalary: 100000,
            bonus: 5000,
            allowance: 2000,
            tax: 25000,
            netSalary: 83000,
            manager: "Donna Lee",
            lastUpdated: "2026-07-14",
        });

        const result = await service.listEmployees();
        // Handle both array and paged result
        const employees = Array.isArray(result) ? result : result.items;

        expect(employee.employeeId).toBe("E-9999");
        expect(employees.some((entry) => entry.id === employee.id)).toBe(true);
    });

    it("summarizes payroll metrics", async () => {
        const service = createEmployeeService(createTestRepository([createSeedEmployee("employee-1")]));
        const summary = await service.getEmployeeSummary();
        expect(summary.totalEmployees).toBe(1);
        expect(summary.averageSalary).toBeGreaterThan(0);
        expect(summary.countryDistribution.length).toBeGreaterThan(0);
    });

    it("deletes an employee", async () => {
        const service = createEmployeeService(createTestRepository([createSeedEmployee("employee-1")]));
        const deleted = await service.deleteEmployee("employee-1");
        expect(deleted).toBe(true);
        const resultAfterDelete = await service.listEmployees();
        const employeesAfterDelete = Array.isArray(resultAfterDelete) ? resultAfterDelete : resultAfterDelete.items;
        expect(employeesAfterDelete).toHaveLength(0);
    });

    it("filters and paginates employees for HR workflows", async () => {
        const service = createEmployeeService(createTestRepository([createSeedEmployee("employee-1")]));
        const filtered = await service.searchEmployees("engineering");
        expect(filtered.length).toBe(1);
        const page = paginateEmployees(filtered, 1, 2);
        expect(page.items).toHaveLength(1);
        expect(page.page).toBe(1);
        expect(page.totalPages).toBeGreaterThan(0);
    });

    it("exports employee rows as csv and applies bulk updates", async () => {
        const service = createEmployeeService(createTestRepository([createSeedEmployee("employee-1")]));
        const result = await service.listEmployees();
        // Handle both array and paged result
        const employees = Array.isArray(result) ? result : result.items;
        const csv = exportEmployeesCsv(employees);
        expect(csv).toContain("employeeId");
        expect(csv).toContain("firstName");

        const updated = await service.applyBulkSalaryUpdate({ department: "Engineering", percentage: 5 });
        expect(updated).toBe(1);
        const engineering = await service.searchEmployees("engineering");
        expect(engineering.some((employee: { baseSalary: number }) => employee.baseSalary > 0)).toBe(true);
    });
});
