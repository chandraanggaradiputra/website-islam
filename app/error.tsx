'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Ada Masalah Saat Memuat Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-lg">
          Mohon maaf, terjadi kesalahan pada server atau koneksi Anda. Silakan coba muat ulang halaman ini.
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-[#093c96] hover:bg-[#072a6b] dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
      >
        <RefreshCcw className="w-5 h-5" />
        Muat Ulang
      </button>
    </div>
  );
}
