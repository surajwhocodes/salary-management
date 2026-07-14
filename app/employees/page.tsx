import Link from "next/link";
import { listEmployees } from "@/services/employeeService";
import { formatCurrency } from "@/utils/format";

export default function EmployeesPage() {
  const employees = listEmployees();

  return (
    <main className="flex flex-col gap-6 mx-auto p-8 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
            Talent operations
          </p>
          <h1 className="font-semibold text-3xl">Employees</h1>
        </div>
        <Link
          href="/"
          className="px-4 py-2 border rounded-lg font-medium text-sm"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="divide-y divide-slate-200 min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-left">Employee</th>
              <th className="px-4 py-3 font-semibold text-left">Department</th>
              <th className="px-4 py-3 font-semibold text-left">Country</th>
              <th className="px-4 py-3 font-semibold text-left">Net Salary</th>
              <th className="px-4 py-3 font-semibold text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-slate-500 text-xs">{employee.email}</p>
                </td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.country}</td>
                <td className="px-4 py-3">
                  {formatCurrency(employee.netSalary, employee.currency)}
                </td>
                <td className="px-4 py-3">{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
