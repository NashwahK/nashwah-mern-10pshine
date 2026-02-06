# API Documentation

Complete reference for all Pendown API endpoints, request/response formats, error codes, and examples.

## Table of Contents
1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Auth Endpoints](#auth-endpoints)
5. [Notes Endpoints](#notes-endpoints)
6. [Response Types](#response-types)

---

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://api.pendown.app/api` (to be deployed)

All requests should include proper headers and authentication tokens.

---

## Authentication

### JWT Token
All protected endpoints require a valid JWT token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Token Structure:**
```json
{
  "userId": "user_id_here",
  "email": "user@example.com",
  "iat": 1707148800,
  "exp": 1707753600
}
```

**Token Validity:** 7 days (configurable)

### Token Refresh
Tokens are automatically included in login and register responses. Store in localStorage:
```javascript
localStorage.setItem('token', response.data.data.token);
```

---

## Error Handling

### Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  },
  "timestamp": "2025-02-05T15:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input/malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (duplicate email) |
| 500 | Server Error | Internal server error |

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_EMAIL | 400 | Email format invalid |
| WEAK_PASSWORD | 400 | Password doesn't meet requirements |
| INVALID_CREDENTIALS | 401 | Email/password combination incorrect |
| TOKEN_REQUIRED | 401 | Authorization header missing |
| TOKEN_INVALID | 401 | JWT token invalid or expired |
| USER_NOT_FOUND | 404 | User doesn't exist |
| NOTE_NOT_FOUND | 404 | Note doesn't exist |
| UNAUTHORIZED | 403 | User not owner of resource |
| EMAIL_EXISTS | 409 | Email already registered |
| VALIDATION_ERROR | 400 | Input validation failed |

---

## Auth Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules:**
- Email must be valid format
- Password minimum 8 characters
- Must contain uppercase, lowercase, number, special character
- Passwords must match

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2025-02-05T15:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "message": "Email already registered",
    "code": "EMAIL_EXISTS",
    "statusCode": 409
  }
}
```

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2025-02-05T15:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get authenticated user's profile

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "createdAt": "2025-02-05T15:30:00Z"
    }
  }
}
```

---

### 4. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "resetTokenSent": true
  }
}
```

**Notes:**
- Email is sent with reset link
- Reset token valid for 1 hour
- No error if email doesn't exist (security)

---

### 5. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using reset token from email

**Request:**
```json
{
  "resetToken": "token_from_email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "passwordReset": true
  }
}
```

---

## Notes Endpoints

### 1. Get All Notes

**Endpoint:** `GET /notes`

**Description:** Retrieve user's notes with pagination and search

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Notes per page |
| search | string | - | Search in title/content |

**Examples:**
```
GET /notes?page=1&limit=10
GET /notes?page=2&limit=20
GET /notes?search=javascript
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "My First Note",
        "content": "<p>Rich HTML content here</p>",
        "tags": ["javascript", "learning"],
        "color": "blue",
        "isPinned": true,
        "createdAt": "2025-02-05T15:30:00Z",
        "updatedAt": "2025-02-05T16:45:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pages": 5,
      "total": 47,
      "perPage": 10
    }
  }
}
```

---

### 2. Get Single Note

**Endpoint:** `GET /notes/:id`

**Description:** Retrieve a specific note by ID

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): Note MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "My First Note",
      "content": "<p>Rich HTML content here</p>",
      "tags": ["javascript", "learning"],
      "color": "blue",
      "isPinned": true,
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-02-05T15:30:00Z",
      "updatedAt": "2025-02-05T16:45:00Z"
    }
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "message": "Note not found",
    "code": "NOTE_NOT_FOUND",
    "statusCode": 404
  }
}
```

---

### 3. Create Note

**Endpoint:** `POST /notes`

**Description:** Create a new note

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "My New Note",
  "content": "<p>Rich text content here</p>",
  "tags": ["javascript", "learning"],
  "color": "blue",
  "isPinned": false
}
```

**Field Validation:**
- `title` (required): string, 1-200 characters
- `content` (optional): HTML string
- `tags` (optional): array of strings
- `color` (optional): one of default, yellow, pink, blue, green, purple, orange
- `isPinned` (optional): boolean

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "My New Note",
      "content": "<p>Rich text content here</p>",
      "tags": ["javascript", "learning"],
      "color": "blue",
      "isPinned": false,
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-02-05T16:00:00Z",
      "updatedAt": "2025-02-05T16:00:00Z"
    }
  }
}
```

---

### 4. Update Note

**Endpoint:** `PUT /notes/:id`

**Description:** Update an existing note

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Note MongoDB ObjectId

**Request:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "tags": ["updated", "tags"],
  "color": "green",
  "isPinned": true
}
```

**Notes:**
- Only provide fields you want to update
- User must be note owner

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Updated Title",
      "content": "<p>Updated content</p>",
      "tags": ["updated", "tags"],
      "color": "green",
      "isPinned": true,
      "userId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-02-05T16:00:00Z",
      "updatedAt": "2025-02-05T17:00:00Z"
    }
  }
}
```

---

### 5. Delete Note

**Endpoint:** `DELETE /notes/:id`

**Description:** Delete a note

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` (required): Note MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {
    "deletedId": "507f1f77bcf86cd799439013"
  }
}
```

**Error Examples:**
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized to delete this note",
    "code": "UNAUTHORIZED",
    "statusCode": 403
  }
}
```

---

## Response Types

### Success Response

All successful responses follow this structure:

```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  },
  "message": "Optional success message"
}
```

### Error Response

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400
  },
  "timestamp": "2025-02-05T15:30:00Z"
}
```

---

## Rate Limiting

Currently no rate limiting. Recommended to add in production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per user

---

## Testing with Postman/Thunder Client

1. Create a collection named "Pendown API"
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (auto-populate after login)
3. Use pre-request scripts to set token:
   ```javascript
   pm.environment.set("token", pm.response.json().data.token);
   ```

---

## API Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-02-05T15:30:00Z",
  "uptime": 3600
}
```

---

## CORS Configuration

The API accepts requests from:
- localhost:5173 (development frontend)
- Production frontend URL (to be configured)

Credentials are allowed in requests.

---

## Version Information

- **API Version:** v1
- **Last Updated:** February 5, 2025
- **Status:** Production Ready

---

For questions or issues with the API, please check the troubleshooting section in the main README.
