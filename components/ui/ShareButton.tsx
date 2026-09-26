'use client';

import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    if (!url) {
      setTimeout(() => setCurrentUrl(window.location.href), 0);
    }
  }, [url]);

  const handleShare = () => {
    const shareText = `*${title}*\n${text}\n\nSelengkapnya: ${currentUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="min-h-[44px] flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm cursor-pointer"
      aria-label="Bagikan ke WhatsApp"
    >
      <Share2 className="w-4 h-4" />
      <span>Bagikan ke WhatsApp</span>
    </button>
  );
}
