import React from "react";
import type { User } from "../types";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="user-card">
      <div className="user-header">
        <div className="user-avatar">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.full_name}</h3>
          <p className="user-username">@{user.username}</p>
        </div>
        <div className="user-actions">
          <button
            className="btn btn-edit"
            onClick={() => onEdit(user)}
            title="Edit user"
          >
            ✏️
          </button>
          <button
            className="btn btn-delete"
            onClick={() => onDelete(user.id)}
            title="Delete user"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="user-details">
        <div className="user-email">
          <span className="label">Email:</span>
          <span className="value">{user.email}</span>
        </div>

        <div className="user-dates">
          <small className="created-date">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </small>
          {user.updated_at !== user.created_at && (
            <small className="updated-date">
              Updated: {new Date(user.updated_at).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
