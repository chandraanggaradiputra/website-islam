// app/jadwal-kajian/loading.tsx
import { KajianCardSkeleton } from '@/components/kajian/KajianCardSkeleton';

export default function JadwalKajianLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 animate-pulse">
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-2" />
        <div className="h-5 w-80 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Grid 6x Skeleton Kajian */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <KajianCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
