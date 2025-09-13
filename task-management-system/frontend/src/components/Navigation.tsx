import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <span className="brand-icon">🎯</span>
          <span className="brand-text">Task Manager</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          <span className="nav-icon">📊</span>
          Dashboard
        </Link>

        <Link
          to="/tasks"
          className={`nav-link ${isActive("/tasks") ? "active" : ""}`}
        >
          <span className="nav-icon">📝</span>
          Tasks
        </Link>

        <Link
          to="/users"
          className={`nav-link ${isActive("/users") ? "active" : ""}`}
        >
          <span className="nav-icon">👥</span>
          Users
        </Link>
      </div>

      <div className="nav-footer">
        <div className="nav-info">
          <small>Task Management System</small>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
