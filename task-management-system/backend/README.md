# Task Management System - Backend

A simple, scalable Node.js backend for the task management system assessment.

## Architecture

This follows a clean separation of concerns:

```
src/
├── config/
│   └── database.ts          # Database connection pool
├── services/
│   └── UserService.ts       # Business logic for users
├── controllers/
│   └── UserController.ts    # HTTP request handling
├── routes/
│   └── userRoutes.ts        # Route definitions
├── middleware/
│   └── errorHandler.ts      # Error handling middleware
└── index.ts                 # Application entry point
```

## Key Principles

- **Services**: Handle business logic and database operations
- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints
- **Middleware**: Handle cross-cutting concerns (errors, validation, etc.)
- **Config**: Centralized configuration (database, environment)

## Database Connection

Simple PostgreSQL connection with connection pooling:

```typescript
import { getPool } from './config/database';

const pool = getPool();
const result = await pool.query('SELECT * FROM users');
```

## User Service Example

```typescript
import { UserService } from './services/UserService';

const userService = new UserService();

// Get all users
const users = await userService.getAllUsers();

// Create a user
const user = await userService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  full_name: 'John Doe'
});
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Check database connection

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the database:
```bash
docker-compose up -d
```

3. Run the server:
```bash
npm run dev
```

## Testing

Test the API with curl:

```bash
# Get all users
curl http://localhost:3001/api/users

# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","full_name":"Test User"}'

# Health check
curl http://localhost:3001/health
```

## Adding New Features

To add a new entity (e.g., Tasks):

1. Create `TaskService` in `services/`
2. Create `TaskController` in `controllers/`
3. Create `taskRoutes` in `routes/`
4. Add routes to `index.ts`

This keeps everything modular and easy to maintain.
