import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function failure(error: unknown, fallback = "Unable to process request", status = 400) {
  const message = error instanceof ZodError
    ? error.issues.map((issue) => issue.message).join(", ")
    : error instanceof Error ? error.message : fallback;
  return NextResponse.json({ success: false, error: message }, { status });
}
