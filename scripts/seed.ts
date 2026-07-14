import { createEmployee } from "../services/employeeService";

const countries = ["USA", "UK", "Germany", "India", "Canada", "Australia"];
const departments = ["Engineering", "Marketing", "Finance", "HR", "Operations"];
const managers = ["Mina Patel", "Sarah Kim", "Alicia Brooks", "Daniel Cruz", "Lina Shah"];
const currencies: Record<string, string> = {
    USA: "USD",
    UK: "GBP",
    Germany: "EUR",
    India: "INR",
    Canada: "CAD",
    Australia: "AUD",
};

for (let i = 0; i < 12; i += 1) {
    const country = countries[i % countries.length];
    const department = departments[i % departments.length];
    createEmployee({
        employeeId: `E-${1000 + i}`,
        firstName: `Employee${i + 1}`,
        lastName: "Demo",
        email: `employee${i + 1}@northstar.io`,
        department,
        country,
        currency: currencies[country],
        joiningDate: "2022-01-01",
        employmentType: i % 2 === 0 ? "Full-Time" : "Contract",
        status: "Active",
        baseSalary: 70000 + i * 4000,
        bonus: 3000 + i * 500,
        allowance: 2000 + i * 200,
        tax: 14000 + i * 800,
        netSalary: 65000 + i * 3500,
        manager: managers[i % managers.length],
        lastUpdated: "2026-07-14",
    });
}

console.log("Seeded demo employees.");
