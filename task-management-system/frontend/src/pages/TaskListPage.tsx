import React, { useState, useEffect, useCallback } from "react";
import type {
  TaskWithUser,
  User,
  CreateTaskData,
  UpdateTaskData,
  TaskQueryParams,
} from "../types";
import { taskApi, userApi, handleApiError } from "../services/api";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import FilterBar from "../components/FilterBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter and search state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assignedTo: "",
    sortBy: "created_at",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    count: 0,
    limit: 9,
    offset: 0,
    hasMore: false,
  });

  // Load users for assignment dropdown
  const loadUsers = useCallback(async () => {
    try {
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, []);

  // Load tasks with current filters
  const loadTasks = useCallback(
    async (resetPagination = false) => {
      try {
        if (resetPagination) {
          setLoading(true);
        }
        setError(null);

        const currentOffset = resetPagination ? 0 : pagination.offset;
        const queryParams: TaskQueryParams = {
          search: filters.search || undefined,
          status: (filters.status as any) || undefined,
          priority: (filters.priority as any) || undefined,
          assignedTo:
            filters.assignedTo === "unassigned"
              ? "unassigned"
              : filters.assignedTo
              ? Number(filters.assignedTo)
              : undefined,
          sortBy: filters.sortBy as any,
          sortOrder: filters.sortOrder,
          limit: pagination.limit,
          offset: currentOffset,
        };

        const response = await taskApi.getAllTasks(queryParams);
        
        if (resetPagination) {
          // Replace tasks when resetting (filter changes, initial load)
          setTasks(response.tasks);
        } else {
          // Append tasks when loading more
          setTasks(prevTasks => [...prevTasks, ...response.tasks]);
        }
        
        setPagination(response.pagination);
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.details);
      } finally {
        if (resetPagination) {
          setLoading(false);
        }
      }
    },
    [filters, pagination.limit, pagination.offset]
  );

  // Load data on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadTasks(true);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      assignedTo: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  // Handle task operations
  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      setIsSubmitting(true);
      await taskApi.createTask(taskData);
      setShowTaskForm(false);
      loadTasks(true);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData: UpdateTaskData) => {
    if (!editingTask) return;

    try {
      setIsSubmitting(true);
      await taskApi.updateTask(editingTask.id, taskData);
      setEditingTask(null);
      loadTasks(true);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      loadTasks(true);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    }
  };

  const handleStatusChange = async (
    taskId: number,
    status: "todo" | "in-progress" | "done"
  ) => {
    try {
      await taskApi.updateTask(taskId, { status });
      loadTasks(true);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.details);
    }
  };

  const handleEditTask = (task: TaskWithUser) => {
    setEditingTask(task);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleOpenTaskForm = () => {
    setShowTaskForm(true);
    // Scroll to top when opening the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = async () => {
    if (pagination.hasMore && !loadingMore) {
      setLoadingMore(true);
      const newOffset = pagination.offset + pagination.limit;
      
      try {
        setError(null);

        const queryParams: TaskQueryParams = {
          search: filters.search || undefined,
          status: (filters.status as any) || undefined,
          priority: (filters.priority as any) || undefined,
          assignedTo:
            filters.assignedTo === "unassigned"
              ? "unassigned"
              : filters.assignedTo
              ? Number(filters.assignedTo)
              : undefined,
          sortBy: filters.sortBy as any,
          sortOrder: filters.sortOrder,
          limit: pagination.limit,
          offset: newOffset,
        };

        const response = await taskApi.getAllTasks(queryParams);
        
        // Append tasks when loading more, avoiding duplicates
        setTasks(prevTasks => {
          const existingIds = new Set(prevTasks.map(task => task.id));
          const newTasks = response.tasks.filter(task => !existingIds.has(task.id));
          return [...prevTasks, ...newTasks];
        });
        setPagination(response.pagination);
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.details);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  return (
    <div className="task-list-page">
      <div className="page-header">
        <h1>Task Management</h1>
        <button
          className="btn btn-primary"
          onClick={handleOpenTaskForm}
        >
          + New Task
        </button>
      </div>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      <FilterBar
        searchTerm={filters.search}
        statusFilter={filters.status}
        priorityFilter={filters.priority}
        assignedToFilter={filters.assignedTo}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        users={users}
        onSearchChange={(value) => handleFilterChange("search", value)}
        onStatusChange={(value) => handleFilterChange("status", value)}
        onPriorityChange={(value) => handleFilterChange("priority", value)}
        onAssignedToChange={(value) => handleFilterChange("assignedTo", value)}
        onSortByChange={(value) => handleFilterChange("sortBy", value)}
        onSortOrderChange={(value) => handleFilterChange("sortOrder", value)}
        onClearFilters={handleClearFilters}
      />

      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Tasks ({pagination.total})</h2>
          {tasks.length > 0 && (
            <p className="tasks-info">
              Showing {Math.min(tasks.length, pagination.total)} of {pagination.total} tasks
            </p>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task.</p>
            <button
              className="btn btn-primary"
              onClick={handleOpenTaskForm}
            >
              Create First Task
            </button>
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {pagination.hasMore && tasks.length < pagination.total && (
              <div className="load-more">
                <button
                  className="btn btn-secondary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More Tasks"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          users={users}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseTaskForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default TaskListPage;
