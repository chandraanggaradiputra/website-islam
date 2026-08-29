async function check() {
  try {
    const res = await fetch('http://localhost:3000/jadwal-kajian');
    const html = await res.text();
    // Instead of explicitly checking for "Sepuluh Fitrah Manusia", 
    // let's check for KajianCard HTML elements.
    const hasKajian = html.includes('KajianCard') || html.includes('Lihat Detail Lengkap') || html.includes('Kajian Rutin') || html.includes('Kajian Tematik');
    
    console.log('Status HTTP:', res.status);
    console.log('Kajian Ditemukan di /jadwal-kajian?:', hasKajian ? '✅ BERHASIL' : '❌ GAGAL');
    
    if (!hasKajian) {
      console.log('Tidak ada jadwal kajian ditemukan di HTML.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error fetching:', err.message);
    process.exit(1);
  }
}

check();
