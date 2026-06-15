// Skeleton placeholder used as the Suspense fallback for lazily loaded routes.
// A shaped skeleton reads as "content is coming" far better than a bare spinner
// and avoids the blank-flash-then-jump that a spinner causes.
export function Loading() {
  return (
    <div className="animate-fade-in space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
