import { NextResponse } from "next/server";
import { createEmployee, listEmployees } from "@/services/employeeService";
import { employeeSchema } from "@/lib/validation";

export async function GET() {
    const employees = await listEmployees();

    return NextResponse.json({
        success: true,
        data: employees,
    });
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const employee = employeeSchema.parse(payload);
        const created = await createEmployee(employee);

        return NextResponse.json(
            { success: true, data: created },
            { status: 201 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Invalid request",
            },
            { status: 400 },
        );
    }
}
