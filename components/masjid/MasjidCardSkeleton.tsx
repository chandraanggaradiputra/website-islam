// components/masjid/MasjidCardSkeleton.tsx
export function MasjidCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full animate-pulse"
      aria-hidden="true"
    >
      {/* Thumbnail Banner Skeleton */}
      <div className="relative w-full aspect-video sm:h-48 bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800" />

      {/* Content Skeleton */}
      <div className="p-5 flex-grow space-y-3">
        {/* Title & Kota Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-5 w-20 bg-emerald-100/60 dark:bg-emerald-950/40 rounded" />
        </div>

        {/* Address */}
        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-4 w-4/5 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>

        {/* Facilities Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-5 w-28 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
      </div>

      {/* Bottom 2 Action Buttons Skeleton */}
      <div className="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800">
        <div className="min-h-[48px] border-r border-slate-100 dark:border-slate-800 flex items-center justify-center p-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="min-h-[48px] flex items-center justify-center p-3">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}
