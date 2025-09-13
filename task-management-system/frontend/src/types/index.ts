// Type definitions for the Task Management System

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  assigned_user?: User | null;
}

export interface TaskWithUser extends Task {
  assigned_user: User | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: number | null;
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
}

export interface TaskQueryParams {
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: number | 'unassigned';
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  count: number;
  limit: number | null;
  offset: number;
  hasMore: boolean;
}

export interface TasksResponse {
  tasks: TaskWithUser[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: string;
  details: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
