'use client';

import { CalendarPlus } from 'lucide-react';
import { WPKajian, WPMasjid } from '@/types/wordpress';
import { createGoogleCalendarUrl } from '@/lib/utils/calendar';

interface CalendarButtonProps {
  kajian: WPKajian;
  masjid?: WPMasjid | null;
}

export function CalendarButton({ kajian, masjid }: CalendarButtonProps) {
  const calendarUrl = createGoogleCalendarUrl(kajian, masjid);

  return (
    <a
      href={calendarUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#093c96] dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm cursor-pointer"
      aria-label="Simpan ke Google Calendar"
    >
      <CalendarPlus className="w-4 h-4 text-[#093c96] dark:text-blue-400" />
      <span>Simpan ke Google Calendar</span>
    </a>
  );
}
