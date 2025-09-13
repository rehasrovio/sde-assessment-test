import { Pool } from "pg";
import { getPool } from "../configs/database";
import { logger } from "../configs/logger";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../interfaces/userInterface";

export class UserService {
  private db: Pool;

  constructor() {
    this.db = getPool();
  }

  // Get all users
  public getAllUsers = async (): Promise<User[]> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );
      logger.logEvent({
        message: "Retrieved all users",
        action: "get_all_users",
        context: {
          count: result.rows.length,
          duration: Date.now() - startTime,
        },
      });
      return result.rows;
    } catch (error) {
      logger.logEvent({
        message: "Failed to retrieve all users",
        action: "get_all_users",
        error: error as Error,
        context: { duration: Date.now() - startTime },
      });
      throw error;
    }
  };

  // Get user by ID
  public getUserById = async (id: number): Promise<User | null> => {
    const result = await this.db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0] as User | null;
  };

  // Get user by username
  public getUserByUsername = async (username: string): Promise<User | null> => {
    const result = await this.db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] as User | null;
  };

  // Get user by email
  public getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await this.db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] as User | null;
  };

  // Create new user
  public createUser = async (userData: CreateUserData): Promise<User> => {
    const startTime = Date.now();
    try {
      const { username, email, full_name } = userData;

      const result = await this.db.query(
        "INSERT INTO users (username, email, full_name) VALUES ($1, $2, $3) RETURNING *",
        [username, email, full_name]
      );

      logger.logEvent({
        message: "User created successfully",
        action: "create_user",
        context: {
          userId: result.rows[0].id,
          username,
          duration: Date.now() - startTime,
        },
      });

      return result.rows[0];
    } catch (error) {
      logger.logEvent({
        message: "Failed to create user",
        action: "create_user",
        error: error as Error,
        context: {
          username: userData.username,
          duration: Date.now() - startTime,
        },
      });
      throw error;
    }
  };

  // Update user
  public updateUser = async (
    id: number,
    userData: UpdateUserData
  ): Promise<User | null> => {
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

    const result = await this.db.query(query, values);
    return result.rows[0] as User | null;
  };

  // Delete user
  public deleteUser = async (id: number): Promise<boolean> => {
    const result = await this.db.query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  };

  // Check if user exists
  public userExists = async (id: number): Promise<boolean> => {
    const result = await this.db.query(
      "SELECT 1 FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return result.rows.length > 0;
  };
}
