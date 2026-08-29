import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Halaman Utama">
          <Moon className="w-6 h-6 text-[#093c96] dark:text-blue-400" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">Syiar Salaf</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
