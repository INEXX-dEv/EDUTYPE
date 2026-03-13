import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
        .logo { font-size: 28px; font-weight: 800; color: #818cf8; text-align: center; margin-bottom: 24px; letter-spacing: -0.5px; }
        .code { font-size: 36px; font-weight: 700; color: #22d3ee; text-align: center; letter-spacing: 8px; padding: 20px; background: #0f172a; border-radius: 12px; margin: 24px 0; }
        .text { color: #94a3b8; text-align: center; line-height: 1.6; }
        .footer { color: #475569; text-align: center; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LernStack</div>
        <p class="text">Email adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
        <div class="code">${code}</div>
        <p class="text">Bu kod 15 dakika geçerlidir.<br/>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelin.</p>
        <div class="footer">© ${new Date().getFullYear()} LernStack. Tüm hakları saklıdır.</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `LernStack <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'LernStack - Email Doğrulama Kodu',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px; }
        .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid #334155; }
        .logo { font-size: 28px; font-weight: 800; color: #818cf8; text-align: center; margin-bottom: 24px; }
        .code { font-size: 36px; font-weight: 700; color: #fb7185; text-align: center; letter-spacing: 8px; padding: 20px; background: #0f172a; border-radius: 12px; margin: 24px 0; }
        .text { color: #94a3b8; text-align: center; line-height: 1.6; }
        .footer { color: #475569; text-align: center; font-size: 12px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LernStack</div>
        <p class="text">Şifre sıfırlama kodunuz:</p>
        <div class="code">${code}</div>
        <p class="text">Bu kod 15 dakika geçerlidir.<br/>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelin.</p>
        <div class="footer">© ${new Date().getFullYear()} LernStack. Tüm hakları saklıdır.</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `LernStack <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'LernStack - Şifre Sıfırlama Kodu',
    html,
  });
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
