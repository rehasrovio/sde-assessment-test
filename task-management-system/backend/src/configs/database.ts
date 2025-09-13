import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "./logger";

// Load environment variables
dotenv.config();

// Simple database connection pool
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5433"),
      database: process.env.DB_NAME || "task_management",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on("error", (err: Error) => {
      logger.logGenericErrorEvent({
        message: "Database pool error",
        error: err
      });
    });

    pool.on("connect", () => {
      logger.logEvent({
        message: "New database client connected",
        action: "database_connect"
      });
    });

    pool.on("remove", () => {
      logger.logEvent({
        message: "Database client removed from pool",
        action: "database_disconnect"
      });
    });
  }
  return pool;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.logEvent({
      message: "Database connection test successful",
      action: "database_test"
    });
    return true;
  } catch (error) {
    logger.logGenericErrorEvent({
      message: "Database connection failed",
      error: error as Error
    });
    return false;
  }
};

// Close the connection pool
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.logEvent({
      message: "Database connection pool closed",
      action: "database_close"
    });
  }
};
