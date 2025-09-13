import React from "react";
import type { User } from "../types";

interface FilterBarProps {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  assignedToFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  users: User[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  assignedToFilter,
  sortBy,
  sortOrder,
  users,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onAssignedToChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm ||
    statusFilter ||
    priorityFilter ||
    assignedToFilter ||
    sortBy !== "created_at";

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3>Filters & Search</h3>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <select
              id="assignedTo"
              value={assignedToFilter}
              onChange={(e) => onAssignedToChange(e.target.value)}
            >
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id.toString()}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="due_date">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortOrder">Order</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) =>
                onSortOrderChange(e.target.value as "asc" | "desc")
              }
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="filter-group">
              <button
                className="btn btn-secondary btn-clear"
                onClick={onClearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
