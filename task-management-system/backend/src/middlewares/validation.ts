import { Request, Response, NextFunction } from "express";
import { logger } from "../configs/logger";

// Validation middleware for user creation
export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, email, full_name } = req.body;

  // Check required fields
  if (!username || !email || !full_name) {
    logger.logEvent({
      message: "Validation failed: Missing required fields",
      action: "validation_error",
      context: {
        missingFields: {
          username: !username,
          email: !email,
          full_name: !full_name,
        },
      },
    });

    res.status(400).json({
      error: "Missing required fields",
      details: "Username, email, and full_name are required",
    });
    return;
  }

  // Validate username
  if (typeof username !== "string" || username.trim().length === 0) {
    logger.logEvent({
      message: "Validation failed: Invalid username",
      action: "validation_error",
      context: { username },
    });

    res.status(400).json({
      error: "Invalid username",
      details: "Username must be a non-empty string",
    });
    return;
  }

  if (username.length > 50) {
    logger.logEvent({
      message: "Validation failed: Username too long",
      action: "validation_error",
      context: { username, length: username.length },
    });

    res.status(400).json({
      error: "Username too long",
      details: "Username must be 50 characters or less",
    });
    return;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    logger.logEvent({
      message: "Validation failed: Invalid email format",
      action: "validation_error",
      context: { email },
    });

    res.status(400).json({
      error: "Invalid email format",
      details: "Please provide a valid email address",
    });
    return;
  }

  if (email.length > 100) {
    logger.logEvent({
      message: "Validation failed: Email too long",
      action: "validation_error",
      context: { email, length: email.length },
    });

    res.status(400).json({
      error: "Email too long",
      details: "Email must be 100 characters or less",
    });
    return;
  }

  // Validate full_name
  if (typeof full_name !== "string" || full_name.trim().length === 0) {
    logger.logEvent({
      message: "Validation failed: Invalid full_name",
      action: "validation_error",
      context: { full_name },
    });

    res.status(400).json({
      error: "Invalid full_name",
      details: "Full name must be a non-empty string",
    });
    return;
  }

  if (full_name.length > 100) {
    logger.logEvent({
      message: "Validation failed: Full name too long",
      action: "validation_error",
      context: { full_name, length: full_name.length },
    });

    res.status(400).json({
      error: "Full name too long",
      details: "Full name must be 100 characters or less",
    });
    return;
  }

  // Trim whitespace
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.full_name = full_name.trim();

  next();
};

// Validation middleware for user updates
export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, email, full_name } = req.body;

  // Check if at least one field is provided
  if (!username && !email && !full_name) {
    logger.logEvent({
      message: "Validation failed: No fields to update",
      action: "validation_error",
    });

    res.status(400).json({
      error: "No fields to update",
      details:
        "At least one field (username, email, full_name) must be provided",
    });
    return;
  }

  // Validate username if provided
  if (username !== undefined) {
    if (typeof username !== "string" || username.trim().length === 0) {
      logger.logEvent({
        message: "Validation failed: Invalid username",
        action: "validation_error",
        context: { username },
      });

      res.status(400).json({
        error: "Invalid username",
        details: "Username must be a non-empty string",
      });
      return;
    }

    if (username.length > 50) {
      logger.logEvent({
        message: "Validation failed: Username too long",
        action: "validation_error",
        context: { username, length: username.length },
      });

      res.status(400).json({
        error: "Username too long",
        details: "Username must be 50 characters or less",
      });
      return;
    }

    req.body.username = username.trim();
  }

  // Validate email if provided
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email.trim())) {
      logger.logEvent({
        message: "Validation failed: Invalid email format",
        action: "validation_error",
        context: { email },
      });

      res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address",
      });
      return;
    }

    if (email.length > 100) {
      logger.logEvent({
        message: "Validation failed: Email too long",
        action: "validation_error",
        context: { email, length: email.length },
      });

      res.status(400).json({
        error: "Email too long",
        details: "Email must be 100 characters or less",
      });
      return;
    }

    req.body.email = email.trim().toLowerCase();
  }

  // Validate full_name if provided
  if (full_name !== undefined) {
    if (typeof full_name !== "string" || full_name.trim().length === 0) {
      logger.logEvent({
        message: "Validation failed: Invalid full_name",
        action: "validation_error",
        context: { full_name },
      });

      res.status(400).json({
        error: "Invalid full_name",
        details: "Full name must be a non-empty string",
      });
      return;
    }

    if (full_name.length > 100) {
      logger.logEvent({
        message: "Validation failed: Full name too long",
        action: "validation_error",
        context: { full_name, length: full_name.length },
      });

      res.status(400).json({
        error: "Full name too long",
        details: "Full name must be 100 characters or less",
      });
      return;
    }

    req.body.full_name = full_name.trim();
  }

  next();
};

// Validation middleware for user ID parameter
export const validateUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId) || userId <= 0) {
    logger.logEvent({
      message: "Validation failed: Invalid user ID",
      action: "validation_error",
      context: { id, userId },
    });

    res.status(400).json({
      error: "Invalid user ID",
      details: "User ID must be a positive integer",
    });
    return;
  }

  req.params.id = userId.toString();
  next();
};
