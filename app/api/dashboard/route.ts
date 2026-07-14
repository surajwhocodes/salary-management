import { failure, success } from "@/lib/api-response";
import { getAnalytics, getEmployeeSummary, getInsights } from "@/services/employeeService";

export async function GET() {
  try {
    const [summary, analytics, insights] = await Promise.all([getEmployeeSummary(), getAnalytics(), getInsights()]);
    return success({ summary, analytics, insights });
  } catch (error) {
    return failure(error, "Unable to load dashboard");
  }
}
