"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const configured = hasSupabaseConfig();

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    void client.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return <main className="flex flex-col gap-6 mx-auto p-8 max-w-4xl"><div><p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">Account</p><h1 className="font-semibold text-3xl">Session overview</h1></div><div className="bg-white shadow-sm p-6 border border-slate-200 rounded-xl">{!configured ? <p className="text-slate-600">Demo mode has no user account. Configure Supabase to enable authenticated roles.</p> : email ? <div className="space-y-2"><p className="text-slate-500 text-sm">Signed in as</p><p className="font-semibold text-xl">{email}</p><p className="text-slate-600 text-sm">Role permissions are evaluated by Supabase Row Level Security.</p></div> : <div className="space-y-3"><p className="text-slate-600">No active session detected.</p><Link href="/login" className="inline-flex bg-slate-900 px-4 py-2 rounded-lg font-medium text-white text-sm">Sign in</Link></div>}</div></main>;
}
