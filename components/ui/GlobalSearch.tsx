'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, FileText, MapPin, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { globalSearch } from '@/lib/actions/search';
import { SearchResultItem } from '@/types';

interface GlobalSearchProps {
  triggerClassName?: string;
  triggerText?: string;
  iconOnly?: boolean;
}

export function GlobalSearch({ triggerClassName, triggerText = "Cari...", iconOnly = false }: GlobalSearchProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kajian':
        return 'bg-blue-100 text-[#093c96] dark:bg-blue-900/40 dark:text-blue-300';
      case 'masjid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      case 'artikel':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kajian':
        return <CalendarDays className="h-4 w-4" />;
      case 'masjid':
        return <MapPin className="h-4 w-4" />;
      case 'artikel':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={triggerClassName || "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"}
        aria-label="Pencarian Global"
      >
        <Search className="h-4 w-4 shrink-0" />
        {!iconOnly && (
          <>
            <span className="hidden sm:inline-block flex-1 text-left truncate">{triggerText}</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-300 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 shrink-0">
              <span className="text-xs">⌘</span>K
            </kbd>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 mx-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kajian, masjid, atau ustadz..."
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <p className="text-sm">Mencari hasil...</p>
                </div>
              )}

              {!isLoading && query.length > 0 && query.length < 2 && (
                <p className="text-center text-sm text-slate-500 py-6">
                  Ketik minimal 2 karakter untuk mencari.
                </p>
              )}

              {!isLoading && query.length >= 2 && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Search className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm">Tidak ada hasil yang ditemukan untuk &quot;{query}&quot;</p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {results.map((result) => (
                    <li key={`${result.category}-${result.id}`}>
                      <button
                        onClick={() => handleSelect(result.url)}
                        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-md p-1.5 ${getCategoryColor(result.category)}`}>
                            {getCategoryIcon(result.category)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#093c96] dark:group-hover:text-blue-400 transition-colors">
                              {result.title}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {result.subtitle}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getCategoryColor(result.category)}`}>
                          {result.badgeText}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center gap-4 text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">ESC</kbd>
                Tutup
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
