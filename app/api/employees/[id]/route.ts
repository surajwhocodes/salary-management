import { failure, success } from "@/lib/api-response";
import { employeeSchema } from "@/lib/validation";
import { deleteEmployee, getEmployee, updateEmployee } from "@/services/employeeService";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const employee = await getEmployee((await params).id);
    return employee ? success(employee) : failure(new Error("Employee not found"), "Employee not found", 404);
  } catch (error) {
    return failure(error, "Unable to load employee");
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const employee = await updateEmployee((await params).id, employeeSchema.partial().parse(await request.json()));
    return employee ? success(employee) : failure(new Error("Employee not found"), "Employee not found", 404);
  } catch (error) {
    return failure(error, "Unable to update employee");
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const deleted = await deleteEmployee((await params).id);
    return deleted ? new Response(null, { status: 204 }) : failure(new Error("Employee not found"), "Employee not found", 404);
  } catch (error) {
    return failure(error, "Unable to delete employee");
  }
}
