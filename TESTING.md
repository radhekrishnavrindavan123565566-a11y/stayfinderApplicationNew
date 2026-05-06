# Testing Guide

This document provides comprehensive information about the testing infrastructure for the Nestora rental platform.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

## Overview

The project uses **Vitest** as the primary testing framework with the following testing approaches:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user flows and scenarios
- **Property-Based Tests**: Test correctness properties using fast-check

### Testing Stack

- **Vitest**: Fast unit test framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **mongodb-memory-server**: In-memory MongoDB for integration tests
- **fast-check**: Property-based testing library
- **jsdom**: DOM implementation for component tests

## Test Structure

```
__tests__/
├── unit/
│   └── components/          # React component tests
│       ├── Button.test.tsx
│       ├── AgreementGeneratorForm.test.tsx
│       └── AgreementSignModal.test.tsx
├── integration/
│   └── api/                 # API endpoint tests
│       ├── auth.test.ts
│       ├── agreements.test.ts
│       └── queues.test.ts
├── e2e/                     # End-to-end flow tests
│   └── agreement-flow.test.ts
└── property-based/          # Property-based tests (from specs)
    └── ai-rental-features/
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test __tests__/unit/components/Button.test.tsx

# Run tests matching a pattern
npm test -- --grep "Agreement"

# Run only unit tests
npm test __tests__/unit

# Run only integration tests
npm test __tests__/integration

# Run only E2E tests
npm test __tests__/e2e
```

## Writing Tests

### Unit Tests (Components)

Unit tests focus on testing individual React components in isolation.

**Example: Button Component Test**

```typescript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  test('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Key Patterns:**
- Use `render()` to mount components
- Use `screen.getByText()`, `screen.getByRole()` for queries
- Use `fireEvent` or `userEvent` for interactions
- Mock external dependencies with `vi.mock()`

### Integration Tests (API)

Integration tests verify API endpoints and database operations.

**Example: Authentication API Test**

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '@/models/User';

describe('Authentication API', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('should create user with hashed password', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'tenant',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

**Key Patterns:**
- Use `mongodb-memory-server` for isolated database testing
- Set up and tear down database connections in `beforeAll`/`afterAll`
- Clean up test data in `beforeEach` or `afterEach`
- Test both success and error scenarios

### E2E Tests (User Flows)

E2E tests verify complete user workflows from start to finish.

**Example: Agreement Flow Test**

```typescript
describe('Agreement Generation and Signing Flow', () => {
  test('should complete full lifecycle: generate -> sign -> complete', async () => {
    // Step 1: Generate agreement
    const agreement = await RentAgreement.create({...});
    expect(agreement.status).toBe('draft');

    // Step 2: Tenant signs
    agreement.tenantSignature = 'John Doe';
    agreement.status = 'pending_owner';
    await agreement.save();

    // Step 3: Owner signs
    agreement.ownerSignature = 'Jane Smith';
    agreement.status = 'fully_signed';
    await agreement.save();

    // Verify final state
    expect(agreement.status).toBe('fully_signed');
  });
});
```

**Key Patterns:**
- Test complete user journeys
- Verify state transitions
- Test error handling and edge cases
- Simulate real-world scenarios

### Property-Based Tests

Property-based tests verify correctness properties using generated test data.

**Example: OTP Validation Property**

```typescript
import fc from 'fast-check';

test('OTP should always be 6 digits', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const otp = generateOTP();
      return otp.length === 6 && /^\d{6}$/.test(otp);
    }),
    { numRuns: 100 }
  );
});
```

**Key Patterns:**
- Use `fc.property()` to define properties
- Use `fc.assert()` to verify properties hold
- Run with `{ numRuns: 100 }` for thorough testing
- Test invariants and correctness properties

## Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage files are generated in:
# - coverage/index.html (HTML report)
# - coverage/coverage-final.json (JSON report)
```

### Coverage Goals

- **Unit Tests**: Aim for 80%+ coverage of components
- **Integration Tests**: Cover all API endpoints
- **E2E Tests**: Cover critical user flows
- **Property-Based Tests**: Verify correctness properties

### Excluded from Coverage

The following are excluded from coverage reports:
- `node_modules/`
- `__tests__/`
- `*.config.ts`
- `.next/`

## Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**
   - Focus on what the component/function does, not how it does it
   - Avoid testing internal state or implementation details

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   test('should show error message when email is invalid')
   
   // Bad
   test('test email validation')
   ```

3. **Follow AAA Pattern**
   - **Arrange**: Set up test data and conditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

4. **Keep Tests Independent**
   - Each test should run independently
   - Don't rely on test execution order
   - Clean up after each test

5. **Mock External Dependencies**
   ```typescript
   vi.mock('axios');
   vi.mock('@/store/authStore');
   ```

### Component Testing

1. **Test User Interactions**
   ```typescript
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'text');
   ```

2. **Test Accessibility**
   ```typescript
   expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
   ```

3. **Test Error States**
   ```typescript
   expect(screen.getByText('Error message')).toBeInTheDocument();
   ```

### API Testing

1. **Test Success Cases**
   - Verify correct data is returned
   - Check status codes

2. **Test Error Cases**
   - Invalid input
   - Missing required fields
   - Unauthorized access

3. **Test Edge Cases**
   - Empty data
   - Maximum values
   - Boundary conditions

### Async Testing

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Use async/await for promises
const result = await someAsyncFunction();
expect(result).toBe(expected);
```

## Continuous Integration

Tests should run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

**Issue: Tests timeout**
```typescript
// Increase timeout for slow tests
test('slow test', async () => {
  // test code
}, { timeout: 10000 }); // 10 seconds
```

**Issue: MongoDB connection errors**
```typescript
// Ensure proper cleanup
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

**Issue: React component not rendering**
```typescript
// Check if all required props are provided
// Verify mocks are set up correctly
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Fast-check Documentation](https://fast-check.dev/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## Contributing

When adding new features:

1. Write tests alongside your code
2. Ensure all tests pass before submitting PR
3. Maintain or improve test coverage
4. Follow existing test patterns and conventions
