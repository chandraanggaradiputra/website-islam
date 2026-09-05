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

export async function sendMailketingEmail({
  recipient,
  subject,
  content,
  fromName = 'Banten Mengaji',
}: MailketingEmailParams): Promise<boolean> {
  const endpoint = 'https://api.mailketing.co.id/api/v1/send';

  const formData = new URLSearchParams();
  formData.append('api_token', MAILKETING_API_TOKEN);
  formData.append('from_name', fromName);
  formData.append('from_email', MAILKETING_FROM_EMAIL);
  formData.append('recipient', recipient);
  formData.append('subject', subject);
  formData.append('content', content);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      console.error('[Mailketing] Gagal mengirim email:', await res.text());
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
  const endpoint = 'https://api.mailketing.co.id/api/v1/addsubtolist';

  const formData = new URLSearchParams();
  formData.append('api_token', MAILKETING_API_TOKEN);
  formData.append('list_id', MAILKETING_DKM_LIST_ID);
  formData.append('email', data.email);
  formData.append('first_name', data.namaPengurus);
  formData.append('company', data.namaMasjid);
  formData.append('city', data.kotaKabupaten);
  formData.append('mobile', data.noWhatsapp);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
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
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #093c96 0%, #1e3a8a 100%); padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Banten Mengaji</h1>
        <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Provinsi Banten</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; color: #1e293b; line-height: 1.6;">
        <h2 style="margin-top: 0; color: #093c96;">${title}</h2>
        ${bodyContent}
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">Banten Mengaji — Dikembangkan oleh Mas Chan Digital</p>
        <p style="margin: 5px 0 0 0;">Bantuan WhatsApp: 0822-9814-8474</p>
      </div>
    </div>
  `;
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
      <a href="https://banten-mengaji.vercel.app/dashboard/admin?tab=dkm" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Buka Dashboard Admin</a>
    </div>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: 'admin@maschandigital.id',
      subject: `[Pendaftaran Baru] Permohonan Akun DKM ${data.namaMasjid} - ${data.namaPengurus}`,
      content,
    });
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
      <a href="https://bantenmengaji.com/login" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Login ke Dashboard DKM</a>
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
