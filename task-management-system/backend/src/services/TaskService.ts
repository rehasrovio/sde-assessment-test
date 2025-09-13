/**
 * Task Service
 * Handles all business logic and database operations for tasks
 */

import { Pool } from "pg";
import { getPool } from "../configs/database";
import { logger } from "../configs/logger";
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskQueryParams,
  TaskWithUser,
} from "../interfaces/taskInterface";

export class TaskService {
  private db: Pool;

  constructor() {
    this.db = getPool();
  }

  // Helper method to handle database errors
  private handleDatabaseError = (
    error: any,
    operation: string,
    context?: any
  ): Error => {
    logger.logEvent({
      message: `Database error during ${operation}`,
      action: "database_error",
      error: error,
      context: context,
    });

    // Handle specific PostgreSQL errors
    if (error.code === "23505") {
      // Unique constraint violation
      return new Error("Task constraint violation");
    } else if (error.code === "23503") {
      // Foreign key constraint violation
      return new Error("Referenced user does not exist");
    } else if (error.code === "23502") {
      // Not null constraint violation
      return new Error("Required field is missing");
    } else if (error.code === "22P02") {
      // Invalid input syntax
      return new Error("Invalid data format");
    } else if (error.code === "23514") {
      // Check constraint violation
      return new Error("Invalid status or priority value");
    }

    // Generic database error
    return new Error("Database operation failed");
  };

