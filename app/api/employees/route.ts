import { failure, success } from "@/lib/api-response";
import { employeeSchema } from "@/lib/validation";
import { createEmployee, listEmployees, searchEmployees } from "@/services/employeeService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const query = searchParams.get("q") || "";

    if (query) {
      const results = await searchEmployees(query);
      if (page && limit) {
        const start = (page - 1) * limit;
        return success({
          items: results.slice(start, start + limit),
          total: results.length,
        });
      }
      return success(results);
    }

    return success(await listEmployees({ page, limit }));
  } catch (error) {
    return failure(error, "Unable to load employees");
  }
}

export async function POST(request: Request) {
  try {
    const employee = await createEmployee(employeeSchema.parse(await request.json()));
    return success(employee, { status: 201 });
  } catch (error) {
    return failure(error, "Unable to create employee");
  }
}
