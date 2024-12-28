const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error('Email is invalid');
            }
        }
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 150
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    lastVisit: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    medicalHistory: [{
        condition: String,
        diagnosedDate: Date,
        notes: String
    }],
    contactNumber: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
