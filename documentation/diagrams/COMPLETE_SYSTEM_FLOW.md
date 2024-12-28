# AIMED Complete System Flow

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'fontSize': '16px',
    'fontFamily': 'arial',
    'lineWidth': '2px',
    'primaryColor': '#ff0000',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#fff',
    'lineColor': '#F8B229',
    'secondaryColor': '#006100',
    'tertiaryColor': '#fff'
  }
}}%%
flowchart TD
    %% Styling
    classDef userDevice fill:#e1bee7,stroke:#333,stroke-width:2px
    classDef iotDevice fill:#bbdefb,stroke:#333,stroke-width:2px
    classDef azureService fill:#c8e6c9,stroke:#333,stroke-width:2px
    classDef storage fill:#ffe0b2,stroke:#333,stroke-width:2px
    classDef processing fill:#b2dfdb,stroke:#333,stroke-width:2px
    classDef alert fill:#ffcdd2,stroke:#333,stroke-width:2px
    classDef security fill:#d1c4e9,stroke:#333,stroke-width:2px

    %% User Devices
    subgraph UserDevices["👥 User Devices"]
        direction TB
        MobileApp["📱 Mobile App"]
        WebDashboard["💻 Web Dashboard"]
        WearableDevice["⌚ Wearable Device"]
    end

    %% IoT Devices
    subgraph IoTLayer["📡 IoT Layer"]
        direction TB
        HeartRate["💗 Heart Rate Monitor"]
        BloodPressure["🩺 Blood Pressure"]
        OxygenLevel["🫁 Oxygen Sensor"]
    end

    %% Azure IoT
    subgraph AzureIoT["☁️ Azure IoT"]
        direction TB
        IoTHub["Azure IoT Hub"]
        DeviceProvisioning["Device Provisioning"]
        StreamAnalytics["Stream Analytics"]
    end

    %% Data Processing
    subgraph Processing["⚙️ Processing"]
        direction TB
        DataValidation["Data Validation"]
        DataTransformation["Data Transformation"]
        MLPipeline["ML Pipeline"]
    end

    %% Storage
    subgraph Storage["💾 Storage"]
        direction TB
        SQL["Azure SQL"]
        Blob["Blob Storage"]
        Cache["Redis Cache"]
    end

    %% Security
    subgraph Security["🔐 Security"]
        direction TB
        Authentication["Authentication"]
        Authorization["Authorization"]
        Encryption["Encryption"]
    end

    %% Alert System
    subgraph AlertSystem["⚠️ Alert System"]
        direction TB
        RiskDetection["Risk Detection"]
        AlertGeneration["Alert Generation"]
        NotificationService["Notification Service"]
    end

    %% Healthcare Providers
    subgraph Healthcare["👨‍⚕️ Healthcare"]
        direction TB
        Doctor["Doctor"]
        Hospital["Hospital"]
        EmergencyService["Emergency Service"]
    end

    %% Connections
    WearableDevice --> IoTHub
    HeartRate --> IoTHub
    BloodPressure --> IoTHub
    OxygenLevel --> IoTHub

    IoTHub --> DeviceProvisioning
    DeviceProvisioning --> StreamAnalytics
    StreamAnalytics --> DataValidation

    DataValidation --> DataTransformation
    DataTransformation --> MLPipeline
    MLPipeline --> SQL
    MLPipeline --> Blob

    SQL --> Cache
    Cache --> WebDashboard
    Cache --> MobileApp

    WebDashboard --> Authentication
    MobileApp --> Authentication
    Authentication --> Authorization
    Authorization --> Encryption

    MLPipeline --> RiskDetection
    RiskDetection --> AlertGeneration
    AlertGeneration --> NotificationService

    NotificationService --> Doctor
    NotificationService --> Hospital
    NotificationService --> EmergencyService

    %% Apply styles
    class MobileApp,WebDashboard,WearableDevice userDevice
    class HeartRate,BloodPressure,OxygenLevel iotDevice
    class IoTHub,DeviceProvisioning,StreamAnalytics azureService
    class SQL,Blob,Cache storage
    class DataValidation,DataTransformation,MLPipeline processing
    class RiskDetection,AlertGeneration,NotificationService alert
    class Authentication,Authorization,Encryption security
```

## Diagram Components

### 1. User Devices 👥
- Mobile App
- Web Dashboard
- Wearable Device

### 2. IoT Layer 📡
- Heart Rate Monitor
- Blood Pressure Device
- Oxygen Sensor

### 3. Azure IoT ☁️
- IoT Hub
- Device Provisioning
- Stream Analytics

### 4. Processing ⚙️
- Data Validation
- Data Transformation
- ML Pipeline

### 5. Storage 💾
- Azure SQL
- Blob Storage
- Redis Cache

### 6. Security 🔐
- Authentication
- Authorization
- Encryption

### 7. Alert System ⚠️
- Risk Detection
- Alert Generation
- Notification Service

### 8. Healthcare 👨‍⚕️
- Doctor
- Hospital
- Emergency Service

## Flow Description

1. **Data Collection**
   - Wearable devices and IoT sensors collect health data
   - Data is sent to Azure IoT Hub

2. **Data Processing**
   - Stream Analytics processes real-time data
   - Data validation and transformation
   - ML Pipeline analyzes health patterns

3. **Storage & Caching**
   - Data stored in Azure SQL and Blob Storage
   - Redis Cache for quick access

4. **Security**
   - Multi-layer security implementation
   - Authentication and Authorization
   - Data encryption

5. **Alert Handling**
   - Continuous risk monitoring
   - Automated alert generation
   - Multi-channel notifications

6. **Healthcare Response**
   - Healthcare providers receive alerts
   - Emergency services coordination
   - Real-time patient monitoring
