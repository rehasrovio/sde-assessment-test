import axios, { type AxiosResponse } from "axios";
import type {
  User,
  Task,
  TaskWithUser,
  CreateTaskData,
  UpdateTaskData,
  CreateUserData,
  UpdateUserData,
  TaskQueryParams,
  TasksResponse,
  ApiError,
} from "../types";

// API base configuration
const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API functions
export const userApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await api.get("/users");
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (userData: CreateUserData): Promise<User> => {
    const response: AxiosResponse<User> = await api.post("/users", userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: UpdateUserData): Promise<User> => {
    const response: AxiosResponse<User> = await api.put(
      `/users/${id}`,
      userData
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Task API functions
export const taskApi = {
  // Get all tasks with optional filtering, sorting, and pagination
  getAllTasks: async (params?: TaskQueryParams): Promise<TasksResponse> => {
    const response: AxiosResponse<TasksResponse> = await api.get("/tasks", {
      params,
    });
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id: number): Promise<TaskWithUser> => {
    const response: AxiosResponse<TaskWithUser> = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (taskData: CreateTaskData): Promise<Task> => {
    const response: AxiosResponse<Task> = await api.post("/tasks", taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id: number, taskData: UpdateTaskData): Promise<Task> => {
    const response: AxiosResponse<Task> = await api.put(
      `/tasks/${id}`,
      taskData
    );
    return response.data;
  },

  // Delete task
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Health check
export const healthApi = {
  checkHealth: async (): Promise<{
    status: string;
    database: boolean;
    timestamp: string;
  }> => {
    const response = await api.get("/health");
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return error.response.data;
  }

  if (error.code === "ECONNABORTED") {
    return {
      error: "Request Timeout",
      details: "The request took too long to complete. Please try again.",
    };
  }

  if (error.code === "NETWORK_ERROR" || !error.response) {
    return {
      error: "Network Error",
      details: "Unable to connect to the server. Please check your connection.",
    };
  }

  return {
    error: "Unknown Error",
    details: error.message || "An unexpected error occurred",
  };
};

export default api;
