RINGKASAN TINDAKAN:
1. **Pengembalian Endpoint API ke v1**: Sesuai dengan spesifikasi dokumentasi _form-urlencoded_ Mailketing, _endpoint_ URL `MAILKETING_SEND_URL` di `lib/mailketing.ts` telah dikembalikan ke `https://api.mailketing.co.id/api/v1/send`.
2. **Validasi Respons 200 OK Semu**: Mailketing selalu merespons HTTP 200 meskipun pengiriman sebenarnya gagal. Untuk mengatasi hal ini, logika fungsi `sendMailketingEmail` telah diperbarui untuk memvalidasi isi respon secara ketat, yakni mengecek apakah `resData.status === 'success'`. Jika tidak, fungsi akan mengembalikan `false` dan mencetak pesan eror _response_ ke dalam log dasbor.
3. **Route Handler Pengujian Instan**: File _route handler_ baru telah dibuat di `app/api/test-email/route.ts` (`/api/test-email`). Fitur ini memungkinkan super admin untuk melakukan pengujian pengiriman email notifikasi langsung dari _browser_ tanpa perlu mengisi formulir pendaftaran DKM terlebih dahulu.
4. **Verifikasi & Integrasi**:
   - Pengecekan kompilator Typescript `tsc --noEmit` lolos.
   - Turbopack sukses membuat _build_ produksi yang stabil dan cepat.
   - Pengerjaan selesai, telah di-_commit_, _merge_ ke branch `main`, dan disinkronkan.

HASIL GIT DIFF & STATUS PUSH:

commit da187b003a35f0535e5d3c8c760d6a048a14ec13
Author: chandraanggaradiputra <anggarasixteen@gmail.com>
Date:   Sat Sep 5 14:32:46 2026 +0700

    fix(mailketing): kembalikan endpoint ke v1, tambah validasi status success, dan buat route test

diff --git a/app/api/test-email/route.ts b/app/api/test-email/route.ts
new file mode 100644
index 0000000..c004f66
--- /dev/null
+++ b/app/api/test-email/route.ts
@@ -0,0 +1,29 @@
+import { NextResponse } from 'next/server';
+import { sendMailketingEmail } from '@/lib/mailketing';
+
+export const dynamic = 'force-dynamic';
+
+export async function GET() {
+  const recipients = ['admin@maschandigital.id', 'anggarasixteen@gmail.com'];
+  const results: Record<string, unknown>[] = [];
+
+  for (const recipient of recipients) {
+    const res = await sendMailketingEmail({
+      recipient,
+      subject: 'Uji Coba Sistem Email Banten Mengaji via Mailketing API v1',
+      content: `
+        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
+          <h2 style="color: #093c96;">Tes Notifikasi Mailketing Berhasil!</h2>
+          <p>Ini adalah email uji coba langsung dari platform <strong>Banten Mengaji</strong>.</p>
+          <p>Waktu pengiriman: \${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>
+        </div>
+      `,
+    });
+    results.push({ recipient, success: res });
+  }
+
+  return NextResponse.json({
+    message: 'Pengujian pengiriman email selesai diproses',
+    results,
+  });
+}
diff --git a/lib/mailketing.ts b/lib/mailketing.ts
index bc1d636..3fa1bfd 100644
--- a/lib/mailketing.ts
+++ b/lib/mailketing.ts
@@ -11,7 +11,7 @@ const MAILKETING_API_TOKEN = process.env.MAILKETING_API_TOKEN || 'fd5208fcad3c4e
 const MAILKETING_FROM_EMAIL = process.env.MAILKETING_FROM_EMAIL || 'admin@maschandigital.id';
 const MAILKETING_DKM_LIST_ID = process.env.MAILKETING_DKM_LIST_ID || '92693';
 const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';
-const MAILKETING_SEND_URL = 'https://api.mailketing.co.id/api/v2/send';
+const MAILKETING_SEND_URL = 'https://api.mailketing.co.id/api/v1/send';
 const MAILKETING_SUBSCRIBER_URL = 'https://api.mailketing.co.id/api/v1/addsubtolist';
 
 export async function sendMailketingEmail({
@@ -47,6 +47,11 @@ export async function sendMailketingEmail({
     const resData = await res.json().catch(() => ({}));
     console.log(\`[Mailketing Send to \${recipient}]:\`, resData);
 
+    if (resData.status !== 'success') {
+      console.error(\`[Mailketing Failed to \${recipient}]:\`, resData.response);
+      return false;
+    }
+
     return true;
   } catch (error) {
     console.error('[Mailketing] Error fetch:', error);

STATUS PUSH:
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
Updating 95d0801..da187b0
Fast-forward
 app/api/test-email/route.ts | 29 +++++++++++++++++++++++++++++
 lib/mailketing.ts           |  7 ++++++-
 2 files changed, 35 insertions(+), 1 deletion(-)
 create mode 100644 app/api/test-email/route.ts
To https://github.com/chandraanggaradiputra/website-islam.git
   95d0801..da187b0  main -> main
