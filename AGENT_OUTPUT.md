Laporan Hasil Kerja:
Berdasarkan instruksi dari `AGENT_INSTRUCTION.md`, berikut adalah tindakan perbaikan yang telah diselesaikan:

1. **Rekonstruksi Shell Email (`lib/mailketing.ts`)**: Fungsi `bantenMengajiEmailShell` telah diperbarui dari layout berbasis div biasa menjadi layout HTML berbasis `<table role="presentation">` dengan deklarasi `<!DOCTYPE html>` dan `<html lang="id">`. Format standar ini tahan terhadap batasan render (seperti *height collapse*) pada aplikasi Gmail Mobile dan sekaligus menghilangkan *banner* tawaran terjemahan bahasa otomatis dari Gmail.
2. **Validasi & Integrasi**:
   - TypeScript tidak menemukan *error* saat kompilasi statis (`tsc --noEmit`).
   - *Build* Next.js menggunakan Turbopack berhasil tanpa kendala.
   - Perubahan telah berhasil di-*commit*, di-*merge* ke *branch* `main`, dan disinkronkan ke repositori *origin* Github.

**HASIL GIT DIFF & STATUS PUSH:**

```diff
commit 1159fee6d84a754ec83db91cbf74da80b7c06ebf
Merge: beec6bd c85eb76
Author: chandraanggaradiputra <anggarasixteen@gmail.com>
Date:   Sat Sep 5 15:42:46 2026 +0700

    Merge branch staging-website-islam

diff --git a/lib/mailketing.ts b/lib/mailketing.ts
index 3fa1bfd..a1de4af 100644
--- a/lib/mailketing.ts
+++ b/lib/mailketing.ts
@@ -99,22 +99,46 @@ export async function addDKMSubscriberToMailketing(data: {
 }
 
 export function bantenMengajiEmailShell(title: string, bodyContent: string): string {
-  return \`
-    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
-      <div style="background: linear-gradient(135deg, #093c96 0%, #1e3a8a 100%); padding: 20px; text-align: center;">
-        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Banten Mengaji</h1>
-        <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Provinsi Banten</p>
-      </div>
-      <div style="padding: 30px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
-        <h2 style="margin-top: 0; color: #093c96;">\${title}</h2>
-        \${bodyContent}
-      </div>
-      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e5e7eb;">
-        <p style="margin: 0;">Banten Mengaji — Dikembangkan oleh Mas Chan Digital</p>
-        <p style="margin: 5px 0 0 0;">Bantuan WhatsApp: 0822-9814-8474</p>
-      </div>
-    </div>
-  \`;
+  return \`<!DOCTYPE html>
+<html lang="id">
+<head>
+  <meta charset="UTF-8">
+  <meta name="viewport" content="width=device-width, initial-scale=1.0">
+  <meta http-equiv="X-UA-Compatible" content="IE=edge">
+  <title>\${title}</title>
+</head>
+<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
+  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 25px 0;">
+    <tr>
+      <td align="center">
+        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
+          <!-- Header -->
+          <tr>
+            <td style="background-color: #093c96; padding: 30px 20px; text-align: center;">
+              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Banten Mengaji</h1>
+              <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px;">Provinsi Banten</p>
+            </td>
+          </tr>
+          <!-- Body Content -->
+          <tr>
+            <td style="padding: 30px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
+              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: bold; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">\${title}</h2>
+              \${bodyContent}
+            </td>
+          </tr>
+          <!-- Footer -->
+          <tr>
+            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
+              <p style="margin: 0; font-weight: 600; color: #475569;">Banten Mengaji — Dikembangkan oleh Mas Chan Digital</p>
+              <p style="margin: 4px 0 0 0;">Layanan Bantuan WhatsApp: 0822-9814-8474</p>
+            </td>
+          </tr>
+        </table>
+      </td>
+    </tr>
+  </table>
+</body>
+</html>\`;
 }
```

**STATUS PUSH:**
```
To https://github.com/chandraanggaradiputra/website-islam.git
   c85eb76..1159fee  main -> main
```
