export default function NotFound() {
  return (
    <main className="flex flex-col gap-4 mx-auto p-10 max-w-2xl">
      <p className="font-medium text-slate-500 text-sm uppercase tracking-[0.2em]">
        404
      </p>
      <h1 className="font-semibold text-3xl">Page not found</h1>
      <p className="text-slate-600">
        The requested view could not be found in the HR workspace.
      </p>
    </main>
  );
}
