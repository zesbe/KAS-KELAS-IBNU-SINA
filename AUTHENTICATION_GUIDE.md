# Authentication Implementation Guide

## Overview

This guide explains how authentication is implemented between frontend and backend using Supabase JWT tokens.

## Architecture

```
Frontend (React)          Backend (Express)
     |                          |
     |-- Login with Supabase -->|
     |                          |
     |<-- JWT Token ------------|
     |                          |
     |-- API Request + Token -->|
     |                          |
     |                    Verify Token
     |                          |
     |<-- Protected Data -------|
```

## Implementation Details

### 1. Backend Authentication Middleware

Located at: `backend/middleware/auth.js`

**Available Middleware Functions:**

- `verifyToken` - Requires valid JWT token
- `requireAdmin` - Requires valid token + admin role
- `optionalAuth` - Token optional, adds user to req if provided

**How it works:**
1. Extracts Bearer token from Authorization header
2. Verifies token with Supabase
3. Attaches user info to `req.user`
4. Returns 401 if token invalid/missing

### 2. Frontend Authentication

**Getting Auth Token:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

**Sending Token with Requests:**
```typescript
const response = await axios.post(url, data, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Protected Routes

All broadcast routes are now protected:
- `POST /api/broadcast/send` - Send messages
- `GET /api/broadcast/status` - Get queue status
- `GET /api/broadcast/status/:jobId` - Get job status
- `GET /api/broadcast/history` - Get history

### 4. Testing Authentication

**Test Endpoints Available:**

1. **Public Endpoint** (No auth required):
   ```bash
   curl http://localhost:3001/api/auth-test/public
   ```

2. **Protected Endpoint** (Token required):
   ```bash
   curl http://localhost:3001/api/auth-test/protected \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Admin Endpoint** (Admin role required):
   ```bash
   curl http://localhost:3001/api/auth-test/admin \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

4. **Verify Token**:
   ```bash
   curl -X POST http://localhost:3001/api/auth-test/verify \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Error Responses

### No Token Provided
```json
{
  "success": false,
  "error": "No token provided. Please include Authorization header with Bearer token."
}
```

### Invalid Token
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Insufficient Permissions
```json
{
  "success": false,
  "error": "Admin access required"
}
```

## Frontend Integration Example

```typescript
// In your service file
async function callProtectedAPI() {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Please login first');
    }
    
    // Make authenticated request
    const response = await axios.get(`${BACKEND_URL}/api/protected-route`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Redirect to login or refresh token
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    throw error;
  }
}
```

## Security Best Practices

1. **Always verify tokens on backend** - Never trust client-side validation
2. **Use HTTPS in production** - Tokens should only be sent over encrypted connections
3. **Handle token expiration** - Implement token refresh logic
4. **Validate user permissions** - Check roles/permissions for sensitive operations
5. **Log authentication failures** - Monitor for suspicious activity

## Troubleshooting

### Token Not Being Sent
- Check if session exists: `supabase.auth.getSession()`
- Verify header format: `Authorization: Bearer TOKEN`
- Check for typos in header name

### 401 Unauthorized Errors
- Token might be expired - try refreshing
- Check if user email is verified
- Verify environment variables are set correctly

### CORS Issues
- Ensure frontend URL is in allowed origins
- Check credentials flag is set to true

## Environment Variables Required

**Backend:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Frontend:**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps

1. Implement role-based access control (RBAC)
2. Add rate limiting per user
3. Implement token refresh mechanism
4. Add audit logging for sensitive operations
5. Consider implementing API keys for service-to-service communication