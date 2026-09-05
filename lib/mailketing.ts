// lib/mailketing.ts

export interface MailketingEmailParams {
  recipient: string;
  subject: string;
  content: string;
  fromName?: string;
}

export async function sendMailketingEmail({
  recipient,
  subject,
  content,
  fromName = 'Banten Mengaji',
}: MailketingEmailParams): Promise<boolean> {
  const apiToken = process.env.MAILKETING_API_TOKEN;
  const fromEmail = process.env.MAILKETING_FROM_EMAIL;

  if (!apiToken || !fromEmail) {
    console.warn('[Mailketing] Kredensial tidak lengkap di environment (MAILKETING_API_TOKEN, MAILKETING_FROM_EMAIL). Email tidak dikirim.');
    return false;
  }

  const endpoint = 'https://api.mailketing.co.id/api/v1/send';

  const formData = new URLSearchParams();
  formData.append('api_token', apiToken);
  formData.append('from_name', fromName);
  formData.append('from_email', fromEmail);
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

export function bantenMengajiEmailShell(title: string, bodyContent: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #093c96; padding: 20px; text-align: center;">
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

export async function sendNewDKMNotificationToAdmin(data: { namaMasjid: string; namaPengurus: string; email: string }) {
  const adminEmail = process.env.MAILKETING_FROM_EMAIL;
  if (!adminEmail) return;

  const content = bantenMengajiEmailShell(
    'Pendaftaran DKM Baru Masuk',
    `
    <p>Halo Admin,</p>
    <p>Terdapat pendaftaran akun DKM baru di platform Banten Mengaji yang perlu segera di-review.</p>
    <ul style="padding-left: 20px;">
      <li><strong>Masjid:</strong> ${data.namaMasjid}</li>
      <li><strong>Pengurus:</strong> ${data.namaPengurus}</li>
      <li><strong>Email DKM:</strong> ${data.email}</li>
    </ul>
    <p>Silakan login ke dashboard Super Admin untuk memeriksa dan menyetujui pendaftaran tersebut.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://salaf.maschandigital.id/wp-admin" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Buka Dashboard Admin</a>
    </div>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: adminEmail,
      subject: `Pendaftaran DKM Baru: ${data.namaMasjid}`,
      content,
    });
  } catch (error) {
    console.error('Gagal sendNewDKMNotificationToAdmin:', error);
  }
}

export async function sendDKMApprovalEmail(data: { email: string; namaMasjid: string }) {
  const content = bantenMengajiEmailShell(
    'Pendaftaran DKM Banten Mengaji Disetujui',
    `
    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
    <p>Alhamdulillah, pendaftaran akun DKM untuk <strong>${data.namaMasjid}</strong> di platform Banten Mengaji telah kami <strong>SETUJUI</strong>.</p>
    <p>Sekarang Anda dapat mengelola profil masjid, menjadwalkan kajian rutin, dan memperbarui informasi kajian secara mandiri.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://bantenmengaji.com/login" style="background-color: #093c96; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login ke Dashboard DKM</a>
    </div>
    <p>Terima kasih atas partisipasi Anda dalam memakmurkan syiar dakwah di Provinsi Banten.</p>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: data.email,
      subject: `Pendaftaran DKM Disetujui - ${data.namaMasjid}`,
      content,
    });
  } catch (error) {
    console.error('Gagal sendDKMApprovalEmail:', error);
  }
}

export async function sendDKMRejectionEmail(data: { email: string; namaMasjid: string }) {
  const content = bantenMengajiEmailShell(
    'Pemberitahuan Pendaftaran DKM',
    `
    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
    <p>Mohon maaf, pendaftaran akun DKM untuk <strong>${data.namaMasjid}</strong> saat ini belum dapat kami setujui karena ada beberapa informasi yang perlu diklarifikasi.</p>
    <p>Hal ini dapat terjadi apabila dokumen kurang lengkap, data masjid tidak valid, atau terdapat duplikasi klaim pengurus masjid yang sama.</p>
    <p>Silakan hubungi tim dukungan kami melalui WhatsApp untuk klarifikasi lebih lanjut.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://wa.me/6282298148474" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Hubungi WhatsApp Bantuan</a>
    </div>
    `
  );

  try {
    await sendMailketingEmail({
      recipient: data.email,
      subject: `Pemberitahuan Pendaftaran DKM - ${data.namaMasjid}`,
      content,
    });
  } catch (error) {
    console.error('Gagal sendDKMRejectionEmail:', error);
  }
}
