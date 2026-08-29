import { test, expect } from '@playwright/test';

test.describe('Website Islam E2E Tests', () => {
  const baseURL = 'http://localhost:3000';

  test('Verifikasi ThemeToggle (Dark Mode)', async ({ page }) => {
    await page.goto(baseURL);
    
    // Tunggu hydration selesai
    await page.waitForSelector('button[aria-label="Ubah Tema"]');
    
    const html = page.locator('html');
    const themeButton = page.locator('button[aria-label="Ubah Tema"]');
    
    // Jika tidak dark, klik untuk membuatnya dark
    let currentClass = await html.getAttribute('class');
    if (!currentClass || !currentClass.includes('dark')) {
      await themeButton.click();
    }
    
    // Verifikasi class dark terpasang
    await expect(html).toHaveClass(/dark/);
  });

  test('Filter Kajian Tematik berjalan dengan baik', async ({ page }) => {
    await page.goto(`${baseURL}/jadwal-kajian`);

    // Pilih opsi tematik
    const selectJenis = page.locator('select[aria-label="Filter Jenis Kajian"]');
    await selectJenis.selectOption('tematik');

    // Klik tombol Terapkan Filter
    const applyButton = page.locator('button:has-text("Terapkan Filter")');
    await applyButton.click();

    // Tunggu navigasi selesai
    await page.waitForURL(/jenis=tematik/);

    // Periksa jika ada fallback kosong
    const emptyState = page.locator('text=Tidak ada jadwal kajian');
    if (await emptyState.isVisible()) {
      console.log('Tidak ada kajian tematik yang tersedia saat ini.');
      return;
    }

    // Pastikan kartu kajian tampil
    const cards = page.locator('h3');
    await expect(cards.first()).toBeVisible();
    
    // Pastikan ada teks yang mengindikasikan komponen tidak kosong
    // (misalnya ada text "Kajian Tematik")
    await expect(page.locator('text=Kajian Tematik').first()).toBeVisible();
  });

  test('Verifikasi tautan Rute Maps dan Kontak DKM', async ({ page }) => {
    await page.goto(`${baseURL}/masjid`);

    // Periksa apakah ada masjid terdaftar
    const emptyState = page.locator('text=Belum ada data masjid yang terdaftar');
    if (await emptyState.isVisible()) {
      console.log('Tidak ada masjid yang tersedia saat ini.');
      return;
    }

    // Masuk ke halaman profil masjid pertama
    const detailLink = page.locator('text=Lihat Profil').first();
    await detailLink.click();

    // Verifikasi atribut href tombol Rute Google Maps
    const mapsLink = page.locator('a:has-text("Rute Google Maps")');
    await expect(mapsLink).toBeVisible();
    
    // Validasi URL Google Maps
    const href = await mapsLink.getAttribute('href');
    expect(href).toMatch(/^https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl)/);

    // Verifikasi atribut href kontak WhatsApp DKM (Jika tersedia)
    const dkmHeading = page.locator('h4:has-text("Kontak DKM")');
    if (await dkmHeading.isVisible()) {
      const waLink = page.locator('a[href^="https://wa.me/"]');
      if (await waLink.count() > 0) {
        const waHref = await waLink.first().getAttribute('href');
        expect(waHref).toMatch(/^https:\/\/wa\.me\/62\d+/);
      }
    }
  });
});
