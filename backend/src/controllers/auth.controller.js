const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { sendEmail, emailTemplates } = require('../services/email.service');
const { catchAsync, ApiError } = require('../middleware/error.middleware');

exports.signup = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { email, password, name } = req.body;
  
  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  // Create user
  const user = new User({
    email,
    password,
    name
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  
  await user.save();

  // Send verification email
  const { subject, html } = emailTemplates.verificationEmail(verificationToken);
  await sendEmail(user.email, subject, html);

  // Send welcome email
  const welcomeTemplate = emailTemplates.welcomeEmail(user.name);
  await sendEmail(user.email, welcomeTemplate.subject, welcomeTemplate.html);

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({
    status: 'success',
    data: {
      token,
      userId: user._id,
      message: 'Verification email sent'
    }
  });
});

exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No user found with this email');
  }

  // Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Send password reset email
  const { subject, html } = emailTemplates.passwordResetEmail(resetToken);
  await sendEmail(user.email, subject, html);

  res.json({
    status: 'success',
    message: 'Password reset email sent'
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password reset successful'
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is verified
  if (!user.isVerified) {
    throw new ApiError(401, 'Please verify your email before logging in');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

exports.verifyToken = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid token');
  }
});

exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const {
    phoneNumber,
    dateOfBirth,
    gender,
    address,
    emergencyContact,
    medicalInfo
  } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalInfo
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  const userId = req.userData.userId;

  const user = await User.findById(userId)
    .select('profile email name onboarded');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.onboarding = catchAsync(async (req, res) => {
  const { metrics } = req.body;
  const userId = req.userData.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Add metrics
  user.metrics.push(...metrics.map(metric => ({
    type: metric.type,
    value: metric.value,
    date: new Date()
  })));

  user.onboarded = true;
  await user.save();

  res.json({
    status: 'success',
    data: {
      metrics: user.metrics,
      onboarded: true
    }
  });
});

// Create test user - only for development
exports.createTestUser = catchAsync(async (req, res) => {
  // Check if test user already exists
  const testEmail = 'test@example.com';
  let user = await User.findOne({ email: testEmail });
  
  if (user) {
    // If test user exists, return their credentials
    res.json({
      status: 'success',
      message: 'Test user already exists',
      data: {
        email: testEmail,
        password: 'Test123!'
      }
    });
    return;
  }

  // Create new test user
  user = new User({
    email: testEmail,
    password: 'Test123!',
    name: 'Test User',
    isVerified: true
  });

  await user.save();

  res.json({
    status: 'success',
    message: 'Test user created',
    data: {
      email: testEmail,
      password: 'Test123!'
    }
  });
});
