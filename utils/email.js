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

async function sendAccountStatus(toEmail, fullName, action, suspendedUntil) {
  const transporter = createTransport();
  let subject, html;

  if (action === 'banned') {
    subject = 'Your OriginalHub account has been banned';
    html = `<h2>Account Banned</h2><p>Hi ${fullName},</p><p>Your OriginalHub account has been permanently banned due to violations of our terms of service.</p><p>If you believe this is a mistake, please contact support.</p>`;
  } else if (action === 'suspended') {
    const until = suspendedUntil ? new Date(suspendedUntil).toDateString() : 'a temporary period';
    subject = 'Your OriginalHub account has been suspended';
    html = `<h2>Account Suspended</h2><p>Hi ${fullName},</p><p>Your OriginalHub account has been temporarily suspended until <strong>${until}</strong> due to multiple reports against your listings.</p><p>After this period your account will be automatically reinstated.</p>`;
  } else if (action === 'unbanned') {
    subject = 'Your OriginalHub account has been reinstated';
    html = `<h2>Account Reinstated</h2><p>Hi ${fullName},</p><p>Your OriginalHub account has been reinstated. You can now log in and continue using the platform.</p>`;
  }

  if (!subject) return;

  await transporter.sendMail({
    from: `"OriginalHub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}

module.exports = { sendPasswordReset, sendSellerApproval, sendAccountStatus };
