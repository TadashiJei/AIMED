const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { verifyToken } = require('../controllers/auth.controller');
const recordsController = require('../controllers/records.controller');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10485760, // 10MB default
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept common medical file types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/dicom',
      'application/dicom',
      'text/plain'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Validation rules
const recordValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['lab_result', 'prescription', 'medical_report', 'imaging', 'other'])
    .withMessage('Invalid record type'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const queryValidation = [
  query('type').optional().isIn(['lab_result', 'prescription', 'medical_report', 'imaging', 'other']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Routes
router.post('/',
  verifyToken,
  upload.single('file'),
  validate(recordValidation),
  recordsController.uploadRecord
);

router.get('/',
  verifyToken,
  validate(queryValidation),
  recordsController.getRecords
);

router.get('/:id',
  verifyToken,
  recordsController.getRecord
);

router.delete('/:id',
  verifyToken,
  recordsController.deleteRecord
);

router.patch('/:id',
  verifyToken,
  validate([
    body('title').optional().trim().notEmpty(),
    body('tags').optional().isArray()
  ]),
  recordsController.updateRecord
);

module.exports = router;
