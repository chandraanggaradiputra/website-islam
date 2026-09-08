/**
 * Helper utilitas untuk jadwal kajian
 */

function extractTime(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }
  return null;
}

/**
 * Memvalidasi apakah kajian tematik telah melewati tanggal & jam pelaksanaannya.
 * Berdasarkan zona waktu Indonesia Barat (WIB / +07:00).
 * Kajian Rutin tanpa tanggal_kajian spesifik tidak pernah kedaluwarsa secara otomatis (return false).
 */
export function isKajianExpired(
  tanggalKajian?: string,
  jamSelesai?: string,
  jamMulai?: string
): boolean {
  if (!tanggalKajian || typeof tanggalKajian !== 'string' || !tanggalKajian.trim()) {
    return false;
  }

  const rawDate = tanggalKajian.trim();
  let dateFormatted = '';

  // Format YYYYMMDD (contoh: 20260908)
  if (/^\d{8}$/.test(rawDate)) {
    dateFormatted = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
  } else {
    // Format YYYY-MM-DD atau YYYY/MM/DD
    const match = rawDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      dateFormatted = `${year}-${month}-${day}`;
    } else {
      dateFormatted = rawDate;
    }
  }

  // Validasi format tanggal YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFormatted)) {
    return false;
  }

  // Dapatkan waktu (prioritas jam_selesai, lalu jam_mulai, fallback akhir hari 23:59)
  const time = extractTime(jamSelesai) || extractTime(jamMulai) || { hours: 23, minutes: 59 };
  const hoursStr = String(time.hours).padStart(2, '0');
  const minutesStr = String(time.minutes).padStart(2, '0');

  // Waktu target di zona WIB (+07:00)
  const targetIso = `${dateFormatted}T${hoursStr}:${minutesStr}:00+07:00`;
  const targetTimestamp = new Date(targetIso).getTime();

  if (isNaN(targetTimestamp)) {
    return false;
  }

  return Date.now() > targetTimestamp;
}
