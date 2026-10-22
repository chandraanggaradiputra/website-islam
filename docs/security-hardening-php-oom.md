# Panduan Konfigurasi Hardening PHP Backend (Hostinger / WordPress Headless) Banten Mengaji

Dokumen ini berisi panduan teknis konfigurasi server PHP / WordPress Headless (`salaf.maschandigital.id`) di Hostinger untuk mencegah eksploitasi Memory Out-Of-Memory (OOM), Denial of Service (DoS) melalui payload flooding, dan Remote Code Execution (RCE).

---

## 1. Konfigurasi Batas Memori & Ukuran Payload (`php.ini` / `.user.ini`)

Untuk mencegah konsumsi RAM berlebih dan serangan alokasi memori tak terkendali saat pemrosesan request HTTP atau berkas media:

```ini
; Batas memori eksekusi per skrip PHP
memory_limit = 256M

; Batas ukuran unggahan berkas tunggal
upload_max_filesize = 15M

; Batas ukuran total POST data dalam satu request
post_max_size = 15M

; Batas waktu eksekusi skrip (detik)
max_execution_time = 60
max_input_time = 60

; Batas jumlah variabel input (mencegah hash collision DoS)
max_input_vars = 3000
```

> **Catatan Penting**: Nilai `post_max_size` wajib setara atau sedikit di atas `upload_max_filesize`, namun tidak boleh dibiarkan terlalu besar (misal 512MB+) demi mencegah serangan buffer overflow / flood memory OOM pada FastCGI/PHP-FPM worker.

---

## 2. Pencegahan Information Disclosure & Eksekusi Berbahaya

Mencegah pembocoran jejak stack trace, kredensial database, path server, serta pemanggilan fungsi sistem rentan:

```ini
; Nonaktifkan tampilan error ke publik (wajib di lingkungan produksi)
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /home/uXXXX/logs/php_error.log

; Nonaktifkan fungsi sistem rawan RCE (Remote Code Execution)
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_multi_exec,parse_ini_file,show_source

; Tutup akses registrasi variabel global & remote file inclusion
allow_url_fopen = On
allow_url_include = Off
expose_php = Off
```

---

## 3. Konfigurasi `.htaccess` WordPress Headless (Root Direktori)

Tambahkan aturan berikut pada berkas `.htaccess` di root public_html WordPress untuk membatasi ukuran request dan memblokir injeksi skrip berbahaya:

```apache
# ─── Proteksi Ukuran Request & Mitigasi Flood OOM ───
LimitRequestBody 15728640

# ─── Blokir Akses Langsung ke Berkas Sensitif & Upload PHP ───
<FilesMatch "^(wp-config\.php|readme\.html|license\.txt|\.env|\.git)">
    Require all denied
</FilesMatch>

# Nonaktifkan eksekusi PHP di direktori wp-content/uploads/
<Directory "/home/*/public_html/wp-content/uploads/">
    <FilesMatch "\.(php|phtml|php3|php4|php5|php7|phps)$">
        Require all denied
    </FilesMatch>
</Directory>
```

---

## 4. Konfigurasi `wp-config.php` untuk Optimalisasi Memori WordPress

Tambahkan konstanta berikut di `wp-config.php` sebelum baris `/* That's all, stop editing! Happy publishing. */`:

```php
// Batasi alokasi memori internal WordPress
define('WP_MEMORY_LIMIT', '128M');
define('WP_MAX_MEMORY_LIMIT', '256M');

// Nonaktifkan editor file internal dari dashboard wp-admin
define('DISALLOW_FILE_EDIT', true);

// Matikan debugging langsung ke layar
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', true);
```

---

## 5. Sinkronisasi dengan Gateway Frontend (Next.js)

Arsitektur Banten Mengaji menerapkan strategi **Defense in Depth**:
1. **Next.js Gateway Guard (`proxy.ts`)**: Memeriksa header `content-length` pada setiap request rute `/api/:path*` dan menolak request > 10MB dengan status HTTP 413 sebelum request diteruskan ke worker/serverless engine.
2. **API Endpoint Route Guard**: Rute webhook spesifik (`/api/webhooks/social-share`) membatasi payload maksimal 2MB dan memvalidasi `content-type: application/json`. Rute OAuth/MCP membatasi payload maksimal 64KB.
3. **Backend PHP WordPress (`salaf.maschandigital.id`)**: Menegakkan batas ketat 15MB di level Hostinger/LiteSpeed/PHP-FPM, memastikan backend terisolasi dari potensi crash OOM jika gateway Next.js dilewati.
