'use client';

import { CalendarPlus } from 'lucide-react';
import { WPKajian } from '@/types';

export function CalendarButton({ kajian }: { kajian: WPKajian }) {
  const { title, acf } = kajian;
  
  const generateGoogleCalendarUrl = () => {
    // Basic calendar URL generation
    let dateStr = acf.tanggal_kajian?.replace(/-/g, '') || '';
    if (!dateStr && acf.hari_kajian) {
       // if recurring, we just create a placeholder event for today's date + some logic,
       // but for simplicity, we let the user edit the date in gcal.
       const now = new Date();
       dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    }

    const startTime = acf.jam_mulai?.replace(':', '') + '00';
    const endTime = acf.jam_selesai?.replace(':', '') + '00';
    
    // Formatting for Google Calendar (YYYYMMDDTHHMMSS)
    // Adding Z for UTC if needed, or keeping it floating time.
    const start = `${dateStr}T${startTime || '000000'}`;
    const end = `${dateStr}T${endTime || '235959'}`;
    
    const text = encodeURIComponent(title.rendered);
    const details = encodeURIComponent(`Kajian bersama ${acf.nama_ustadz}\nKitab: ${acf.kitab_bahasan || '-'}\n\nVia Syiar Salaf`);
    const location = encodeURIComponent(
        typeof acf.masjid_terkait === 'object' ? acf.masjid_terkait?.title.rendered : ''
    );
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
    
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={generateGoogleCalendarUrl}
      className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
      aria-label="Simpan ke Google Calendar"
    >
      <CalendarPlus className="w-4 h-4" />
      <span>Google Calendar</span>
    </button>
  );
}
