const Joi = require('joi');
const User = require('../models/User');

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  surName: Joi.string().required(),
  lastName: Joi.string().allow(null, ''),
  orgId: Joi.number().integer().allow(null),
  userTypeId: Joi.number().integer().allow(null),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  depId: Joi.number().integer().allow(null),
  jobTitle: Joi.string().allow(null, '')
});

exports.createUser = (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  User.create(value, (err, user) => {
    if (err) {
      console.error('Create user error:', err.message);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    res.status(201).json(user);
  });
};

exports.getUsers = (req, res) => {
  User.findAll((err, users) => {
    if (err) {
      console.error('Get users error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  });
};

exports.getUserById = (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid user id' });

  User.findById(id, (err, user) => {
    if (err) {
      console.error('Get user by id error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
};
