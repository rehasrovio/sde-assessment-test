import { Request, Response, NextFunction } from "express";
import { logger } from "../configs/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.logGenericErrorEvent({
    message: "Unhandled error occurred",
    error: error
  });

  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development"
      ? error.message
      : "Something went wrong",
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.logEvent({
    message: "Route not found",
    action: "route_not_found",
    context: {
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }
  });

  res.status(404).json({
    error: "Not found",
    details: `Route ${req.method} ${req.path} not found`,
  });
};
