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

  // Helper method to handle database errors
  private handleDatabaseError = (error: any, operation: string, context?: any): Error => {
    logger.logEvent({
      message: `Database error during ${operation}`,
      action: 'database_error',
      error: error,
      context: context
    });

    // Handle specific PostgreSQL errors
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint === 'users_username_key') {
        return new Error('Username already exists');
      } else if (error.constraint === 'users_email_key') {
        return new Error('Email already exists');
      }
    } else if (error.code === '23503') { // Foreign key constraint violation
      return new Error('Referenced user does not exist');
    } else if (error.code === '23502') { // Not null constraint violation
      return new Error('Required field is missing');
    } else if (error.code === '22P02') { // Invalid input syntax
      return new Error('Invalid data format');
    }

    // Generic database error
    return new Error('Database operation failed');
  };

  // Get all users
  public getAllUsers = async (): Promise<User[]> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query(
        "SELECT * FROM users ORDER BY created_at DESC"
      );

      logger.logEvent({
        message: "Retrieved all users successfully",
        action: "get_all_users",
        context: { 
          count: result.rows.length,
          duration: Date.now() - startTime
        },
      });

      return result.rows;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'getAllUsers', {
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Get user by ID
  public getUserById = async (id: number): Promise<User | null> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
      
      const user = result.rows[0] as User | null;
      
      logger.logEvent({
        message: user ? "User retrieved successfully" : "User not found",
        action: "get_user_by_id",
        context: { 
          userId: id,
          found: !!user,
          duration: Date.now() - startTime
        },
      });

      return user;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'getUserById', {
        userId: id,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Get user by username
  public getUserByUsername = async (username: string): Promise<User | null> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query("SELECT * FROM users WHERE username = $1", [username]);
      
      const user = result.rows[0] as User | null;
      
      logger.logEvent({
        message: user ? "User retrieved by username successfully" : "User not found by username",
        action: "get_user_by_username",
        context: { 
          username,
          found: !!user,
          duration: Date.now() - startTime
        },
      });

      return user;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'getUserByUsername', {
        username,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Get user by email
  public getUserByEmail = async (email: string): Promise<User | null> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query("SELECT * FROM users WHERE email = $1", [email]);
      
      const user = result.rows[0] as User | null;
      
      logger.logEvent({
        message: user ? "User retrieved by email successfully" : "User not found by email",
        action: "get_user_by_email",
        context: { 
          email,
          found: !!user,
          duration: Date.now() - startTime
        },
      });

      return user;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'getUserByEmail', {
        email,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Create new user
  public createUser = async (userData: CreateUserData): Promise<User> => {
    const startTime = Date.now();
    try {
      const { username, email, full_name } = userData;

      // Check if username already exists
      const existingUserByUsername = await this.getUserByUsername(username);
      if (existingUserByUsername) {
        logger.logEvent({
          message: "Username already exists",
          action: "create_user_validation_error",
          context: { username }
        });
        throw new Error('Username already exists');
      }

      // Check if email already exists
      const existingUserByEmail = await this.getUserByEmail(email);
      if (existingUserByEmail) {
        logger.logEvent({
          message: "Email already exists",
          action: "create_user_validation_error",
          context: { email }
        });
        throw new Error('Email already exists');
      }

      const result = await this.db.query(
        "INSERT INTO users (username, email, full_name) VALUES ($1, $2, $3) RETURNING *",
        [username, email, full_name]
      );

      const newUser = result.rows[0] as User;

      logger.logEvent({
        message: "User created successfully",
        action: "create_user",
        context: {
          userId: newUser.id,
          username: newUser.username,
          email: newUser.email,
          duration: Date.now() - startTime
        },
      });

      return newUser;
    } catch (error: any) {
      if (error.message === 'Username already exists' || error.message === 'Email already exists') {
        throw error; // Re-throw validation errors as-is
      }
      
      const processedError = this.handleDatabaseError(error, 'createUser', {
        userData,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Update user
  public updateUser = async (id: number, userData: UpdateUserData): Promise<User | null> => {
    const startTime = Date.now();
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        logger.logEvent({
          message: "User not found for update",
          action: "update_user_not_found",
          context: { userId: id }
        });
        return null;
      }

      // Check for username conflicts if username is being updated
      if (userData.username && userData.username !== existingUser.username) {
        const existingUserByUsername = await this.getUserByUsername(userData.username);
        if (existingUserByUsername) {
          logger.logEvent({
            message: "Username already exists during update",
            action: "update_user_validation_error",
            context: { userId: id, username: userData.username }
          });
          throw new Error('Username already exists');
        }
      }

      // Check for email conflicts if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        const existingUserByEmail = await this.getUserByEmail(userData.email);
        if (existingUserByEmail) {
          logger.logEvent({
            message: "Email already exists during update",
            action: "update_user_validation_error",
            context: { userId: id, email: userData.email }
          });
          throw new Error('Email already exists');
        }
      }

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
        logger.logEvent({
          message: "No fields to update",
          action: "update_user_no_fields",
          context: { userId: id }
        });
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

      const result = await this.db.query(query, values);
      const updatedUser = result.rows[0] as User;

      logger.logEvent({
        message: "User updated successfully",
        action: "update_user",
        context: {
          userId: id,
          updatedFields: Object.keys(userData),
          duration: Date.now() - startTime
        },
      });

      return updatedUser;
    } catch (error: any) {
      if (error.message === 'Username already exists' || error.message === 'Email already exists' || error.message === 'No fields to update') {
        throw error; // Re-throw validation errors as-is
      }
      
      const processedError = this.handleDatabaseError(error, 'updateUser', {
        userId: id,
        userData,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Delete user
  public deleteUser = async (id: number): Promise<boolean> => {
    const startTime = Date.now();
    try {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        logger.logEvent({
          message: "User not found for deletion",
          action: "delete_user_not_found",
          context: { userId: id }
        });
        return false;
      }

      // Check if user has assigned tasks
      const tasksResult = await this.db.query(
        "SELECT COUNT(*) as task_count FROM tasks WHERE assigned_to = $1",
        [id]
      );
      const taskCount = parseInt(tasksResult.rows[0].task_count);

      if (taskCount > 0) {
        logger.logEvent({
          message: "User has assigned tasks, setting assigned_to to NULL",
          action: "delete_user_with_tasks",
          context: { userId: id, taskCount }
        });

        // Set assigned_to to NULL for all tasks assigned to this user
        await this.db.query(
          "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1",
          [id]
        );
      }

      const result = await this.db.query("DELETE FROM users WHERE id = $1", [id]);
      const deleted = result.rowCount !== null && result.rowCount > 0;

      logger.logEvent({
        message: deleted ? "User deleted successfully" : "User deletion failed",
        action: "delete_user",
        context: {
          userId: id,
          deleted,
          taskCount,
          duration: Date.now() - startTime
        },
      });

      return deleted;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'deleteUser', {
        userId: id,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Check if user exists
  public userExists = async (id: number): Promise<boolean> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query(
        "SELECT 1 FROM users WHERE id = $1 LIMIT 1",
        [id]
      );
      
      const exists = result.rows.length > 0;
      
      logger.logEvent({
        message: exists ? "User exists" : "User does not exist",
        action: "check_user_exists",
        context: {
          userId: id,
          exists,
          duration: Date.now() - startTime
        },
      });

      return exists;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'userExists', {
        userId: id,
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };

  // Get users count
  public getUsersCount = async (): Promise<number> => {
    const startTime = Date.now();
    try {
      const result = await this.db.query("SELECT COUNT(*) FROM users");
      const count = parseInt(result.rows[0].count);
      
      logger.logEvent({
        message: "Users count retrieved successfully",
        action: "get_users_count",
        context: {
          count,
          duration: Date.now() - startTime
        },
      });

      return count;
    } catch (error) {
      const processedError = this.handleDatabaseError(error, 'getUsersCount', {
        duration: Date.now() - startTime
      });
      throw processedError;
    }
  };
}