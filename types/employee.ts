export type EmploymentType = "Full-Time" | "Part-Time" | "Contract";
export type EmployeeStatus = "Active" | "On Leave" | "Terminated";

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    country: string;
    currency: string;
    joiningDate: string;
    employmentType: EmploymentType;
    status: EmployeeStatus;
    baseSalary: number;
    bonus: number;
    allowance: number;
    tax: number;
    netSalary: number;
    manager: string;
    lastUpdated: string;
}

export interface EmployeeSummary {
    totalEmployees: number;
    averageSalary: number;
    highestSalary: number;
    lowestSalary: number;
    payrollCost: number;
    countryDistribution: Array<{ name: string; value: number }>;
    departmentDistribution: Array<{ name: string; value: number }>;
    recentSalaryChanges: Array<{ employeeId: string; name: string; delta: number; date: string }>;
}

export interface AnalyticsPoint {
    label: string;
    value: number;
}
