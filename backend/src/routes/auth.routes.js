const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const authController = require('../controllers/auth.controller');

// Signup validation
const signupValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  body('name').notEmpty().withMessage('Name is required')
];

// Profile validation
const profileValidation = [
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']),
  body('address.*.zipCode').optional().isPostalCode('any').withMessage('Invalid postal code'),
  body('emergencyContact.phoneNumber').optional().isMobilePhone().withMessage('Invalid emergency contact number'),
  body('medicalInfo.bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
];

// Auth routes
router.post('/signup', validate(signupValidation), authController.signup);
router.post('/login', validate([
  body('email').isEmail(),
  body('password').exists()
]), authController.login);

// Test route - only for development
if (process.env.NODE_ENV === 'development') {
  router.post('/create-test-user', authController.createTestUser);
}

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset
router.post('/forgot-password', validate([
  body('email').isEmail()
]), authController.forgotPassword);
router.post('/reset-password/:token', validate([
  body('password')
    .isLength({ min: 6 })
    .matches(/\d/)
    .matches(/[A-Z]/)
]), authController.resetPassword);

// Profile management
router.get('/profile', authController.verifyToken, authController.getProfile);
router.patch('/profile', 
  authController.verifyToken,
  validate(profileValidation),
  authController.updateProfile
);

// Onboarding
router.post('/onboarding',
  authController.verifyToken,
  validate([
    body('metrics').isArray(),
    body('metrics.*.type').notEmpty(),
    body('metrics.*.value').exists()
  ]),
  authController.onboarding
);

module.exports = router;
