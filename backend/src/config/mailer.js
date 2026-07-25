const nodemailer = require('nodemailer');

/**
 * Returns a configured nodemailer transporter.
 * Supports Gmail (via App Password) or any SMTP provider.
 * Falls back gracefully if env vars are missing.
 */
function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[Mailer] EMAIL_USER or EMAIL_PASS not set — emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host:   EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,   // Gmail: use an App Password, not your account password
    },
  });
}

/**
 * Send an email. Silently logs errors so a mail failure never crashes the server.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"J Raph Streach" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
    });
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.message);
  }
}

module.exports = { sendMail };
