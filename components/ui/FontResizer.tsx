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
        onClick={() => updateFont(fontSize - 2)}
        aria-label="Perkecil teks"
        className="px-3 py-1 text-sm font-medium hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
      >
        A-
      </button>
      <span className="text-xs font-semibold px-2">{fontSize}px</span>
      <button
        onClick={() => updateFont(fontSize + 2)}
        aria-label="Perbesar teks"
        className="px-3 py-1 text-lg font-medium hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
      >
        A+
      </button>
    </div>
  );
}
