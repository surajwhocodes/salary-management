"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, type SupabaseSession } from "@/lib/supabase";

export default function AccountPage() {
  const [session, setSession] = useState<SupabaseSession | null>(null);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    setSession(client.getSession());
  }, []);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Account</p>
        <h1 className="text-3xl font-semibold">Session overview</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {!session ? (
          <div className="space-y-3">
            <p className="text-slate-600">No active Supabase session detected.</p>
            <Link href="/login" className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Signed in as</p>
            <p className="text-xl font-semibold">{session.user.email}</p>
            <p className="text-sm text-slate-600">Role: {session.user.role}</p>
            <p className="text-sm text-slate-600">Token: {session.accessToken}</p>
          </div>
        )}
      </div>
    </main>
  );
}
