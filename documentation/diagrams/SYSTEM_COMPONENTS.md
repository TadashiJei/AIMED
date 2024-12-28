# AIMED System Components Diagram

## System Architecture
```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryTextColor': '#000',
    'primaryColor': '#fff',
    'primaryBorderColor': '#000',
    'lineColor': '#000',
    'fontSize': '16px'
  }
}}%%
flowchart TD
    %% Style definitions
    classDef iotLayer fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef processLayer fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef storageLayer fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef appLayer fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef securityLayer fill:#fff,stroke:#000,stroke-width:2px,color:#000

    %% IoT Layer
    subgraph IOT[Data Collection Layer]
        IH[Azure IoT Hub]
        DS[Device SDK]
        MR[Message Routing]
    end

    %% Processing Layer
    subgraph PROC[Processing Layer]
        subgraph DPS[Data Processing Service]
            PHD[ProcessHealthData]
            AM[AggregateMetrics]
            SHD[StoreHealthData]
        end
        subgraph MLS[ML Service]
            MT[Model Training]
            RI[Real-time Inference]
            MM[Model Monitoring]
        end
    end

    %% Storage Layer
    subgraph STOR[Storage Layer]
        subgraph SQL[Azure SQL DB]
            HM[Health Metrics]
            UP[User Profiles]
            AH[Alert History]
        end
        subgraph BLOB[Blob Storage]
            RD[Raw Data]
            MA[ML Artifacts]
            SL[System Logs]
        end
    end

    %% Application Layer
    subgraph APP[Application Layer]
        subgraph API[Backend API]
            EP[API Endpoints]
            AM2[Auth Middleware]
            RL[Rate Limiter]
        end
        subgraph FE[Frontend]
            DB[Dashboard]
            AV[Alerts View]
            SM[Settings Mgmt]
        end
    end

    %% Security Layer
    subgraph SEC[Security Layer]
        subgraph AAD[Azure AD]
            UA[User Auth]
            RBAC[Role Access]
            TM[Token Mgmt]
        end
        subgraph KV[Key Vault]
            AK[API Keys]
            CERT[Certificates]
            CS[Conn Strings]
        end
    end

    %% Connections
    IH --> DS
    DS --> MR
    MR --> PHD
    PHD --> AM
    AM --> SHD
    SHD --> SQL
    PHD --> MLS
    MLS --> MM
    MM --> MT
    MT --> RI
    RI --> BLOB
    SQL --> API
    BLOB --> API
    API --> FE
    API --> AAD
    AAD --> KV
    KV --> API

    %% Apply styles
    class IH,DS,MR iotLayer
    class PHD,AM,SHD,MT,RI,MM processLayer
    class HM,UP,AH,RD,MA,SL storageLayer
    class EP,AM2,RL,DB,AV,SM appLayer
    class UA,RBAC,TM,AK,CERT,CS securityLayer
```

## ML Pipeline Flow
```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryTextColor': '#000',
    'primaryColor': '#fff',
    'primaryBorderColor': '#000',
    'lineColor': '#000',
    'fontSize': '16px'
  }
}}%%
flowchart TD
    %% Style definitions
    classDef dataClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef processClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef modelClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef monitorClass fill:#fff,stroke:#000,stroke-width:2px,color:#000

    %% Data Flow
    subgraph DF[Data Flow]
        RD[Raw Data]
        CV[Data Validation]
        FE[Feature Engineering]
    end

    %% Model Pipeline
    subgraph MP[Model Pipeline]
        MT[Model Training]
        MV[Model Validation]
        MD[Model Deployment]
    end

    %% Inference
    subgraph INF[Inference]
        RI[Real-time Inference]
        BP[Batch Prediction]
    end

    %% Monitoring
    subgraph MON[Monitoring]
        MM[Model Metrics]
        PM[Performance Monitor]
        DM[Drift Monitor]
    end

    %% Connections
    RD --> CV
    CV --> FE
    FE --> MT
    MT --> MV
    MV --> MD
    MD --> RI
    MD --> BP
    RI --> MM
    BP --> MM
    MM --> PM
    PM --> DM
    DM --> MT

    %% Apply styles
    class RD,CV,FE dataClass
    class MT,MV,MD processClass
    class RI,BP modelClass
    class MM,PM,DM monitorClass
```

## Authentication Flow
```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryTextColor': '#000',
    'primaryColor': '#fff',
    'primaryBorderColor': '#000',
    'lineColor': '#000',
    'fontSize': '16px'
  }
}}%%
flowchart TD
    %% Style definitions
    classDef userClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef authClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef tokenClass fill:#fff,stroke:#000,stroke-width:2px,color:#000
    classDef accessClass fill:#fff,stroke:#000,stroke-width:2px,color:#000

    %% User Flow
    subgraph UF[User Flow]
        LR[Login Request]
        CR[Credentials]
    end

    %% Authentication
    subgraph AUTH[Authentication]
        VA[Validate Auth]
        MFA[2FA Check]
    end

    %% Token Management
    subgraph TM[Token Management]
        GT[Generate Token]
        VT[Validate Token]
        RT[Refresh Token]
    end

    %% Access Control
    subgraph AC[Access Control]
        RC[Role Check]
        PC[Permission Check]
        AG[Access Grant]
    end

    %% Connections
    LR --> CR
    CR --> VA
    VA --> MFA
    MFA --> GT
    GT --> VT
    VT --> RT
    RT --> RC
    RC --> PC
    PC --> AG

    %% Apply styles
    class LR,CR userClass
    class VA,MFA authClass
    class GT,VT,RT tokenClass
    class RC,PC,AG accessClass
