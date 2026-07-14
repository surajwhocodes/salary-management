import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col justify-center gap-4 mx-auto p-10 max-w-2xl min-h-[60vh]">
      <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
        404
      </p>
      <h1 className="font-semibold text-3xl">
        The requested view was not found.
      </h1>
      <p className="text-slate-600">
        The page you are looking for may have moved or never existed in the HR
        workspace.
      </p>
      <Link
        href="/"
        className="bg-slate-900 px-4 py-2 rounded-lg w-fit font-medium text-white text-sm"
      >
        Return home
      </Link>
    </main>
  );
}
