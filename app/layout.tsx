import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar Salary Management",
  description: "A startup-grade employee salary management platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-slate-50 min-h-full text-slate-950">
        <div className="min-h-screen">
          <header className="bg-white/80 backdrop-blur border-slate-200 border-b">
            <nav className="flex justify-between items-center mx-auto px-6 py-4 max-w-7xl">
              <Link href="/" className="font-semibold text-lg">
                Northstar HR
              </Link>
              <div className="flex items-center gap-4 font-medium text-slate-600 text-sm">
                <Link href="/" className="hover:text-slate-950">
                  Dashboard
                </Link>
                <Link href="/employees" className="hover:text-slate-950">
                  Employees
                </Link>
                <Link href="/analytics" className="hover:text-slate-950">
                  Analytics
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
