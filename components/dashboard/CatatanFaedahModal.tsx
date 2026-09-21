'use client';

import { useState } from 'react';
import { WPKajian } from '@/types';
import { updateCatatanFaedahKajian } from '@/lib/actions/kajian';
import { decodeHtmlEntities } from '@/lib/utils/whatsappText';
import { getKajianCatatanFaedah } from '@/lib/kajian';
import { X, Loader2, BookOpen, Video, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface CatatanFaedahModalProps {
  kajian: WPKajian;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedFaedah: string, updatedStreaming: string) => void;
}

export function CatatanFaedahModal({
  kajian,
  isOpen,
  onClose,
  onSuccess,
}: CatatanFaedahModalProps) {
  const [faedah, setFaedah] = useState(() => getKajianCatatanFaedah(kajian));
  const [linkStreaming, setLinkStreaming] = useState(kajian.acf?.link_streaming || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await updateCatatanFaedahKajian(
        kajian.id,
        faedah,
        linkStreaming
      );

      if (res.success) {
        setSuccessMsg(res.message || 'Catatan faedah berhasil disimpan!');
        onSuccess(faedah.trim(), linkStreaming.trim());
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Gagal menyimpan catatan faedah kajian.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const plainTitle = decodeHtmlEntities(kajian.title?.rendered || 'Kajian Selesai');
  const ustadz = kajian.acf?.nama_ustadz || 'Asatidz';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                Isi Catatan & Faedah Kajian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dokumentasikan ringkasan ilmu & rekaman kajian yang telah selesai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informasi Kajian (Read-Only) */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Informasi Kajian
          </p>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {plainTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Pemateri: <span className="font-semibold">{ustadz}</span>
          </p>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ringkasan / Faedah Kajian</span>
            </label>
            <textarea
              value={faedah}
              onChange={(e) => setFaedah(e.target.value)}
              placeholder="Tuliskan poin-poin penting pembahasan kajian, mutiara faedah, ayat & hadits yang dibahas, atau catatan penting bagi jamaah..."
              rows={6}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Catatan ini akan tampil di bagian &quot;Catatan &amp; Ringkasan Faedah Kajian&quot; pada halaman arsip publik. Jika dikosongkan, seksi faedah tidak akan dimunculkan.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              <span>Link Video Rekaman / Streaming</span>
            </label>
            <input
              type="url"
              value={linkStreaming}
              onChange={(e) => setLinkStreaming(e.target.value)}
              placeholder="https://youtube.com/watch?v=... atau https://facebook.com/.../videos/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Mendukung embed video rekaman dari YouTube atau Facebook Live/Video.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Catatan Faedah</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
