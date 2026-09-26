'use client';

import { useState } from 'react';
import { Copy, Check, MessageSquareShare } from 'lucide-react';
import { stripHtmlToWhatsAppText } from '@/lib/utils/whatsappText';

interface CopyWhatsAppButtonProps {
  textToCopy: string;
  title?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

/**
 * Tombol interaktif untuk menyalin teks format WhatsApp ke clipboard
 * Dilengkapi umpan balik visual dan memenuhi standar aksesibilitas WCAG 2.2 (min touch target 44px)
 */
export function CopyWhatsAppButton({
  textToCopy,
  title = 'Jadwal Kajian',
  className = '',
  variant = 'primary',
}: CopyWhatsAppButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;

    // Pastikan teks yang disalin ke clipboard membawa penanda asli WhatsApp (*teks*, _teks_, ~teks~).
    // Jika teks masih mengandung tag HTML, konversi kembali menggunakan stripHtmlToWhatsAppText.
    const cleanText = /<[a-z][\s\S]*>/i.test(textToCopy)
      ? stripHtmlToWhatsAppText(textToCopy)
      : textToCopy;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        // Fallback untuk lingkungan webview atau browser lama
        const textarea = document.createElement('textarea');
        textarea.value = cleanText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Gagal menyalin teks:', err);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        disabled={!textToCopy}
        aria-label={copied ? 'Format WhatsApp Tersalin!' : `Salin WA untuk ${title}`}
        title="Salin teks format WhatsApp"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50 ${
          copied
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50" />
            <span>Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Salin WA</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!textToCopy}
      aria-label={copied ? 'Format WhatsApp Tersalin!' : `Salin Format WhatsApp untuk ${title}`}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer disabled:opacity-50 ${
        copied
          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
          : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 animate-in zoom-in-50" />
          <span>✓ Format WhatsApp Tersalin!</span>
        </>
      ) : (
        <>
          <MessageSquareShare className="w-4 h-4" />
          <span>📋 Salin Format WhatsApp</span>
        </>
      )}
    </button>
  );
}
