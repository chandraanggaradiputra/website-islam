import { WPKajian, WPMasjid } from '@/types/wordpress';

/**
 * Mencari tanggal YYYY-MM-DD terdekat berikutnya berdasarkan nama hari
 */
function getNextDateForDay(dayName: string): string {
  const dayMap: Record<string, number> = {
    ahad: 0,
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };

  const targetDay = dayMap[dayName.trim().toLowerCase()];
  const now = new Date();
  
  if (targetDay === undefined) {
    return now.toISOString().split('T')[0];
  }

  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) {
    diff += 7; // Hari yang sama atau sudah lewat -> jadwalkan untuk pekan depan
  }

  const nextDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
  return nextDate.toISOString().split('T')[0];
}

/**
 * Menghasilkan URL resmi Google Calendar untuk jadwal kajian
 */
export function createGoogleCalendarUrl(kajian: WPKajian, masjid?: WPMasjid | null): string {
  const rawTitle = kajian.title?.rendered ? kajian.title.rendered.replace(/<[^>]+>/g, '').trim() : 'Jadwal Kajian Islam';
  const title = rawTitle.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)).replace(/&amp;/g, '&');
  const ustadz = kajian.acf?.nama_ustadz || 'Asatidz';
  const kitab = kajian.acf?.kitab_bahasan || '';
  const masjidName =
    masjid?.title?.rendered?.replace(/<[^>]+>/g, '').trim() ||
    (typeof kajian.acf?.masjid_terkait === 'object' && kajian.acf?.masjid_terkait !== null
      ? (kajian.acf.masjid_terkait as any).title?.rendered?.replace(/<[^>]+>/g, '').trim()
      : (kajian.acf?.nama_masjid_manual || kajian.masjid_name || 'Masjid di Banten'));
  const alamat = masjid?.acf?.alamat_lengkap || '';
  const gmaps = masjid?.acf?.google_maps_url || '';
  const jamMulai = kajian.acf?.jam_mulai || '18:30';
  const jamSelesai = kajian.acf?.jam_selesai || '20:00';

  // 1. Tentukan Tanggal Pelaksanaan
  let eventDate = kajian.acf?.tanggal_kajian;
  if (!eventDate && kajian.acf?.hari_kajian) {
    eventDate = getNextDateForDay(kajian.acf.hari_kajian);
  }
  if (!eventDate) {
    eventDate = new Date().toISOString().split('T')[0];
  }

  // Normalisasi YYYYMMDD -> YYYY-MM-DD
  if (eventDate.length === 8 && !eventDate.includes('-')) {
    eventDate = `${eventDate.slice(0, 4)}-${eventDate.slice(4, 6)}-${eventDate.slice(6, 8)}`;
  }

  // 2. Konversi Waktu WIB (+07:00) ke format UTC ISO string (YYYYMMDDTHHmmssZ)
  const [startH, startM] = jamMulai.split(':').map(Number);
  const [endH, endM] = jamSelesai.split(':').map(Number);

  const validStartH = isNaN(startH) ? 18 : startH;
  const validStartM = isNaN(startM) ? 30 : startM;
  const validEndH = isNaN(endH) ? validStartH + 2 : endH;
  const validEndM = isNaN(endM) ? validStartM : endM;

  const startDateLocal = new Date(`${eventDate}T${String(validStartH).padStart(2, '0')}:${String(validStartM).padStart(2, '0')}:00+07:00`);
  let endDateLocal = new Date(`${eventDate}T${String(validEndH).padStart(2, '0')}:${String(validEndM).padStart(2, '0')}:00+07:00`);

  if (isNaN(endDateLocal.getTime()) || endDateLocal.getTime() <= startDateLocal.getTime()) {
    endDateLocal = new Date(startDateLocal.getTime() + 90 * 60 * 1000);
  }

  const formatUtcGcal = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const datesParam = `${formatUtcGcal(startDateLocal)}/${formatUtcGcal(endDateLocal)}`;

  // 3. Susun Deskripsi Lengkap Acara
  const detailLines: string[] = [
    `Kajian Islam Ilmiah - Banten Mengaji`,
    kitab ? `Kitab: ${kitab}` : '',
    `Pemateri: ${ustadz}`,
    `Tempat: ${masjidName}`,
    alamat ? `Alamat: ${alamat}` : '',
    gmaps ? `Google Maps: ${gmaps}` : '',
    `\nInformasi Resmi: https://banten-mengaji.vercel.app/jadwal-kajian/${kajian.slug}`,
  ].filter(Boolean);

  const details = detailLines.join('\n');
  const location = alamat ? `${masjidName}, ${alamat}` : masjidName;

  // 4. Susun Parameter URL
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: kitab ? `Kajian: ${kitab} - ${ustadz}` : `Kajian: ${title}`,
    dates: datesParam,
    details: details,
    location: location,
    ctz: 'Asia/Jakarta',
  });

  // Jika kajian rutin pekanan, tambahkan aturan pengulangan mingguan
  if (kajian.acf?.jenis_kajian === 'rutin') {
    params.set('recur', 'RRULE:FREQ=WEEKLY');
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
