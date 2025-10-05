# Auth E2E Test Suite

## Overview
This test suite provides real API E2E authentication tests for the Vite+React+TypeScript application using Vitest and React Testing Library.

## Test File Location
`/app/vitereact/src/__tests__/auth.e2e.test.tsx`

## Test Coverage

### 1. Full Auth Flow Test
Tests the complete authentication lifecycle:
- **Register**: Creates a new user account with unique timestamped email
- **Logout**: Clears authentication state
- **Sign-in**: Authenticates with previously registered credentials

### 2. Registration Validation Test
Tests registration form validation handling

### 3. Invalid Login Test
Tests login error handling with non-existent credentials

## Configuration

### vitest.config.ts
- Environment: jsdom
- Globals: enabled
- Setup files: ./src/test/setup.ts
- Path aliases: `@` resolves to `./src`
- Test timeout: 30 seconds (configurable per test)

### .env.test
```
VITE_API_BASE_URL=http://localhost:3000
```

### src/test/setup.ts
Imports `@testing-library/jest-dom` for extended matchers

## Running Tests

### Prerequisites
1. Backend server must be running at `http://localhost:3000`
2. PostgreSQL database must be accessible and initialized

### Run All Tests
```bash
cd /app/vitereact
npm run test
```

### Run Auth E2E Tests Only
```bash
cd /app/vitereact
npx vitest run src/__tests__/auth.e2e.test.tsx
```

### Run in Watch Mode
```bash
cd /app/vitereact
npx vitest src/__tests__/auth.e2e.test.tsx
```

## Key Features

### Real API Integration
- No mocking - tests hit real backend endpoints
- Tests actual database operations
- Validates full request/response cycle

### Unique Test Data
- Generates unique email per test run: `user${Date.now()}@example.com`
- Prevents duplicate email constraint violations
- Ensures test isolation

### Zustand Store Validation
- Tests verify authentication state in Zustand store
- Validates `is_authenticated`, `auth_token`, and `current_user`
- Ensures state persistence after auth operations

### Resilient Selectors
- Uses flexible regex patterns for labels and buttons
- Handles label variants: `/email address|email/i`, `/password/i`
- Handles button variants: `/sign in|create account/i`

## Test Architecture

### Component Under Test
`UV_Login` - The unified login/register view component

### Router Wrapper
Uses `BrowserRouter` to provide routing context

### Store Management
- Clears localStorage before each test
- Resets Zustand store to unauthenticated state
- Uses `useAppStore.setState()` for state management

## Assertions

### Authentication Success
```typescript
const state = useAppStore.getState();
expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
expect(state.authentication_state.auth_token).toBeTruthy();
expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
```

### Logout Success
```typescript
const state = useAppStore.getState();
expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
expect(state.authentication_state.auth_token).toBeNull();
expect(state.authentication_state.current_user).toBeNull();
```

### Error Handling
```typescript
const state = useAppStore.getState();
expect(state.authentication_state.error_message).toBeTruthy();
expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
```

## Backend API Endpoints Tested

### POST /api/auth/register
- **Payload**: `{ email, name, password }`
- **Response**: `{ user: {...}, token: "..." }`
- **Store Action**: `register_user(email, password, name)`

### POST /api/auth/login
- **Payload**: `{ email, password }`
- **Response**: `{ user: {...}, token: "..." }`
- **Store Action**: `login_user(email, password)`

### Store Action: logout_user()
- Clears authentication state locally
- No API call (client-side only)

## Timeouts

- Default test timeout: 30 seconds
- Full auth flow test: 60 seconds
- API operation waits: 20 seconds
- Error handling waits: 10 seconds

## Troubleshooting

### Test Fails with "Email already exists"
- Test generates unique emails using `Date.now()`
- If error persists, check database for stuck records

### Test Fails with Connection Error
- Verify backend server is running: `cd /app/backend && npm start`
- Check `.env.test` has correct `VITE_API_BASE_URL`

### Store State Not Updating
- Verify Zustand middleware is working
- Check `localStorage` is being cleared in `beforeEach`
- Ensure `waitFor` timeouts are sufficient

### Selector Not Found
- Use `screen.debug()` to inspect DOM
- Check for label/button text variants
- Verify component is fully rendered before interaction

## Best Practices

1. **Never mock the API** - These are E2E tests
2. **Use unique data** - Timestamp-based emails prevent collisions
3. **Wait for state changes** - Use `waitFor()` with appropriate timeouts
4. **Clean up between tests** - Clear localStorage and reset store
5. **Test real user flows** - Simulate actual user interactions
6. **Assert on store state** - Verify Zustand state matches expectations

## Future Enhancements

- Add tests for password reset flow
- Test session expiration handling
- Add tests for concurrent login attempts
- Test navigation after successful authentication
- Add accessibility (a11y) assertions
