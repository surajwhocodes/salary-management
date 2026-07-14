import { failure, success } from "@/lib/api-response";
import { employeeSchema } from "@/lib/validation";
import { createEmployee, listEmployees } from "@/services/employeeService";

export async function GET() {
  try {
    return success(await listEmployees());
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
