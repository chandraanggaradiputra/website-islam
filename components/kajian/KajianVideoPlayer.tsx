'use client';

import React from 'react';
import { parseStreamingUrl } from '@/lib/utils/streamingUrl';
import { ExternalLink, Video, Play } from 'lucide-react';

interface KajianVideoPlayerProps {
  url: string | undefined | null;
  title?: string;
}

/**
 * Komponen pemutar streaming video responsif multi-platform
 * Mendukung embed YouTube (privacy-enhanced), Facebook Live / Video, dan kartu tautan platform eksternal (Zoom, IG).
 * Dilengkapi tombol aksi cadangan jika pemutar embed dibatasi oleh pemilik video.
 */
export function KajianVideoPlayer({ url, title }: KajianVideoPlayerProps) {
  const streamingInfo = parseStreamingUrl(url);

  if (!streamingInfo) return null;

  const { platform, embedUrl, originalUrl } = streamingInfo;

  return (
    <div className="space-y-3">
      {/* Kontainer Video Responsif 16:9 */}
      {embedUrl ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800">
          <iframe
            src={embedUrl}
            title={title || 'Rekaman Video Kajian'}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* Tampilan Kartu untuk Tautan Non-Embed (Zoom, Instagram, dsb.) */
        <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Video className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Siaran Online Kajian Tersedia
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Kajian ini disiarkan melalui tautan siaran eksternal.
              </p>
            </div>
          </div>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors shadow-sm min-h-[44px] cursor-pointer shrink-0"
          >
            <span>Buka Tautan Siaran</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Tombol Aksi Cadangan (Fallback Link Jika Embed Dibatasi oleh Pemilik Channel) */}
      {embedUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Pemutar video {platform === 'youtube' ? 'YouTube' : 'Facebook Live'}</span>
          </span>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] self-start sm:self-auto cursor-pointer"
            title={`Tonton langsung di ${platform === 'youtube' ? 'YouTube' : 'Facebook'}`}
          >
            <span>Buka langsung di {platform === 'youtube' ? 'YouTube' : 'Facebook'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
