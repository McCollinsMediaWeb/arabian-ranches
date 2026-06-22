import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || "587";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"Arabian Ranches Circle" <${smtpUser}>`;

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials are not configured in environment variables. Logging email output directly to server console:");
    console.log("-----------------------------------------");
    console.log(`[EMAIL SEND] To: ${to}`);
    console.log(`[EMAIL SEND] Subject: ${subject}`);
    console.log(`[EMAIL SEND] Text Content:\n${text}`);
    console.log("-----------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  });
}
