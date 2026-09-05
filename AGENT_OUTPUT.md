Laporan Hasil Kerja: Perbaikan Fungsi Penolakan dan Persetujuan DKM

Saya telah menyelesaikan perbaikan pada alur pengiriman email Mailketing sesuai permintaan:

1. **Perbaikan `lib/actions/dkm.ts` (Fungsi Approval & Rejection)**:
   - Menambahkan keyword `await` dan memblok pengiriman email ke dalam blok `try...catch` pada fungsi `approveDKMRegistration` dan `rejectDKMRegistration`. Hal ini bertujuan agar Vercel Lambda menunggu proses *fetch* eksternal Mailketing hingga selesai tanpa diputus di tengah jalan secara prematur akibat Vercel Lambda *freeze*.
2. **Perbaikan `lib/mailketing.ts` (`sendDKMRejectionEmail` & `sendDKMApprovalEmail`)**:
   - Menambahkan pengembalian nilai asinkron (menggunakan `return await`) yang memastikan promise benar-benar ditunggu dan melempar *boolean* (sukses/gagal) dengan valid.

**Hasil Pengujian & Sinkronisasi:**
- `npx tsc --noEmit` & `npm run build` berhasil tanpa *error*.
- Perubahan berhasil di-*commit*, di-*merge* dari `staging-website-islam` ke `main`, dan disinkronkan ke Github.

**HASIL GIT DIFF (HEAD~1 HEAD):**

```diff
diff --git a/lib/actions/dkm.ts b/lib/actions/dkm.ts
index 2e12f01..4617d39 100644
--- a/lib/actions/dkm.ts
+++ b/lib/actions/dkm.ts
@@ -513,10 +513,15 @@ export async function approveDKMRegistration(registrationId: string | number) {
 
     if (appData.email) {
       const namaMasjidFinal = appData.newMasjidData?.namaMasjid || appData.masjidName || masjidData.title?.rendered || 'Masjid Anda';
-      sendDKMApprovalEmail({
-        email: appData.email,
-        namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
-      }).catch((e) => console.error('[Mailketing Error di approveDKMRegistration]', e));
+      
+      try {
+        await sendDKMApprovalEmail({
+          email: appData.email,
+          namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
+        });
+      } catch (e) {
+        console.error('[Mailketing Error di approveDKMRegistration]', e);
+      }
     }
 
     revalidatePath('/');
@@ -575,10 +580,15 @@ export async function rejectDKMRegistration(registrationId: string | number) {
       
       if (appData.email) {
         const namaMasjidFinal = appData.newMasjidData?.namaMasjid || appData.masjidName || masjidData.title?.rendered || 'Usulan Masjid';
-        sendDKMRejectionEmail({
-          email: appData.email,
-          namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
-        }).catch((e) => console.error('[Mailketing Error di rejectDKMRegistration]', e));
+        
+        try {
+          await sendDKMRejectionEmail({
+            email: appData.email,
+            namaMasjid: namaMasjidFinal.replace('KLAIM: ', ''),
+          });
+        } catch (e) {
+          console.error('[Mailketing Error di rejectDKMRegistration]', e);
+        }
       }
     }
 
diff --git a/lib/mailketing.ts b/lib/mailketing.ts
index a1de4af..db3adce 100644
--- a/lib/mailketing.ts
+++ b/lib/mailketing.ts
@@ -209,13 +209,14 @@ export async function sendDKMApprovalEmail(data: { email: string; namaMasjid: st
   );
 
   try {
-    await sendMailketingEmail({
+    return await sendMailketingEmail({
       recipient: data.email,
       subject: `Alhamdulillah! Akun DKM Anda Telah Disetujui - Banten Mengaji`,
       content,
     });
   } catch (error) {
     console.error('Gagal sendDKMApprovalEmail:', error);
+    return false;
   }
 }
 
@@ -235,12 +236,13 @@ export async function sendDKMRejectionEmail(data: { email: string; namaMasjid: s
   );
 
   try {
-    await sendMailketingEmail({
+    return await sendMailketingEmail({
       recipient: data.email,
       subject: `Pemberitahuan Status Pendaftaran DKM - Banten Mengaji`,
       content,
     });
   } catch (error) {
     console.error('Gagal sendDKMRejectionEmail:', error);
+    return false;
   }
 }
```
