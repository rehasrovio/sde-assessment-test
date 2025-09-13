import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { testConnection, closePool } from "./config/database";
import userRoutes from "./routes/userRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;
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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Failed to connect to database");
    }

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log(`📊 Database connected successfully`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
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
