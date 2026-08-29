async function testRoutes() {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('Menjalankan Pengujian Rute Dashboard...\n');
  
  try {
    // 1. Uji akses tanpa login ke /dashboard (seharusnya diarahkan ke /login)
    console.log('1. Menguji Akses Proteksi /dashboard (Tanpa Login)');
    const res1 = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    if (res1.status === 307 || res1.status === 302 || res1.status === 308) {
      const loc = res1.headers.get('location');
      if (loc?.includes('/login')) {
        console.log('✅ BERHASIL: Akses tanpa otentikasi dialihkan dengan benar ke /login');
      } else {
        console.log(`❌ GAGAL: Akses dialihkan ke URL yang tidak terduga: ${loc}`);
      }
    } else {
      console.log(`❌ GAGAL: Diharapkan pengalihan, tetapi mendapat status: ${res1.status}`);
    }
    
    // 2. Uji ketersediaan halaman /login
    console.log('\n2. Menguji Ketersediaan Halaman /login');
    const res2 = await fetch(`${BASE_URL}/login`);
    if (res2.status === 200) {
      console.log('✅ BERHASIL: Halaman /login tersedia (200 OK)');
    } else {
      console.log(`❌ GAGAL: Halaman /login mengembalikan status: ${res2.status}`);
    }

    // 3. Uji ketersediaan halaman /daftar-dkm
    console.log('\n3. Menguji Ketersediaan Halaman /daftar-dkm');
    const res3 = await fetch(`${BASE_URL}/daftar-dkm`);
    if (res3.status === 200) {
      console.log('✅ BERHASIL: Halaman /daftar-dkm tersedia (200 OK)');
    } else {
      console.log(`❌ GAGAL: Halaman /daftar-dkm mengembalikan status: ${res3.status}`);
    }
    
    console.log('\n✅ Semua pengujian selesai.');

  } catch (error) {
    console.error('\n❌ Pengujian GAGAL karena terjadi kesalahan koneksi. Pastikan server Next.js (npm run dev) sedang berjalan di port 3000.');
    console.error(error.message);
  }
}

testRoutes();
