# AIMED API Documentation

## API Overview
The AIMED API provides endpoints for health data collection, prediction, and alert management. All endpoints use JSON for request and response payloads.

## Base URL
```
Production: https://api.aimed.com/v1
Development: http://localhost:7071/api
```

## Authentication
All API requests require Bearer token authentication:
```http
Authorization: Bearer <token>
```

## Endpoints

### Health Data API

#### Get Health Metrics
```http
GET /api/health/metrics
```

**Parameters:**
- `userId` (string, required): User identifier
- `timeRange` (string, optional): Time range for metrics (default: "24h")
  - Options: "24h", "7d", "30d", "custom"
- `startDate` (string, optional): Start date for custom range (ISO format)
- `endDate` (string, optional): End date for custom range (ISO format)

**Response:**
```json
{
  "userId": "user123",
  "metrics": {
    "heartRate": {
      "current": 75,
      "min": 60,
      "max": 90,
      "average": 72
    },
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "oxygenLevel": 98
  },
  "timestamp": "2024-12-28T02:22:24Z"
}
```

#### Submit Health Data
```http
POST /api/health/data
```

**Request Body:**
```json
{
  "userId": "user123",
  "deviceId": "device456",
  "metrics": {
    "heartRate": 75,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "oxygenLevel": 98
  },
  "timestamp": "2024-12-28T02:22:24Z"
}
```

**Response:**
```json
{
  "status": "success",
  "messageId": "msg789",
  "timestamp": "2024-12-28T02:22:24Z"
}
```

### Prediction API

#### Get Health Risk Prediction
```http
GET /api/predictions/risk
```

**Parameters:**
- `userId` (string, required): User identifier
- `metrics` (object, required): Current health metrics

**Response:**
```json
{
  "userId": "user123",
  "riskAssessment": {
    "overallRisk": "low",
    "score": 0.2,
    "factors": [
      {
        "type": "heartRate",
        "risk": "low",
        "recommendation": "Continue normal activity"
      }
    ]
  },
  "timestamp": "2024-12-28T02:22:24Z"
}
```

### Alert API

#### Get User Alerts
```http
GET /api/alerts
```

**Parameters:**
- `userId` (string, required): User identifier
- `status` (string, optional): Alert status filter
  - Options: "active", "resolved", "all"
- `limit` (number, optional): Maximum number of alerts to return (default: 50)

**Response:**
```json
{
  "userId": "user123",
  "alerts": [
    {
      "alertId": "alert123",
      "type": "highHeartRate",
      "severity": "medium",
      "message": "Heart rate above normal range",
      "timestamp": "2024-12-28T02:22:24Z",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### Acknowledge Alert
```http
POST /api/alerts/acknowledge
```

**Request Body:**
```json
{
  "alertId": "alert123",
  "userId": "user123",
  "acknowledgement": {
    "action": "resolved",
    "notes": "Patient contacted and confirmed OK"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "alertId": "alert123",
  "timestamp": "2024-12-28T02:22:24Z"
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting
- Default rate limit: 100 requests per minute
- Exceeded rate limit response: HTTP 429
- Rate limit headers:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640678544
  ```

## Webhooks
For real-time notifications, configure webhooks:

```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["alert.created", "prediction.high_risk"],
  "secret": "your_webhook_secret"
}
```

## SDK Examples

### JavaScript/Node.js
```javascript
const AimedClient = require('aimed-sdk');

const client = new AimedClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Get health metrics
const metrics = await client.health.getMetrics({
  userId: 'user123',
  timeRange: '24h'
});

// Submit health data
const response = await client.health.submitData({
  userId: 'user123',
  metrics: {
    heartRate: 75,
    bloodPressure: {
      systolic: 120,
      diastolic: 80
    }
  }
});
```

## Best Practices
1. Always include error handling
2. Use appropriate timeouts
3. Implement exponential backoff for retries
4. Cache responses when appropriate
5. Use webhook notifications for real-time updates
