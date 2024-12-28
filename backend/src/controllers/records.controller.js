const { catchAsync, ApiError } = require('../middleware/error.middleware');
const Record = require('../models/record.model');
const { blobServiceClient, recordsContainer } = require('../config/azure');
const crypto = require('crypto');

// Generate unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(`${timestamp}-${originalName}`).digest('hex');
  const extension = originalName.split('.').pop();
  return `${hash}.${extension}`;
};

// Upload file to Azure Blob Storage
const uploadToBlob = async (file, fileName) => {
  const containerClient = blobServiceClient.getContainerClient(recordsContainer);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  
  await blockBlobClient.upload(file.buffer, file.buffer.length, {
    blobHTTPHeaders: { blobContentType: file.mimetype }
  });

  return blockBlobClient.url;
};

exports.uploadRecord = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { title, type, tags = [] } = req.body;
  const userId = req.userData.userId;

  // Generate unique filename
  const fileName = generateUniqueFileName(req.file.originalname);
  
  // Upload to Azure Blob Storage
  const fileUrl = await uploadToBlob(req.file, fileName);

  // Create record in database
  const record = new Record({
    user: userId,
    title,
    type,
    fileUrl,
    tags,
    metadata: {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date()
    }
  });

  await record.save();

  res.status(201).json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.getRecords = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const { type, tags, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = { user: userId };

  // Apply filters
  if (type) query.type = type;
  if (tags) query.tags = { $in: tags.split(',') };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-analysisResults'),
    Record.countDocuments(query)
  ]);

  res.json({
    status: 'success',
    data: {
      records,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.getRecord = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const recordId = req.params.id;

  const record = await Record.findOne({
    _id: recordId,
    user: userId
  }).populate('analysisResults');

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  res.json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.deleteRecord = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const recordId = req.params.id;

  const record = await Record.findOne({
    _id: recordId,
    user: userId
  });

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  // Delete from Azure Blob Storage
  const containerClient = blobServiceClient.getContainerClient(recordsContainer);
  const fileName = record.fileUrl.split('/').pop();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.delete();

  // Delete from database
  await record.remove();

  res.json({
    status: 'success',
    message: 'Record deleted successfully'
  });
});

exports.updateRecord = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const recordId = req.params.id;
  const { title, tags } = req.body;

  const record = await Record.findOne({
    _id: recordId,
    user: userId
  });

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  // Update fields
  if (title) record.title = title;
  if (tags) record.tags = tags;

  await record.save();

  res.json({
    status: 'success',
    data: {
      record
    }
  });
});
