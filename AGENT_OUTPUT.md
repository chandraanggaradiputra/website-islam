Laporan Hasil Kerja: Pembersihan Nama Lama "Website Islam" Menjadi "Banten Mengaji"

Berdasarkan instruksi yang ditugaskan, saya telah membersihkan sisa-sisa nama referensi lama ("Website Islam" dan "website-islam") di seluruh *source code* proyek dan menggantinya menjadi "Banten Mengaji" (serta format URL/variabel "banten-mengaji"). Berikut adalah perubahan yang telah dilakukan:

1. **Penggantian Nama di Markdown Docs**:
   - `ANTIGRAVITY_RULES.md`
   - `SECURITY_STANDARDS.md`
   - `SECURITY_AUDIT_TASKS.md`
2. **Penggantian Nama Modul NPM/Sistem**:
   - `package.json` (`"name": "website-islam"` menjadi `"name": "banten-mengaji"`)
   - `package-lock.json` (*auto-regenerated* via `npm install`)
3. **Penggantian Kunci Rahasia / Variabel Internal**:
   - `lib/env.ts` (mengganti token fallback `super-secret-key-for-website-islam-2024-change-in-prod` menjadi `super-secret-key-for-banten-mengaji-2024-change-in-prod`)
4. **Pembaruan Berkas E2E Test**:
   - Mengubah nama file `e2e/website-islam.spec.ts` menjadi `e2e/banten-mengaji.spec.ts`
   - Mengganti deskripsi *test suite* di dalamnya.

**Hasil Pengujian & Sinkronisasi:**
- `npx tsc --noEmit` & `npm run build` berhasil secara keseluruhan (0 *error*).
- Seluruh perubahan berhasil di-*commit* ke *branch* `staging-website-islam` dan di-*merge* ke *branch* `main`. Sinkronisasi (*push*) ke *remote* (Github) berhasil dipublikasikan.

**HASIL GIT DIFF:**

```diff
diff --git a/ANTIGRAVITY_RULES.md b/ANTIGRAVITY_RULES.md
index 3970b05..d1cb92b 100644
--- a/ANTIGRAVITY_RULES.md
+++ b/ANTIGRAVITY_RULES.md
@@ -1,4 +1,4 @@
-# Standar Rekayasa Kode Proyek "Website Islam" (Mas Chan Digital)
+# Standar Rekayasa Kode Proyek "Banten Mengaji" (Mas Chan Digital)
 
 1. **5 Prinsip Rekayasa Baku**:
    - **Prinsip 1 (Zero Silent Fallback)**: Dilarang keras menyuntikkan ID/nama data default palsu jika data relasi/sesi kosong. Kembalikan `null` atau `Error` eksplisit.
diff --git a/SECURITY_AUDIT_TASKS.md b/SECURITY_AUDIT_TASKS.md
index 0411117..42a765e 100644
--- a/SECURITY_AUDIT_TASKS.md
+++ b/SECURITY_AUDIT_TASKS.md
@@ -1,4 +1,4 @@
-# Temuan Audit Keamanan — Project Website Islam (Banten Mengaji)
+# Temuan Audit Keamanan — Project Banten Mengaji
 
 > **Untuk**: AI Agent (Gemini Spark / Antigravity) yang mengerjakan repo ini.
 > **Konteks**: Hasil audit keamanan atas repo `chandraanggaradiputra/website-islam`
diff --git a/SECURITY_STANDARDS.md b/SECURITY_STANDARDS.md
index 9969f72..7371d90 100644
--- a/SECURITY_STANDARDS.md
+++ b/SECURITY_STANDARDS.md
@@ -1,4 +1,4 @@
-# Standar Keamanan Proyek "Website Islam" (Mas Chan Digital)
+# Standar Keamanan Proyek "Banten Mengaji" (Mas Chan Digital)
 
 > Dokumen ini pelengkap `ANTIGRAVITY_RULES.md`. Kalau `ANTIGRAVITY_RULES.md` mengatur
 > *kualitas rekayasa kode*, dokumen ini mengatur *keamanan*. Berlaku untuk semua AI Agent
diff --git a/e2e/website-islam.spec.ts b/e2e/banten-mengaji.spec.ts
similarity index 98%
rename from e2e/website-islam.spec.ts
rename to e2e/banten-mengaji.spec.ts
index 783e747..ff36735 100644
--- a/e2e/website-islam.spec.ts
+++ b/e2e/banten-mengaji.spec.ts
@@ -1,6 +1,6 @@
 import { test, expect } from '@playwright/test';
 
-test.describe('Website Islam E2E Tests', () => {
+test.describe('Banten Mengaji E2E Tests', () => {
   const baseURL = 'http://localhost:3000';
 
   test('Verifikasi ThemeToggle (Dark Mode)', async ({ page }) => {
diff --git a/lib/env.ts b/lib/env.ts
index 373a1af..d05d146 100644
--- a/lib/env.ts
+++ b/lib/env.ts
@@ -2,7 +2,7 @@
 
 const KNOWN_INSECURE_FALLBACKS = [
   'super-secret-key-for-development-only-12345',
-  'super-secret-key-for-website-islam-2024-change-in-prod',
+  'super-secret-key-for-banten-mengaji-2024-change-in-prod',
 ];
 
 const jwtSecret = process.env.JWT_SECRET?.trim();
diff --git a/package-lock.json b/package-lock.json
index 6a83021..d1de76e 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -1,11 +1,11 @@
 {
-  "name": "website-islam",
+  "name": "banten-mengaji",
   "version": "0.1.0",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
-      "name": "website-islam",
+      "name": "banten-mengaji",
       "version": "0.1.0",
       "dependencies": {
         "@hookform/resolvers": "^5.9.1",
diff --git a/package.json b/package.json
index 7f0f65f..790c8e5 100644
--- a/package.json
+++ b/package.json
@@ -1,5 +1,5 @@
 {
-  "name": "website-islam",
+  "name": "banten-mengaji",
   "version": "0.1.0",
   "private": true,
   "scripts": {
```
