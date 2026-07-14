"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    const client = getSupabaseBrowserClient();
    if (client) {
      await client.auth.signOut();
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur border-slate-200 border-b sticky top-0 z-50">
      <nav className="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
        <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
          Northstar HR
        </Link>
        
        {!isLoginPage && (
          <button
            className="sm:hidden p-2 text-slate-600 hover:text-slate-950 transition-colors focus:outline-none"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        )}

        {!isLoginPage && (
          <div className="hidden sm:flex items-center gap-x-6 font-medium text-slate-600 text-sm">
            <Link href="/" className="hover:text-slate-950 transition-colors">
              Dashboard
            </Link>
            <Link href="/employees" className="hover:text-slate-950 transition-colors">
              Employees
            </Link>
            <Link href="/analytics" className="hover:text-slate-950 transition-colors">
              Analytics
            </Link>
            <Link href="/account" className="hover:text-slate-950 transition-colors">
              Account
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Navigation Drawer */}
      {!isLoginPage && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 z-50 sm:hidden ${
              isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={`fixed inset-y-0 right-0 w-72 bg-white shadow-2xl border-l border-slate-200 z-50 p-6 flex flex-col justify-between transition-transform duration-300 transform sm:hidden ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-semibold text-slate-950 text-sm uppercase tracking-wider">
                  Navigation
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 font-medium text-slate-600 text-sm">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/employees"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors"
                >
                  Employees
                </Link>
                <Link
                  href="/analytics"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-950 transition-colors"
                >
                  Account
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full text-center bg-slate-900 hover:bg-slate-800 px-4 py-3 rounded-xl text-white font-medium transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-slate-900 hover:bg-slate-800 px-4 py-3 rounded-xl text-white font-medium transition-colors block"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
