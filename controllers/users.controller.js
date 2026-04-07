const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { notifyEmployeeAdded } = require('../utils/notificationService');

// 0. GET ALL ADMINS (with organization info)
exports.getAdmins = (req, res) => {
  const sql = `
    SELECT 
      u.User_ID,
      u.First_Name,
      u.SurName,
      u.Email,
      u.Employee_ID,
      u.User_Type_ID,
      u.Job_Title,
      u.Phone_Num,
      u.Is_Active,
      u.Created_at,
      o.Org_ID,
      o.Org_Name,
      o.Org_Domain
    FROM User u
    LEFT JOIN Organization o ON u.Org_ID = o.Org_ID
    WHERE u.User_Type_ID = 1
    ORDER BY o.Org_Name ASC, u.First_Name ASC
  `;
  
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Database error fetching admins:', err);
      return res.status(500).json({ error: 'Failed to fetch organization admins' });
    }
    res.json(rows || []);
  });
};

// 1. CREATE USER (Provisioning)
exports.createUser = async (req, res) => {
  try {
    const { firstName, surName, email, password, jobTitle, depId, userTypeId } = req.body;
    const adminOrgId = req.user.orgId;

    if (!firstName || !surName || !email || !password) {
      return res.status(400).json({ error: 'Name, Email, and Password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Dep_ID, Is_Active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sql, [firstName, surName, email.toLowerCase(), hashedPassword, adminOrgId, userTypeId || 3, jobTitle, depId || null], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      // Send notification to org admin if this is an employee (user type 3)
      if ((userTypeId || 3) === 3) {
        db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [adminOrgId], (orgErr, org) => {
          if (!orgErr && org) {
            notifyEmployeeAdded(this.lastID, firstName, surName, adminOrgId, org.Org_Name)
              .catch((err) => console.error('⚠️  Failed to send employee added notification:', err.message));
          }
        });
      }
      
      res.status(201).json({ message: 'User provisioned successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. GET ALL USERS (The one causing the crash on line 7)
exports.getUsers = (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT 
      User_ID, 
      First_Name AS firstName, 
      SurName AS surName, 
      Email AS email, 
      Job_Title AS jobTitle,
      Employee_ID AS employeeId,
      Avatar_Data AS avatar,
      Avatar_MIME_Type AS avatarMimeType
    FROM User 
    WHERE Org_ID = ? AND Is_Active = 1
  `;
  
  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });
    res.json(rows);
  });
};

// 3. GET SINGLE USER
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;
  db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
};

// 4. UPDATE USER (Admin profile editing)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, surName, email, jobTitle, depId } = req.body;
    const orgId = req.user.orgId;

    // Verify user belongs to org
    db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], async (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });

      // Check if email is being changed and if it already exists
      if (email && email.toLowerCase() !== user.Email) {
        db.get('SELECT User_ID FROM User WHERE Email = ? AND User_ID != ?', [email.toLowerCase(), id], (err, existing) => {
          if (existing) return res.status(400).json({ error: 'Email already exists' });
        });
      }

      const sql = `
        UPDATE User 
        SET 
          First_Name = ?, 
          SurName = ?, 
          Email = ?, 
          Job_Title = ?, 
          Dep_ID = ?
        WHERE User_ID = ? AND Org_ID = ?
      `;

      db.run(
        sql,
        [firstName || user.First_Name, surName || user.SurName, email?.toLowerCase() || user.Email, jobTitle || user.Job_Title, depId || user.Dep_ID, id, orgId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Update failed: ' + err.message });
          res.json({ message: 'User updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 7. UPLOAD USER AVATAR
exports.uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;
    const { avatarData, avatarMimeType } = req.body;

    console.log(`[AVATAR] Uploading avatar for user ${id} in org ${orgId}`);
    console.log(`[AVATAR] Avatar data length: ${avatarData?.length || 0} chars`);

    if (!avatarData) {
      return res.status(400).json({ error: 'Avatar data is required' });
    }

    if (avatarData.length > 5000000) {
      return res.status(400).json({ error: 'Avatar data too large' });
    }

    // Verify user belongs to org
    db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], (err, user) => {
      if (err) {
        console.error(`[AVATAR] DB error fetching user: ${err.message}`);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      if (!user) {
        console.error(`[AVATAR] User not found: ${id}`);
        return res.status(404).json({ error: 'User not found' });
      }

      const sql = `
        UPDATE User 
        SET 
          Avatar_Data = ?,
          Avatar_MIME_Type = ?
        WHERE User_ID = ? AND Org_ID = ?
      `;

      console.log(`[AVATAR] Executing update for user ${id}`);
      db.run(
        sql,
        [avatarData, avatarMimeType || 'image/png', id, orgId],
        function(err) {
          if (err) {
            console.error(`[AVATAR] Update error: ${err.message}`);
            return res.status(500).json({ error: 'Avatar upload failed: ' + err.message });
          }
          console.log(`[AVATAR] Successfully updated user ${id}, changes: ${this.changes}`);
          res.json({ 
            message: 'Avatar uploaded successfully',
            userId: id,
            changes: this.changes
          });
        }
      );
    });
  } catch (error) {
    console.error(`[AVATAR] Exception: ${error.message}`);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// 5. CHANGE USER PASSWORD (Admin resetting user password)
exports.changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const orgId = req.user.orgId;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify user belongs to org
    db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], async (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const sql = 'UPDATE User SET Password = ? WHERE User_ID = ? AND Org_ID = ?';
      db.run(sql, [hashedPassword, id, orgId], (err) => {
        if (err) return res.status(500).json({ error: 'Password update failed' });
        res.json({ message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 6. DELETE USER (Admin deleting a user)
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    // Verify user belongs to org
    db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });

      const sql = 'DELETE FROM User WHERE User_ID = ? AND Org_ID = ?';
      db.run(sql, [id, orgId], (err) => {
        if (err) return res.status(500).json({ error: 'Delete failed: ' + err.message });
        res.json({ message: 'User deleted successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// =============================================================
// 7. GET OWN PROFILE (User viewing their profile)
// =============================================================
exports.getOwnProfile = (req, res) => {
  try {
    const { userId, orgId } = req.user;

    const sql = `
      SELECT 
        u.User_ID,
        u.First_Name,
        u.SurName,
        u.Email,
        u.Phone_Num,
        u.Job_Title,
        u.Employee_ID,
        u.Dep_ID,
        d.Depart_Name,
        u.Avatar_Data,
        u.Avatar_MIME_Type,
        u.Is_Active,
        u.Created_at,
        u.Updated_at,
        ut.Type_Name as User_Type,
        o.Org_Name
      FROM User u
      LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
      LEFT JOIN User_Type ut ON u.User_Type_ID = ut.User_Type_ID
      LEFT JOIN Organization o ON u.Org_ID = o.Org_ID
      WHERE u.User_ID = ? AND u.Org_ID = ?
    `;

    db.get(sql, [userId, orgId], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({
        success: true,
        profile: user
      });
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// =============================================================
// 8. GET ORG-ADMIN UPDATES & ITEMS NEEDING ATTENTION
// =============================================================
exports.getAttentionItems = (req, res) => {
  try {
    const { userId, orgId } = req.user;

    // Get all org-admin updates and items needing attention
    const sql = `
      SELECT 
        Notify_ID,
        Title,
        Message,
        Type,
        Category,
        Is_Read,
        Created_at,
        Action_URL,
        Related_Record_ID,
        CASE 
          WHEN Category = 'schedule' THEN 'Schedule Update'
          WHEN Category = 'attendance' THEN 'Attendance Alert'
          WHEN Category = 'clock_out' THEN 'Clock-Out Reminder'
          WHEN Category = 'general' THEN 'General Update'
          WHEN Category = 'policy' THEN 'Policy Update'
          WHEN Category = 'urgent' THEN 'Urgent Action Required'
          ELSE 'System Notification'
        END as Action_Type
      FROM Notification
      WHERE User_ID = ? 
        AND Org_ID = ?
        AND (Category IN ('schedule', 'policy', 'urgent') OR Is_Read = 0)
      ORDER BY 
        CASE 
          WHEN Type = 'urgent' THEN 1
          WHEN Is_Read = 0 THEN 2
          ELSE 3
        END ASC,
        Created_at DESC
      LIMIT 50
    `;

    db.all(sql, [userId, orgId], (err, notifications) => {
      if (err) {
        console.error('Notification fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch updates' });
      }

      // Count unread items needing attention
      const sql2 = `
        SELECT 
          COUNT(*) as urgentCount
        FROM Notification
        WHERE User_ID = ? 
          AND Org_ID = ?
          AND (Type = 'urgent' OR (Is_Read = 0 AND Type = 'alert'))
      `;

      db.get(sql2, [userId, orgId], (err, counts) => {
        res.json({
          success: true,
          attentionItems: notifications || [],
          summary: {
            totalNotifications: (notifications || []).length,
            urgentCount: counts?.urgentCount || 0,
            unreadCount: (notifications || []).filter(n => !n.Is_Read).length,
            requiresAction: (notifications || []).length > 0
          }
        });
      });
    });
  } catch (error) {
    console.error('Attention items error:', error);
    res.status(500).json({ error: 'Failed to fetch items needing attention' });
  }
};