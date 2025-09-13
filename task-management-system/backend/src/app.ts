/**
 * Express App Configuration
 * Shared app setup for both server and tests
 */

import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./configs/logger";
import userRoutes from "./routes/userRoutes";
import taskRoutes from "./routes/taskRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { requestIdMiddleware } from "./middlewares/requestId";

export const createApp = (): Express => {
  const app: Express = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? ["https://yourdomain.com"]
          : ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    })
  );

  // Request ID middleware (should be early in the chain)
  app.use(requestIdMiddleware);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.get("/", (req, res) => {
    res.json({
      message: "Task Management System API",
      version: "1.0.0",
      status: "running",
    });
  });

  // Health check route
  app.get("/health", async (req, res) => {
    try {
      const { testConnection } = await import("./configs/database");
      const isConnected = await testConnection();
      res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "healthy" : "unhealthy",
        database: isConnected,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        database: false,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // API routes
  app.use("/api/users", userRoutes);
  app.use("/api/tasks", taskRoutes);

  // Error handling middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
