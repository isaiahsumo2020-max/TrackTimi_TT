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
  Attendance.listRecent(limit, (err, rows) => {
    if (err) {
      console.error('Fetch attendance error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch attendance' });
    }
    res.json(rows);
  });
};
