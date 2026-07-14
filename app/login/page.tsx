"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const client = createSupabaseBrowserClient();
    const result = await client.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? "/";
    router.replace(redirectTo);
  }

  return (
    <main className="flex flex-col justify-center mx-auto px-6 py-12 max-w-md min-h-[70vh]">
      <div className="bg-white shadow-sm p-8 border border-slate-200 rounded-2xl">
        <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
          Northstar HR
        </p>
        <h1 className="mt-2 font-semibold text-3xl">Sign in</h1>
        <p className="mt-2 text-slate-600 text-sm">
          Use your Supabase-backed HR credentials to continue.
        </p>

        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <label className="block font-medium text-slate-700 text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 px-3 py-2 border border-slate-300 rounded-lg w-full"
            />
          </label>
          <label className="block font-medium text-slate-700 text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 px-3 py-2 border border-slate-300 rounded-lg w-full"
            />
          </label>

          {error ? <p className="text-rose-600 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 disabled:opacity-70 px-4 py-2 rounded-lg w-full font-medium text-white text-sm"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
