const Joi = require('joi');

const validators = {
  // User validation
  user: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    surName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().max(50).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().max(20).allow(null, ''),
    orgId: Joi.number().integer().min(1).allow(null),
    userTypeId: Joi.number().integer().valid(1, 2, 3, 4, 5).allow(null),
    jobTitle: Joi.string().max(100).allow(null, ''),
    password: Joi.string().min(6).allow(null, '')
  }),

  // Attendance validation  
  attendance: Joi.object({
    userId: Joi.number().integer().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    statusId: Joi.number().integer().valid(1, 2, 3, 4, 5).allow(null),
    methodId: Joi.number().integer().valid(1, 2, 3, 4, 5).allow(null)
  }),

  // Organization validation
  organization: Joi.object({
    orgName: Joi.string().min(2).max(255).required(),
    orgTypeId: Joi.number().integer().min(1).allow(null),
    regionId: Joi.number().integer().min(1).allow(null),
    numEmployees: Joi.number().integer().min(1).allow(null),
    phone: Joi.string().max(20).allow(null, ''),
    email: Joi.string().email().allow(null, '')
  }),

  // Generic validate function
  validate: (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      return { valid: false, errors: error.details.map(d => d.message) };
    }
    return { valid: true, data: value };
  }
};

module.exports = validators;
