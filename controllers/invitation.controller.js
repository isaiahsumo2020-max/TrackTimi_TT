const Joi = require('joi');
const Invitation = require('../models/Invitation');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { sendInvitationEmail } = require('../utils/emailService');
const { notifyNewUser, notifyOrgAdminAction } = require('../utils/notificationHelper');

exports.inviteEmployee = async (req, res) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required(), firstName: Joi.string().required(), surName: Joi.string().required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const orgId = req.user.orgId;
    const invitedBy = req.user.userId;

    // Check existing user
    db.get('SELECT User_ID FROM User WHERE Email = ? AND Org_ID = ?', [value.email.toLowerCase(), orgId], (err, existing) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (existing) return res.status(409).json({ error: 'User already exists' });

      // Check existing invitation
      Invitation.findByOrgAndEmail(orgId, value.email, (err, existingInv) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (existingInv) return res.status(409).json({ error: 'Already invited', token: existingInv.Token });

        Invitation.create({ email: value.email, orgId: orgId, userTypeId: 3, createdBy: invitedBy }, async (errCreate, inv) => {
          if (errCreate) return res.status(500).json({ error: 'Failed to create invitation' });

          console.log('✅ Invitation created for:', value.email);

          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(2, 10) + '!@';
          console.log('🔐 Generated temp password for:', value.email);

          // Store invitation details temporarily (not creating user yet)
          // Store in a map or cache with the token as key
          const invitationDetails = {
            email: value.email.toLowerCase(),
            firstName: value.firstName,
            surName: value.surName,
            jobTitle: null,
            departId: null,
            orgId: orgId,
            userTypeId: 3,
            tempPassword: tempPassword
          };
          
          // We'll store this in the Pending_Employee table for reference, but user won't be created yet
          const pendingSql = `INSERT INTO Pending_Employee (Email, First_Name, SurName, Job_Title, Depart_ID, Org_ID, Invitation_ID, User_Type_ID, Created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
          db.run(pendingSql, [value.email.toLowerCase(), value.firstName, value.surName, null, null, orgId, inv.Invitation_ID, 3], (errPending) => {
            if (errPending) console.error('Pending insert error:', errPending);
            else console.log('✅ Pending employee record created');
          });

          // Fetch organization name and inviter details
          db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], async (errOrg, org) => {
            if (errOrg) console.error('Org fetch error:', errOrg);
            
            db.get('SELECT First_Name, SurName FROM User WHERE User_ID = ?', [invitedBy], async (errInviter, inviter) => {
              if (errInviter) console.error('Inviter fetch error:', errInviter);

              const orgName = org?.Org_Name || 'TrackTimi';
              const inviterName = inviter ? `${inviter.First_Name} ${inviter.SurName}` : 'Admin';

              console.log('📧 About to send invitation to:', value.email, 'from:', inviterName, 'org:', orgName);

              // Send invitation email with temporary password
              const emailResult = await sendInvitationEmail(value.email.toLowerCase(), inv.Token, orgName, inviterName, tempPassword);
              
              if (emailResult.success) {
                console.log('✅ Invitation email sent successfully to:', value.email);
              } else {
                console.error('❌ Failed to send invitation email to:', value.email, 'Error:', emailResult.error);
              }

              // Notify the org admin about sending the invitation
              notifyOrgAdminAction(
                invitedBy,
                orgId,
                '👤 Employee Invitation Sent',
                `You sent an invitation to ${value.firstName} ${value.surName} (${value.email})`,
                'user'
              );

              res.status(201).json({ 
                invited: true, 
                token: inv.Token,
                message: `Invitation sent to ${value.email}. Waiting for user to activate...`,
                tempPassword: tempPassword
              });
            });
          });
        });
      });
    });
  } catch (e) {
    console.error('Invite error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getInvitationDetails = (req, res) => {
  const token = req.params.token;
  Invitation.findByToken(token, (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch invitation' });
    if (!row) return res.status(404).json({ error: 'Invitation not found or already used' });
    // try to get pending details
    db.get('SELECT First_Name, SurName, Email FROM Pending_Employee WHERE Invitation_ID = ?', [row.Invitation_ID], (err2, pending) => {
      if (err2) console.error('Pending lookup error:', err2);
      res.json({ email: pending?.Email || row.Email, firstName: pending?.First_Name, surName: pending?.SurName, orgId: row.Org_ID, expiresAt: row.Expires_At });
    });
  });
};

exports.activateInvitation = async (req, res) => {
  try {
    const schema = Joi.object({ token: Joi.string().required(), password: Joi.string().min(6).required() });
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    Invitation.findByToken(value.token, async (err, invite) => {
      if (err) return res.status(500).json({ error: 'Failed to verify invitation' });
      if (!invite) return res.status(404).json({ error: 'Invalid or used invitation token' });

      console.log('🔗 Activation token found for:', invite.Email);

      db.get('SELECT * FROM Pending_Employee WHERE Invitation_ID = ?', [invite.Invitation_ID], async (err2, pending) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        if (!pending) return res.status(400).json({ error: 'Pending record not found' });

        console.log('⏳ Pending employee found:', pending.Email);

        const hashed = await bcrypt.hash(value.password, 10);
        const sql = `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Depart_ID, Employee_ID, Is_Active, Email_Verified, Created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, datetime('now'))`;

        // simple employee id
        const empId = 'EMP' + Math.floor(Math.random() * 900000 + 100000);

        db.run(sql, [pending.First_Name, pending.SurName, pending.Email.toLowerCase(), hashed, pending.Org_ID, pending.User_Type_ID, pending.Job_Title, pending.Depart_ID, empId], function(errCreate) {
          if (errCreate) {
            console.error('❌ User create error:', errCreate);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          const userId = this.lastID;
          console.log('✅ User created successfully:', pending.Email, 'with ID:', userId);

          // Trigger notification for org admins about new user activation
          console.log('📢 Triggering notification for new user activation');
          const userData = {
            User_ID: userId,
            First_Name: pending.First_Name,
            SurName: pending.SurName,
            Email: pending.Email,
            Job_Title: pending.Job_Title
          };
          const orgData = { Org_ID: pending.Org_ID, Org_Name: 'Your Organization' };
          
          notifyNewUser(userData, orgData, (notifyErr) => {
            if (notifyErr) {
              console.error('❌ Failed to create user activation notification:', notifyErr);
            } else {
              console.log('✅ User activation notification created successfully');
            }
          });

          Invitation.markUsed(value.token, (errMark) => { 
            if (errMark) console.error('Mark used error:', errMark);
            else console.log('✅ Invitation marked as used');
          });

          db.run('DELETE FROM Pending_Employee WHERE Invitation_ID = ?', [invite.Invitation_ID], (errDel) => { 
            if (errDel) console.error('Pending delete error:', errDel);
            else console.log('✅ Pending employee record cleaned up');
          });

          res.json({ 
            created: true, 
            userId, 
            employeeId: empId,
            message: 'Account activated successfully! You can now log in.'
          });
        });
      });
    });
  } catch (e) {
    console.error('Activate invite error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: list invitations for org
exports.getInvitations = (req, res) => {
  const orgId = req.user?.orgId || req.body.orgId;
  if (!orgId) return res.status(400).json({ error: 'orgId required' });

  db.all('SELECT * FROM Invitation WHERE Org_ID = ? ORDER BY Created_at DESC', [orgId], (err, rows) => {
    if (err) {
      console.error('Get invitations error:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json({ total: rows.length, invitations: rows });
  });
};

// Admin: resend an invitation (extend expiry and send email)
exports.resendInvitation = async (req, res) => {
  const invitationId = req.params.invitationId;
  const orgId = req.user?.orgId;
  if (!invitationId || !orgId) return res.status(400).json({ error: 'invitationId and org context required' });

  db.get('SELECT * FROM Invitation WHERE Invitation_ID = ? AND Org_ID = ?', [invitationId, orgId], async (err, inv) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.run('UPDATE Invitation SET Expires_At = ? WHERE Invitation_ID = ?', [newExpires, invitationId], (errUpd) => {
      if (errUpd) console.error('Expire update error:', errUpd);
    });

    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/activate/${inv.Token}`;
    const transporter = getTransporter();
    const mailOptions = { from: process.env.SMTP_FROM || 'no-reply@tracktimi.local', to: inv.Email, subject: 'Your TrackTimi invitation (resend)', text: `Activate: ${activationUrl}`, html: `<p>Activate: <a href="${activationUrl}">link</a></p>` };
    try { await transporter.sendMail(mailOptions); } catch (e) { console.warn('Resend email failed:', e.message); }

    res.json({ resent: true, expiresAt: newExpires });
  });
};
 
