import React, { useState, useEffect, useCallback } from "react";
import type { User, CreateUserData, UpdateUserData } from "../types";
import { userApi, handleApiError } from "../services/api";
import UserCard from "../components/UserCard";
import UserForm from "../components/UserForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle user operations
  const handleCreateUser = async (
    userData: CreateUserData | UpdateUserData
  ) => {
    try {
      setIsSubmitting(true);
      await userApi.createUser(userData as CreateUserData);
      setShowUserForm(false);
      loadUsers();
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (
    userData: CreateUserData | UpdateUserData
  ) => {
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      await userApi.updateUser(editingUser.id, userData as UpdateUserData);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (
      !window.confirm(
        `Are you sure you want to delete user "${user.full_name}"? This will unassign all their tasks.`
      )
    ) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      loadUsers();
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleOpenUserForm = () => {
    setShowUserForm(true);
    // Scroll to top when opening the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <button
          className="btn btn-primary"
          onClick={handleOpenUserForm}
        >
          + New User
        </button>
      </div>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      <div className="users-section">
        <div className="users-header">
          <h2>Users ({users.length})</h2>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading users..." />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Create the first user to get started.</p>
            <button
              className="btn btn-primary"
              onClick={handleOpenUserForm}
            >
              Create First User
            </button>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        )}
      </div>

      {(showUserForm || editingUser) && (
        <UserForm
          user={editingUser || undefined}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={handleCloseUserForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
