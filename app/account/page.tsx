"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createSupabaseBrowserClient,
  type SupabaseSession,
} from "@/lib/supabase";

export default function AccountPage() {
  const [session, setSession] = useState<SupabaseSession | null>(null);

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    setSession(client.getSession());
  }, []);

  return (
    <main className="flex flex-col gap-6 mx-auto p-8 max-w-4xl">
      <div>
        <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
          Account
        </p>
        <h1 className="font-semibold text-3xl">Session overview</h1>
      </div>

      <div className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">
        {!session ? (
          <div className="space-y-3">
            <p className="text-slate-600">
              No active Supabase session detected.
            </p>
            <Link
              href="/login"
              className="inline-flex bg-slate-900 px-4 py-2 rounded-lg font-medium text-white text-sm"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm">Signed in as</p>
            <p className="font-semibold text-xl">{session.user.email}</p>
            <p className="text-slate-600 text-sm">Role: {session.user.role}</p>
            <p className="text-slate-600 text-sm">
              Token: {session.accessToken}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
