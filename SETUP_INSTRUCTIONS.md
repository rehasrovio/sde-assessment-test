# Setup Instructions for Candidates

## Quick Start

1. **Clone the repository** (if provided as a git repo)
2. **Start the database**:
   ```bash
   docker-compose up -d
   ```
3. **Verify database setup**:
   ```bash
   docker exec -it task_management_db psql -U postgres -d task_management -c "SELECT COUNT(*) FROM tasks;"
   ```
4. **Build your Node.js API** following the requirements in `API_REQUIREMENTS.md`
5. **Build a minimal React frontend** to test your API
6. **Test your full application** by running both backend and frontend

## Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: task_management
- **Username**: postgres
- **Password**: password

## Database Schema

The database is automatically set up with:
- `users` table with 5 sample users
- `tasks` table with 20+ sample tasks
- Proper indexes for performance
- Foreign key relationships

## Sample Data

The database includes:
- **Users**: john_doe, jane_smith, bob_wilson, alice_brown, charlie_davis
- **Tasks**: Various tasks with different statuses, priorities, and assignments
- **Edge cases**: Some unassigned tasks, overdue tasks, etc.

## Testing Your Application

### Using Your Frontend
1. Start your API server on port 3001
2. Start your React frontend (typically on port 3000)
3. Test all functionality through your frontend interface
4. Verify that API calls are working correctly

### Using curl/Postman
```bash
# Get all tasks
curl http://localhost:3001/api/tasks

# Get tasks with filters
curl "http://localhost:3001/api/tasks?status=todo&priority=high"

# Create a new task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test Description","status":"todo","priority":"medium"}'

# Get all users
curl http://localhost:3001/api/users
```

## Common Issues

### Database Connection Issues
- Make sure Docker is running
- Check if port 5432 is available
- Verify database is running: `docker ps`

### Frontend Issues
- Ensure your API is running on port 3001
- Check browser console for errors
- Verify API endpoints are responding
- Make sure your frontend is making correct API calls

### Database Schema Issues
- The schema is automatically created
- If you need to reset: `docker-compose down -v && docker-compose up -d`

## Development Tips

1. **Start with basic CRUD operations** before adding filtering/sorting
2. **Test edge cases** mentioned in the requirements
3. **Add proper error handling** from the beginning
4. **Use the provided sample data** to test your queries
5. **Check the database directly** if you're unsure about data:
   ```bash
   docker exec -it task_management_db psql -U postgres -d task_management
   ```

## File Structure Suggestion

```
your-project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── public/
└── README.md
```

## Environment Variables

Create a `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=password
PORT=3001
```

## Dependencies You Might Need

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "pg": "^8.8.0",
  "cors": "^2.8.5",
  "helmet": "^6.0.1",
  "express-rate-limit": "^6.7.0",
  "joi": "^17.7.0",
  "jest": "^29.3.1",
  "supertest": "^6.3.3"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1",
  "axios": "^1.3.4"
}
```

## Submission Instructions

### How to Submit Your Work

1. **Create a branch with your name:**
   ```bash
   git checkout -b candidate-[your-name]
   # Example: git checkout -b candidate-john-doe
   ```

2. **Work on your branch and commit regularly:**
   ```bash
   git add .
   git commit -m "Descriptive commit message"
   ```

3. **Push your branch when complete:**
   ```bash
   git push origin candidate-[your-name]
   ```

4. **Notify the hiring team** that your submission is ready for review

**Important**: Only work on the `main` branch or your own candidate branch. Do not access or modify other candidates' branches.

### Submission Requirements

- [ ] All API endpoints implemented and working
- [ ] Minimal React frontend built and functional
- [ ] Frontend integrates properly with backend API
- [ ] Proper error handling for edge cases
- [ ] Unit tests for critical functionality
- [ ] README with setup and testing instructions
- [ ] API documentation (endpoints, request/response formats)
- [ ] Documentation of AI tools used
- [ ] Clean, readable code structure
- [ ] All work committed to your named branch

