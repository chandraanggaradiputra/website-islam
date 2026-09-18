'use client';

import { useState, useEffect } from 'react';

export function FontResizer() {
  const [fontSize, setFontSize] = useState<number>(18);

  useEffect(() => {
    const saved = localStorage.getItem('articleFontSize');
    if (saved) {
      setTimeout(() => setFontSize(Number(saved)), 0);
      document.documentElement.style.setProperty('--article-font-size', `${saved}px`);
    }
  }, []);

  const updateFont = (newSize: number) => {
    if (newSize >= 14 && newSize <= 30) {
      setFontSize(newSize);
      localStorage.setItem('articleFontSize', newSize.toString());
      document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
      <button
        type="button"
        onClick={() => updateFont(fontSize - 2)}
        aria-label="A- (Perkecil ukuran teks)"
        className="min-h-[36px] min-w-[36px] flex items-center justify-center px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
      >
        A-
      </button>
      <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">{fontSize}px</span>
      <button
        type="button"
        onClick={() => updateFont(fontSize + 2)}
        aria-label="A+ (Perbesar ukuran teks)"
        className="min-h-[36px] min-w-[36px] flex items-center justify-center px-2 py-1 text-base font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
      >
        A+
      </button>
    </div>
  );
}
