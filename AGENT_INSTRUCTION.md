# Agent Instruction
# TASK: Perbaikan Body Email HTML Mailketing (Kompatibilitas Gmail & Table-Based Layout)
Branch: `staging-website-islam`

## 1. Konteks Masalah
Email notifikasi Mailketing telah berhasil terkirim ke Gmail, namun isi pesan (body email) tampil kosong di aplikasi Gmail.

Akar masalah:
1. Shell HTML sebelumnya hanya berupa potongan `<div>` tanpa `<!DOCTYPE html>` dan `<table width="100%">`, menyebabkan aplikasi Gmail di smartphone menciutkan tinggi elemen (*height collapse*).
2. Pengiriman via `URLSearchParams` (`application/x-www-form-urlencoded`) meng-encode seluruh tag HTML menjadi kode persen (`%3C`), yang rentan rusak/kosong saat diproses server Mailketing.
3. Ketiadaan atribut `<html lang="id">` memicu banner terjemahan otomatis Gmail.

## 2. Instruksi Pekerjaan

### A. Rekonstruksi Shell Email di `lib/mailketing.ts`
Ubah fungsi `bantenMengajiEmailShell` menjadi format tabel email standar industri yang kebal terhadap pembatasan Gmail Mobile:

```ts
export function bantenMengajiEmailShell(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 25px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #093c96; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Banten Mengaji</h1>
              <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px;">Provinsi Banten</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: bold; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">${title}</h2>
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0; font-weight: 600; color: #475569;">Banten Mengaji — Dikembangkan oleh Mas Chan Digital</p>
              <p style="margin: 4px 0 0 0;">Layanan Bantuan WhatsApp: 0822-9814-8474</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}