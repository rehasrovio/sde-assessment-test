import { getPool } from "../config/database";
import { logger } from "../config/logger";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
}

export class UserService {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const startTime = Date.now();
    try {
      const pool = getPool();
      const result = await pool.query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      logger.logEvent({
        message: "Retrieved all users",
        action: "get_all_users",
        context: { count: result.rows.length, duration: Date.now() - startTime }
      });
      return result.rows;
    } catch (error) {
      logger.logEvent({
        message: "Failed to retrieve all users",
        action: "get_all_users",
        error: error as Error,
        context: { duration: Date.now() - startTime }
      });
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const startTime = Date.now();
    try {
      const pool = getPool();
      const { username, email, full_name } = userData;

      const result = await pool.query(
        "INSERT INTO users (username, email, full_name) VALUES ($1, $2, $3) RETURNING *",
        [username, email, full_name]
      );

      logger.logEvent({
        message: "User created successfully",
        action: "create_user",
        context: { 
          userId: result.rows[0].id, 
          username, 
          duration: Date.now() - startTime 
        }
      });

      return result.rows[0];
    } catch (error) {
      logger.logEvent({
        message: "Failed to create user",
        action: "create_user",
        error: error as Error,
        context: { 
          username: userData.username, 
          duration: Date.now() - startTime 
        }
      });
      throw error;
    }
  }

  // Update user
  async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    const pool = getPool();
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic query
    if (userData.username !== undefined) {
      fields.push(`username = $${paramCount}`);
      values.push(userData.username);
      paramCount++;
    }
    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(userData.email);
      paramCount++;
    }
    if (userData.full_name !== undefined) {
      fields.push(`full_name = $${paramCount}`);
      values.push(userData.full_name);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Check if user exists
  async userExists(id: number): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      "SELECT 1 FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return result.rows.length > 0;
  }
}
