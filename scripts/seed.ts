import { getSupabaseServerClient } from "../lib/supabase";

const countries = [["United States", "USD"], ["India", "INR"], ["United Kingdom", "GBP"], ["Germany", "EUR"], ["Canada", "CAD"], ["Australia", "AUD"]] as const;
const departments = ["Engineering", "Product", "Marketing", "Finance", "People", "Operations"];
const firstNames = ["Aisha", "Liam", "Maya", "Noah", "Priya", "Owen", "Sofia", "Ethan", "Amara", "Lucas"];
const lastNames = ["Shah", "Williams", "Müller", "Patel", "Chen", "Brown", "Singh", "Garcia", "Khan", "Taylor"];

async function seed() {
  const client = getSupabaseServerClient();
  if (!client) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before seeding.");
  const { data: countryRows, error: countryError } = await client.from("countries").upsert(countries.map(([name, currency]) => ({ name, currency })), { onConflict: "name" }).select("id, name");
  if (countryError || !countryRows) throw new Error(countryError?.message ?? "Unable to seed countries");
  const { data: departmentRows, error: departmentError } = await client.from("departments").upsert(departments.map((name) => ({ name })), { onConflict: "name" }).select("id, name");
  if (departmentError || !departmentRows) throw new Error(departmentError?.message ?? "Unable to seed departments");
  const countryIds = new Map(countryRows.map((row) => [row.name, row.id]));
  const departmentIds = new Map(departmentRows.map((row) => [row.name, row.id]));
  const employees = Array.from({ length: 10_000 }, (_, index) => {
    const [country, currency] = countries[index % countries.length]; const department = departments[index % departments.length];
    const baseSalary = 52000 + (index % 24) * 6000; const bonus = Math.round(baseSalary * (0.06 + (index % 5) * 0.01)); const allowance = 1200 + (index % 6) * 350; const tax = Math.round((baseSalary + bonus + allowance) * (0.17 + (index % 4) * 0.03));
    return { employee_id: `NST-${String(index + 1).padStart(6, "0")}`, first_name: firstNames[index % firstNames.length], last_name: lastNames[Math.floor(index / firstNames.length) % lastNames.length], email: `employee.${index + 1}@northstar.example`, department_id: departmentIds.get(department), country_id: countryIds.get(country), currency, joining_date: `${2020 + (index % 6)}-${String((index % 12) + 1).padStart(2, "0")}-15`, employment_type: index % 8 === 0 ? "Contract" : "Full-Time", status: index % 29 === 0 ? "On Leave" : "Active", base_salary: baseSalary, bonus, allowance, tax, net_salary: baseSalary + bonus + allowance - tax, manager: ["Mina Patel", "Daniel Cruz", "Sarah Kim", "Alicia Brooks"][index % 4], last_updated: "2026-07-14" };
  });
  for (let start = 0; start < employees.length; start += 500) {
    const { error } = await client.from("employees").upsert(employees.slice(start, start + 500), { onConflict: "employee_id" });
    if (error) throw new Error(error.message);
  }
  console.log("Seeded 10,000 employees.");
}

void seed();
