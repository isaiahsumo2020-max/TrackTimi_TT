const Invitation = require('../models/Invitation');
const User = require('../models/User');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUniqueEmployeeId } = require('../utils/employeeId');

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

/**
 * Admin invites employee
 * POST /api/admin/invite-employee
 */
exports.inviteEmployee = (req, res) => {
  const { email, firstName, surName, departmentId, jobTitle, userTypeId = 3 } = req.body;
  const orgId = req.user.orgId;
  const createdBy = req.user.userId;

  // Validation
  if (!email || !firstName || !surName) {
    return res.status(400).json({ error: 'Email, firstName, and surName are required' });
  }

  // Check if user already exists in org
  db.get(
    'SELECT User_ID FROM User WHERE Email = ? AND Org_ID = ?',
    [email, orgId],
    (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'Employee with this email already exists in organization' });
      }

      // Check if already invited
      Invitation.findByOrgAndEmail(orgId, email, (err, existingInvitation) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingInvitation) {
          return res.status(409).json({ 
            error: 'Employee has already been invited',
            invitationId: existingInvitation.Invitation_ID,
            token: existingInvitation.Token
          });
        }

        // Create invitation
        Invitation.create(
          {
            email,
            orgId,
            userTypeId,
            createdBy
          },
          (err, invitation) => {
            if (err) {
              console.error('Invitation creation error:', err);
              return res.status(500).json({ error: 'Failed to create invitation' });
            }

            // Store employee details temporarily in database (pending activation)
            const sql = `
              INSERT INTO Pending_Employee (Email, First_Name, SurName, Depart_ID, Job_Title, Org_ID, Invitation_ID, User_Type_ID)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(sql, [email, firstName, surName, departmentId || null, jobTitle || null, orgId, invitation.Invitation_ID, userTypeId], (err) => {
              if (err) console.error('Pending employee creation error:', err);
              
              res.status(201).json({
                message: '✅ Employee invitation sent',
                invitation: {
                  Invitation_ID: invitation.Invitation_ID,
                  email,
                  token: invitation.token,
                  expiresAt: invitation.expiresAt,
                  status: 'pending'
                }
              });
            });
          }
        );
      });
    }
  );
};

/**
 * Get all invitations for organization
 * GET /api/admin/invitations
 */
exports.getInvitations = (req, res) => {
  const orgId = req.user.orgId;

  Invitation.findByOrgId(orgId, (err, invitations) => {
    if (err) {
      console.error('Get invitations error:', err);
      return res.status(500).json({ error: 'Failed to fetch invitations' });
    }

    res.json({
      total: invitations.length,
      invitations: invitations.map(inv => ({
        Invitation_ID: inv.Invitation_ID,
        Email: inv.Email,
        UserType: inv.UserType,
        Is_Used: inv.Is_Used,
        Created_at: inv.Created_at,
        Used_at: inv.Used_at,
        Status: inv.Is_Used ? 'Accepted' : inv.Expires_At < new Date() ? 'Expired' : 'Pending'
      }))
    });
  });
};

/**
 * Employee activates account with invitation token
 * POST /api/auth/activate-invitation
 */
exports.activateInvitation = (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password required' });
  }

  // Find valid invitation
  Invitation.findByToken(token, (err, invitation) => {
    if (err) {
      console.error('Invitation lookup error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!invitation) {
      return res.status(401).json({ error: 'Invalid or expired invitation token' });
    }

    // Get pending employee details
    db.get(
      'SELECT * FROM Pending_Employee WHERE Invitation_ID = ?',
      [invitation.Invitation_ID],
      (err, pending) => {
        if (err) {
          console.error('Pending employee lookup error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!pending) {
          return res.status(400).json({ error: 'No pending employee record found' });
        }

        // Generate employee ID
        generateUniqueEmployeeId((err, employeeId) => {
          if (err) {
            console.error('Employee ID generation error:', err);
            return res.status(500).json({ error: 'Failed to generate employee ID' });
          }

          // Hash password
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.error('Password hash error:', err);
              return res.status(500).json({ error: 'Password encryption failed' });
            }

            // Create actual user
            const sql = `
              INSERT INTO User (
                First_Name, SurName, Email, Password, 
                Org_ID, User_Type_ID, Job_Title, Depart_ID, 
                Employee_ID, Is_Active, Created_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
            `;

            db.run(
              sql,
              [
                pending.First_Name,
                pending.SurName,
                pending.Email,
                hash,
                pending.Org_ID,
                pending.User_Type_ID,
                pending.Job_Title,
                pending.Depart_ID,
                employeeId
              ],
              function(err) {
                if (err) {
                  if (err.message.includes('UNIQUE constraint')) {
                    return res.status(409).json({ error: 'Email already registered' });
                  }
                  console.error('User creation error:', err);
                  return res.status(500).json({ error: 'Failed to create user account' });
                }

                const userId = this.lastID;

                // Mark invitation as used
                Invitation.markAsUsed(invitation.Invitation_ID, userId, (err) => {
                  if (err) console.error('Error marking invitation as used:', err);

                  // Delete pending employee record
                  db.run('DELETE FROM Pending_Employee WHERE Invitation_ID = ?', [invitation.Invitation_ID], (err) => {
                    if (err) console.error('Error deleting pending employee:', err);

                    // Generate JWT
                    const jwtToken = jwt.sign(
                      {
                        userId,
                        orgId: pending.Org_ID,
                        email: pending.Email,
                        role: pending.User_Type_ID === 1 ? 'Admin' : 'Staff',
                        employeeId
                      },
                      JWT_SECRET,
                      { expiresIn: '7d' }
                    );

                    res.json({
                      message: ' Account activated successfully',
                      token: jwtToken,
                      user: {
                        userId,
                        employeeId,
                        firstName: pending.First_Name,
                        surName: pending.SurName,
                        email: pending.Email,
                        orgId: pending.Org_ID,
                        userTypeId: pending.User_Type_ID
                      }
                    });
                  });
                });
              }
            );
          });
        });
      }
    );
  });
};

/**
 * Resend invitation
 * POST /api/admin/resend-invitation/:invitationId
 */
exports.resendInvitation = (req, res) => {
  const { invitationId } = req.params;
  const orgId = req.user.orgId;

  db.get(
    'SELECT * FROM Invitation WHERE Invitation_ID = ? AND Org_ID = ?',
    [invitationId, orgId],
    (err, invitation) => {
      if (err) {
        console.error('Invitation lookup error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!invitation || invitation.Is_Used) {
        return res.status(400).json({ error: 'Invitation not found or already used' });
      }

      // Update expiration date
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      db.run(
        'UPDATE Invitation SET Expires_At = ? WHERE Invitation_ID = ?',
        [newExpiresAt, invitationId],
        (err) => {
          if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Failed to resend invitation' });
          }

          res.json({
            message: '✅ Invitation resent',
            expiresAt: newExpiresAt
          });
        }
      );
    }
  );
};

/**
 * Get invitation details (for activation page)
 * GET /api/auth/invitation/:token
 */
exports.getInvitationDetails = (req, res) => {
  const { token } = req.params;

  Invitation.findByToken(token, (err, invitation) => {
    if (err) {
      console.error('Invitation lookup error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!invitation) {
      return res.status(401).json({ error: 'Invalid or expired invitation token' });
    }

    db.get(
      'SELECT First_Name, SurName, Email FROM Pending_Employee WHERE Invitation_ID = ?',
      [invitation.Invitation_ID],
      (err, pending) => {
        if (err) {
          console.error('Pending employee lookup error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          email: pending?.Email || invitation.Email,
          firstName: pending?.First_Name,
          surName: pending?.SurName,
          expiresAt: invitation.Expires_At
        });
      }
    );
  });
};
