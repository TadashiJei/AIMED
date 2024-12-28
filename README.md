# AIMED: AI-Powered Medical Records Management System

![AIMED Logo](frontend/public/logo.svg)

## Overview

AIMED is an innovative healthcare management system that leverages artificial intelligence to streamline medical record management, enhance patient care, and improve healthcare service delivery. The system combines modern web technologies with Azure's AI services to provide an intelligent, secure, and efficient platform for healthcare professionals.

## Features

- **Smart Medical Records Management**
  - Intelligent document processing using Azure Form Recognizer
  - Automated data extraction from medical documents
  - Secure storage and retrieval of patient records

- **AI-Powered Analysis**
  - Natural language processing for medical text analysis
  - Automated medical document classification
  - Intelligent search and retrieval capabilities

- **Secure Authentication**
  - JWT-based authentication system
  - Role-based access control (RBAC)
  - Secure password hashing and verification

- **Automated Communications**
  - Email notifications for important updates
  - Secure communication channel between healthcare providers
  - Automated report generation and distribution

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT + FastAPI Security
- **Email Service**: FastMail
- **AI Services**: Azure Form Recognizer, Azure Language Service, Azure OpenAI

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI
- **State Management**: React Context API
- **API Client**: Axios

### Cloud Services
- **Storage**: Azure Blob Storage
- **AI & ML**: Azure Cognitive Services
- **Hosting**: Azure App Service

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB
- Azure account with necessary services enabled
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AIMED.git
   cd AIMED
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your credentials:
   - MongoDB connection string
   - Azure service credentials
   - JWT secret key
   - Email configuration

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Documentation

### Authentication Endpoints

- `POST /auth/login`: User login
- `POST /auth/register`: User registration
- `POST /auth/refresh-token`: Refresh access token

### Medical Records Endpoints

- `POST /records/upload`: Upload medical documents
- `GET /records/{record_id}`: Retrieve specific record
- `GET /records/search`: Search through records
- `PUT /records/{record_id}`: Update record information

### Admin Endpoints

- `GET /admin/users`: List all users
- `POST /admin/users`: Create new user
- `PUT /admin/users/{user_id}`: Update user details

## Security

AIMED implements several security measures to protect sensitive medical data:

- **JWT Authentication**: Secure token-based authentication system
- **Data Encryption**: All sensitive data is encrypted at rest and in transit
- **Role-Based Access**: Granular access control based on user roles
- **Secure File Storage**: Medical documents are stored securely in Azure Blob Storage
- **Environment Variables**: Sensitive credentials are stored in environment variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/yourusername/AIMED](https://github.com/yourusername/AIMED)

## Acknowledgments

- FastAPI for the amazing Python web framework
- Azure for providing powerful AI and cloud services
- React team for the frontend framework
- All contributors who have helped shape this project
