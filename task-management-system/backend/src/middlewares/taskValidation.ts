/**
 * Task Validation Middleware
 * Handles input validation for task-related endpoints
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../configs/logger";

// Validation middleware for task creation
export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  // Check required fields
  if (!title) {
    logger.logEvent({
      message: "Validation failed: Missing required field",
      action: "validation_error",
      context: {
        missingFields: { title: !title },
      },
    });

    res.status(400).json({
      error: "Missing required fields",
      details: "Title is required",
    });
    return;
  }

  // Validate title
  if (typeof title !== "string" || title.trim().length === 0) {
    logger.logEvent({
      message: "Validation failed: Invalid title",
      action: "validation_error",
      context: { title },
    });

    res.status(400).json({
      error: "Invalid title",
      details: "Title must be a non-empty string",
    });
    return;
  }

  if (title.length > 200) {
    logger.logEvent({
      message: "Validation failed: Title too long",
      action: "validation_error",
      context: { title, length: title.length },
    });

    res.status(400).json({
      error: "Title too long",
      details: "Title must be 200 characters or less",
    });
    return;
  }

  // Validate description
  if (description !== undefined) {
    if (typeof description !== "string") {
      logger.logEvent({
        message: "Validation failed: Invalid description",
        action: "validation_error",
        context: { description },
      });

      res.status(400).json({
        error: "Invalid description",
        details: "Description must be a string",
      });
      return;
    }

    if (description.length > 1000) {
      logger.logEvent({
        message: "Validation failed: Description too long",
        action: "validation_error",
        context: { description, length: description.length },
      });

      res.status(400).json({
        error: "Description too long",
        details: "Description must be 1000 characters or less",
      });
      return;
    }
  }

  // Validate status
  if (status !== undefined) {
    const validStatuses = ["todo", "in-progress", "done"];
    if (!validStatuses.includes(status)) {
      logger.logEvent({
        message: "Validation failed: Invalid status",
        action: "validation_error",
        context: { status },
      });

      res.status(400).json({
        error: "Invalid status",
        details: "Status must be one of: todo, in-progress, done",
      });
      return;
    }
  }

  // Validate priority
  if (priority !== undefined) {
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      logger.logEvent({
        message: "Validation failed: Invalid priority",
        action: "validation_error",
        context: { priority },
      });

      res.status(400).json({
        error: "Invalid priority",
        details: "Priority must be one of: low, medium, high",
      });
      return;
    }
  }

  // Validate due_date
  if (due_date !== undefined) {
    if (typeof due_date !== "string") {
      logger.logEvent({
        message: "Validation failed: Invalid due_date type",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date",
        details: "Due date must be a string",
      });
      return;
    }

    // Check if it's a valid date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      logger.logEvent({
        message: "Validation failed: Invalid due_date format",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date format",
        details: "Due date must be in YYYY-MM-DD format",
      });
      return;
    }

    // Check if it's a valid date
    const date = new Date(due_date);
    if (isNaN(date.getTime())) {
      logger.logEvent({
        message: "Validation failed: Invalid due_date value",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date",
        details: "Due date must be a valid date",
      });
      return;
    }
  }

  // Validate assigned_to
  if (assigned_to !== undefined) {
    if (assigned_to !== null && (typeof assigned_to !== "number" || assigned_to <= 0)) {
      logger.logEvent({
        message: "Validation failed: Invalid assigned_to",
        action: "validation_error",
        context: { assigned_to },
      });

      res.status(400).json({
        error: "Invalid assigned_to",
        details: "Assigned user ID must be a positive integer or null",
      });
      return;
    }
  }

  // Trim whitespace
  req.body.title = title.trim();
  if (description !== undefined) {
    req.body.description = description.trim();
  }

  next();
};

// Validation middleware for task updates
export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;

  // Check if at least one field is provided
  if (!title && !description && !status && !priority && !due_date && assigned_to === undefined) {
    logger.logEvent({
      message: "Validation failed: No fields to update",
      action: "validation_error",
    });

    res.status(400).json({
      error: "No fields to update",
      details: "At least one field must be provided for update",
    });
    return;
  }

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      logger.logEvent({
        message: "Validation failed: Invalid title",
        action: "validation_error",
        context: { title },
      });

      res.status(400).json({
        error: "Invalid title",
        details: "Title must be a non-empty string",
      });
      return;
    }

    if (title.length > 200) {
      logger.logEvent({
        message: "Validation failed: Title too long",
        action: "validation_error",
        context: { title, length: title.length },
      });

      res.status(400).json({
        error: "Title too long",
        details: "Title must be 200 characters or less",
      });
      return;
    }

    req.body.title = title.trim();
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== "string") {
      logger.logEvent({
        message: "Validation failed: Invalid description",
        action: "validation_error",
        context: { description },
      });

      res.status(400).json({
        error: "Invalid description",
        details: "Description must be a string",
      });
      return;
    }

    if (description.length > 1000) {
      logger.logEvent({
        message: "Validation failed: Description too long",
        action: "validation_error",
        context: { description, length: description.length },
      });

      res.status(400).json({
        error: "Description too long",
        details: "Description must be 1000 characters or less",
      });
      return;
    }

    req.body.description = description.trim();
  }

  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ["todo", "in-progress", "done"];
    if (!validStatuses.includes(status)) {
      logger.logEvent({
        message: "Validation failed: Invalid status",
        action: "validation_error",
        context: { status },
      });

      res.status(400).json({
        error: "Invalid status",
        details: "Status must be one of: todo, in-progress, done",
      });
      return;
    }
  }

  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      logger.logEvent({
        message: "Validation failed: Invalid priority",
        action: "validation_error",
        context: { priority },
      });

      res.status(400).json({
        error: "Invalid priority",
        details: "Priority must be one of: low, medium, high",
      });
      return;
    }
  }

  // Validate due_date if provided
  if (due_date !== undefined) {
    if (typeof due_date !== "string") {
      logger.logEvent({
        message: "Validation failed: Invalid due_date type",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date",
        details: "Due date must be a string",
      });
      return;
    }

    // Check if it's a valid date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(due_date)) {
      logger.logEvent({
        message: "Validation failed: Invalid due_date format",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date format",
        details: "Due date must be in YYYY-MM-DD format",
      });
      return;
    }

    // Check if it's a valid date
    const date = new Date(due_date);
    if (isNaN(date.getTime())) {
      logger.logEvent({
        message: "Validation failed: Invalid due_date value",
        action: "validation_error",
        context: { due_date },
      });

      res.status(400).json({
        error: "Invalid due_date",
        details: "Due date must be a valid date",
      });
      return;
    }
  }

  // Validate assigned_to if provided
  if (assigned_to !== undefined) {
    if (assigned_to !== null && (typeof assigned_to !== "number" || assigned_to <= 0)) {
      logger.logEvent({
        message: "Validation failed: Invalid assigned_to",
        action: "validation_error",
        context: { assigned_to },
      });

      res.status(400).json({
        error: "Invalid assigned_to",
        details: "Assigned user ID must be a positive integer or null",
      });
      return;
    }
  }

  next();
};

// Validation middleware for task ID parameter
export const validateTaskId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  const taskId = parseInt(id);

  if (isNaN(taskId) || taskId <= 0) {
    logger.logEvent({
      message: "Validation failed: Invalid task ID",
      action: "validation_error",
      context: { id, taskId },
    });

    res.status(400).json({
      error: "Invalid task ID",
      details: "Task ID must be a positive integer",
    });
    return;
  }

  req.params.id = taskId.toString();
  next();
};
