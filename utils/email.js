const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendPasswordReset(toEmail, resetToken) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const resetUrl = `${siteUrl}/reset-password.html?token=${resetToken}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"OriginalHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your OriginalHub password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

async function sendSellerApproval(toEmail, shopName, approved, reason) {
  const transporter = createTransport();
  const subject = approved ? 'Your seller application was approved!' : 'Your seller application update';
  const html = approved
    ? `<h2>Congratulations, ${shopName}!</h2><p>Your seller application has been approved. You can now list products on OriginalHub.</p>`
    : `<h2>Application Update for ${shopName}</h2><p>Unfortunately your seller application was not approved at this time.</p><p><strong>Reason:</strong> ${reason || 'Not specified'}</p>`;

  await transporter.sendMail({
    from: `"OriginalHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}

module.exports = { sendPasswordReset, sendSellerApproval };
