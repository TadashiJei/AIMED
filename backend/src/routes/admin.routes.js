const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Admin = require('../models/admin.model');
const adminController = require('../controllers/adminController');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      access_token: token,
      token_type: 'bearer',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        isSuperAdmin: admin.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create admin (protected route)
router.post('/create', auth, async (req, res) => {
  try {
    const { username, password, email, fullName, isSuperAdmin } = req.body;

    // Check if requester is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if username exists
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email exists
    admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new admin
    admin = new Admin({
      username,
      email,
      fullName,
      isSuperAdmin: isSuperAdmin || false
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        isSuperAdmin: admin.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize superadmin (can only be used if no admins exist)
router.post('/init-superadmin', async (req, res) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Superadmin already exists' });
    }

    const { username, password, email, fullName } = req.body;

    // Create superadmin
    const admin = new Admin({
      username,
      email,
      fullName,
      isSuperAdmin: true
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();

    res.status(201).json({
      message: 'Superadmin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        isSuperAdmin: admin.isSuperAdmin
      }
    });
  } catch (error) {
    console.error('Init superadmin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Dashboard Routes
router.get('/analytics', auth, adminController.getAnalytics);
router.get('/patients', auth, adminController.getPatients);
router.get('/reports', auth, adminController.getReports);
router.post('/reports/generate', auth, adminController.generateReport);
router.get('/settings', auth, adminController.getSettings);
router.patch('/settings', auth, adminController.updateSettings);

module.exports = router;
