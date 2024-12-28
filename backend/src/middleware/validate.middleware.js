const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to validate request using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      const promises = [];
      for (let validation of validations) {
        if (Array.isArray(validation)) {
          promises.push(...validation.map(v => v.run(req)));
        } else if (validation) {
          promises.push(validation.run(req));
        }
      }
      await Promise.all(promises);

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }));

      throw new ApiError(400, 'Validation Error', true, { errors: extractedErrors });
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
const schemas = {
  // Auth validations
  signup: [
    {
      field: 'email',
      rules: { isEmail: true },
      message: 'Please provide a valid email address'
    },
    {
      field: 'password',
      rules: { isLength: { min: 6 } },
      message: 'Password must be at least 6 characters long'
    },
    {
      field: 'name',
      rules: { notEmpty: true },
      message: 'Name is required'
    }
  ],

  // Metrics validations
  metrics: [
    {
      field: 'type',
      rules: { isIn: [['height', 'weight', 'blood_pressure', 'heart_rate', 'temperature']] },
      message: 'Invalid metric type'
    },
    {
      field: 'value',
      rules: { isNumeric: true },
      message: 'Metric value must be a number'
    }
  ],

  // Record validations
  record: [
    {
      field: 'title',
      rules: { notEmpty: true },
      message: 'Title is required'
    },
    {
      field: 'type',
      rules: { isIn: [['lab_result', 'prescription', 'medical_report', 'imaging', 'other']] },
      message: 'Invalid record type'
    }
  ]
};

module.exports = {
  validate,
  schemas
};
