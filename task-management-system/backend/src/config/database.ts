import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Simple database connection pool
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    console.log("verifying env variables", process.env.DB_USER);
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
      console.error("Database pool error:", err);
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
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

// Close the connection pool
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
