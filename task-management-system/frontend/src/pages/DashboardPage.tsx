import React, { useState, useEffect } from "react";
import type { TaskWithUser, User } from "../types";
import { taskApi, userApi, handleApiError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
    totalUsers: 0,
  });
  const [recentTasks, setRecentTasks] = useState<TaskWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all tasks and users in parallel
      const [tasksResponse, usersData] = await Promise.all([
        taskApi.getAllTasks({
          limit: 50,
          sortBy: "created_at",
          sortOrder: "desc",
        }),
        userApi.getAllUsers(),
      ]);

      const tasks = tasksResponse.tasks;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate statistics
      const totalTasks = tasksResponse.pagination.total;
      const todoTasks = tasks.filter((task) => task.status === "todo").length;
      const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
      ).length;
      const doneTasks = tasks.filter((task) => task.status === "done").length;
      const overdueTasks = tasks.filter((task) => {
        if (!task.due_date || task.status === "done") return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;

      setStats({
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks,
        totalUsers: usersData.length,
      });

      setRecentTasks(tasks.slice(0, 5));
      setUsers(usersData);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "status-done";
      case "in-progress":
        return "status-in-progress";
      case "todo":
        return "status-todo";
      default:
        return "status-todo";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-secondary" onClick={loadDashboardData}>
          Refresh
        </button>
      </div>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      <div className="dashboard-content">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Tasks</h3>
              <p className="stat-number">{stats.totalTasks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>To Do</h3>
              <p className="stat-number">{stats.todoTasks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>In Progress</h3>
              <p className="stat-number">{stats.inProgressTasks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-number">{stats.doneTasks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>Overdue</h3>
              <p className="stat-number">{stats.overdueTasks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-section">
          <h2>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No recent tasks found.</p>
            </div>
          ) : (
            <div className="recent-tasks">
              {recentTasks.map((task) => (
                <div key={task.id} className="recent-task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p className="task-meta">
                      <span
                        className={`status-badge ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace("-", " ").toUpperCase()}
                      </span>
                      <span
                        className={`priority-badge ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div className="task-details">
                    {task.assigned_user && (
                      <p className="assignee">
                        Assigned to: {task.assigned_user.full_name}
                      </p>
                    )}
                    {task.due_date && (
                      <p className="due-date">
                        Due: {formatDate(task.due_date)}
                      </p>
                    )}
                    <p className="created-date">
                      Created: {formatDate(task.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
