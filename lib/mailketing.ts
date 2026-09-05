// lib/mailketing.ts

export interface MailketingEmailParams {
  recipient: string;
  subject: string;
  content: string;
  fromName?: string;
}

const MAILKETING_API_TOKEN = process.env.MAILKETING_API_TOKEN || 'fd5208fcad3c4e08653a7709bd47f58c';
const MAILKETING_FROM_EMAIL = process.env.MAILKETING_FROM_EMAIL || 'admin@maschandigital.id';
const MAILKETING_DKM_LIST_ID = process.env.MAILKETING_DKM_LIST_ID || '92693';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://banten-mengaji.vercel.app';
const MAILKETING_SEND_URL = 'https://api.mailketing.co.id/api/v1/send';
const MAILKETING_SUBSCRIBER_URL = 'https://api.mailketing.co.id/api/v1/addsubtolist';

export async function sendMailketingEmail({
  recipient,
  subject,
  content,
  fromName = 'Banten Mengaji',
}: MailketingEmailParams): Promise<boolean> {

  const formData = new URLSearchParams();
  formData.append('api_token', MAILKETING_API_TOKEN);
  formData.append('from_name', fromName);
  formData.append('from_email', MAILKETING_FROM_EMAIL);
  formData.append('recipient', recipient);
  formData.append('subject', subject);
  formData.append('content', content);

  try {
    const res = await fetch(MAILKETING_SEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(7000), // Mencegah Vercel timeout 504
    });

    if (!res.ok) {
      console.error('[Mailketing] Gagal mengirim email:', await res.text());
      return false;
    }

    const resData = await res.json().catch(() => ({}));
    console.log(`[Mailketing Send to ${recipient}]:`, resData);

    if (resData.status !== 'success') {
      console.error(`[Mailketing Failed to ${recipient}]:`, resData.response);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Mailketing] Error fetch:', error);
    return false;
  }
}

export async function addDKMSubscriberToMailketing(data: {
  email: string;
  namaPengurus: string;
  namaMasjid: string;
  kotaKabupaten: string;
  noWhatsapp: string;
}): Promise<boolean> {

  const formData = new URLSearchParams();
  formData.append('api_token', MAILKETING_API_TOKEN);
  formData.append('list_id', MAILKETING_DKM_LIST_ID);
  formData.append('email', data.email);
  formData.append('first_name', data.namaPengurus);
  formData.append('company', data.namaMasjid);
  formData.append('city', data.kotaKabupaten);
  formData.append('mobile', data.noWhatsapp);

  try {
    const res = await fetch(MAILKETING_SUBSCRIBER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) {
      console.error('[Mailketing] Gagal menambah subscriber:', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Mailketing] Error fetch add subscriber:', error);
    return false;
  }
}

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

export async function sendNewDKMNotificationToAdmin(data: {
  namaMasjid: string;
  namaPengurus: string;
  email: string;
  noWhatsapp: string;
  kotaKabupaten: string;
  alamatLengkap?: string;
  fasilitas?: string[];
}) {
  const content = bantenMengajiEmailShell(
    'Pendaftaran DKM Baru Masuk',
    `
    <p>Halo Admin,</p>
    <p>Terdapat permohonan pendaftaran akun DKM baru di platform Banten Mengaji yang perlu segera di-review.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr><td style="padding: 5px 0; width: 120px;"><strong>Masjid</strong></td><td style="padding: 5px 0;">: ${data.namaMasjid}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>Pengurus</strong></td><td style="padding: 5px 0;">: ${data.namaPengurus}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>Email</strong></td><td style="padding: 5px 0;">: ${data.email}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>No WA</strong></td><td style="padding: 5px 0;">: ${data.noWhatsapp}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>Kota/Kab</strong></td><td style="padding: 5px 0;">: ${data.kotaKabupaten}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>Alamat</strong></td><td style="padding: 5px 0;">: ${data.alamatLengkap || '-'}</td></tr>
      <tr><td style="padding: 5px 0;"><strong>Fasilitas</strong></td><td style="padding: 5px 0;">: ${data.fasilitas?.join(', ') || '-'}</td></tr>
    </table>
    <p>Silakan login ke dashboard Super Admin untuk memeriksa kelengkapan data dan menyetujui pendaftaran tersebut.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/dashboard/admin?tab=dkm" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Buka Dashboard Admin</a>
    </div>
    `
  );

  const adminRecipients = (
    process.env.ADMIN_NOTIFICATION_EMAIL || 
    'admin@maschandigital.id,anggarasixteen@gmail.com'
  ).split(',').map(e => e.trim()).filter(Boolean);

  try {
    for (const recipient of adminRecipients) {
      await sendMailketingEmail({
        recipient,
        subject: `[Pendaftaran Baru] Permohonan Akun DKM ${data.namaMasjid} - ${data.namaPengurus}`,
        content,
      });
    }
  } catch (error) {
    console.error('Gagal sendNewDKMNotificationToAdmin:', error);
  }
}

export async function sendDKMApprovalEmail(data: { email: string; namaMasjid: string }) {
  const content = bantenMengajiEmailShell(
    'Alhamdulillah! Akun DKM Disetujui',
    `
    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
    <p>Alhamdulillah, pendaftaran akun DKM untuk <strong>${data.namaMasjid}</strong> di platform Banten Mengaji telah kami <strong>SETUJUI</strong> dan profil masjid Anda kini telah terbit di sistem.</p>
    <p>Informasi Akun Anda:</p>
    <ul style="padding-left: 20px;">
      <li><strong>Email Login:</strong> ${data.email}</li>
      <li><strong>Password:</strong> Sesuai dengan password yang Anda buat saat mendaftar.</li>
    </ul>
    <p>Sekarang Anda dapat mengelola profil masjid, menjadwalkan kajian rutin, dan memperbarui informasi kajian secara mandiri melalui dasbor DKM.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/login" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Login ke Dashboard DKM</a>
    </div>
    <p>Terima kasih atas partisipasi Anda dalam memakmurkan syiar dakwah di Provinsi Banten.</p>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: data.email,
      subject: `Alhamdulillah! Akun DKM Anda Telah Disetujui - Banten Mengaji`,
      content,
    });
  } catch (error) {
    console.error('Gagal sendDKMApprovalEmail:', error);
  }
}

export async function sendDKMRejectionEmail(data: { email: string; namaMasjid: string }) {
  const content = bantenMengajiEmailShell(
    'Pemberitahuan Status Pendaftaran DKM',
    `
    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
    <p>Mohon maaf, pendaftaran akun DKM untuk <strong>${data.namaMasjid}</strong> saat ini belum dapat kami setujui karena ada beberapa informasi yang perlu diklarifikasi.</p>
    <p>Hal ini dapat terjadi apabila dokumen kurang lengkap, data masjid tidak valid, atau terdapat duplikasi klaim pengurus masjid yang sama.</p>
    <p>Silakan hubungi tim dukungan kami melalui WhatsApp untuk klarifikasi lebih lanjut dan melengkapi persyaratan yang dibutuhkan.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/6282298148474" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Hubungi WhatsApp Bantuan</a>
    </div>
    <p>Terima kasih atas pengertian Anda.</p>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: data.email,
      subject: `Pemberitahuan Status Pendaftaran DKM - Banten Mengaji`,
      content,
    });
  } catch (error) {
    console.error('Gagal sendDKMRejectionEmail:', error);
  }
}
