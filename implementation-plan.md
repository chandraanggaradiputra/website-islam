# Rencana Implementasi: Infrastruktur Web Push Notification Native & Panel Broadcast Admin

Branch Target: `staging-website-islam`

## 1. Ringkasan & Ruang Lingkup Perubahan
Tugas ini membangun infrastruktur Web Push Notification native pada portal **Banten Mengaji** serta menyediakan Panel Broadcast khusus bagi Super Admin untuk mengirimkan notifikasi siaran (jadwal kajian baru, pengumuman penting, dsb.) langsung ke perangkat jamaah (Android, Desktop, dan iOS PWA):

1. **Dependensi & Konfigurasi Kunci VAPID**:
   - Memasang pustaka `web-push` dan tipe datanya `@types/web-push`.
   - Mengonfigurasi pasangan kunci VAPID (*Voluntary Application Server Identification*): Public Key (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`), Private Key (`VAPID_PRIVATE_KEY`), dan Subject (`VAPID_SUBJECT`).
2. **Ekstensi Service Worker (`public/sw.js`)**:
   - Menambahkan event listener `push` untuk menangkap payload notifikasi berformat JSON (title, body, icon, badge, data URL).
   - Menambahkan event listener `notificationclick` untuk menangani aksi klik notifikasi (membuka URL target atau memfokuskan tab browser yang sudah terbuka).
3. **Backend Server Actions & Penyimpanan Langganan (`lib/actions/push.ts`)**:
   - `savePushSubscription(subscription)`: Menyimpan endpoint langganan jamaah ke berkas persisten `data/push-subscriptions.json` (mencegah duplikasi endpoint).
   - `removePushSubscription(endpoint)`: Menghapus endpoint jika jamaah menonaktifkan notifikasi atau jika service worker mengembalikan status 410 Gone / 404 Not Found.
   - `getPushSubscriberStats()`: Mengambil jumlah perangkat terdaftar yang siap menerima notifikasi.
   - `sendBroadcastNotification(payload)`: Mengirimkan pesan push notifikasi secara batch menggunakan `web-push.sendNotification()` dengan pelaporan status berhasil dan pembersihan otomatis endpoint yang sudah kadaluwarsa (expired).
4. **Komponen Pengelola Izin Client (`components/pwa/PushNotificationManager.tsx`)**:
   - Komponen client untuk memeriksa dukungan Push API dan status izin (`Notification.permission`).
   - Menyediakan tombol/kartu ajakan berlangganan notifikasi dengan konversi kunci VAPID `urlBase64ToUint8Array`.
   - Terintegrasi secara elegan di portal (misal pada banner PWA atau navigasi utama).
5. **Panel Siaran (Broadcast Push) pada Dasbor Super Admin**:
   - Tab baru `tab=broadcast` pada Dasbor Super Admin (`components/dashboard/AdminDashboardTabs.tsx` & `DashboardSidebar.tsx`).
   - Menampilkan metrik: Total Jamaah Berlangganan Notifikasi.
   - Formulir Broadcast: Judul Notifikasi, Isi Pesan, Tautan URL Tujuan (misal `/jadwal-kajian` atau tautan kajian spesifik), serta Pratinjau Tampilan Notifikasi (*Live Preview*).
   - Tombol eksekusi broadcast dengan indikator loading dan laporan pengiriman (*misal: "Berhasil terkirim ke 45 perangkat"*).

---

## User Review Required

> [!IMPORTANT]
> **Pemberitahuan Truncated Prompt**:
> Pesan tugas Anda terpotong setelah baris perintah `npm install -D @types/web-push`. Rencana di bawah ini telah kami susun secara menyeluruh mencakup arsitektur end-to-end (VAPID, Service Worker, Server Actions, Client Subscription UI, dan Panel Broadcast Admin). Silakan tinjau dan beri konfirmasi apakah terdapat rincian atau alur khusus tambahan yang ingin Anda sertakan sebelum kami mulai mengeksekusi kode.

> [!NOTE]
> **Penyimpanan Langganan Push**:
> Langganan disimpan secara persisten di berkas `data/push-subscriptions.json`, selaras dengan arsitektur penyimpanan pengaturan sistem di `data/system-settings.json`.

---

## Open Questions

> [!QUESTION]
> 1. Apakah Anda memiliki pasangan kunci VAPID yang sudah ada, atau kami buatkan pasangan kunci VAPID baru yang aman dan valid secara otomatis menggunakan `web-push generate-vapid-keys`?
> 2. Di mana posisi pemicu izin notifikasi bagi jamaah yang paling Anda sukai? (Rekomendasi: Terintegrasi langsung di dalam banner PWA & tombol lonceng notifikasi di Header / pengaturan).
> 3. Apakah menu navigasi di Sidebar Admin ingin diberi label **"Broadcast Notifikasi"** dengan rute `/dashboard/admin?tab=broadcast`?

---

## Proposed Changes

### A. Dependensi & Lingkungan Server
#### [MODIFY] [package.json](file:///C:/website-islam/package.json)
- Menambahkan dependensi `web-push` dan devDependency `@types/web-push`.

#### [MODIFY] [.env.local](file:///C:/website-islam/.env.local)
- Menambahkan `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, dan `VAPID_SUBJECT`.

---

### B. Service Worker
#### [MODIFY] [public/sw.js](file:///C:/website-islam/public/sw.js)
- Menambahkan event listener `push` untuk menampilkan notifikasi visual native.
- Menambahkan event listener `notificationclick` untuk navigasi ke URL kajian/tujuan saat notifikasi diklik.

---

### C. Backend Server Actions
#### [NEW] [lib/actions/push.ts](file:///C:/website-islam/lib/actions/push.ts)
- `savePushSubscription`: Menyimpan endpoint dan kunci p256dh & auth ke `data/push-subscriptions.json`.
- `removePushSubscription`: Menghapus endpoint yang tidak lagi valid.
- `getPushSubscriberStats`: Menghitung total subscriber aktif.
- `sendBroadcastNotification`: Mengirimkan notifikasi massal dengan penanganan error status `410 Gone` (auto-prune).

#### [NEW] [types/push.ts](file:///C:/website-islam/types/push.ts)
- Mendefinisikan antarmuka `PushSubscriptionRecord`, `BroadcastPayload`, dan `BroadcastResult`.

---

### D. Client Components & PWA Integration
#### [NEW] [components/pwa/PushNotificationManager.tsx](file:///C:/website-islam/components/pwa/PushNotificationManager.tsx)
- Menangani registrasi push subscription ke browser via `registration.pushManager.subscribe`.
- Menyediakan UI tombol izin notifikasi ("Aktifkan Notifikasi Kajian").

#### [MODIFY] [components/pwa/PwaHandler.tsx](file:///C:/website-islam/components/pwa/PwaHandler.tsx)
- Mengintegrasikan opsi aktivasi notifikasi kajian ke dalam alur PWA.

---

### E. Dasbor Admin (Panel Broadcast)
#### [MODIFY] [components/dashboard/DashboardSidebar.tsx](file:///C:/website-islam/components/dashboard/DashboardSidebar.tsx)
- Menambahkan menu navigasi Super Admin **Broadcast Notifikasi** menuju `/dashboard/admin?tab=broadcast` dengan ikon `Send` / `BellRing`.

#### [MODIFY] [components/dashboard/AdminDashboardTabs.tsx](file:///C:/website-islam/components/dashboard/AdminDashboardTabs.tsx)
- Menambahkan tab ke-6: `Broadcast Notifikasi`.
- Menyediakan formulir pengiriman broadcast: Judul, Pesan, Tautan URL, Pratinjau Tampilan Notifikasi, dan statistik subscriber aktif.

#### [MODIFY] [app/dashboard/admin/page.tsx](file:///C:/website-islam/app/dashboard/admin/page.tsx)
- Memuat statistik subscriber push notifikasi saat halaman admin dirender.

---

## Verification Plan

### Automated Tests
- Menjalankan `npx tsc --noEmit` untuk memastikan 100% bebas error TypeScript.
- Menjalankan `npm run build` untuk memastikan kompilasi Turbopack produksi berhasil.

### Manual Verification
- Pengujian pendaftaran izin push notifikasi di browser.
- Pengujian pembuatan & penyimpanan subscription di `data/push-subscriptions.json`.
- Pengujian simulasi pengiriman pesan broadcast dari Dasbor Admin ke service worker browser.
