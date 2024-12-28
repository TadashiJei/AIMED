# AIMED Complete System Landscape

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryTextColor': '#000',
    'primaryColor': '#fff',
    'primaryBorderColor': '#000',
    'lineColor': '#000',
    'fontSize': '14px'
  }
}}%%
flowchart LR
    %% Style definitions
    classDef defaultStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef userStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef dataStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef processStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef storageStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef securityStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef monitorStyle fill:#fff,stroke:#000,stroke-width:2px,color:#000

    %% User Interface Layer
    subgraph UI[User Interface]
        direction TB
        WD[Web Dashboard]
        MA[Mobile App]
        AV[Alerts View]
    end

    %% IoT & Data Collection
    subgraph DC[Data Collection]
        direction TB
        subgraph Devices
            WD1[Wearable Device]
            HR[Heart Rate Monitor]
            BP[Blood Pressure]
            OX[Oxygen Sensor]
        end
        subgraph IoT[IoT Hub]
            IH[Azure IoT Hub]
            DP[Device Provisioning]
            MR[Message Routing]
        end
    end

    %% Data Processing & ML
    subgraph DP[Data Processing]
        direction TB
        subgraph Processing
            DV[Data Validation]
            DT[Data Transform]
            FE[Feature Engineering]
        end
        subgraph ML[Machine Learning]
            MT[Model Training]
            MP[Model Prediction]
            MM[Model Monitoring]
        end
    end

    %% Storage Systems
    subgraph ST[Storage]
        direction TB
        subgraph SQL[SQL Database]
            HM[Health Metrics]
            UP[User Profiles]
            AH[Alert History]
        end
        subgraph BL[Blob Storage]
            RD[Raw Data]
            MA1[ML Artifacts]
            SL[System Logs]
        end
        RC[Redis Cache]
    end

    %% Security
    subgraph SEC[Security]
        direction TB
        subgraph Auth[Authentication]
            UA[User Auth]
            MFA[2FA]
            TM[Token Mgmt]
        end
        subgraph Access[Access Control]
            RBAC[Role Access]
            PC[Permission Check]
            AG[Access Grant]
        end
        KV[Key Vault]
    end

    %% Monitoring & Alerts
    subgraph MON[Monitoring & Alerts]
        direction TB
        subgraph Alert[Alert System]
            RD1[Risk Detection]
            AG1[Alert Generation]
            NS[Notification Service]
        end
        subgraph Health[Healthcare]
            DR[Doctor]
            HP[Hospital]
            ES[Emergency Services]
        end
    end

    %% Connections
    %% Data Flow
    WD1 & HR & BP & OX --> IH
    IH --> DP --> MR
    MR --> DV --> DT --> FE
    FE --> MT --> MP
    MP --> MM
    
    %% Storage Flow
    DT --> SQL
    DT --> BL
    SQL & BL --> RC
    
    %% UI Flow
    RC --> WD & MA & AV
    
    %% Security Flow
    WD & MA --> UA
    UA --> MFA --> TM
    TM --> RBAC --> PC --> AG
    KV --> UA
    
    %% Alert Flow
    MP --> RD1 --> AG1 --> NS
    NS --> DR & HP & ES
    
    %% Apply styles
    class WD,MA,AV userStyle
    class WD1,HR,BP,OX,IH,DP,MR dataStyle
    class DV,DT,FE,MT,MP,MM processStyle
    class HM,UP,AH,RD,MA1,SL,RC storageStyle
    class UA,MFA,TM,RBAC,PC,AG,KV securityStyle
    class RD1,AG1,NS,DR,HP,ES monitorStyle
```

## System Components Description

### User Interface
- Web Dashboard
- Mobile App
- Alerts View

### Data Collection
- IoT Devices
  - Wearable Devices
  - Health Monitors
- Azure IoT Hub
  - Device Management
  - Message Routing

### Data Processing
- Data Pipeline
  - Validation
  - Transformation
  - Feature Engineering
- Machine Learning
  - Model Training
  - Predictions
  - Monitoring

### Storage
- SQL Database
  - Health Data
  - User Profiles
- Blob Storage
  - Raw Data
  - ML Models
- Redis Cache

### Security
- Authentication
  - User Auth
  - 2FA
  - Token Management
- Access Control
  - RBAC
  - Permissions
- Key Vault

### Monitoring & Alerts
- Alert System
  - Risk Detection
  - Notifications
- Healthcare Response
  - Doctors
  - Hospitals
  - Emergency Services
