import { isKajianExpired, isKajianJustFinished, GRACE_PERIOD_MS } from '../lib/kajian';

function runTests() {
  console.log('--- Memulai Pengujian TASK-BM-007 Grace Period 24 Jam & isKajianJustFinished ---');
  let passCount = 0;
  let totalTests = 0;

  function assert(name: string, condition: boolean) {
    totalTests++;
    if (condition) {
      passCount++;
      console.log(`[PASS] Test ${totalTests}: ${name}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${name}`);
    }
  }

  // 1. Validasi Nilai Grace Period
  assert('GRACE_PERIOD_MS bernilai tepat 24 jam (86.400.000 ms)', GRACE_PERIOD_MS === 24 * 60 * 60 * 1000);

  // Helper untuk membuat tanggal & jam di zona WIB (+07:00)
  const now = new Date();
  
  // Waktu WIB saat ini
  const wibTime = new Date(now.getTime() + (7 * 3600 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
  
  // Tanggal besok (Masa depan)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // 2. Kajian masa depan
  assert(
    'Kajian besok belum expired dan belum just finished',
    !isKajianExpired(tomorrowStr, '12:00', '10:00') &&
    !isKajianJustFinished(tomorrowStr, '12:00', '10:00')
  );

  // 3. Kajian rutin tanpa tanggal
  assert(
    'Kajian rutin tanpa tanggal tidak pernah expired atau just finished',
    !isKajianExpired(undefined) &&
    !isKajianJustFinished(undefined)
  );

  // 4. Kajian yang baru selesai 2 jam lalu (dalam masa tenggang 24 jam)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const twoHoursAgoDateStr = twoHoursAgo.toISOString().split('T')[0];
  const twoHoursAgoHours = String(twoHoursAgo.getUTCHours() + 7).padStart(2, '0');
  const twoHoursAgoMinutes = String(twoHoursAgo.getUTCMinutes()).padStart(2, '0');
  const twoHoursAgoTimeStr = `${twoHoursAgoHours}:${twoHoursAgoMinutes}`;

  assert(
    'Kajian selesai 2 jam lalu: isKajianExpired === false (karena grace period)',
    isKajianExpired(twoHoursAgoDateStr, twoHoursAgoTimeStr) === false
  );
  assert(
    'Kajian selesai 2 jam lalu: isKajianJustFinished === true (dalam batas 24 jam)',
    isKajianJustFinished(twoHoursAgoDateStr, twoHoursAgoTimeStr) === true
  );

  // 5. Kajian yang selesai 30 jam lalu (melebihi masa tenggang 24 jam)
  const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
  const thirtyHoursAgoDateStr = thirtyHoursAgo.toISOString().split('T')[0];
  const thirtyHoursAgoHours = String(thirtyHoursAgo.getUTCHours() + 7).padStart(2, '0');
  const thirtyHoursAgoMinutes = String(thirtyHoursAgo.getUTCMinutes()).padStart(2, '0');
  const thirtyHoursAgoTimeStr = `${thirtyHoursAgoHours}:${thirtyHoursAgoMinutes}`;

  assert(
    'Kajian selesai 30 jam lalu: isKajianExpired === true (melewati grace period 24 jam)',
    isKajianExpired(thirtyHoursAgoDateStr, thirtyHoursAgoTimeStr) === true
  );
  assert(
    'Kajian selesai 30 jam lalu: isKajianJustFinished === false (sudah expired penuh)',
    isKajianJustFinished(thirtyHoursAgoDateStr, thirtyHoursAgoTimeStr) === false
  );

  // 6. Format ACF numerik YYYYMMDD
  const rawDateNumeric = thirtyHoursAgoDateStr.replace(/-/g, '');
  assert(
    'Format tanggal ACF YYYYMMDD yang sudah lewat 30 jam terdeteksi expired',
    isKajianExpired(rawDateNumeric, thirtyHoursAgoTimeStr) === true
  );

  console.log(`\nHasil: ${passCount} dari ${totalTests} pengujian berhasil (${Math.round((passCount / totalTests) * 100)}%).`);
  if (passCount !== totalTests) {
    process.exit(1);
  }
}

runTests();
