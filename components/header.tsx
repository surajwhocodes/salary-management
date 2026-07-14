"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <header className="bg-white/80 backdrop-blur border-slate-200 border-b sticky top-0 z-50">
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mx-auto px-6 py-4 max-w-7xl">
        <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
          Northstar HR
        </Link>
        {!isLoginPage && (
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 font-medium text-slate-600 text-sm">
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
            <Link
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
