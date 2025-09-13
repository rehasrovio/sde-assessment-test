# Task Management System API Documentation

## Overview
This document describes the complete API endpoints for the Task Management System. The API provides comprehensive functionality for managing users and tasks with full CRUD operations, filtering, sorting, pagination, and advanced search capabilities.

## Base URL
```
http://localhost:3001/api
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

---

# User API

## Base URL
```
http://localhost:3001/api/users
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

# Task API

## Base URL
```
http://localhost:3001/api/tasks
```

## Endpoints

### 1. Get All Tasks
**GET** `/api/tasks`

Retrieves all tasks with optional filtering, sorting, and pagination.

#### Query Parameters
- `status` (optional): Filter by task status (`todo`, `in-progress`, `done`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `assignedTo` (optional): Filter by assigned user ID or `unassigned`
- `search` (optional): Search in title and description (case-insensitive)
- `sortBy` (optional): Sort field (`created_at`, `updated_at`, `due_date`, `title`, `priority`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`) - defaults to `desc`
- `limit` (optional): Number of results per page (1-100)
- `offset` (optional): Number of results to skip

#### Response
- **Status**: `200 OK`
- **Body**: Object with tasks array and pagination metadata

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "in-progress",
      "priority": "high",
      "due_date": "2024-12-31",
      "assigned_to": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:30:00Z",
      "assigned_user": {
        "id": 1,
        "username": "john_doe",
        "email": "john.doe@example.com",
        "full_name": "John Doe"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "count": 10,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Database connection issues

---

### 2. Get Task by ID
**GET** `/api/tasks/:id`

Retrieves a specific task by its ID.

#### Parameters
- `id` (path, required): Task ID (integer)

#### Response
- **Status**: `200 OK`
- **Body**: Task object with assigned user information

```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2024-12-31",
  "assigned_to": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:30:00Z",
  "assigned_user": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe"
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid task ID format
- **404 Not Found**: Task not found
- **500 Internal Server Error**: Database connection issues

---

### 3. Create Task
**POST** `/api/tasks`

Creates a new task in the system.

#### Request Body
```json
{
  "title": "New Task",
  "description": "Task description (optional)",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-31",
  "assigned_to": 1
}
```

#### Validation Rules
- `title`: Required, string, 1-200 characters, non-empty
- `description`: Optional, string, max 1000 characters
- `status`: Optional, enum (`todo`, `in-progress`, `done`), defaults to `todo`
- `priority`: Optional, enum (`low`, `medium`, `high`), defaults to `medium`
- `due_date`: Optional, string, YYYY-MM-DD format
- `assigned_to`: Optional, integer (user ID) or null

#### Response
- **Status**: `201 Created`
- **Body**: Created task object

```json
{
  "id": 2,
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-31",
  "assigned_to": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields, invalid data format, validation errors
- **500 Internal Server Error**: Database connection issues

---

### 4. Update Task
**PUT** `/api/tasks/:id`

Updates an existing task.

#### Parameters
- `id` (path, required): Task ID (integer)

#### Request Body
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2024-12-31",
  "assigned_to": 2
}
```

#### Validation Rules
- All fields are optional
- At least one field must be provided
- Same validation rules as create task
- `assigned_to` must reference an existing user ID

#### Response
- **Status**: `200 OK`
- **Body**: Updated task object

```json
{
  "id": 1,
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2024-12-31",
  "assigned_to": 2,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T12:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid task ID, no fields to update, validation errors
- **404 Not Found**: Task not found
- **500 Internal Server Error**: Database connection issues

---

### 5. Delete Task
**DELETE** `/api/tasks/:id`

Deletes a task from the system.

#### Parameters
- `id` (path, required): Task ID (integer)

#### Response
- **Status**: `204 No Content`
- **Body**: Empty

#### Error Responses
- **400 Bad Request**: Invalid task ID format
- **404 Not Found**: Task not found
- **500 Internal Server Error**: Database connection issues

---

## Task Filtering Examples

### Filter by Status
```bash
GET /api/tasks?status=in-progress
```

### Filter by Priority
```bash
GET /api/tasks?priority=high
```

### Filter by Assigned User
```bash
GET /api/tasks?assignedTo=1
```

### Filter Unassigned Tasks
```bash
GET /api/tasks?assignedTo=unassigned
```

### Search Tasks
```bash
GET /api/tasks?search=documentation
```

### Sort Tasks
```bash
GET /api/tasks?sortBy=due_date&sortOrder=asc
```

### Paginate Results
```bash
GET /api/tasks?limit=10&offset=20
```

### Combined Filters
```bash
GET /api/tasks?status=todo&priority=high&assignedTo=1&sortBy=due_date&sortOrder=asc&limit=5
```

---

## Data Models

### User Object
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

### Task Object
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-31",
  "assigned_to": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "assigned_user": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe"
  }
}
```

### Pagination Object
```json
{
  "total": 100,
  "count": 10,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

---

## Validation Details

### Task Title Validation
- Required for creation
- Optional for updates
- Must be a non-empty string
- Maximum 200 characters
- Leading/trailing whitespace is trimmed

### Task Description Validation
- Optional
- Must be a string if provided
- Maximum 1000 characters
- Leading/trailing whitespace is trimmed

### Task Status Validation
- Optional
- Must be one of: `todo`, `in-progress`, `done`
- Defaults to `todo` for new tasks

### Task Priority Validation
- Optional
- Must be one of: `low`, `medium`, `high`
- Defaults to `medium` for new tasks

### Due Date Validation
- Optional
- Must be in YYYY-MM-DD format if provided
- Must be a valid date

### Assigned User Validation
- Optional
- Must be a positive integer (user ID) or null
- Referenced user must exist

---

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

---

## Logging

All API operations are logged with the following information:
- Request ID (for tracing requests across services)
- Action performed
- Success/failure status
- Performance metrics (response time)
- Error details (if applicable)
- Context information (user IDs, field names, etc.)

---

## Testing

The API includes comprehensive test coverage for:
- All endpoints and HTTP methods
- Input validation scenarios
- Error handling
- Edge cases
- Performance considerations
- Filtering, sorting, and pagination

Run tests with:
```bash
npm test
```

---

## Examples

### Create a Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API documentation for all endpoints",
    "status": "todo",
    "priority": "high",
    "due_date": "2024-12-31",
    "assigned_to": 1
  }'
```

### Get All Tasks with Filtering
```bash
curl "http://localhost:3001/api/tasks?status=in-progress&priority=high&limit=10"
```

### Update a Task
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "high"
  }'
```

### Search Tasks
```bash
curl "http://localhost:3001/api/tasks?search=documentation&sortBy=due_date&sortOrder=asc"
```

### Get Unassigned Tasks
```bash
curl "http://localhost:3001/api/tasks?assignedTo=unassigned"
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3001/api/tasks/1
```

---

## Health Check

### System Health
**GET** `/health`

Check the health status of the API and database connection.

#### Response
- **Status**: `200 OK` (healthy) or `503 Service Unavailable` (unhealthy)
- **Body**: Health status object

```json
{
  "status": "healthy",
  "database": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. All endpoints are publicly accessible without restrictions.

---

## CORS

The API supports CORS for the following origins:
- Development: `http://localhost:3000`, `http://localhost:3001`
- Production: `https://yourdomain.com` (configurable)

---

## Versioning

Current API version: `1.0.0`

The API follows semantic versioning principles. Breaking changes will result in a new major version.