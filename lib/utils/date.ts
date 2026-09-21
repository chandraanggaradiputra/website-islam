/**
 * Helper utilitas pemformatan tanggal baku bahasa Indonesia
 */

/**
 * Mengonversi berbagai format string tanggal menjadi tanggal baku bahasa Indonesia
 * Contoh output: "18 September 2026"
 * 
 * Mendukung format:
 * - YYYY-MM-DD (contoh: "2026-09-18")
 * - YYYYMMDD (contoh: "20260918")
 * - YYYY/MM/DD (contoh: "2026/09/18")
 * - ISO string lengkap (contoh: "2026-09-18T18:30:00Z")
 */
export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return '-';
  }

  const clean = dateStr.trim();
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  // 1. Format 8 digit YYYYMMDD (contoh: "20260918")
  if (/^\d{8}$/.test(clean)) {
    year = parseInt(clean.slice(0, 4), 10);
    month = parseInt(clean.slice(4, 6), 10);
    day = parseInt(clean.slice(6, 8), 10);
  } else {
    // 2. Format YYYY-MM-DD atau YYYY/MM/DD
    const match = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }
  }

  // Jika cocok dengan komponen tahun, bulan, hari eksplisit
  if (year !== null && month !== null && day !== null) {
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Menggunakan new Date(year, monthIndex, day) lokal untuk menghindari pergeseran timezone UTC
      const localDate = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(localDate);
    }
  }

  // 3. Fallback jika string adalah ISO DateTime atau format Date yang valid
  const parsedDate = new Date(clean);
  if (!isNaN(parsedDate.getTime())) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(parsedDate);
  }

  return clean;
}
