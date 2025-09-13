# User API Documentation

## Overview
This document describes the User API endpoints for the Task Management System. All endpoints follow RESTful conventions and include comprehensive error handling, validation, and logging.

## Base URL
```
http://localhost:3001/api/users
```

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

## Request/Response Format
- **Content-Type**: `application/json`
- **Response Format**: JSON

## Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Endpoints

### 1. Get All Users
**GET** `/api/users`

Retrieves all users in the system.

#### Response
- **Status**: `200 OK`
- **Body**: Array of user objects

```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Error Responses
- **500 Internal Server Error**: Database connection issues

---

### 2. Get User by ID
**GET** `/api/users/:id`

Retrieves a specific user by their ID.

#### Parameters
- `id` (path, required): User ID (integer)

#### Response
- **Status**: `200 OK`
- **Body**: User object

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid user ID format
- **404 Not Found**: User not found
- **500 Internal Server Error**: Database connection issues

---

### 3. Create User
**POST** `/api/users`

Creates a new user in the system.

#### Request Body
```json
{
  "username": "new_user",
  "email": "new@example.com",
  "full_name": "New User"
}
```

#### Validation Rules
- `username`: Required, string, 1-50 characters, unique
- `email`: Required, string, valid email format, 1-100 characters, unique
- `full_name`: Required, string, 1-100 characters

#### Response
- **Status**: `201 Created`
- **Body**: Created user object

```json
{
  "id": 2,
  "username": "new_user",
  "email": "new@example.com",
  "full_name": "New User",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields, invalid data format, validation errors
- **409 Conflict**: Username or email already exists
- **500 Internal Server Error**: Database connection issues

---

### 4. Update User
**PUT** `/api/users/:id`

Updates an existing user.

#### Parameters
- `id` (path, required): User ID (integer)

#### Request Body
```json
{
  "username": "updated_user",
  "email": "updated@example.com",
  "full_name": "Updated User"
}
```

#### Validation Rules
- All fields are optional
- At least one field must be provided
- Same validation rules as create user
- Username and email must be unique (if provided)

#### Response
- **Status**: `200 OK`
- **Body**: Updated user object

```json
{
  "id": 1,
  "username": "updated_user",
  "email": "updated@example.com",
  "full_name": "Updated User",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid user ID, no fields to update, validation errors
- **404 Not Found**: User not found
- **409 Conflict**: Username or email already exists
- **500 Internal Server Error**: Database connection issues

---

### 5. Delete User
**DELETE** `/api/users/:id`

Deletes a user from the system.

#### Parameters
- `id` (path, required): User ID (integer)

#### Response
- **Status**: `204 No Content`
- **Body**: Empty

#### Edge Case Handling
When a user is deleted, any tasks assigned to that user will have their `assigned_to` field set to `NULL` (unassigned).

#### Error Responses
- **400 Bad Request**: Invalid user ID format
- **404 Not Found**: User not found
- **500 Internal Server Error**: Database connection issues

---

## Validation Details

### Username Validation
- Required for creation
- Optional for updates
- Must be a non-empty string
- Maximum 50 characters
- Must be unique across all users
- Leading/trailing whitespace is trimmed

### Email Validation
- Required for creation
- Optional for updates
- Must be a valid email format
- Maximum 100 characters
- Must be unique across all users
- Converted to lowercase
- Leading/trailing whitespace is trimmed

### Full Name Validation
- Required for creation
- Optional for updates
- Must be a non-empty string
- Maximum 100 characters
- Leading/trailing whitespace is trimmed

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate unique constraint |
| 500 | Internal Server Error - Server error |

## Logging

All API operations are logged with the following information:
- Request ID (for tracing requests across services)
- Action performed
- Success/failure status
- Performance metrics (response time)
- Error details (if applicable)
- Context information (user IDs, field names, etc.)

## Testing

The API includes comprehensive test coverage for:
- All endpoints and HTTP methods
- Input validation scenarios
- Error handling
- Edge cases
- Performance considerations

Run tests with:
```bash
npm test
```

## Examples

### Create a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_doe",
    "email": "jane.doe@example.com",
    "full_name": "Jane Doe"
  }'
```

### Get All Users
```bash
curl http://localhost:3001/api/users
```

### Update a User
```bash
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith"
  }'
```

### Delete a User
```bash
curl -X DELETE http://localhost:3001/api/users/1
```
