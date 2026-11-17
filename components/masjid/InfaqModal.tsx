'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { WPMasjid } from '@/types';

export function InfaqModal({ masjid }: { masjid: WPMasjid }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { acf, title } = masjid;
  const showRekening = acf.nomor_rekening && acf.nama_bank;

  // Tutup modal saat user menekan Escape (R-32)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!showRekening) return null;

  const handleCopy = async () => {
    if (acf.nomor_rekening) {
      await navigator.clipboard.writeText(acf.nomor_rekening);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKonfirmasiWA = () => {
    const waText = encodeURIComponent(`Bismillah, admin DKM ${title.rendered}, saya telah mengirimkan infaq/sedekah ke rekening ${acf.nama_bank} - ${acf.nomor_rekening}. Mohon doa dan konfirmasinya. Barakallahu fiikum.`);
    window.open(`https://wa.me/${acf.no_wa_dkm}?text=${waText}`, '_blank');
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors mt-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        Infaq Operasional Masjid
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="infaq-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 id="infaq-modal-title" className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Infaq & Sedekah
              </h3>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                aria-label="Tutup dialog infaq"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center leading-relaxed">
                Salurkan infaq terbaik Anda untuk operasional dan kemakmuran {title.rendered}.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center mb-6">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{acf.nama_bank}</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-bold tracking-wider text-slate-900 dark:text-white font-mono">
                    {acf.nomor_rekening}
                  </p>
                  <button 
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Salin nomor rekening"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  a.n. {acf.atas_nama_rekening}
                </p>
              </div>

              {acf.no_wa_dkm && (
                <button
                  type="button"
                  onClick={handleKonfirmasiWA}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Konfirmasi via WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
