# AIMED Testing Guide

## Testing Strategy Overview

### Testing Levels
1. Unit Testing
2. Integration Testing
3. End-to-End Testing
4. Performance Testing
5. Security Testing

## 1. Unit Testing

### Frontend Testing (React Components)

#### Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

#### Example Component Test
```javascript
// DashboardComponent.test.js
import { render, screen } from '@testing-library/react';
import DashboardComponent from './DashboardComponent';

describe('DashboardComponent', () => {
  test('renders health metrics', () => {
    const mockData = {
      heartRate: 75,
      bloodPressure: { systolic: 120, diastolic: 80 }
    };
    
    render(<DashboardComponent data={mockData} />);
    
    expect(screen.getByText(/75/)).toBeInTheDocument();
    expect(screen.getByText(/120\/80/)).toBeInTheDocument();
  });
});
```

### Backend Testing (Azure Functions)

#### Setup
```bash
# Install testing dependencies
npm install --save-dev jest @types/jest
```

#### Example Function Test
```javascript
// processHealthData.test.js
const { processHealthData } = require('../ProcessHealthData');

describe('ProcessHealthData', () => {
  test('validates health data format', async () => {
    const mockData = {
      userId: 'user123',
      metrics: {
        heartRate: 75
      }
    };
    
    const result = await processHealthData(mockData);
    expect(result.status).toBe('success');
  });
});
```

## 2. Integration Testing

### API Integration Tests

#### Setup
```bash
# Install testing dependencies
npm install --save-dev supertest
```

#### Example API Test
```javascript
// api.test.js
const request = require('supertest');
const app = require('../app');

describe('Health API', () => {
  test('GET /api/health/metrics returns correct format', async () => {
    const response = await request(app)
      .get('/api/health/metrics')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);
      
    expect(response.body).toHaveProperty('metrics');
    expect(response.body.metrics).toHaveProperty('heartRate');
  });
});
```

### Azure Services Integration

#### IoT Hub Integration Test
```javascript
// iotHub.test.js
const { IoTHubClient } = require('../services/iotHub');

describe('IoT Hub Integration', () => {
  test('device message processing', async () => {
    const client = new IoTHubClient();
    const message = {
      deviceId: 'test-device',
      message: { heartRate: 75 }
    };
    
    const result = await client.processMessage(message);
    expect(result.processed).toBe(true);
  });
});
```

## 3. End-to-End Testing

### Setup
```bash
# Install Cypress for E2E testing
npm install --save-dev cypress
```

### Example E2E Test
```javascript
// cypress/integration/dashboard.spec.js
describe('Dashboard Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('displays real-time health data', () => {
    cy.get('[data-testid="health-metrics"]').should('be.visible');
    cy.get('[data-testid="heart-rate"]').should('contain.text');
  });

  it('shows alerts when threshold exceeded', () => {
    // Simulate high heart rate
    cy.intercept('GET', '/api/health/metrics', {
      body: { heartRate: 150 }
    });
    
    cy.get('[data-testid="alerts"]').should('contain.text', 'High Heart Rate');
  });
});
```

## 4. Performance Testing

### Load Testing with k6

#### Setup
```bash
# Install k6
brew install k6
```

#### Example Load Test Script
```javascript
// loadTest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('https://api.aimed.com/health/metrics');
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Performance Metrics
- Response Time: < 500ms
- Throughput: > 100 req/sec
- Error Rate: < 0.1%

## 5. Security Testing

### Authentication Testing
```javascript
describe('Authentication', () => {
  test('rejects invalid tokens', async () => {
    const response = await request(app)
      .get('/api/health/metrics')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
```

### Authorization Testing
```javascript
describe('Authorization', () => {
  test('enforces role-based access', async () => {
    const response = await request(app)
      .post('/api/admin/settings')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

## Test Data Management

### Test Data Setup
```javascript
// testData.js
const setupTestData = async () => {
  await db.collection('users').insertMany([
    {
      id: 'test-user-1',
      name: 'Test User',
      devices: ['device-1']
    }
  ]);
};
```

### Data Cleanup
```javascript
afterAll(async () => {
  await db.collection('users').deleteMany({ id: /test-/ });
});
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      
      - name: Install Dependencies
        run: npm install
      
      - name: Run Unit Tests
        run: npm run test:unit
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Run E2E Tests
        run: npm run test:e2e
```

## Testing Best Practices

### 1. Test Organization
- Group related tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock External Services
```javascript
jest.mock('../services/iotHub', () => ({
  IoTHubClient: jest.fn().mockImplementation(() => ({
    processMessage: jest.fn().mockResolvedValue({ processed: true })
  }))
}));
```

### 3. Error Handling Tests
```javascript
test('handles network errors gracefully', async () => {
  // Mock network failure
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
  
  const result = await healthService.getMetrics();
  expect(result.error).toBe('Unable to fetch health metrics');
});
```

### 4. Test Coverage
```bash
# Run tests with coverage
npm test -- --coverage
```

### 5. Performance Testing Guidelines
- Test under various loads
- Monitor resource usage
- Test error scenarios
- Validate data consistency

## Troubleshooting Tests

### Common Issues
1. **Flaky Tests**
   - Add retry logic
   - Increase timeouts
   - Improve test isolation

2. **Slow Tests**
   - Use test parallelization
   - Mock expensive operations
   - Optimize setup/teardown

3. **Memory Leaks**
   - Clean up resources
   - Monitor memory usage
   - Use proper teardown

## Reporting

### Test Report Format
```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports',
      outputName: 'junit.xml',
    }],
  ],
};
```

### Coverage Requirements
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%
