// lib/utils.ts

/**
 * Normalisasi nomor WhatsApp ke format internasional 628xxx
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  return '62' + cleaned;
}

/**
 * Buat link Google Calendar Intent
 */
export function createGoogleCalendarUrl(params: {
  title: string;
  details: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;  // HH:mm
}): string {
  const { title, details, location, startDate, startTime, endTime } = params;
  
  // Format ISO ke YYYYMMDDTHHmmSS
  const startClean = `${startDate.replace(/-/g, '')}T${startTime.replace(':', '')}00`;
  const endClean = endTime
    ? `${startDate.replace(/-/g, '')}T${endTime.replace(':', '')}00`
    : `${startDate.replace(/-/g, '')}T210000`;

  const baseUrl = 'https://calendar.google.com/calendar/render';
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    location: location,
    dates: `${startClean}/${endClean}`,
  });

  return `${baseUrl}?${query.toString()}`;
}

/**
 * Buat link Share WhatsApp Kajian
 */
export function createKajianShareUrl(params: {
  title: string;
  ustadz: string;
  kitab?: string;
  waktu: string;
  masjid: string;
  url: string;
}): string {
  const text = `*INFO KAJIAN SUNNAH KOTA SERANG*\n\n` +
    `📖 *Tema:* ${params.title}\n` +
    `🎙️ *Pemateri:* ${params.ustadz}\n` +
    (params.kitab ? `📚 *Kitab:* ${params.kitab}\n` : '') +
    `⏰ *Waktu:* ${params.waktu}\n` +
    `🕌 *Lokasi:* ${params.masjid}\n\n` +
    `Detail lengkap: ${params.url}\n\n` +
    `_Disiarkan melalui Portal Dakwah Islam Kota Serang_`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}