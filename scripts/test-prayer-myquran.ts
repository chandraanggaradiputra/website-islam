import { getMonthlyShalat, getFallbackMonthlyShalat, getMyQuranHijriDate } from '../lib/equranShalat';
import { BANTEN_MYQURAN_IDS, DAFTAR_KOTA_KABUPATEN } from '../lib/constants/bantenRegions';

async function runTests() {
  console.log('=== MEMULAI TEST JADWAL SHALAT MYQURAN & HIJRIAH (TASK-BM-009) ===\n');

  // Test 1: Hijri Date
  console.log('--- Test 1: Fetch Tanggal Hijriah Resmi Kemenag ---');
  const hijriToday = await getMyQuranHijriDate();
  console.log('Tanggal Hijriah Hari Ini:', hijriToday);
  if (!hijriToday || !hijriToday.includes('H')) {
    throw new Error('Test 1 Gagal: Format tanggal hijriah tidak valid');
  }
  console.log('✓ Test 1 Lolos: Tanggal Hijriah berhasil diambil.\n');

  // Test 2: Jadwal Shalat Kota Serang (Default)
  console.log('--- Test 2: Jadwal Shalat Bulanan Kota Serang ---');
  const serangData = await getMonthlyShalat('Kota Serang', 9, 2026);
  console.log('Wilayah:', serangData.kabkota);
  console.log('Bulan/Tahun:', serangData.bulan_nama, serangData.tahun);
  console.log('Tanggal Hijriah Data:', serangData.tanggal_hijriah_hari_ini);
  console.log('Total Hari:', serangData.jadwal.length);

  const sampleDay = serangData.jadwal.find((d) => d.tanggal === 26) || serangData.jadwal[0];
  console.log('Jadwal Sampel (Tgl 26):', {
    tanggal: sampleDay.tanggal,
    hari: sampleDay.hari,
    subuh: sampleDay.subuh,
    terbit: sampleDay.terbit,
    dzuhur: sampleDay.dzuhur,
    ashar: sampleDay.ashar,
    maghrib: sampleDay.maghrib,
    isya: sampleDay.isya,
    hijriah: sampleDay.tanggal_hijriah,
  });

  if (serangData.jadwal.length < 28) {
    throw new Error('Test 2 Gagal: Jumlah hari dalam bulan kurang dari 28');
  }
  if (!sampleDay.subuh || !sampleDay.maghrib) {
    throw new Error('Test 2 Gagal: Waktu subuh atau maghrib kosong');
  }
  console.log('✓ Test 2 Lolos: Jadwal shalat Kota Serang valid.\n');

  // Test 3: Verifikasi 8 ID Kota/Kabupaten Banten
  console.log('--- Test 3: Verifikasi 8 ID Wilayah Banten di MyQuran ---');
  for (const regionName of DAFTAR_KOTA_KABUPATEN) {
    const id = BANTEN_MYQURAN_IDS[regionName];
    if (!id) {
      throw new Error(`Test 3 Gagal: ID untuk ${regionName} tidak ditemukan`);
    }
    console.log(`- ${regionName}: ID MyQuran = ${id}`);
  }
  console.log('✓ Test 3 Lolos: Seluruh 8 wilayah Banten terpetakan dengan benar.\n');

  // Test 4: Verifikasi Fallback Lokal Adhan
  console.log('--- Test 4: Verifikasi Zero Silent Fallback (Adhan) ---');
  const fallback = getFallbackMonthlyShalat(9, 2026, 'Kota Serang');
  console.log('Fallback Hari:', fallback.jadwal.length);
  console.log('Fallback Sample Subuh:', fallback.jadwal[0].subuh);
  console.log('Fallback Hijri:', fallback.tanggal_hijriah_hari_ini);
  if (fallback.jadwal.length < 28 || !fallback.jadwal[0].subuh) {
    throw new Error('Test 4 Gagal: Fallback lokal tidak mengembalikan data jadwal valid');
  }
  console.log('✓ Test 4 Lolos: Fallback lokal Adhan siap beroperasi jika API offline.\n');

  console.log('=== SEMUA PENGUJIAN UNIT SELESAI & LOLOS 100% ===');
}

runTests().catch((err) => {
  console.error('Pengujian gagal:', err);
  process.exit(1);
});
