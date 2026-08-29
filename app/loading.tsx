export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-pulse">
      {/* Title skeleton */}
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64 mb-8"></div>
      
      {/* Grid skeleton (simulating cards like Kajian, Masjid, or Artikel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-96 flex flex-col">
            <div className="h-48 bg-slate-100 dark:bg-slate-800 w-full border-b border-slate-200 dark:border-slate-800"></div>
            <div className="p-6 flex-grow space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="space-y-2 mt-6">
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
