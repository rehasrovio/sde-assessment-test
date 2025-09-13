# Task Management System - Backend API

A robust Node.js/Express REST API for managing tasks and users with PostgreSQL database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Database**
   ```bash
   # From project root
   docker-compose up -d
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   ```bash
   curl http://localhost:3001/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Core Endpoints

#### Tasks API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks (with filtering, pagination, search) |
| `POST` | `/api/tasks` | Create new task |
| `GET` | `/api/tasks/:id` | Get task by ID |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

#### Users API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users |
| `POST` | `/api/users` | Create new user |
| `GET` | `/api/users/:id` | Get user by ID |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

### Query Parameters (Tasks)
- `status` - Filter by task status (`todo`, `in-progress`, `done`)
- `priority` - Filter by priority (`low`, `medium`, `high`)
- `assignedTo` - Filter by assigned user ID or `unassigned`
- `search` - Search in title and description
- `sortBy` - Sort field (`created_at`, `updated_at`, `due_date`, `title`, `priority`)
- `sortOrder` - Sort direction (`asc`, `desc`)
- `limit` - Number of results per page (1-100)
- `offset` - Number of results to skip

### Example Requests

#### Create Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "todo",
    "priority": "high",
    "due_date": "2024-12-31",
    "assigned_to": 1
  }'
```

#### Get Tasks with Filters
```bash
curl "http://localhost:3001/api/tasks?status=todo&priority=high&limit=10&offset=0"
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
- **User API Tests**: Complete CRUD operations
- **Task API Tests**: Complete CRUD operations with filtering
- **Validation Tests**: Input validation and error handling
- **Pagination Tests**: Pagination logic and edge cases

### Test Structure
```
src/tests/
├── userAPI.test.ts      # User endpoint tests
├── taskAPI.test.ts      # Task endpoint tests
└── setup/               # Test configuration
```

## 🏗️ Architecture

### Project Structure
```
src/
├── controllers/         # API route handlers
├── services/           # Business logic layer
├── routes/             # Express routes
├── middleware/         # Custom middleware
├── configs/            # Configuration files
├── tests/              # Unit tests
└── app.ts              # Express app setup
```

### Key Features
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Validation**: Input validation middleware for all endpoints
- **Logging**: Structured logging for debugging and monitoring
- **Database**: Optimized PostgreSQL queries with proper indexing
- **Testing**: 95%+ test coverage for critical functionality

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3001)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: task_management)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: password)

### Database Schema
- **Users Table**: id, username, email, full_name, created_at, updated_at
- **Tasks Table**: id, title, description, status, priority, due_date, assigned_to, created_at, updated_at

## 📖 Complete Documentation

For detailed API documentation with examples and error responses, see:
- `API_DOCUMENTATION.md` - Comprehensive API reference

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest + Supertest
- **Validation**: Custom middleware
- **Logging**: Winston

## 🤖 AI Tools Used

This backend utilized AI assistance for:
- **Code Generation**: Initial project structure and boilerplate
- **Type Definitions**: TypeScript interfaces and types
- **Error Handling**: Consistent error handling patterns
- **Testing Structure**: Test templates and assertion patterns
- **Documentation**: API documentation generation
