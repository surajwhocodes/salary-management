import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center gap-4 p-10">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        404
      </p>
      <h1 className="text-3xl font-semibold">The requested view was not found.</h1>
      <p className="text-slate-600">
        The page you are looking for may have moved or never existed in the HR workspace.
      </p>
      <Link href="/" className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Return home
      </Link>
    </main>
  );
}
