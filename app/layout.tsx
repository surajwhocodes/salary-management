import type { Metadata } from "next";
import { Header } from "@/components/header";
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
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
