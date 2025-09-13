import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../configs/logger";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate or get request ID from header
  const requestId = (req.headers["x-request-id"] as string) || uuidv4();

  // Set request ID in logger
  logger.setRequestId(requestId);

  // Add request ID to response headers
  res.setHeader("x-request-id", requestId);

  // Log request start
  logger.logRequestEvent({
    message: "Request started",
    action: "request_start",
    requestId,
    context: {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    },
  });

  // Clean up request ID when response finishes
  res.on("finish", () => {
    logger.logRequestEvent({
      message: "Request completed",
      action: "request_end",
      requestId,
      context: {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      },
    });

    // Clear request ID from logger
    logger.clearRequestId();
  });

  // Store start time for response time calculation

  next();
};
