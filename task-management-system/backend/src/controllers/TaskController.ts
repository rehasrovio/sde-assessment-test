/**
 * Task Controller
 * Handles HTTP requests for task-related operations
 */

import { Request, Response } from "express";
import { TaskService } from "../services/TaskService";
import {
  CreateTaskData,
  UpdateTaskData,
  TaskQueryParams,
} from "../interfaces/taskInterface";
import { logger } from "../configs/logger";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // GET /api/tasks
  getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryParams: TaskQueryParams = {
        status: req.query.status as "todo" | "in-progress" | "done" | undefined,
        priority: req.query.priority as "low" | "medium" | "high" | undefined,
        assignedTo: req.query.assignedTo as string | undefined,
        search: req.query.search as string | undefined,
        sortBy: req.query.sortBy as
          | "created_at"
          | "updated_at"
          | "due_date"
          | "title"
          | "priority"
          | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
      };

      // Validate assignedTo parameter
      if (queryParams.assignedTo !== undefined) {
        if (queryParams.assignedTo === "unassigned") {
          queryParams.assignedTo = "unassigned";
        } else {
          const assignedToId = parseInt(queryParams.assignedTo as string);
          if (isNaN(assignedToId)) {
            logger.logEvent({
              message: "Invalid assignedTo parameter",
              action: "get_all_tasks_validation_error",
              context: { assignedTo: queryParams.assignedTo },
            });

            res.status(400).json({
              error: "Invalid assignedTo parameter",
              details: "assignedTo must be a valid user ID or 'unassigned'",
            });
            return;
          }
          queryParams.assignedTo = assignedToId as number;
        }
      }

      // Validate limit parameter
      if (
        queryParams.limit !== undefined &&
        (queryParams.limit < 1 || queryParams.limit > 100)
      ) {
        logger.logEvent({
          message: "Invalid limit parameter",
          action: "get_all_tasks_validation_error",
          context: { limit: queryParams.limit },
        });

        res.status(400).json({
          error: "Invalid limit parameter",
          details: "limit must be between 1 and 100",
        });
        return;
      }

      // Validate offset parameter
      if (queryParams.offset !== undefined && queryParams.offset < 0) {
        logger.logEvent({
          message: "Invalid offset parameter",
          action: "get_all_tasks_validation_error",
          context: { offset: queryParams.offset },
        });

        res.status(400).json({
          error: "Invalid offset parameter",
          details: "offset must be 0 or greater",
        });
        return;
      }

      const { tasks, total } = await this.taskService.getAllTasks(queryParams);

      logger.logEvent({
        message: "Tasks retrieved successfully",
        action: "get_all_tasks_success",
        context: {
          count: tasks.length,
          total,
          queryParams,
        },
      });

      // Add pagination metadata to response
      const response = {
        tasks,
        pagination: {
          total,
          count: tasks.length,
          limit: queryParams.limit,
          offset: queryParams.offset || 0,
          hasMore: queryParams.limit
            ? (queryParams.offset || 0) + tasks.length < total
            : false,
        },
      };

      res.json(response);
    } catch (error) {
      logger.logEvent({
        message: "Error fetching tasks",
        action: "get_all_tasks_error",
        error: error as Error,
        context: { queryParams: req.query },
      });

      res.status(500).json({
        error: "Failed to fetch tasks",
        details: "Internal server error occurred while retrieving tasks",
      });
    }
  };

  // GET /api/tasks/:id
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid task ID provided",
          action: "get_task_by_id_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid task ID",
          details: "Task ID must be a valid integer",
        });
        return;
      }

      const task = await this.taskService.getTaskById(id);

      if (!task) {
        logger.logEvent({
          message: "Task not found",
          action: "get_task_by_id_not_found",
          context: { taskId: id },
        });

        res.status(404).json({
          error: "Task not found",
          details: `Task with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "Task retrieved successfully",
        action: "get_task_by_id_success",
        context: { taskId: id },
      });

      res.json(task);
    } catch (error) {
      logger.logEvent({
        message: "Error fetching task by ID",
        action: "get_task_by_id_error",
        error: error as Error,
        context: { taskId: req.params.id },
      });

      res.status(500).json({
        error: "Failed to fetch task",
        details: "Internal server error occurred while retrieving task",
      });
    }
  };

  // POST /api/tasks
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, status, priority, due_date, assigned_to } =
        req.body;

      // Basic validation (additional validation handled by middleware)
      if (!title) {
        logger.logEvent({
          message: "Missing required field for task creation",
          action: "create_task_validation_error",
          context: {
            providedFields: {
              title: !!title,
              description: !!description,
              status: !!status,
              priority: !!priority,
              due_date: !!due_date,
              assigned_to: !!assigned_to,
            },
          },
        });

        res.status(400).json({
          error: "Missing required fields",
          details: "Title is required",
        });
        return;
      }

      const taskData: CreateTaskData = {
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
      };

      const task = await this.taskService.createTask(taskData);

      logger.logEvent({
        message: "Task created successfully",
        action: "create_task_success",
        context: {
          taskId: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
        },
      });

      res.status(201).json(task);
    } catch (error: any) {
      logger.logEvent({
        message: "Error creating task",
        action: "create_task_error",
        error: error as Error,
        context: {
          title: req.body.title,
          status: req.body.status,
          priority: req.body.priority,
        },
      });

      if (error.message === "Referenced user does not exist") {
        res.status(400).json({
          error: "Invalid assigned user",
          details: "The assigned user does not exist",
        });
      } else if (error.message === "Invalid status or priority value") {
        res.status(400).json({
          error: "Invalid status or priority",
          details:
            "Status must be 'todo', 'in-progress', or 'done'. Priority must be 'low', 'medium', or 'high'",
        });
      } else {
        res.status(500).json({
          error: "Failed to create task",
          details: "Internal server error occurred while creating task",
        });
      }
    }
  };

  // PUT /api/tasks/:id
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid task ID provided for update",
          action: "update_task_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid task ID",
          details: "Task ID must be a valid integer",
        });
        return;
      }

      const { title, description, status, priority, due_date, assigned_to } =
        req.body;
      const taskData: UpdateTaskData = {
        title,
        description,
        status,
        priority,
        due_date,
        assigned_to,
      };

      // Check if at least one field is provided
      if (
        !title &&
        !description &&
        !status &&
        !priority &&
        !due_date &&
        assigned_to === undefined
      ) {
        logger.logEvent({
          message: "No fields provided for task update",
          action: "update_task_validation_error",
          context: { taskId: id },
        });

        res.status(400).json({
          error: "No fields to update",
          details: "At least one field must be provided for update",
        });
        return;
      }

      const task = await this.taskService.updateTask(id, taskData);

      if (!task) {
        logger.logEvent({
          message: "Task not found for update",
          action: "update_task_not_found",
          context: { taskId: id },
        });

        res.status(404).json({
          error: "Task not found",
          details: `Task with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "Task updated successfully",
        action: "update_task_success",
        context: {
          taskId: id,
          updatedFields: Object.keys(taskData).filter(
            (key) => taskData[key as keyof UpdateTaskData] !== undefined
          ),
        },
      });

      res.json(task);
    } catch (error: any) {
      logger.logEvent({
        message: "Error updating task",
        action: "update_task_error",
        error: error as Error,
        context: {
          taskId: req.params.id,
          updateData: req.body,
        },
      });

      if (error.message === "No fields to update") {
        res.status(400).json({
          error: "No fields to update",
          details: "At least one field must be provided for update",
        });
      } else if (error.message === "Referenced user does not exist") {
        res.status(400).json({
          error: "Invalid assigned user",
          details: "The assigned user does not exist",
        });
      } else if (error.message === "Invalid status or priority value") {
        res.status(400).json({
          error: "Invalid status or priority",
          details:
            "Status must be 'todo', 'in-progress', or 'done'. Priority must be 'low', 'medium', or 'high'",
        });
      } else {
        res.status(500).json({
          error: "Failed to update task",
          details: "Internal server error occurred while updating task",
        });
      }
    }
  };

  // DELETE /api/tasks/:id
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid task ID provided for deletion",
          action: "delete_task_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid task ID",
          details: "Task ID must be a valid integer",
        });
        return;
      }

      const deleted = await this.taskService.deleteTask(id);

      if (!deleted) {
        logger.logEvent({
          message: "Task not found for deletion",
          action: "delete_task_not_found",
          context: { taskId: id },
        });

        res.status(404).json({
          error: "Task not found",
          details: `Task with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "Task deleted successfully",
        action: "delete_task_success",
        context: { taskId: id },
      });

      res.status(204).send();
    } catch (error) {
      logger.logEvent({
        message: "Error deleting task",
        action: "delete_task_error",
        error: error as Error,
        context: { taskId: req.params.id },
      });

      res.status(500).json({
        error: "Failed to delete task",
        details: "Internal server error occurred while deleting task",
      });
    }
  };
}
