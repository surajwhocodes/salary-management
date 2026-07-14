import { describe, expect, it } from "vitest";
import {
    applyBulkSalaryUpdate,
    createEmployee,
    deleteEmployee,
    exportEmployeesCsv,
    getEmployeeSummary,
    listEmployees,
    paginateEmployees,
    searchEmployees,
} from "@/services/employeeService";

describe("employeeService", () => {
    it("creates and lists employees", () => {
        const employee = createEmployee({
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

        expect(employee.employeeId).toBe("E-9999");
        expect(listEmployees().some((entry) => entry.id === employee.id)).toBe(true);
    });

    it("summarizes payroll metrics", () => {
        const summary = getEmployeeSummary();
        expect(summary.totalEmployees).toBeGreaterThan(0);
        expect(summary.averageSalary).toBeGreaterThan(0);
        expect(summary.countryDistribution.length).toBeGreaterThan(0);
    });

    it("deletes an employee", () => {
        const initialCount = listEmployees().length;
        const lastEmployee = listEmployees()[listEmployees().length - 1];
        const deleted = deleteEmployee(lastEmployee.id);
        expect(deleted).toBe(true);
        expect(listEmployees()).toHaveLength(initialCount - 1);
    });

    it("filters and paginates employees for HR workflows", () => {
        const filtered = searchEmployees("engineering");
        expect(filtered.length).toBeGreaterThan(0);
        const page = paginateEmployees(filtered, 1, 2);
        expect(page.items).toHaveLength(2);
        expect(page.page).toBe(1);
        expect(page.totalPages).toBeGreaterThan(0);
    });

    it("exports employee rows as csv and applies bulk updates", () => {
        const csv = exportEmployeesCsv(listEmployees());
        expect(csv).toContain("employeeId");
        expect(csv).toContain("firstName");

        const updated = applyBulkSalaryUpdate({ department: "Engineering", percentage: 5 });
        expect(updated).toBeGreaterThan(0);
        const engineering = searchEmployees("engineering");
        expect(engineering.some((employee) => employee.baseSalary > 0)).toBe(true);
    });
});
