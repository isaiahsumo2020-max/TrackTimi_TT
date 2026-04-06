const db = require('../config/db');
const socketHelper = require('../utils/socket');

// =============================================================
// 1. USER: SUBMIT EXCUSE (with attachment support)
// =============================================================
exports.submitExcuse = (req, res) => {
  try {
    const { userId, orgId } = req.user;
    const { excuseType, reason, dateAffected, attendId } = req.body;

    if (!excuseType || !reason || !dateAffected) {
      return res.status(400).json({ error: 'Excuse type, reason, and date are required' });
    }

    // Validate excuse type
    const validTypes = ['LATE', 'ABSENT', 'EARLY_EXIT', 'LEAVE'];
    if (!validTypes.includes(excuseType)) {
      return res.status(400).json({ error: 'Invalid excuse type' });
    }

    // Get attachment if provided
    let attachmentData = null;
    let attachmentMimeType = null;
    let attachmentName = null;

    if (req.files && req.files.attachment) {
      const file = req.files.attachment;
      attachmentData = file.data;
      attachmentMimeType = file.mimetype;
      attachmentName = file.name;
    }

    const sql = `
      INSERT INTO Excuse (
        User_ID, Org_ID, Attend_ID, Excuse_Type, Reason, 
        Attachment_Data, Attachment_MIME_Type, Attachment_Name,
        Date_Affected, Created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `;

    db.run(
      sql,
      [userId, orgId, attendId || null, excuseType, reason, attachmentData, attachmentMimeType, attachmentName, dateAffected],
      function(err) {
        if (err) {
          console.error('❌ Excuse submission error:', err.message);
          return res.status(500).json({ error: 'Failed to submit excuse: ' + err.message });
        }

        const excuseId = this.lastID;

        // Get user info for notification
        db.get(`SELECT First_Name, SurName FROM User WHERE User_ID = ?`, [userId], (err, user) => {
          // Create notification for admins about new excuse
          const admins = [];
          const adminNotifSql = `
            SELECT DISTINCT u.User_ID 
            FROM User u 
            WHERE u.Org_ID = ? AND u.User_Type_ID = 1
          `;

          db.all(adminNotifSql, [orgId], (err, adminUsers) => {
            if (adminUsers && adminUsers.length > 0) {
              adminUsers.forEach(admin => {
                const title = `New Excuse Pending Review: ${excuseType}`;
                const message = `${user?.First_Name} ${user?.SurName} submitted a ${excuseType} excuse for ${dateAffected}. Reason: "${reason.substring(0, 50)}..."`;

                db.run(
                  `INSERT INTO Notification (User_ID, Org_ID, Excuse_ID, Title, Message, Type, Category, Created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                  [admin.User_ID, orgId, excuseId, title, message, 'alert', 'excuse'],
                  (err) => {
                    if (!err) {
                      // Emit real-time notification via Socket.IO
                      try {
                        const io = socketHelper.getIo();
                        io.to(`org:${orgId}`).to(`admin:${admin.User_ID}`).emit('excuse:submitted', {
                          excuseId: excuseId,
                          userId: userId,
                          userName: `${user?.First_Name} ${user?.SurName}`,
                          excuseType: excuseType,
                          reason: reason,
                          dateAffected: dateAffected,
                          timestamp: new Date().toISOString()
                        });
                      } catch (socketErr) {
                        console.error('Socket emit error:', socketErr.message);
                      }
                    }
                  }
                );
              });
            }
          });
        });

        res.status(201).json({
          success: true,
          excuseId: excuseId,
          message: 'Excuse submitted for admin review. You will be notified when it is reviewed.'
        });
      }
    );
  } catch (error) {
    console.error('Submit excuse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================
// 2. ADMIN: GET PENDING EXCUSES
// =============================================================
exports.getPendingExcuses = (req, res) => {
  try {
    const { orgId } = req.user;
    const status = req.query.status || 'PENDING'; // Can filter by status

    const sql = `
      SELECT 
        e.Excuse_ID,
        e.User_ID,
        e.Excuse_Type,
        e.Reason,
        e.Status,
        e.Date_Affected,
        e.Created_at,
        e.Attachment_Name,
        u.First_Name,
        u.SurName,
        u.Email,
        u.Employee_ID,
        a.Attend_ID,
        a.Check_in_time,
        a.Check_out_time
      FROM Excuse e
      INNER JOIN User u ON e.User_ID = u.User_ID
      LEFT JOIN Attendance a ON e.Attend_ID = a.Attend_ID
      WHERE e.Org_ID = ? AND e.Status = ?
      ORDER BY 
        CASE WHEN e.Status = 'PENDING' THEN 1 ELSE 2 END ASC,
        e.Created_at DESC
      LIMIT 100
    `;

    db.all(sql, [orgId, status], (err, excuses) => {
      if (err) {
        console.error('Fetch excuses error:', err);
        return res.status(500).json({ error: 'Failed to fetch excuses' });
      }

      res.json({
        success: true,
        excuses: excuses || [],
        summary: {
          total: (excuses || []).length,
          bystatus: {
            pending: (excuses || []).filter(e => e.Status === 'PENDING').length,
            approved: (excuses || []).filter(e => e.Status === 'APPROVED').length,
            rejected: (excuses || []).filter(e => e.Status === 'REJECTED').length
          }
        }
      });
    });
  } catch (error) {
    console.error('Get excuses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================
// 3. ADMIN: APPROVE EXCUSE
// =============================================================
exports.approveExcuse = (req, res) => {
  try {
    const { excuseId } = req.params;
    const { approvalNotes } = req.body;
    const { userId: adminId, orgId } = req.user;

    // Get excuse details
    db.get(
      `SELECT * FROM Excuse WHERE Excuse_ID = ? AND Org_ID = ?`,
      [excuseId, orgId],
      (err, excuse) => {
        if (err || !excuse) {
          return res.status(404).json({ error: 'Excuse not found' });
        }

        // Update excuse status
        db.run(
          `UPDATE Excuse 
           SET Status = 'APPROVED', Approved_By = ?, Approval_Notes = ?, Approved_At = datetime('now', 'localtime'), Updated_at = datetime('now', 'localtime')
           WHERE Excuse_ID = ?`,
          [adminId, approvalNotes || null, excuseId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to approve excuse' });
            }

            // Update related attendance record if exists
            if (excuse.Attend_ID) {
              db.run(
                `UPDATE Attendance SET Excuse_ID = ? WHERE Attend_ID = ?`,
                [excuseId, excuse.Attend_ID],
                (err) => {
                  if (err) console.error('Error linking excuse to attendance:', err);
                }
              );
            }

            // Create notification for user
            db.get(`SELECT First_Name, SurName FROM User WHERE User_ID = ?`, [adminId], (err, admin) => {
              const title = 'Excuse Approved ✅';
              const message = `Your ${excuse.Excuse_Type} excuse for ${excuse.Date_Affected} has been approved by ${admin?.First_Name} ${admin?.SurName}.`;

              db.run(
                `INSERT INTO Notification (User_ID, Org_ID, Excuse_ID, Title, Message, Type, Category, Created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                [excuse.User_ID, orgId, excuseId, title, message, 'success', 'excuse'],
                (err) => {
                  if (!err) {
                    // Emit real-time notification
                    try {
                      const io = socketHelper.getIo();
                      io.to(`user:${excuse.User_ID}`).emit('excuse:approved', {
                        excuseId: excuseId,
                        excuseType: excuse.Excuse_Type,
                        dateAffected: excuse.Date_Affected,
                        approvalNotes: approvalNotes,
                        approvedBy: `${admin?.First_Name} ${admin?.SurName}`,
                        timestamp: new Date().toISOString()
                      });
                    } catch (socketErr) {
                      console.error('Socket emit error:', socketErr.message);
                    }
                  }
                }
              );
            });

            res.json({
              success: true,
              message: 'Excuse approved successfully. User notified.'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Approve excuse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================
// 4. ADMIN: REJECT EXCUSE
// =============================================================
exports.rejectExcuse = (req, res) => {
  try {
    const { excuseId } = req.params;
    const { rejectionReason } = req.body;
    const { userId: adminId, orgId } = req.user;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    db.get(
      `SELECT * FROM Excuse WHERE Excuse_ID = ? AND Org_ID = ?`,
      [excuseId, orgId],
      (err, excuse) => {
        if (err || !excuse) {
          return res.status(404).json({ error: 'Excuse not found' });
        }

        db.run(
          `UPDATE Excuse 
           SET Status = 'REJECTED', Approved_By = ?, Approval_Notes = ?, Approved_At = datetime('now', 'localtime'), Updated_at = datetime('now', 'localtime')
           WHERE Excuse_ID = ?`,
          [adminId, rejectionReason, excuseId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to reject excuse' });
            }

            // Create notification for user
            db.get(`SELECT First_Name, SurName FROM User WHERE User_ID = ?`, [adminId], (err, admin) => {
              const title = 'Excuse Rejected ❌';
              const message = `Your ${excuse.Excuse_Type} excuse for ${excuse.Date_Affected} was not approved. Reason: ${rejectionReason}`;

              db.run(
                `INSERT INTO Notification (User_ID, Org_ID, Excuse_ID, Title, Message, Type, Category, Created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                [excuse.User_ID, orgId, excuseId, title, message, 'warning', 'excuse'],
                (err) => {
                  if (!err) {
                    try {
                      const io = socketHelper.getIo();
                      io.to(`user:${excuse.User_ID}`).emit('excuse:rejected', {
                        excuseId: excuseId,
                        excuseType: excuse.Excuse_Type,
                        dateAffected: excuse.Date_Affected,
                        rejectionReason: rejectionReason,
                        rejectedBy: `${admin?.First_Name} ${admin?.SurName}`,
                        timestamp: new Date().toISOString()
                      });
                    } catch (socketErr) {
                      console.error('Socket emit error:', socketErr.message);
                    }
                  }
                }
              );
            });

            res.json({
              success: true,
              message: 'Excuse rejected. User notified.'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Reject excuse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================================
// 5. USER: GET OWN EXCUSES
// =============================================================
exports.getMyExcuses = (req, res) => {
  try {
    const { userId, orgId } = req.user;

    const sql = `
      SELECT 
        e.Excuse_ID,
        e.Excuse_Type,
        e.Reason,
        e.Status,
        e.Date_Affected,
        e.Created_at,
        e.Approved_At,
        e.Approval_Notes,
        e.Attachment_Name,
        u.First_Name as Approved_By_First_Name,
        u.SurName as Approved_By_Last_Name
      FROM Excuse e
      LEFT JOIN User u ON e.Approved_By = u.User_ID
      WHERE e.User_ID = ? AND e.Org_ID = ?
      ORDER BY e.Created_at DESC
      LIMIT 50
    `;

    db.all(sql, [userId, orgId], (err, excuses) => {
      if (err) {
        console.error('Fetch user excuses error:', err);
        return res.status(500).json({ error: 'Failed to fetch excuses' });
      }

      const summary = {
        total: (excuses || []).length,
        pending: (excuses || []).filter(e => e.Status === 'PENDING').length,
        approved: (excuses || []).filter(e => e.Status === 'APPROVED').length,
        rejected: (excuses || []).filter(e => e.Status === 'REJECTED').length
      };

      res.json({
        success: true,
        excuses: excuses || [],
        summary: summary
      });
    });
  } catch (error) {
    console.error('Get my excuses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
