const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { generateUniqueEmployeeId } = require('../utils/employeeId');
const { sendVerificationEmail, sendResendVerificationEmail, sendInvitationEmail } = require('../utils/emailService');
const NotificationBroadcaster = require('../utils/notificationBroadcaster');
const { notifyNewOrganization, notifyEmployeeAdded } = require('../utils/notificationService');

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// 1. REGISTER ORGANIZATION & ADMIN (Onboarding)
exports.registerOrg = async (req, res) => {
  try {
    const { orgName, orgDomain, orgSlug, adminName, adminEmail, adminPassword } = req.body;

    console.log('📝 Full Registration request body:', JSON.stringify(req.body, null, 2));
    console.log('📝 Destructured values:', { orgName, orgDomain, orgSlug, adminName, adminEmail, adminPassword });

    // Validate required fields
    if (!orgName || !adminEmail || !adminPassword || !adminName) {
      console.error('❌ Validation failed. Missing fields:', { orgName: !!orgName, adminEmail: !!adminEmail, adminPassword: !!adminPassword, adminName: !!adminName });
      return res.status(400).json({ error: 'Missing required fields: orgName, adminName, adminEmail, adminPassword' });
    }

    // Generate orgSlug from orgDomain if not provided
    const slug = orgSlug || (orgDomain ? orgDomain.split('.')[0].toLowerCase() : null) || orgName.toLowerCase().replace(/\s+/g, '-');

    const existing = await new Promise((resolve) => {
      db.get('SELECT Email FROM User WHERE Email = ?', [adminEmail.toLowerCase()], (err, row) => resolve(row));
    });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Create Organization
    console.log('⚙️  Creating organization:', orgName);
    const orgId = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO Organization (Org_Name, Org_Domain, Org_Type_ID, Region_ID, Email) VALUES (?, ?, 1, 1, ?)`,
        [orgName, orgDomain || slug, adminEmail.toLowerCase()], function(err) { 
          if (err) {
            console.error('❌ Organization creation error:', err);
            reject(err);
          } else {
            console.log('✅ Organization created with ID:', this.lastID);
            resolve(this.lastID);
          }
        });
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const names = adminName.split(' ');

    // Generate employee ID
    const employeeId = await new Promise((resolve, reject) => {
      generateUniqueEmployeeId((err, id) => {
        if (err) reject(err);
        else resolve(id);
      });
    });

    // Create User
    console.log('⚙️  Creating admin user:', adminEmail);
    await new Promise((resolve, reject) => {
      const sql = `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Employee_ID, Is_Active, Email_Verified) 
                   VALUES (?, ?, ?, ?, ?, 1, 'System Admin', ?, 1, 0)`;

      db.run(sql, [names[0], names.slice(1).join(' ') || 'Admin', adminEmail.toLowerCase(), hashedPassword, orgId, employeeId], function(err) {
        if (err) {
          console.error('❌ User creation error:', err);
          reject(err);
        } else {
          console.log('✅ Admin user created with ID:', this.lastID);
          resolve(this.lastID);
        }
      });
    });

    // Generate verification code and token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log('🔐 Verification code:', verificationCode);

    // Save verification code and token
    const User = require('../models/User');
    await new Promise((resolve, reject) => {
      User.setVerificationCode(adminEmail.toLowerCase(), verificationCode, verificationToken, (err) => {
        if (err) {
          console.error('❌ Failed to set verification code:', err);
          reject(err);
        } else {
          console.log('✅ Verification code saved');
          resolve();
        }
      });
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(adminEmail.toLowerCase(), verificationCode, verificationToken)
      .then(() => console.log('✅ Verification email sent to:', adminEmail))
      .catch((err) => console.error('⚠️  Failed to send verification email:', err.message));

    // Send notification to superadmin about new org registration (non-blocking)
    notifyNewOrganization({ Org_ID: orgId, Org_Name: orgName })
      .catch((err) => console.error('⚠️  Failed to send registration notification:', err.message));

    // Return success response
    return res.status(201).json({ 
      success: true,
      message: 'Organization registered successfully. Please check your email to verify your account.',
      email: adminEmail.toLowerCase(),
      user: { 
        orgId: orgId, 
        orgName: orgName,
        orgSlug: slug, 
        adminName: names[0],
        adminEmail: adminEmail.toLowerCase()
      } 
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

// 2. UNIVERSAL LOGIN (Now with Permanent Branding Support)
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // CRITICAL: We JOIN with Organization to get the most updated Org_Name and Logo_Path
  const sql = `
    SELECT u.*, o.Org_Name, o.Org_Domain, o.Logo_Path, o.Logo_MIME_Type, o.Theme_Color
    FROM User u 
    LEFT JOIN Organization o ON u.Org_ID = o.Org_ID 
    WHERE u.Email = ? AND u.Is_Active = 1
  `;

  db.get(sql, [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Check if email is verified (for OrgAdmin and regular users, not superadmin)
    // In development mode, allow bypass for testing
    if (user.Org_ID && !user.Email_Verified && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        error: 'Please verify your email before accessing your dashboard.',
        requiresVerification: true,
        email: user.Email
      });
    }

    // In development mode, auto-verify email on first login if not already verified
    if (user.Org_ID && !user.Email_Verified && process.env.NODE_ENV === 'development') {
      const User = require('../models/User');
      User.setEmailVerified(user.Email, (err) => {
        if (err) console.error('Failed to auto-verify email in dev mode:', err);
      });
    }

    // Standardized JWT Payload
    const token = jwt.sign(
      { 
        userId: user.User_ID, 
        orgId: user.Org_ID,
        orgSlug: user.Org_Domain,
        userTypeId: user.User_Type_ID, 
        role: user.User_Type_ID === 1 ? 'Admin' : 'Staff' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return everything needed for the Sidebar and Dashboard
    res.json({
      token,
      user: {
        userId: user.User_ID,
        firstName: user.First_Name,
        surName: user.SurName,
        name: user.First_Name,
        orgId: user.Org_ID,
        orgName: user.Org_Name,     // <--- Fetches updated name from settings
        orgSlug: user.Org_Domain,   // <--- Required for routing
        orgLogo: user.Logo_Path,    // <--- Fetches updated logo
        role: user.User_Type_ID === 1 ? 'Admin' : 'Staff',
        themeColor: user.Theme_Color,
        avatar: user.Avatar_Data || null,
        avatarMimeType: user.Avatar_MIME_Type || 'image/png'
      }
    });
  });
};

// 3. GET PROFILE
exports.getProfile = (req, res) => {
  res.json({ success: true, user: req.user });
};

// 4. REFRESH TOKEN
exports.refreshToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token expired' });
    const { iat, exp, ...payload } = decoded;
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token: newToken });
  });
};

// 5. INVITE EMPLOYEE (OrgAdmin only)
exports.inviteEmployee = async (req, res) => {
  try {
    const { email, firstName, surName, departId, roleId } = req.body;
    const { orgId, userId } = req.user;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await new Promise((resolve) => {
      db.get('SELECT User_ID FROM User WHERE Email = ? AND Org_ID = ?', [email.toLowerCase(), orgId], (err, row) => resolve(row));
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Employee already exists in your organization' });
    }

    // Check if invitation already pending
    const existingInvitation = await new Promise((resolve) => {
      db.get('SELECT Invitation_ID FROM Invitation WHERE Email = ? AND Org_ID = ? AND Is_Used = 0 AND Expires_At > datetime("now")', [email.toLowerCase(), orgId], (err, row) => resolve(row));
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation is already pending for this email' });
    }

    // Generate temporary password (8 characters: mix of letters, numbers, special chars)
    const tempPassword = Math.random().toString(36).slice(2, 10) + '!@';

    // Create invitation record
    const Invitation = require('../models/Invitation');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    Invitation.create({
      email: email.toLowerCase(),
      orgId: orgId,
      userTypeId: roleId || 3,
      expiresAt: expiresAt,
      createdBy: userId
    }, async (err, invitation) => {
      if (err) {
        console.error('Invitation creation error:', err);
        return res.status(500).json({ error: 'Failed to create invitation' });
      }

      // Fetch organization name and inviter details for email
      db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], async (errOrg, org) => {
        if (errOrg) console.error('Org fetch error:', errOrg);
        
        db.get('SELECT First_Name, SurName FROM User WHERE User_ID = ?', [userId], async (errInviter, inviter) => {
          if (errInviter) console.error('Inviter fetch error:', errInviter);

          const orgName = org?.Org_Name || 'TrackTimi';
          const inviterName = inviter ? `${inviter.First_Name} ${inviter.SurName}` : 'Admin';

          // Send invitation email with temporary password
          await sendInvitationEmail(email.toLowerCase(), invitation.Token, orgName, inviterName, tempPassword);

          res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            invitationToken: invitation.Token,
            inviteExpiresAt: invitation.Expires_At,
            email: invitation.Email,
            tempPassword: tempPassword // Include in response for display to admin if needed
          });
        });
      });
    });

  } catch (error) {
    console.error('Invite employee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 6. ACTIVATE INVITATION (Employee sets password)
exports.activateInvitation = async (req, res) => {
  try {
    const { token, password, firstName, surName } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid invitation
    const Invitation = require('../models/Invitation');
    Invitation.findByToken(token, async (err, invitation) => {
      if (err || !invitation) {
        return res.status(400).json({ error: 'Invalid or expired invitation token' });
      }

      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const existingUser = await new Promise((resolve) => {
          db.get('SELECT * FROM User WHERE Email = ?', [invitation.Email.toLowerCase()], (err, row) => resolve(row));
        });

        let userId;

        if (existingUser) {
          // Update existing user with password
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE User SET Password = ? WHERE User_ID = ?',
              [hashedPassword, existingUser.User_ID],
              (err) => {
                if (err) reject(err);
                else {
                  userId = existingUser.User_ID;
                  resolve();
                }
              }
            );
          });
        } else {
          // Create new user
          generateUniqueEmployeeId(async (err, employeeId) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to generate employee ID' });
            }

            const names = (firstName || surName || 'Employee').split(' ');
            const sql = `
              INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Employee_ID, Is_Active)
              VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            `;

            db.run(
              sql,
              [
                firstName || names[0],
                surName || names.slice(1).join(' '),
                invitation.Email.toLowerCase(),
                hashedPassword,
                invitation.Org_ID,
                invitation.User_Type_ID || 3,
                employeeId
              ],
              function(err) {
                if (err) {
                  console.error('User creation error:', err);
                  return res.status(500).json({ error: 'Failed to create user account' });
                }
                userId = this.lastID;
                completeActivation(userId, invitation);
              }
            );
          });
          return;
        }

        completeActivation(userId, invitation);

        function completeActivation(userId, invitation) {
          // Mark invitation as used
          Invitation.markUsed(token, (err) => {
            if (err) console.error('Failed to mark invitation as used:', err);
          });

          // Get updated user with org info
          const sql = `
            SELECT u.*, o.Org_Name, o.Org_Domain, o.Logo_Path, o.Theme_Color
            FROM User u 
            LEFT JOIN Organization o ON u.Org_ID = o.Org_ID 
            WHERE u.User_ID = ?
          `;

          db.get(sql, [userId], async (err, user) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to retrieve user' });
            }

            // Send notification to admins about new user
            try {
              await NotificationBroadcaster.onInvitationAccepted({
                userId: user.User_ID,
                firstName: user.First_Name,
                lastName: user.SurName,
                email: user.Email,
                orgId: user.Org_ID
              });
            } catch (notifErr) {
              console.error('Failed to send notification:', notifErr);
            }

            // Also send employee onboarding notification using new service
            const { notifyEmployeeOnboarding } = require('../utils/notificationService');
            notifyEmployeeOnboarding(user.User_ID, user.First_Name, user.SurName, user.Org_ID, user.Org_Name)
              .catch((err) => console.error('⚠️  Failed to send onboarding notification:', err.message));

            // Generate JWT
            const jwtToken = jwt.sign(
              {
                userId: user.User_ID,
                orgId: user.Org_ID,
                orgSlug: user.Org_Domain,
                userTypeId: user.User_Type_ID,
                role: user.User_Type_ID === 1 ? 'Admin' : 'Staff'
              },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.json({
              success: true,
              token: jwtToken,
              user: {
                userId: user.User_ID,
                firstName: user.First_Name,
                surName: user.SurName,
                email: user.Email,
                orgId: user.Org_ID,
                orgName: user.Org_Name,
                orgSlug: user.Org_Domain,
                role: user.User_Type_ID === 1 ? 'Admin' : 'Staff'
              }
            });
          });
        }

      } catch (error) {
        console.error('Activation error:', error);
        res.status(500).json({ error: 'Failed to activate invitation' });
      }
    });

  } catch (error) {
    console.error('Activate invitation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 7. VERIFY EMAIL BY LINK (GET /api/auth/verify-email?token=TOKEN)
exports.verifyEmailByLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const User = require('../models/User');
    User.verifyByToken(token, (err, user) => {
      if (err) {
        console.error('❌ Email verification error:', err);
        return res.status(500).json({ error: 'Verification process failed' });
      }

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification token',
          tokenExpired: true
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully! You can now login to your dashboard.',
        email: user.Email
      });
    });
  } catch (error) {
    console.error('❌ Verify email link error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// 8. VERIFY EMAIL BY CODE (POST /api/auth/verify-code)
exports.verifyEmailByCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Verification code must be 6 digits' });
    }

    const User = require('../models/User');
    User.verifyByCode(email.toLowerCase(), code, (err, user) => {
      if (err) {
        console.error('❌ Code verification error:', err);
        return res.status(500).json({ error: 'Verification process failed' });
      }

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid verification code or it has expired',
          codeExpired: true
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully! You can now login to your dashboard.',
        email: user.Email
      });
    });
  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// 9. RESEND VERIFICATION EMAIL (POST /api/auth/resend-verification)
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await new Promise((resolve) => {
      db.get('SELECT * FROM User WHERE Email = ?', [email.toLowerCase()], (err, row) => resolve(row));
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.Email_Verified) {
      return res.status(400).json({ error: 'This email is already verified' });
    }

    // Generate new code and token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const User = require('../models/User');
    User.setVerificationCode(email.toLowerCase(), verificationCode, verificationToken, async (err) => {
      if (err) {
        console.error('❌ Failed to generate new code:', err);
        return res.status(500).json({ error: 'Failed to generate verification code' });
      }

      // Send verification email
      try {
        await sendResendVerificationEmail(email.toLowerCase(), verificationCode, verificationToken);

        res.json({
          success: true,
          message: 'A new verification code has been sent to your email',
          email: email.toLowerCase()
        });
      } catch (emailError) {
        console.error('❌ Failed to send resend verification email:', emailError);
        res.status(500).json({ error: 'Failed to send verification email. Please try again later.' });
      }
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification' });
  }
};