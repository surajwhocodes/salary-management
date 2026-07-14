import { NextResponse } from "next/server";
import { deleteEmployee, getEmployee, updateEmployee } from "@/services/employeeService";
import { employeeSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const employee = getEmployee(id);

    if (!employee) {
        return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const payload = await request.json();
        const employee = employeeSchema.partial().parse(payload);
        const updated = updateEmployee(id, employee);

        if (!updated) {
            return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deleted = deleteEmployee(id);

    if (!deleted) {
        return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: null }, { status: 204 });
}
