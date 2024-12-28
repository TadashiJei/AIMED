# AIMED System Flowcharts

## Required Images List
1. `aimed-logo.png` - Main project logo
2. `azure-services-icons.png` - Collection of Azure service icons
3. `medical-icons.png` - Health monitoring icons
4. `device-icons.png` - IoT device icons
5. `alert-icons.png` - Alert system icons
6. `user-interface-icons.png` - Dashboard UI icons

## 1. Overall System Architecture
```mermaid
graph TD
    subgraph User Layer
        A[User Device]
        B[Medical IoT Devices]
        C[Healthcare Provider]
    end

    subgraph Data Collection
        D[Azure IoT Hub]
        E[Device Management]
        F[Data Ingestion]
    end

    subgraph Processing Layer
        G[Azure Functions]
        H[Data Processing]
        I[ML Pipeline]
    end

    subgraph Storage Layer
        J[Azure SQL]
        K[Blob Storage]
        L[Cache Layer]
    end

    subgraph Application Layer
        M[Web Dashboard]
        N[Mobile App]
        O[Alert System]
    end

    A --> D
    B --> D
    D --> E
    D --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    J --> L
    L --> M
    L --> N
    I --> O
    O --> C
```

## 2. Data Flow Pipeline
```mermaid
graph TD
    subgraph Data Sources
        A1[Heart Rate Monitor]
        A2[Blood Pressure Device]
        A3[Oxygen Sensor]
    end

    subgraph IoT Processing
        B1[Data Collection]
        B2[Data Validation]
        B3[Data Transformation]
    end

    subgraph ML Pipeline
        C1[Feature Engineering]
        C2[Model Prediction]
        C3[Risk Assessment]
    end

    subgraph Alert System
        D1[Risk Detection]
        D2[Alert Generation]
        D3[Notification Service]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> D3
```

## 3. User Authentication Flow
```mermaid
graph TD
    subgraph User Actions
        A1[Login Request]
        A2[2FA Verification]
        A3[Session Management]
    end

    subgraph Azure AD B2C
        B1[Identity Verification]
        B2[Token Generation]
        B3[Role Assignment]
    end

    subgraph Security Layer
        C1[Token Validation]
        C2[Permission Check]
        C3[Access Grant]
    end

    A1 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> A2
    A2 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> A3
```

## 4. Health Monitoring Pipeline
```mermaid
graph TD
    subgraph Monitoring
        A1[Real-time Data]
        A2[Historical Data]
        A3[Threshold Check]
    end

    subgraph Analysis
        B1[Pattern Recognition]
        B2[Anomaly Detection]
        B3[Trend Analysis]
    end

    subgraph Response
        C1[Risk Evaluation]
        C2[Alert Trigger]
        C3[Action Plan]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B2 --> B3
    A3 --> C1
    B3 --> C1
    C1 --> C2
    C2 --> C3
```

## 5. Alert System Flow
```mermaid
graph TD
    subgraph Detection
        A1[Anomaly Detected]
        A2[Risk Assessment]
        A3[Priority Assignment]
    end

    subgraph Processing
        B1[Alert Generation]
        B2[Contact Selection]
        B3[Message Preparation]
    end

    subgraph Notification
        C1[SMS Alert]
        C2[Email Notice]
        C3[App Notification]
    end

    subgraph Response
        D1[User Acknowledgment]
        D2[Emergency Services]
        D3[Healthcare Provider]
    end

    A1 --> A2
    A2 --> A3
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
    C1 --> D1
    C2 --> D1
    C3 --> D1
    D1 --> D2
    D1 --> D3
```

## Required Shell Script for Image Download
```bash
#!/bin/bash

# Create images directory
mkdir -p images

# Download required images
# Note: Replace URLs with actual image sources

# Project Logo
curl -o images/aimed-logo.png "URL_TO_LOGO"

# Azure Service Icons
curl -o images/azure-services-icons.png "URL_TO_AZURE_ICONS"

# Medical Icons
curl -o images/medical-icons.png "URL_TO_MEDICAL_ICONS"

# Device Icons
curl -o images/device-icons.png "URL_TO_DEVICE_ICONS"

# Alert Icons
curl -o images/alert-icons.png "URL_TO_ALERT_ICONS"

# UI Icons
curl -o images/user-interface-icons.png "URL_TO_UI_ICONS"

# Set permissions
chmod 644 images/*

echo "Image download complete!"
```

## Image Requirements:

1. **Project Logo (aimed-logo.png)**
   - Size: 500x500px
   - Format: PNG with transparency
   - Style: Modern, medical/tech themed

2. **Azure Service Icons (azure-services-icons.png)**
   - Size: 800x600px
   - Format: PNG with transparency
   - Including: IoT Hub, Functions, ML, SQL Database icons

3. **Medical Icons (medical-icons.png)**
   - Size: 600x600px
   - Format: PNG with transparency
   - Including: Heart rate, blood pressure, oxygen level icons

4. **Device Icons (device-icons.png)**
   - Size: 600x400px
   - Format: PNG with transparency
   - Including: Wearable devices, sensors, mobile devices

5. **Alert Icons (alert-icons.png)**
   - Size: 400x400px
   - Format: PNG with transparency
   - Including: Warning, emergency, notification icons

6. **UI Icons (user-interface-icons.png)**
   - Size: 800x600px
   - Format: PNG with transparency
   - Including: Dashboard elements, buttons, charts

Please review the image requirements and provide approval for downloading these resources. Once approved, I can help create the shell script with the actual image URLs.
