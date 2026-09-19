'use client';

import { useState } from 'react';
import { formatWhatsAppText } from '@/lib/utils/whatsappText';
import { MessageSquareShare, Eye, PenLine, Sparkles, HelpCircle } from 'lucide-react';

interface WhatsAppScratchpadProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

/**
 * Komponen Smart Scratchpad (Opsi A) untuk input teks siaran WhatsApp kajian
 * Dilengkapi tab tulis dan pratinjau live dengan rendering *bold*, _italic_, URL, dan teks Arab (RTL)
 */
export function WhatsAppScratchpad({
  id = 'content',
  name = 'content',
  label = 'Deskripsi / Teks Broadcast WhatsApp',
  value,
  defaultValue = '',
  onChange,
  rows = 7,
  placeholder,
  required = false,
}: WhatsAppScratchpadProps) {
  const [internalText, setInternalText] = useState(defaultValue);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showTips, setShowTips] = useState(false);

  const isControlled = value !== undefined;
  const currentText = isControlled ? value : internalText;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalText(val);
    }
    onChange?.(val);
  };

  const defaultPlaceholder =
    placeholder ||
    `Tempelkan atau ketik draf siaran WhatsApp kajian Anda di sini...\n\nContoh:\n﷽\n*INFO KAJIAN SUNNAH SERANG*\nTema: Meniti Jalan As-Salaf Ash-Shalih\nPemateri: Ustadz Abu Fulan\nWaktu: Ba'da Maghrib - Isya\nTempat: Masjid At-Taqwa, Serang\n\nInfo & Streaming: https://...`;

  const renderedPreview = formatWhatsAppText(currentText);

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 md:p-5 transition-all">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <MessageSquareShare className="w-4 h-4" />
          </div>
          <div>
            <label
              htmlFor={id}
              className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>{label}</span>
              {required && <span className="text-red-600 dark:text-red-400">*</span>}
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors p-0.5"
                title="Panduan format WhatsApp"
                aria-label="Panduan format WhatsApp"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Smart Scratchpad: tempel teks WA untuk referensi & publikasi deskripsi lengkap
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
              activeTab === 'write'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-pressed={activeTab === 'write'}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Tulis / Tempel Teks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[36px] ${
              activeTab === 'preview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-pressed={activeTab === 'preview'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau Web</span>
          </button>
        </div>
      </div>

      {/* Info Tips (Toggleable) */}
      {showTips && (
        <div className="mb-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs text-slate-600 dark:text-slate-300 space-y-1 animate-in fade-in duration-150">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Panduan Format Teks WhatsApp:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
            <li>Gunakan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-700 dark:text-emerald-400">*teks tebal*</code> untuk format <strong>tebal</strong>.</li>
            <li>Gunakan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-700 dark:text-emerald-400">_teks miring_</code> untuk format <em>miring</em>.</li>
            <li>Tautan URL (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://...</code>) otomatis menjadi link aktif yang dapat diklik.</li>
            <li>Teks berbahasa Arab (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">﷽</code>, kutipan hadits/ayat) otomatis diratakan ke kanan (RTL).</li>
          </ul>
        </div>
      )}

      {/* Tab 1: Write Area */}
      {activeTab === 'write' && (
        <div className="relative">
          <textarea
            id={id}
            name={name}
            dir="auto"
            rows={rows}
            value={currentText}
            onChange={handleTextChange}
            placeholder={defaultPlaceholder}
            required={required}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-sans leading-relaxed whitespace-pre-wrap transition-colors"
          />
          <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Mendukung teks Arab, emoji, dan format WhatsApp</span>
            <span>{currentText.length} karakter</span>
          </div>
        </div>
      )}

      {/* Tab 2: Live Preview */}
      {activeTab === 'preview' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950 p-4 min-h-[160px] text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto">
          {currentText.trim() ? (
            <div
              dir="auto"
              className="whitespace-pre-wrap break-words space-y-1"
              dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
              <Eye className="w-8 h-8 mb-2 opacity-40 text-emerald-600" />
              <p className="font-medium text-xs">Belum ada teks untuk dipratinjau</p>
              <p className="text-[11px] mt-0.5">
                Beralih ke tab <strong>Tulis / Tempel Teks</strong> untuk mengisi teks siaran WhatsApp.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
