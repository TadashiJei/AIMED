# AIMED Setup Guide

This guide provides detailed instructions for setting up the AIMED healthcare management system for both development and production environments.

## Development Environment Setup

### Prerequisites

1. **Python Environment**
   - Python 3.8 or higher
   - pip (Python package manager)
   - virtualenv or venv for isolated environments

2. **Node.js Environment**
   - Node.js 14 or higher
   - npm (Node package manager)

3. **Database**
   - MongoDB (local installation or cloud service)

4. **Azure Account**
   - Active Azure subscription
   - Required services enabled:
     - Azure Blob Storage
     - Azure Form Recognizer
     - Azure Language Service
     - Azure OpenAI

5. **Email Service**
   - Gmail account with App Password enabled
   - 2-Step Verification enabled

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/AIMED.git
   cd AIMED
   ```

2. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Configure environment variables
   cp .env.example .env
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

1. **Backend Environment Variables**
   Edit `backend/.env` with your credentials:

   ```env
   # Server Configuration
   PORT=3001
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h

   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # Azure Storage Configuration
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
   AZURE_STORAGE_CONTAINER=health-records
   MAX_FILE_SIZE=10485760

   # Azure AI Services
   AZURE_FORM_RECOGNIZER_KEY=your_form_recognizer_key
   AZURE_FORM_RECOGNIZER_ENDPOINT=your_form_recognizer_endpoint
   AZURE_LANGUAGE_KEY=your_language_key
   AZURE_LANGUAGE_ENDPOINT=your_language_endpoint
   AZURE_OPENAI_KEY=your_openai_key

   # Email Configuration
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   MAIL_FROM=your_email@gmail.com
   MAIL_PORT=587
   MAIL_SERVER=smtp.gmail.com
   ```

2. **Frontend Environment Variables**
   Create `frontend/.env` if needed:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_STORAGE_URL=your_azure_storage_url
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Production Deployment

### Azure App Service Deployment

1. **Backend Deployment**
   ```bash
   # Install Azure CLI
   az login
   
   # Create App Service
   az webapp up --runtime PYTHON:3.8 --sku B1 --name aimed-backend
   
   # Configure environment variables
   az webapp config appsettings set --settings @env.json --name aimed-backend
   ```

2. **Frontend Deployment**
   ```bash
   # Build frontend
   npm run build
   
   # Deploy to Azure Static Web Apps
   az staticwebapp create --name aimed-frontend
   az staticwebapp deploy
   ```

### Security Considerations

1. **SSL/TLS Configuration**
   - Enable HTTPS-only mode in Azure App Service
   - Configure custom domain and SSL certificate

2. **Environment Variables**
   - Use Azure Key Vault for sensitive credentials
   - Enable managed identities for secure access

3. **Network Security**
   - Configure network security groups
   - Set up Azure Application Gateway if needed

### Monitoring Setup

1. **Azure Application Insights**
   - Enable Application Insights in Azure Portal
   - Add instrumentation key to application settings

2. **Logging Configuration**
   - Configure log levels in application settings
   - Set up log retention policies

## Troubleshooting

### Common Issues

1. **MongoDB Connection**
   - Verify connection string format
   - Check network connectivity
   - Ensure IP whitelist includes your server

2. **Azure Services**
   - Verify service keys and endpoints
   - Check service quota limits
   - Review Azure service health status

3. **Email Configuration**
   - Verify Gmail App Password
   - Check SMTP settings
   - Test email connectivity

### Getting Help

- Check the [GitHub Issues](https://github.com/yourusername/AIMED/issues)
- Review the [FAQ](./FAQ.md)
- Contact the development team

## Maintenance

### Regular Updates

1. **Dependency Updates**
   ```bash
   # Update Python dependencies
   pip install -r requirements.txt --upgrade
   
   # Update Node.js dependencies
   npm update
   ```

2. **Database Maintenance**
   - Regular backups
   - Index optimization
   - Data cleanup

### Health Checks

1. **System Health**
   - Monitor API endpoints
   - Check database connections
   - Verify Azure service status

2. **Performance Monitoring**
   - Review Application Insights metrics
   - Monitor response times
   - Check resource utilization
