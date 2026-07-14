"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col gap-4 mx-auto p-10 max-w-2xl">
      <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
        Error
      </p>
      <h1 className="font-semibold text-3xl">Something went wrong</h1>
      <p className="text-slate-600">
        A non-critical issue interrupted the view. Please retry.
      </p>
      <button
        onClick={() => reset()}
        className="bg-slate-900 px-4 py-2 rounded-lg w-fit font-medium text-white text-sm"
      >
        Try again
      </button>
    </main>
  );
}
