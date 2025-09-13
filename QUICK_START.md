# 🚀 Quick Start Guide

Get the Task Management System up and running in minutes!

## Prerequisites

- **Docker & Docker Compose** - For database
- **Node.js** (v16 or higher) - For backend and frontend
- **npm or yarn** - Package manager

## 🐳 Database Setup

1. **Start PostgreSQL Database**
   ```bash
   docker-compose up -d
   ```

2. **Verify Database is Running**
   ```bash
   docker ps
   ```
   You should see `task_management_db` container running.

3. **Check Database Connection** (Optional)
   ```bash
   docker exec -it task_management_db psql -U postgres -d task_management
   ```

## 🔧 Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd task-management-system/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

4. **Verify Backend is Running**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"UP","timestamp":"..."}`

## 🎨 Frontend Setup

1. **Open New Terminal** (keep backend running)

2. **Navigate to Frontend Directory**
   ```bash
   cd task-management-system/frontend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Frontend Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## ✅ Verify Everything is Working

### Backend Health Check
```bash
curl http://localhost:3001/health
```

### API Test
```bash
curl http://localhost:3001/api/tasks
```

### Frontend Test
- Open http://localhost:3000 in your browser
- You should see the Task Management dashboard
- Try creating a task or user

## 🛠️ Development Commands

### Backend Commands
```bash
cd task-management-system/backend
npm run dev          # Start development server
npm test             # Run tests
npm run build        # Build for production
```

### Frontend Commands
```bash
cd task-management-system/frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Commands
```bash
docker-compose up -d          # Start database
docker-compose down -v        # Stop database
docker-compose logs           # View database logs
docker-compose restart        # Restart database
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
- **Backend (3001)**: Change port in `backend/src/index.ts`
- **Frontend (3000)**: Change port in `frontend/vite.config.ts`
- **Database (5432)**: Change port in `docker-compose.yml`

#### Database Connection Failed
```bash
# Restart Docker containers
docker-compose down
docker-compose up -d

# Check if database is running
docker ps | grep postgres
```

#### Frontend Can't Connect to Backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify API URL in frontend configuration

#### Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Explore the Application**
   - Create some tasks and users
   - Test filtering and search functionality
   - Try the pagination features

2. **Read Documentation**
   - Backend: `task-management-system/backend/README.md`
   - Frontend: `task-management-system/frontend/README.md`
   - API Docs: `task-management-system/backend/API_DOCUMENTATION.md`

3. **Run Tests**
   ```bash
   cd task-management-system/backend
   npm test
   ```

## 🎯 Quick Test Checklist

- [ ] Database running (`docker ps`)
- [ ] Backend responding (`curl http://localhost:3001/health`)
- [ ] Frontend loading (http://localhost:3000)
- [ ] Can create a task
- [ ] Can create a user
- [ ] Can filter tasks
- [ ] Pagination working

## 🆘 Need Help?

- Check the individual README files in backend/ and frontend/ directories
- Review the API documentation for endpoint details
- Check Docker logs: `docker-compose logs`
- Check application logs in terminal output

---

**Happy Coding! 🚀**
