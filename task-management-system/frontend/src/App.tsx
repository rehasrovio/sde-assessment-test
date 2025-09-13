import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import TaskListPage from './pages/TaskListPage';
import UserManagementPage from './pages/UserManagementPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TaskListPage />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;