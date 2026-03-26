const Joi = require('joi');
const Attendance = require('../models/Attendance');

const checkInSchema = Joi.object({
  userId: Joi.number().integer().required(),
  statusId: Joi.number().integer().allow(null),
  methodId: Joi.number().integer().allow(null),
  latitude: Joi.number().allow(null),
  longitude: Joi.number().allow(null),
  deviceInfoId: Joi.number().integer().allow(null)
});

exports.checkIn = (req, res) => {
  const { error, value } = checkInSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  Attendance.createCheckIn(value, (err, record) => {
    if (err) {
      console.error('Check-in error:', err.message);
      return res.status(500).json({ error: 'Failed to record attendance' });
    }
    res.status(201).json(record);
  });
};

exports.getRecent = (req, res) => {
  const limit = Number(req.query.limit) || 20;
  Attendance.findRecent(limit, (err, rows) => {
    if (err) {
      console.error('Fetch attendance error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }
    res.json(rows);
  });
};

exports.getOrgLogs = (req, res) => {
  const orgId = req.user.orgId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context missing' });
  }

  const limit = Number(req.query.limit) || 25;
  const page = Number(req.query.page) || 1;
  const offset = (page - 1) * limit;

  Attendance.findOrgLogs(orgId, limit, offset, (err, rows) => {
    if (err) {
      console.error('Fetch org logs error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch org logs' });
    }

    res.json({ page, limit, logs: rows });
  });
};

exports.getOrgSummary = (req, res) => {
  const orgId = req.user.orgId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context missing' });
  }

  Attendance.findOrgSummary(orgId, (err, summary) => {
    if (err) {
      console.error('Fetch org summary error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch org summary' });
    }

    Attendance.findOrgWeeklyTrend(orgId, (err2, trend) => {
      if (err2) {
        console.error('Fetch org trend error:', err2.message);
        return res.status(500).json({ error: 'Failed to fetch org trend' });
      }

      res.json({ summary, weeklyTrend: trend });
    });
  });
};

exports.generateReport = (req, res) => {
  const orgId = req.user.orgId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context missing' });
  }

  Attendance.findOrgLogs(orgId, 1000, 0, (err, rows) => {
    if (err) {
      console.error('Generate report error:', err.message);
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    // Minimal report payload until advanced reporting engine is added
    const report = {
      generatedAt: new Date().toISOString(),
      totalEntries: rows.length,
      results: rows.map((row) => ({
        id: row.Attend_ID,
        name: `${row.First_Name} ${row.SurName}`,
        checkIn: row.Check_in_time,
        checkOut: row.Check_out_time,
        statusId: row.Status_ID,
        methodId: row.Method_ID,
        location: `${row.Latitude || 'N/A'}, ${row.Longitude || 'N/A'}`
      }))
    };

    res.json({ report });
  });
};
