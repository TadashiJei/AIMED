const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');

// Configure transport
const transport = process.env.NODE_ENV === 'development' && !process.env.MAILGUN_API_KEY
  ? nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true
    })
  : nodemailer.createTransport(mailgunTransport({
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    }));

const sendEmail = async (to, subject, html) => {
  const msg = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };

  try {
    if (process.env.NODE_ENV === 'development' && !process.env.MAILGUN_API_KEY) {
      // In development, just log the email
      console.log('Email would be sent in production:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', html);
      return;
    }
    
    await transport.sendMail(msg);
  } catch (error) {
    console.error('Email error:', error);
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sending failed, but continuing in development mode');
      return;
    }
    throw new Error('Email sending failed');
  }
};

const emailTemplates = {
  verificationEmail: (token) => ({
    subject: 'Verify your AIMED account',
    html: `
      <h1>Welcome to AIMED!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  }),

  passwordResetEmail: (token) => ({
    subject: 'Reset your AIMED password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a>
      <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    `
  }),

  welcomeEmail: (name) => ({
    subject: 'Welcome to AIMED!',
    html: `
      <h1>Welcome to AIMED, ${name}!</h1>
      <p>We're excited to have you on board. Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Upload your first health record</li>
        <li>Explore our health insights</li>
      </ul>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
