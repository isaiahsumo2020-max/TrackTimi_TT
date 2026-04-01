const Joi = require('joi');
const Invitation = require('../models/Invitation');
const db = require('../config/db');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return { sendMail: (opts) => { console.log('Email stub send:', opts); return Promise.resolve(); } };
}

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

          // store pending employee
          const sql = `INSERT INTO Pending_Employee (Email, First_Name, SurName, Job_Title, Depart_ID, Org_ID, Invitation_ID, User_Type_ID, Created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
          db.run(sql, [value.email.toLowerCase(), value.firstName, value.surName, null, null, orgId, inv.Invitation_ID, 3], (errPending) => {
            if (errPending) console.error('Pending insert error:', errPending);
          });

          const token = inv.Token;
          const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/activate/${token}`;
          const transporter = getTransporter();
          const mailOptions = { from: process.env.SMTP_FROM || 'no-reply@tracktimi.local', to: value.email, subject: 'You are invited to TrackTimi', text: `Activate: ${activationUrl}`, html: `<p>Activate: <a href="${activationUrl}">link</a></p>` };
          try { await transporter.sendMail(mailOptions); } catch (e) { console.warn('Email send failed:', e.message); }

          res.status(201).json({ invited: true, token });
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

      db.get('SELECT * FROM Pending_Employee WHERE Invitation_ID = ?', [invite.Invitation_ID], async (err2, pending) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        if (!pending) return res.status(400).json({ error: 'Pending record not found' });

        const hashed = await bcrypt.hash(value.password, 10);
        const sql = `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Depart_ID, Employee_ID, Is_Active, Created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`;

        // simple employee id
        const empId = 'EMP' + Math.floor(Math.random() * 900000 + 100000);

        db.run(sql, [pending.First_Name, pending.SurName, pending.Email.toLowerCase(), hashed, pending.Org_ID, pending.User_Type_ID, pending.Job_Title, pending.Depart_ID, empId], function(errCreate) {
          if (errCreate) {
            console.error('User create error:', errCreate);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          const userId = this.lastID;
          Invitation.markUsed(value.token, (errMark) => { if (errMark) console.error('Mark used error:', errMark); });
          db.run('DELETE FROM Pending_Employee WHERE Invitation_ID = ?', [invite.Invitation_ID], (errDel) => { if (errDel) console.error('Pending delete error:', errDel); });
          res.json({ created: true, userId, employeeId: empId });
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
 
