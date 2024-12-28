const { catchAsync } = require('../middleware/error.middleware');
const User = require('../models/user.model');

exports.addMetrics = catchAsync(async (req, res) => {
  const { metrics } = req.body;
  const userId = req.userData.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Add new metrics
  user.metrics.push(...metrics.map(metric => ({
    type: metric.type,
    value: metric.value,
    date: new Date()
  })));

  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      metrics: user.metrics
    }
  });
});

exports.getMetrics = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const { type, startDate, endDate } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let metrics = user.metrics;

  // Filter by type if specified
  if (type) {
    metrics = metrics.filter(metric => metric.type === type);
  }

  // Filter by date range if specified
  if (startDate || endDate) {
    metrics = metrics.filter(metric => {
      const metricDate = new Date(metric.date);
      if (startDate && endDate) {
        return metricDate >= new Date(startDate) && metricDate <= new Date(endDate);
      } else if (startDate) {
        return metricDate >= new Date(startDate);
      } else {
        return metricDate <= new Date(endDate);
      }
    });
  }

  res.json({
    status: 'success',
    data: {
      metrics
    }
  });
});

exports.getMetricsSummary = catchAsync(async (req, res) => {
  const userId = req.userData.userId;
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Group metrics by type and calculate latest values and trends
  const summary = user.metrics.reduce((acc, metric) => {
    if (!acc[metric.type]) {
      acc[metric.type] = {
        latest: metric,
        count: 1,
        trend: null
      };
    } else {
      acc[metric.type].count++;
      if (new Date(metric.date) > new Date(acc[metric.type].latest.date)) {
        // Calculate trend
        const trend = metric.value - acc[metric.type].latest.value;
        acc[metric.type] = {
          latest: metric,
          count: acc[metric.type].count,
          trend
        };
      }
    }
    return acc;
  }, {});

  res.json({
    status: 'success',
    data: {
      summary
    }
  });
});
