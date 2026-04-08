const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
// If credentials are not configured, use test/dummy mode
let transporter = null;

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (emailUser && emailUser !== 'your-email@gmail.com' && emailPassword && emailPassword !== 'your-app-password') {
  // Real email configuration
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
  console.log('✅ Email service configured with real credentials');
} else {
  // Development mode: use dummy transporter that logs to console
  console.log('⚠️  Email credentials not configured. Using development mode.');
  console.log('📧 Verification codes will be printed to console.');
  console.log('📧 To send real emails, set EMAIL_USER and EMAIL_PASSWORD in .env');
  
  transporter = {
    sendMail: async (options) => {
      console.log('📧 [DEV MODE] Email sent to:', options.to);
      console.log('Subject:', options.subject);
      if (options.text) {
        console.log('Body:', options.text.substring(0, 200) + '...');
      }
      return { success: true, messageId: 'dev-' + Date.now() };
    }
  };
}

const sendVerificationEmail = async (email, code, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

  console.log(`🔐 Verification code for ${email}: ${code}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f2a409; padding: 20px; color: white; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .code-box { background-color: #ffffff; border: 2px solid #f2a409; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
          .code { font-size: 32px; font-weight: bold; color: #f2a409; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { background-color: #f2a409; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TrackTimi</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>Thank you for registering with TrackTimi. To activate your account, please verify your email address using one of the methods below.</p>
            
            <h3>Verification Code:</h3>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p>Or click the button below to verify immediately:</p>
            <a href="${verifyLink}" class="button">Verify Email</a>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This code and link will expire in <strong>15 minutes</strong>.
            </p>
            
            <p>If you did not create this account, please ignore this message.</p>
            
            <p>Best regards,<br/>
            <strong>TrackTimi Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 TrackTimi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your TrackTimi Account',
    html: htmlContent,
    text: `
Hello,

Welcome to TrackTimi.

Please verify your email address to activate your account.

Verification Code:
${code}

Or click the link below:
${verifyLink}

This code and link will expire in 15 minutes.

If you did not create this account, please ignore this message.

TrackTimi Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.response || info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️  Email sending failed:', error.message);
    // Don't throw - just log and continue
    return { success: false, error: error.message };
  }
};

/**
 * Send resend verification email
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @param {string} token - Secure token for link verification
 * @returns {Promise}
 */
const sendResendVerificationEmail = async (email, code, token) => {
  return sendVerificationEmail(email, code, token);
};

/**
 * Test email sending function
 * @param {string} testEmail - Email to send test to
 * @returns {Promise}
 */
const sendTestEmail = async (testEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: testEmail,
    subject: 'TrackTimi Test Email',
    html: '<h1>Test Email Successful</h1><p>Your email configuration is working correctly.</p>',
    text: 'Test Email Successful\n\nYour email configuration is working correctly.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent:', info.response || info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    throw error;
  }
};

/**
 * Send invitation email to new employee with temporary password
 * @param {string} email - Recipient email address
 * @param {string} invitationToken - Invitation token for activation
 * @param {string} orgName - Organization name
 * @param {string} inviterName - Name of person who invited them
 * @param {string} tempPassword - Temporary password for initial login
 * @returns {Promise}
 */
const sendInvitationEmail = async (email, invitationToken, orgName, inviterName, tempPassword) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const activationLink = `${frontendUrl}/activate/${invitationToken}`;

  console.log(`📧 Sending invitation email to ${email} for organization: ${orgName}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; padding: 20px; color: white; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .org-box { background-color: #EEF2FF; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .credentials-box { background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; }
          .credential-label { color: #92400E; font-size: 12px; font-weight: bold; }
          .credential-value { color: #1C1917; font-size: 14px; margin: 5px 0; }
          .button { background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TrackTimi</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>${inviterName} has invited you to join <strong>${orgName}</strong> on TrackTimi.</p>
            
            <div class="org-box">
              <h3 style="margin-top: 0; color: #4F46E5;">Join ${orgName}</h3>
              <p>Set up your account by clicking the button below to activate your invitation.</p>
            </div>

            <div class="credentials-box">
              <p style="margin-top: 0; color: #92400E;"><strong>Your Temporary Login Credentials:</strong></p>
              <p class="credential-label">Email:</p>
              <p class="credential-value">${email}</p>
              <p class="credential-label">Temporary Password:</p>
              <p class="credential-value" style="background-color: #FAFAF8; padding: 8px; border-radius: 3px; letter-spacing: 0.5px;">${tempPassword}</p>
              <p style="color: #92400E; font-size: 11px; margin: 10px 0 0 0;">
                ⚠️ Please change this password immediately after your first login for security.
              </p>
            </div>
            
            <p>
              <a href="${activationLink}" class="button">Activate Your Account</a>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This invitation link will expire in <strong>7 days</strong>. After that, you will need to request a new invitation.
            </p>
            
            <p>If you did not expect this invitation, please ignore this message and notify your administrator.</p>
            
            <p>Best regards,<br/>
            <strong>TrackTimi Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 TrackTimi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: `Welcome to ${orgName} - TrackTimi Invitation`,
    html: htmlContent,
    text: `
Hello,

${inviterName} has invited you to join ${orgName} on TrackTimi.

Your Temporary Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

⚠️ Please change this password immediately after your first login for security.

To activate your account, click the link below:
${activationLink}

This invitation link will expire in 7 days.

If you did not expect this invitation, please ignore this message and notify your administrator.

Best regards,
TrackTimi Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️  Invitation email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email with reset link
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  console.log(`🔐 Password reset link for ${email}: ${resetLink}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f2a409; padding: 20px; color: white; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .link-box { background-color: #ffffff; border: 2px solid #f2a409; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; word-break: break-all; }
          .link-text { font-size: 13px; color: #f2a409; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { background-color: #f2a409; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hello ${firstName},</p>
            
            <p>We received a request to reset your TrackTimi account password. Click the button below to create a new password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or click the reset link below:</p>
            <div class="link-box">
              <div class="link-text">${resetLink}</div>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This link will expire in <strong>30 minutes</strong>.
            </p>
            
            <p>If you did not request to reset your password, please ignore this message and contact our support team if you have concerns.</p>
            
            <p>Best regards,<br/>
            <strong>TrackTimi Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 TrackTimi. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your TrackTimi Password',
    html: htmlContent,
    text: `Click this link to reset your password: ${resetLink}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠️  Password reset email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendTestEmail,
  sendInvitationEmail,
  sendPasswordResetEmail
};
