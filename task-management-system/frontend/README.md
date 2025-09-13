# Task Management System - Frontend

A modern React frontend application for managing tasks and users with a clean, responsive interface.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Backend API running on port 3001
- npm or yarn

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

## ✨ Features

### Task Management
- **Create Tasks**: Add new tasks with title, description, status, priority, due date
- **Edit Tasks**: Update existing tasks with full form validation
- **Delete Tasks**: Remove tasks with confirmation dialog
- **Status Management**: Change task status (todo, in-progress, done)
- **Task Assignment**: Assign tasks to users or mark as unassigned

### User Management
- **Create Users**: Add new team members
- **Edit Users**: Update user information
- **Delete Users**: Remove users from the system
- **User Assignment**: Assign tasks to specific users

### Advanced Features
- **Search & Filter**: Search tasks by title/description, filter by status, priority, assignee
- **Sorting**: Sort tasks by date, priority, title, or status
- **Pagination**: Efficient browsing with "Load More" functionality
- **Real-time Updates**: Instant UI updates when data changes
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── TaskCard.tsx    # Individual task display
│   ├── TaskForm.tsx    # Task creation/editing form
│   ├── UserCard.tsx    # Individual user display
│   ├── UserForm.tsx    # User creation/editing form
│   ├── FilterBar.tsx   # Search and filter controls
│   ├── Navigation.tsx  # Main navigation
│   ├── LoadingSpinner.tsx
│   └── ErrorAlert.tsx
├── pages/              # Main application pages
│   ├── DashboardPage.tsx    # Overview dashboard
│   ├── TaskListPage.tsx     # Task management
│   └── UserManagementPage.tsx
├── services/           # API integration
│   └── api.ts         # Axios API client
├── types/             # TypeScript definitions
│   └── index.ts       # Type definitions
└── App.tsx            # Main application component
```

### Key Components

#### TaskListPage
- Displays paginated list of tasks
- Advanced filtering and search
- Task creation and editing
- Status management

#### UserManagementPage
- User CRUD operations
- User assignment for tasks
- User information management

#### DashboardPage
- Task statistics overview
- Recent tasks display
- Quick access to main features

## 🔧 Configuration

### API Integration
- **Base URL**: `http://localhost:3001/api`
- **HTTP Client**: Axios with error handling
- **Type Safety**: Full TypeScript integration

### Environment Variables
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design
- **Glass-morphism Effects**: Subtle transparency and blur effects
- **Responsive Layout**: Mobile-first design approach
- **Consistent Styling**: Unified color scheme and typography

### User Experience
- **Intuitive Navigation**: Clear menu structure
- **Form Validation**: Real-time input validation
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no data exists

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Component Architecture**: Reusable, modular components
- **Error Boundaries**: Graceful error handling

## 🔗 API Integration

### Backend Requirements
- Backend API must be running on port 3001
- CORS enabled for localhost:3000
- All endpoints documented in backend README

### Data Flow
1. **API Service Layer**: Centralized API calls with error handling
2. **Type Safety**: TypeScript interfaces for all data models
3. **State Management**: React hooks for local state
4. **Real-time Updates**: Optimistic UI updates

## 🤖 AI Tools Used

This frontend utilized AI assistance for:
- **Component Generation**: Initial component templates and structure
- **TypeScript Types**: Type definitions and interfaces
- **CSS Styling**: Modern styling with glass-morphism effects
- **Error Handling**: Consistent error handling patterns
- **Form Validation**: Input validation logic

All business logic, component architecture, and user experience decisions were implemented manually.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Styling**: CSS3 with modern features
- **State Management**: React Hooks