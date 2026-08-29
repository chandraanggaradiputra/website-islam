'use client';

import { useState } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';
import { WPMasjid } from '@/types';

export function InfaqModal({ masjid }: { masjid: WPMasjid }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { acf, title } = masjid;
  const showRekening = acf.nomor_rekening && acf.nama_bank;

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
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors mt-4"
      >
        Infaq Operasional Masjid
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Infaq & Sedekah</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center">
                Salurkan infaq terbaik Anda untuk operasional dan kemakmuran {title.rendered}.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center mb-6">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{acf.nama_bank}</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-bold tracking-wider text-slate-900 dark:text-white">
                    {acf.nomor_rekening}
                  </p>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                    aria-label="Salin nomor rekening"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  a.n. {acf.atas_nama_rekening}
                </p>
              </div>

              {acf.no_wa_dkm && (
                <button
                  onClick={handleKonfirmasiWA}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Konfirmasi via WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
