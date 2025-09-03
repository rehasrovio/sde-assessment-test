# API Requirements Specification

## Overview
Your task is to build a complete task management system using Node.js, Express, PostgreSQL, and React. You'll build both a RESTful API backend and a minimal React frontend to test your API. The system should handle CRUD operations for tasks and users, with filtering, searching, and sorting capabilities.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Required API Endpoints

### Users API

#### GET /api/users
Get all users
- **Response**: Array of user objects
- **Example Response**:
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

#### GET /api/users/:id
Get a specific user by ID
- **Response**: User object or 404 if not found

#### POST /api/users
Create a new user
- **Request Body**:
```json
{
  "username": "new_user",
  "email": "new@example.com",
  "full_name": "New User"
}
```
- **Validation**: username and email must be unique

#### PUT /api/users/:id
Update a user
- **Request Body**: Same as POST, all fields optional

#### DELETE /api/users/:id
Delete a user
- **Edge Case**: What happens to tasks assigned to this user?

### Tasks API

#### GET /api/tasks
Get all tasks with optional filtering and sorting
- **Query Parameters**:
  - `status`: Filter by status (todo, in-progress, done)
  - `priority`: Filter by priority (low, medium, high)
  - `assignedTo`: Filter by assigned user ID or 'unassigned'
  - `search`: Search in title and description (case-insensitive)
  - `sortBy`: Sort field (created_at, updated_at, due_date, title, priority)
  - `sortOrder`: Sort order (asc, desc)
  - `limit`: Number of results to return (pagination)
  - `offset`: Number of results to skip (pagination)

- **Example Request**: `GET /api/tasks?status=todo&priority=high&sortBy=due_date&sortOrder=asc`

- **Response**: Array of task objects
- **Example Response**:
```json
[
  {
    "id": 1,
    "title": "Setup development environment",
    "description": "Install Node.js, PostgreSQL, and set up the project structure",
    "status": "done",
    "priority": "high",
    "due_date": "2024-01-15",
    "assigned_to": 1,
    "created_at": "2024-01-10T10:30:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
  }
]
```

#### GET /api/tasks/:id
Get a specific task by ID
- **Response**: Task object or 404 if not found

#### POST /api/tasks
Create a new task
- **Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-02-15",
  "assigned_to": 1
}
```
- **Validation**: title is required, status and priority must be valid enum values

#### PUT /api/tasks/:id
Update a task
- **Request Body**: Same as POST, all fields optional

#### DELETE /api/tasks/:id
Delete a task
- **Response**: 204 No Content on success

## Edge Cases to Handle

### Input Validation
- Invalid date formats for due_date
- Empty or null required fields
- Invalid enum values for status/priority
- Non-existent user IDs in assigned_to
- Very long strings (title > 200 chars, description > reasonable limit)

### Data Integrity
- What happens when a user is deleted but has assigned tasks?
- Concurrent updates to the same task
- Invalid foreign key references

### Error Handling
- Database connection errors
- Invalid JSON in request body
- Missing required fields
- Duplicate unique constraints (username, email)

### Performance Considerations
- Large result sets (implement pagination)
- Slow queries (add database indexes)
- Search functionality optimization

## Response Format Standards

### Success Responses
- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests

### Error Responses
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate unique constraint
- **500 Internal Server Error**: Server errors

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details if applicable"
}
```

## Testing Requirements

### Unit Tests
- Test all API endpoints
- Test input validation
- Test error handling
- Test edge cases

### Integration Tests
- Test database operations
- Test API with actual HTTP requests
- Test filtering and sorting functionality

## Frontend Requirements

### Minimal React Frontend
Build a simple React application that:
- **Displays tasks** in a list or card format
- **Shows task details** (title, description, status, priority, due date, assigned user)
- **Allows filtering** by status, priority, and assigned user
- **Includes search functionality** to search by title/description
- **Makes API calls** to your backend endpoints
- **Handles loading states** and error messages
- **Has a clean, simple UI** (no need for complex styling)

### Frontend Features
- Task list view with basic information
- Filter controls (dropdowns for status, priority, user)
- Search input field
- Loading indicators
- Error message display
- Responsive design (basic mobile-friendly layout)

### Technical Requirements
- Use React with functional components and hooks
- Make HTTP requests to your backend API
- Handle async operations properly
- Display data in a user-friendly format
- Include basic error handling



## Sample Test Cases

1. **Create a task with invalid status** → Should return 400 error
2. **Assign task to non-existent user** → Should return 400 error
3. **Search for tasks with empty string** → Should return all tasks
4. **Filter by non-existent user** → Should return empty array
5. **Update task with invalid date format** → Should return 400 error
6. **Delete user with assigned tasks** → Should handle gracefully (set assigned_to to NULL)
7. **Get tasks with invalid sort field** → Should return 400 error or default sorting
