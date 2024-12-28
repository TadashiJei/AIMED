const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');
const connectDB = require('../config/database');

async function initSuperAdmin() {
  try {
    // Connect to database
    await connectDB();

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('Superadmin already exists!');
      process.exit(0);
    }

    // Create superadmin
    const admin = new Admin({
      username: 'superadmin',
      email: 'admin@aimed.com',
      fullName: 'Super Administrator',
      isSuperAdmin: true
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash('Admin@123', salt);

    await admin.save();

    console.log('Superadmin created successfully!');
    console.log('Username: superadmin');
    console.log('Password: Admin@123');
    console.log('Please change this password immediately after logging in!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
}

initSuperAdmin();
