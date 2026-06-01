const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: `"PCS Playbook" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
}

async function sendTemporaryPassword(
  email,
  temporaryPassword
) {
  await transporter.sendMail({
    from: `"PCS Playbook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'PCS Playbook Password Reset',
    text: `
A temporary password has been generated for your PCS Playbook account.

Temporary Password:
${temporaryPassword}

Log in using this password.

For security purposes, you will be required to create a new password after signing in.
    `
  });
}

module.exports = {
  sendEmail,
  sendTemporaryPassword
};