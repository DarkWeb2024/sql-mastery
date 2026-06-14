// A small, unobtrusive loading state used as the Suspense fallback for lazily
// loaded routes. Honors reduced motion via the spinner's CSS.
export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-slate-500" role="status" aria-live="polite">
      <span className="mr-3 inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 motion-reduce:animate-none" />
      {label}…
    </div>
  );
}
