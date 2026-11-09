// components/kajian/KajianCardSkeleton.tsx
export function KajianCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full animate-pulse"
      aria-hidden="true"
    >
      {/* Thumbnail Banner Skeleton */}
      <div className="relative w-full aspect-video sm:h-48 bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800" />

      {/* Content Skeleton */}
      <div className="p-5 flex-grow space-y-3">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-5 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Info Rows */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-900/50">
        <div className="min-h-[48px] w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
