"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseConfig();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError("Add Supabase environment variables to enable sign-in.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const { error: signInError } = await client.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace(searchParams.get("redirectTo") ?? "/");
    router.refresh();
  }

  return (
    <main className="flex flex-col justify-center mx-auto px-6 py-12 max-w-md min-h-[70vh]">
      <div className="bg-white shadow-sm p-8 border border-slate-200 rounded-2xl">
        <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">Northstar HR</p>
        <h1 className="mt-2 font-semibold text-3xl">Sign in</h1>
        <p className="mt-2 text-slate-600 text-sm">Use your HR credentials to access protected salary data.</p>
        {!configured ? <p className="bg-amber-50 mt-4 p-3 border border-amber-200 rounded-lg text-amber-900 text-sm">Demo mode is enabled. Connect Supabase to turn on authentication.</p> : null}
        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          <label className="block font-medium text-slate-700 text-sm">Email<input name="email" type="email" required disabled={!configured} className="mt-1 px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 w-full" /></label>
          <label className="block font-medium text-slate-700 text-sm">Password<input name="password" type="password" required disabled={!configured} className="mt-1 px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100 w-full" /></label>
          {error ? <p role="alert" className="text-rose-600 text-sm">{error}</p> : null}
          <button type="submit" disabled={loading || !configured} className="bg-slate-900 disabled:opacity-70 px-4 py-2 rounded-lg w-full font-medium text-white text-sm">{loading ? "Signing in…" : "Continue"}</button>
        </form>
      </div>
    </main>
  );
}
