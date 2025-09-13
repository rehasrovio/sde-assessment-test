import React from "react";
import type { TaskWithUser } from "../types";

interface TaskCardProps {
  task: TaskWithUser;
  onEdit: (task: TaskWithUser) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (
    taskId: number,
    status: "todo" | "in-progress" | "done"
  ) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && task.status !== "done";
  };

  return (
    <div className={`task-card ${isOverdue(task.due_date) ? "overdue" : ""}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            className="btn btn-edit"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            className="btn btn-delete"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-status">
          <label>Status:</label>
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(
                task.id,
                e.target.value as "todo" | "in-progress" | "done"
              )
            }
            className={`status-select ${getStatusColor(task.status)}`}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="task-priority">
          <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="task-footer">
        <div
          className={`task-due-date ${
            isOverdue(task.due_date) ? "overdue" : ""
          }`}
        >
          <span className="due-date-label">Due:</span>
          <span className="due-date-value">{formatDate(task.due_date)}</span>
          {isOverdue(task.due_date) && (
            <span className="overdue-indicator">⚠️ Overdue</span>
          )}
        </div>

        {task.assigned_user ? (
          <div className="task-assignee">
            <span className="assignee-label">Assigned to:</span>
            <span className="assignee-name">
              {task.assigned_user.full_name}
            </span>
          </div>
        ) : (
          <div className="task-assignee unassigned">
            <span className="assignee-label">Unassigned</span>
          </div>
        )}
      </div>

      <div className="task-dates">
        <small className="created-date">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </small>
        {task.updated_at !== task.created_at && (
          <small className="updated-date">
            Updated: {new Date(task.updated_at).toLocaleDateString()}
          </small>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
