# AIMED Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- Azure CLI
- Git
- Visual Studio Code (recommended)

## Development Environment Setup

### 1. Node.js and npm Installation
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
```

### 2. Azure CLI Installation
```bash
# macOS (using Homebrew)
brew update && brew install azure-cli

# Verify installation
az --version

# Login to Azure
az login
```

### 3. Project Setup
```bash
# Clone the repository
git clone [repository-url]
cd AIMED

# Install dependencies
npm install
```

### 4. Azure Services Configuration

#### Azure Resource Group
```bash
# Create resource group
az group create --name aimed-rg --location eastus
```

#### Azure IoT Hub
```bash
# Create IoT Hub
az iot hub create --name aimed-iot-hub \
    --resource-group aimed-rg \
    --sku S1
```

#### Azure Functions
```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create Function App
az functionapp create \
    --resource-group aimed-rg \
    --consumption-plan-location eastus \
    --runtime node \
    --functions-version 4 \
    --name aimed-functions \
    --storage-account aimedstore
```

#### Azure Machine Learning
```bash
# Create ML workspace
az ml workspace create \
    --workspace-name aimed-ml \
    --resource-group aimed-rg
```

## Environment Configuration

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
AZURE_IOT_HUB_CONNECTION_STRING=your_connection_string
AZURE_FUNCTION_APP_NAME=aimed-functions
AZURE_ML_WORKSPACE=aimed-ml
AZURE_KEYVAULT_NAME=aimed-keyvault
```

### 2. Azure Key Vault Setup
```bash
# Create Key Vault
az keyvault create \
    --name aimed-keyvault \
    --resource-group aimed-rg \
    --location eastus
```

## Running the Application

### Frontend Development
```bash
# Start React development server
cd frontend
npm start
```

### Backend Development
```bash
# Start Azure Functions locally
cd backend
func start
```

## Testing

### Unit Tests
```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

## Deployment

### Frontend Deployment
```bash
# Build React app
cd frontend
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
    --name aimed-web \
    --resource-group aimed-rg \
    --source https://github.com/your-repo
```

### Backend Deployment
```bash
# Deploy Azure Functions
cd backend
func azure functionapp publish aimed-functions
```

## Monitoring Setup

### Application Insights
```bash
# Create Application Insights
az monitor app-insights component create \
    --app aimed-insights \
    --location eastus \
    --resource-group aimed-rg
```

## Troubleshooting

### Common Issues
1. **Azure Functions not running locally**
   - Check if Azure Functions Core Tools is installed
   - Verify local.settings.json configuration

2. **IoT Hub Connection Issues**
   - Verify connection string in environment variables
   - Check device registration status

3. **ML Model Deployment Issues**
   - Verify ML workspace configuration
   - Check model version and endpoints

### Getting Help
- Azure Documentation: https://docs.microsoft.com/azure
- Project Issues: [GitHub Issues Page]
- Support Email: [support@aimed.com]
