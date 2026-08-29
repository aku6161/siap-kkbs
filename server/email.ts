import { Complaint, ComplaintStatus } from '../src/types';
import { db } from './db';

export function generateEmailHtml(complaint: Complaint, type: 'DITERIMA' | ComplaintStatus, messageNote?: string): {
  subject: string;
  bodyHtml: string;
  bodyText: string;
} {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const checkUrl = `${appUrl}/?ref=${complaint.noRujukan}`;
  const senderName = db.getConfig().emailSenderName || 'SiAP – Sistem Aduan Pelanggan';

  let subject = '';
  let statusBadge = '';
  let headerTitle = '';
  let contentMessage = '';

  if (type === 'DITERIMA' || type === 'MENUNGGU') {
    subject = `[SiAP] Aduan ${complaint.noRujukan} Telah Diterima`;
    headerTitle = 'Pengesahan Penerimaan Aduan';
    statusBadge = '🟡 Menunggu Tindakan';
    contentMessage = `Terima kasih kerana membuat aduan. Aduan anda telah selamat didaftarkan ke dalam sistem SiAP dan telah dihantar secara automatik kepada kumpulan petugas bertugas di saluran Telegram berkaitan.`;
  } else if (type === 'SELESAI') {
    subject = `[SiAP] Aduan ${complaint.noRujukan} Telah Selesai`;
    headerTitle = 'Aduan Anda Telah Selesai';
    statusBadge = '🟢 Selesai';
    contentMessage = `Sukacita dimaklumkan bahawa aduan anda telah diselesaikan oleh pegawai bertugas kami (${complaint.namaPegawai || 'Pegawai Bertugas'}). Tindakan: "${messageNote || complaint.tindakanTerkini || 'Tindakan selesai.'}". Sila layari portal SiAP untuk membuat semakan dan memberi penilaian kepuasan anda.`;
  } else {
    subject = `[SiAP] Kemas Kini Aduan ${complaint.noRujukan}`;
    headerTitle = 'Status Aduan Anda Telah Dikemaskini';
    statusBadge = type === 'DALAM_TINDAKAN' ? '🟠 Dalam Tindakan' : type === 'DALAM_SEMAKAN' ? '🔵 Dalam Semakan' : '🔴 Ditutup';
    contentMessage = `Aduan anda telah dikemaskini dengan status baharu oleh pegawai bertugas (${complaint.namaPegawai || 'Pegawai Bertugas'}). Tindakan terkini: "${messageNote || complaint.tindakanTerkini || 'Sedang disemak.'}".`;
  }

  const bodyText = `
${senderName}
==========================================
${headerTitle}

Salam sejahtera ${complaint.namaPengadu},

${contentMessage}

BUTIRAN ADUAN:
- No. Rujukan : ${complaint.noRujukan}
- Kategori    : ${complaint.kategoriNama}
- Tajuk Aduan : ${complaint.tajukAduan}
- Lokasi      : ${complaint.lokasi}
- Status      : ${statusBadge}
- Tarikh      : ${complaint.tarikhMasa}

Untuk menyemak perkembangan atau memberi penilaian:
${checkUrl}

Sekian, terima kasih.
${senderName}
"Kami SiAP menyelesaikan aduan anda."
  `.trim();

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #1e40af; color: white; padding: 24px 32px; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px; }
    .lead { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #334155; }
    .card { background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 28px; border: 1px solid #e2e8f0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .row:last-child { margin-bottom: 0; }
    .label { color: #64748b; font-weight: 600; }
    .val { color: #0f172a; font-weight: 600; text-align: right; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SiAP</h1>
      <p>Sistem Aduan Pelanggan</p>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">${headerTitle}</h2>
      <p class="lead">Salam sejahtera <strong>${complaint.namaPengadu}</strong>,</p>
      <p class="lead">${contentMessage}</p>

      <div class="card">
        <div class="row"><span class="label">No. Rujukan:</span> <span class="val" style="color: #2563eb; font-family: monospace; font-size: 15px;">${complaint.noRujukan}</span></div>
        <div class="row"><span class="label">Kategori:</span> <span class="val">${complaint.kategoriNama}</span></div>
        <div class="row"><span class="label">Tajuk Aduan:</span> <span class="val">${complaint.tajukAduan}</span></div>
        <div class="row"><span class="label">Lokasi:</span> <span class="val">${complaint.lokasi}</span></div>
        <div class="row"><span class="label">Status:</span> <span class="val">${statusBadge}</span></div>
        <div class="row"><span class="label">Tarikh:</span> <span class="val">${complaint.tarikhMasa}</span></div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${checkUrl}" class="btn">SEMAK STATUS ADUAN</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;"><strong>${senderName}</strong></p>
      <p style="margin: 0;">"Kami SiAP menyelesaikan aduan anda."</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, bodyHtml, bodyText };
}

import nodemailer from 'nodemailer';

export async function sendEmailNotification(
  complaint: Complaint,
  type: 'DITERIMA' | ComplaintStatus,
  messageNote?: string
) {
  if (!complaint.emel) return;

  const { subject, bodyHtml, bodyText } = generateEmailHtml(complaint, type, messageNote);

  // Log in system email records
  db.addEmailLog({
    noRujukan: complaint.noRujukan,
    penerima: complaint.emel,
    subjek: subject,
    kandungan: `Status: ${complaint.status}. ${messageNote || 'Notifikasi automatik SiAP.'}`,
    status: 'Dihantar',
  });

  db.addLog({
    jenisAktiviti: 'EMEL_DIHANTAR',
    noRujukan: complaint.noRujukan,
    keterangan: `Emel notifikasi "${subject}" dihantar kepada ${complaint.emel}.`,
    dilakukanOleh: 'SiAP Mailer Engine',
  });

  // Check if SMTP is configured in database config or environment variables (.env)
  const config = db.getConfig();
  let smtpHost = config.smtpHost || process.env.SMTP_HOST;
  const smtpPortStr = config.smtpPort || process.env.SMTP_PORT;
  const smtpPort = smtpPortStr ? parseInt(smtpPortStr, 10) : 587;
  const smtpUser = config.smtpUser || process.env.SMTP_USER;
  const smtpPass = config.smtpPass || process.env.SMTP_PASS;

  // Auto-detect Gmail host if blank but Gmail address is provided
  if (!smtpHost && smtpUser && smtpUser.trim().toLowerCase().endsWith('@gmail.com')) {
    smtpHost = 'smtp.gmail.com';
  }

  console.log('SMTP Config Status Check:', {
    smtpHost,
    smtpPort,
    smtpUser,
    hasPass: !!smtpPass,
  });

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const senderName = db.getConfig().emailSenderName || 'SiAP – Sistem Aduan Pelanggan';
      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser}>`,
        to: complaint.emel,
        subject: subject,
        text: bodyText,
        html: bodyHtml,
      });

      console.log(`Email successfully sent directly via SMTP to: ${complaint.emel}`);
      return;
    } catch (smtpErr: any) {
      console.error(`SMTP email sending failed: ${smtpErr.message}. Falling back to Apps Script...`);
    }
  }

  // Fallback: Call Google Apps Script Web App to send real email using GmailApp/MailApp
  const scriptUrl = config.googleAppsScriptUrl;
  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_EMAIL',
          to: complaint.emel,
          subject,
          htmlBody: bodyHtml,
          body: bodyText,
        }),
        redirect: 'follow',
      });
      const result = await res.json();
      if (result.status === 'success') {
        console.log(`Email successfully dispatched via Google Apps Script to: ${complaint.emel}`);
      } else {
        console.error(`Apps Script returned email error: ${result.message}`);
      }
    } catch (err: any) {
      console.error(`Failed to send email through Google Apps Script fallback: ${err.message}`);
    }
  }
}
