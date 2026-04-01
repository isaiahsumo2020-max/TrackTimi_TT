const nodemailer = require('nodemailer');

async function sendTest() {
  // Create a test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: 'TrackTimi <no-reply@tracktimi.test>',
    to: 'bob.test+copilot@example.com',
    subject: 'TrackTimi test email (Ethereal)',
    text: 'This is a test email sent by the TrackTimi backend via Nodemailer/Ethereal.',
    html: '<p>This is a test email sent by the <b>TrackTimi</b> backend via Nodemailer/Ethereal.</p>'
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

sendTest().catch(err => { console.error('Send test failed:', err); process.exit(1); });