  // Build WHERE clause for filtering
  private buildWhereClause = (
    filters: Partial<TaskQueryParams>
  ): { whereClause: string; values: any[] } => {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`t.status = $${paramCount}`);
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      conditions.push(`t.priority = $${paramCount}`);
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.assignedTo !== undefined) {
      if (filters.assignedTo === "unassigned") {
        conditions.push(`t.assigned_to IS NULL`);
      } else {
        conditions.push(`t.assigned_to = $${paramCount}`);
        values.push(filters.assignedTo);
        paramCount++;
      }
    }

    if (filters.search) {
      conditions.push(
        `(t.title ILIKE $${paramCount} OR t.description ILIKE $${
          paramCount + 1
        })`
      );
      values.push(`%${filters.search}%`, `%${filters.search}%`);
      paramCount += 2;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { whereClause, values };
  };

  // Build ORDER BY clause for sorting
  private buildOrderClause = (sortBy?: string, sortOrder?: string): string => {
    const validSortFields = [
      "created_at",
      "updated_at",
      "due_date",
      "title",
      "priority",
    ];
    const field = validSortFields.includes(sortBy || "")
      ? sortBy
      : "created_at";
    const order = sortOrder === "asc" ? "ASC" : "DESC";

    return `ORDER BY t.${field} ${order}`;
  };

  // Build LIMIT and OFFSET clause for pagination
  private buildPaginationClause = (limit?: number, offset?: number): string => {
    let clause = "";

    if (limit && limit > 0) {
      clause += ` LIMIT ${Math.min(limit, 100)}`; // Max 100 items per page
    }

    if (offset && offset >= 0) {
      clause += ` OFFSET ${offset}`;
    }

    return clause;
  };

  // Get all tasks with filtering, sorting, and pagination
  public getAllTasks = async (
    queryParams: TaskQueryParams = {}
  ): Promise<{ tasks: TaskWithUser[]; total: number }> => {
    try {
      const startTime = Date.now();

      // Build WHERE clause
      const { whereClause, values } = this.buildWhereClause(queryParams);

      // Build ORDER BY clause
      const orderClause = this.buildOrderClause(
        queryParams.sortBy,
        queryParams.sortOrder
      );

      // Build pagination clause
      const paginationClause = this.buildPaginationClause(
        queryParams.limit,
        queryParams.offset
      );

      // Main query with user information
      const mainQuery = `
        SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.id as user_id,
          u.username,
          u.email,
          u.full_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ${whereClause}
        ${orderClause}
        ${paginationClause}
      `;

      // Count query for total results
      const countQuery = `
        SELECT COUNT(*) as total
        FROM tasks t
        ${whereClause}
      `;

      // Execute both queries
      const [tasksResult, countResult] = await Promise.all([
        this.db.query(mainQuery, values),
        this.db.query(countQuery, values),
      ]);

      // Transform results
      const tasks: TaskWithUser[] = tasksResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        due_date: row.due_date,
        assigned_to: row.assigned_to,
        created_at: row.created_at,
        updated_at: row.updated_at,
        assigned_user: row.user_id
          ? {
              id: row.user_id,
              username: row.username,
              email: row.email,
              full_name: row.full_name,
            }
          : null,
      }));

      const total = parseInt(countResult.rows[0].total);

      logger.logEvent({
        message: "Tasks retrieved successfully",
        action: "get_all_tasks",
        context: {
          count: tasks.length,
          total,
          filters: queryParams,
          duration: Date.now() - startTime,
        },
      });

      return { tasks, total };
    } catch (error) {
      const processedError = this.handleDatabaseError(error, "getAllTasks", {
        queryParams,
      });
      throw processedError;
    }
  };

  // Get task by ID
  public getTaskById = async (id: number): Promise<TaskWithUser | null> => {
    try {
      const query = `
        SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.due_date,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.id as user_id,
          u.username,
          u.email,
          u.full_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.id = $1
      `;

      const result = await this.db.query(query, [id]);
      const row = result.rows[0];

      if (!row) {
        logger.logEvent({
          message: "Task not found",
          action: "get_task_by_id",
          context: { taskId: id, found: false },
        });
        return null;
      }

      const task: TaskWithUser = {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        due_date: row.due_date,
        assigned_to: row.assigned_to,
        created_at: row.created_at,
        updated_at: row.updated_at,
        assigned_user: row.user_id
          ? {
              id: row.user_id,
              username: row.username,
              email: row.email,
              full_name: row.full_name,
            }
          : null,
      };

      logger.logEvent({
        message: "Task retrieved successfully",
        action: "get_task_by_id",
        context: { taskId: id, found: true },
      });

      return task;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, "getTaskById", {
        taskId: id,
      });
      throw processedError;
    }
  };

  // Create new task
  public createTask = async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const {
        title,
        description,
        status = "todo",
        priority = "medium",
        due_date,
        assigned_to,
      } = taskData;

      const result = await this.db.query(
        `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          title,
          description || null,
          status,
          priority,
          due_date || null,
          assigned_to || null,
        ]
      );

      const newTask = result.rows[0] as Task;

      logger.logEvent({
        message: "Task created successfully",
        action: "create_task",
        context: {
          taskId: newTask.id,
          title: newTask.title,
          status: newTask.status,
          priority: newTask.priority,
        },
      });

      return newTask;
    } catch (error: any) {
      const processedError = this.handleDatabaseError(error, "createTask", {
        taskData,
      });
      throw processedError;
    }
  };

  // Update task
  public updateTask = async (
    id: number,
    taskData: UpdateTaskData
  ): Promise<Task | null> => {
    try {
      // Check if task exists
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        logger.logEvent({
          message: "Task not found for update",
          action: "update_task_not_found",
          context: { taskId: id },
        });
        return null;
      }

      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic query
      if (taskData.title !== undefined) {
        fields.push(`title = $${paramCount}`);
        values.push(taskData.title);
        paramCount++;
      }
      if (taskData.description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(taskData.description);
        paramCount++;
      }
      if (taskData.status !== undefined) {
        fields.push(`status = $${paramCount}`);
        values.push(taskData.status);
        paramCount++;
      }
      if (taskData.priority !== undefined) {
        fields.push(`priority = $${paramCount}`);
        values.push(taskData.priority);
        paramCount++;
      }
      if (taskData.due_date !== undefined) {
        fields.push(`due_date = $${paramCount}`);
        values.push(taskData.due_date);
        paramCount++;
      }
      if (taskData.assigned_to !== undefined) {
        fields.push(`assigned_to = $${paramCount}`);
        values.push(taskData.assigned_to);
        paramCount++;
      }

      if (fields.length === 0) {
        logger.logEvent({
          message: "No fields to update",
          action: "update_task_no_fields",
          context: { taskId: id },
        });
        throw new Error("No fields to update");
      }

      values.push(id);
      const query = `UPDATE tasks SET ${fields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;

      const result = await this.db.query(query, values);
      const updatedTask = result.rows[0] as Task;

      logger.logEvent({
        message: "Task updated successfully",
        action: "update_task",
        context: {
          taskId: id,
          updatedFields: Object.keys(taskData),
        },
      });

      return updatedTask;
    } catch (error: any) {
      if (error.message === "No fields to update") {
        throw error; // Re-throw validation errors as-is
      }

      const processedError = this.handleDatabaseError(error, "updateTask", {
        taskId: id,
        taskData,
      });
      throw processedError;
    }
  };

  // Delete task
  public deleteTask = async (id: number): Promise<boolean> => {
    try {
      const result = await this.db.query("DELETE FROM tasks WHERE id = $1", [
        id,
      ]);
      const deleted = result.rowCount !== null && result.rowCount > 0;

      logger.logEvent({
        message: deleted ? "Task deleted successfully" : "Task deletion failed",
        action: "delete_task",
        context: {
          taskId: id,
          deleted,
        },
      });

      return deleted;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, "deleteTask", {
        taskId: id,
      });
      throw processedError;
    }
  };

  // Check if task exists
  public taskExists = async (id: number): Promise<boolean> => {
    try {
      const result = await this.db.query(
        "SELECT 1 FROM tasks WHERE id = $1 LIMIT 1",
        [id]
      );

      const exists = result.rows.length > 0;

      logger.logEvent({
        message: exists ? "Task exists" : "Task does not exist",
        action: "check_task_exists",
        context: {
          taskId: id,
          exists,
        },
      });

      return exists;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, "taskExists", {
        taskId: id,
      });
      throw processedError;
    }
  };

  // Get tasks count
  public getTasksCount = async (
    filters: Partial<TaskQueryParams> = {}
  ): Promise<number> => {
    try {
      const { whereClause, values } = this.buildWhereClause(filters);

      const query = `
        SELECT COUNT(*) as total
        FROM tasks t
        ${whereClause}
      `;

      const result = await this.db.query(query, values);
      const count = parseInt(result.rows[0].total);

      logger.logEvent({
        message: "Tasks count retrieved successfully",
        action: "get_tasks_count",
        context: {
          count,
          filters,
        },
      });

      return count;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, "getTasksCount", {
        filters,
      });
      throw processedError;
    }
  };
}
