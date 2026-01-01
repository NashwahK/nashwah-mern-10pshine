# API Testing Guide

## Server Info
- Server: http://localhost:5000
- Health Check: http://localhost:5000/health

## Test Endpoints

### 1. Health Check
```http
GET http://localhost:5000/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2026-01-01T..."
}
```

---

### 2. Register New User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "nashwah",
  "email": "nashwah@example.com",
  "password": "password123",
  "firstName": "Nashwah",
  "lastName": "User"
}
```

Expected Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "nashwah",
      "email": "nashwah@example.com",
      "firstName": "Nashwah",
      "lastName": "User",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "nashwah@example.com",
  "password": "password123"
}
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "nashwah",
      "email": "nashwah@example.com",
      "firstName": "Nashwah",
      "lastName": "User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User (Protected Route)
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Note:** Replace `YOUR_TOKEN_HERE` with the token from login/register response.

Expected Response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "nashwah",
      "email": "nashwah@example.com",
      "firstName": "Nashwah",
      "lastName": "User",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

## Testing with VS Code Thunder Client

1. Install Thunder Client extension in VS Code
2. Create a new request
3. Set the method (GET/POST)
4. Enter the URL
5. For POST requests: Add JSON body in the "Body" tab
6. For protected routes: Add Authorization header with "Bearer {token}"
7. Click Send

## Testing with PowerShell (curl)

### Health Check:
```powershell
curl http://localhost:5000/health
```

### Register:
```powershell
$body = @{
    username = "nashwah"
    email = "nashwah@example.com"
    password = "password123"
    firstName = "Nashwah"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login:
```powershell
$body = @{
    email = "nashwah@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"
```

### Get Current User:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

---

## Check MongoDB Compass

Open MongoDB Compass and connect to `mongodb://localhost:27017`

You should see:
- Database: `notes_app`
- Collection: `users`
- Your registered users will appear here

---

## Common Issues

### 401 Unauthorized
- Check if you're including the Authorization header
- Make sure the token hasn't expired (24h expiration)
- Verify the token format: "Bearer {token}"

### 400 Bad Request
- Check JSON body format
- Verify all required fields are included
- Check validation errors in response

### 409 Conflict
- Email or username already exists
- Try a different email/username
