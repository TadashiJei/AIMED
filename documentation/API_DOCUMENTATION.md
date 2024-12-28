# AIMED API Documentation

## API Overview

The AIMED API provides a comprehensive set of endpoints for managing medical records, user authentication, and AI-powered document analysis. This RESTful API is built using FastAPI and follows OpenAPI (Swagger) specifications.

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.aimed.com`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### 1. User Registration
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "role": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "created_at": "string"
}
```

#### 2. User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

#### 3. Token Refresh
```http
POST /auth/refresh-token
```

**Request Header:**
```http
Authorization: Bearer <expired_token>
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

## Medical Records Management

### 1. Upload Medical Record
```http
POST /records/upload
Content-Type: multipart/form-data
```

**Request Body:**
- file: File (required)
- patient_id: string (required)
- record_type: string (required)
- notes: string (optional)

**Response:**
```json
{
  "id": "string",
  "file_url": "string",
  "patient_id": "string",
  "record_type": "string",
  "notes": "string",
  "upload_date": "string",
  "analysis_status": "string"
}
```

### 2. Get Medical Record
```http
GET /records/{record_id}
```

**Response:**
```json
{
  "id": "string",
  "file_url": "string",
  "patient_id": "string",
  "record_type": "string",
  "notes": "string",
  "upload_date": "string",
  "analysis_results": {
    "extracted_text": "string",
    "key_findings": ["string"],
    "medical_entities": ["string"]
  }
}
```

### 3. Search Medical Records
```http
GET /records/search
```

**Query Parameters:**
- patient_id: string (optional)
- record_type: string (optional)
- date_from: string (optional)
- date_to: string (optional)
- query: string (optional)

**Response:**
```json
{
  "total": 0,
  "records": [
    {
      "id": "string",
      "file_url": "string",
      "patient_id": "string",
      "record_type": "string",
      "notes": "string",
      "upload_date": "string"
    }
  ]
}
```

### 4. Update Medical Record
```http
PUT /records/{record_id}
```

**Request Body:**
```json
{
  "notes": "string",
  "record_type": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "file_url": "string",
  "patient_id": "string",
  "record_type": "string",
  "notes": "string",
  "upload_date": "string"
}
```

## User Management (Admin Only)

### 1. List Users
```http
GET /admin/users
```

**Query Parameters:**
- page: integer (default: 1)
- limit: integer (default: 10)
- role: string (optional)

**Response:**
```json
{
  "total": 0,
  "users": [
    {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "role": "string",
      "created_at": "string",
      "last_login": "string"
    }
  ]
}
```

### 2. Create User
```http
POST /admin/users
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "role": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "created_at": "string"
}
```

### 3. Update User
```http
PUT /admin/users/{user_id}
```

**Request Body:**
```json
{
  "full_name": "string",
  "role": "string",
  "is_active": boolean
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "role": "string",
  "is_active": boolean,
  "updated_at": "string"
}
```

## Error Responses

### Common Error Codes

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 422 Unprocessable Entity: Validation error
- 500 Internal Server Error: Server error

### Error Response Format
```json
{
  "detail": {
    "message": "string",
    "code": "string",
    "params": {}
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute per authenticated user

## Best Practices

1. **Authentication**
   - Always store tokens securely
   - Refresh tokens before they expire
   - Never send tokens in URL parameters

2. **File Upload**
   - Maximum file size: 10MB
   - Supported formats: PDF, JPG, PNG
   - Use multipart/form-data for file uploads

3. **Error Handling**
   - Always check response status codes
   - Implement proper error handling
   - Log error responses for debugging

4. **Performance**
   - Use pagination for large datasets
   - Implement caching where appropriate
   - Minimize request payload size

## SDK Examples

### Python
```python
import requests

class AIMEDClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {api_key}"}
    
    def upload_record(self, file_path, patient_id, record_type):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'patient_id': patient_id,
                'record_type': record_type
            }
            response = requests.post(
                f"{self.base_url}/records/upload",
                headers=self.headers,
                files=files,
                data=data
            )
            return response.json()
```

### JavaScript
```javascript
class AIMEDClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.headers = {
      Authorization: `Bearer ${apiKey}`
    };
  }

  async uploadRecord(file, patientId, recordType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    formData.append('record_type', recordType);

    const response = await fetch(`${this.baseUrl}/records/upload`, {
      method: 'POST',
      headers: this.headers,
      body: formData
    });

    return response.json();
  }
}
```

## Support

For API support and questions:
- Email: api-support@aimed.com
- Documentation: https://docs.aimed.com
- Status Page: https://status.aimed.com
