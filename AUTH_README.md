# Authentication System Documentation

## Overview

This authentication system provides token-based authentication with automatic redirects for the admin panel. It uses Next.js middleware, React Context, and both localStorage and cookies for token management.

## Features

- **Server-side protection**: Next.js middleware automatically redirects unauthenticated users to login
- **Client-side protection**: React hooks and context for authentication state management
- **Automatic token management**: Tokens are stored in both localStorage and cookies
- **Redirect after login**: Users are redirected back to their intended page after successful login
- **Cross-tab synchronization**: Authentication state is synchronized across browser tabs
- **Automatic logout**: Users are logged out when tokens expire (401 responses)

## Components

### 1. Middleware (`middleware.ts`)

Protects all routes except `/login` and static assets. Checks for authentication tokens in cookies and redirects to login if not found.

### 2. Auth Provider (`components/auth-provider.tsx`)

React Context provider that manages authentication state across the application.

### 3. useAuth Hook (`hooks/use-auth.ts`)

Custom hook that provides access to authentication state and functions.

### 4. Protected Route Component (`components/protected-route.tsx`)

Wrapper component for pages that require authentication.

### 5. Logout Button (`components/logout-button.tsx`)

Reusable logout button component.

## Usage

### Basic Setup

The `AuthProvider` is already included in the root layout, so authentication is available throughout the app.

### Using the useAuth Hook

```tsx
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { isAuthenticated, isLoading, token, adminId, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <p>Welcome, Admin ID: {adminId}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protecting Individual Pages

Wrap your page component with `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/protected-route'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Using the Logout Button

```tsx
import LogoutButton from '@/components/logout-button'

function Navigation() {
  return (
    <nav>
      <LogoutButton variant="outline" />
    </nav>
  )
}
```

## Token Storage

Tokens are stored in two places:
1. **localStorage**: For client-side JavaScript access
2. **Cookies**: For server-side middleware access

This dual storage ensures that authentication works on both client and server sides.

## API Integration

The axios instance (`utils/axios.ts`) automatically:
- Adds authentication tokens to request headers
- Handles 401 responses by clearing tokens and redirecting to login
- Manages both localStorage and cookie storage

## Security Features

- Tokens are stored with secure cookie flags in production
- Automatic cleanup on logout or token expiration
- Cross-tab synchronization prevents inconsistent states
- Server-side protection via middleware

## Customization

### Adding More Protected Routes

The middleware configuration can be modified to protect additional routes:

```typescript
// In middleware.ts
const publicRoutes = ['/login', '/forgot-password', '/register']
```

### Custom Redirect Logic

Modify the login success handler to change redirect behavior:

```typescript
// In app/login/page.tsx
const redirectTo = urlParams.get('redirect') || '/dashboard' // Change default redirect
```

### Token Validation

Add custom token validation in the middleware or axios interceptors as needed for your API requirements.