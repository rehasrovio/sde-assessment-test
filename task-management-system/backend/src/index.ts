import dotenv from "dotenv";
import { testConnection, closePool } from "./configs/database";
import { logger } from "./configs/logger";
import createApp from "./app";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;
const app = createApp();

// Start server
const startServer = async () => {
  try {
    // Initialize logger
    logger.initialize("task-management-system");

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to database");
    }

    app.listen(port, () => {
      logger.logEvent({
        message: "Server started successfully",
        action: "server_start",
        context: {
          port,
          environment: process.env.NODE_ENV || "development",
          database: "connected",
        },
      });
    });
  } catch (error) {
    logger.logGenericErrorEvent({
      message: "Failed to start server",
      error: error as Error,
    });
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT. Starting graceful shutdown...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM. Starting graceful shutdown...");
  await closePool();
  process.exit(0);
});
