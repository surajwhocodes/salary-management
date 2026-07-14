import { describe, expect, it } from "vitest";
import { createEmployee, deleteEmployee, getEmployeeSummary, listEmployees } from "@/services/employeeService";

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
});
