import { z } from "zod";

export const employeeSchema = z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    department: z.string().min(1, "Department is required"),
    country: z.string().min(1, "Country is required"),
    currency: z.string().min(1, "Currency is required"),
    joiningDate: z.string().min(1, "Joining date is required"),
    employmentType: z.enum(["Full-Time", "Part-Time", "Contract"]),
    status: z.enum(["Active", "On Leave", "Terminated"]),
    baseSalary: z.number().nonnegative(),
    bonus: z.number().nonnegative(),
    allowance: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    netSalary: z.number().nonnegative(),
    manager: z.string().min(1, "Manager is required"),
    lastUpdated: z.string().min(1, "Last updated is required"),
});

export const bulkUpdateSchema = z.object({
    department: z.string().optional(),
    country: z.string().optional(),
    percentage: z.number().min(0).max(100),
});

export const importCsvSchema = z.object({
    rows: z.array(employeeSchema),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
