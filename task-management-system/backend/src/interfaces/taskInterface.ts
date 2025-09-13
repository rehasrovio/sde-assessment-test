/**
 * Task-related interfaces and types
 */

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null; // ISO date string
  assigned_to: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  due_date?: string; // ISO date string
  assigned_to?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  due_date?: string; // ISO date string
  assigned_to?: number;
}

export interface TaskFilters {
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  assignedTo?: number | "unassigned" | string;
  search?: string;
}

export interface TaskSortOptions {
  sortBy?: "created_at" | "updated_at" | "due_date" | "title" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface TaskPaginationOptions {
  limit?: number;
  offset?: number;
}

export interface TaskQueryParams
  extends TaskFilters,
    TaskSortOptions,
    TaskPaginationOptions {}

export interface TaskWithUser extends Task {
  assigned_user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  } | null;
}
