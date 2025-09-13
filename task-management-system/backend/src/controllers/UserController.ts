import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { CreateUserData, UpdateUserData } from "../interfaces/userInterface";
import { logger } from "../configs/logger";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();

      logger.logEvent({
        message: "Users retrieved successfully",
        action: "get_all_users_success",
        context: { count: users.length },
      });

      res.json(users);
    } catch (error) {
      logger.logEvent({
        message: "Error fetching users",
        action: "get_all_users_error",
        error: error as Error,
      });
      res.status(500).json({
        error: "Failed to fetch users",
        details: "Internal server error occurred while retrieving users",
      });
    }
  };

  // GET /api/users/:id
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid user ID provided",
          action: "get_user_by_id_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid user ID",
          details: "User ID must be a valid integer",
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        logger.logEvent({
          message: "User not found",
          action: "get_user_by_id_not_found",
          context: { userId: id },
        });

        res.status(404).json({
          error: "User not found",
          details: `User with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "User retrieved successfully",
        action: "get_user_by_id_success",
        context: { userId: id },
      });

      res.json(user);
    } catch (error) {
      logger.logEvent({
        message: "Error fetching user by ID",
        action: "get_user_by_id_error",
        error: error as Error,
        context: { userId: req.params.id },
      });

      res.status(500).json({
        error: "Failed to fetch user",
        details: "Internal server error occurred while retrieving user",
      });
    }
  };

  // POST /api/users
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, full_name } = req.body;

      // Basic validation (additional validation handled by middleware)
      if (!username || !email || !full_name) {
        logger.logEvent({
          message: "Missing required fields for user creation",
          action: "create_user_validation_error",
          context: {
            providedFields: {
              username: !!username,
              email: !!email,
              full_name: !!full_name,
            },
          },
        });

        res.status(400).json({
          error: "Missing required fields",
          details: "Username, email, and full_name are required",
        });
        return;
      }

      const userData: CreateUserData = { username, email, full_name };
      const user = await this.userService.createUser(userData);

      logger.logEvent({
        message: "User created successfully",
        action: "create_user_success",
        context: {
          userId: user.id,
          username: user.username,
          email: user.email,
        },
      });

      res.status(201).json(user);
    } catch (error: any) {
      logger.logEvent({
        message: "Error creating user",
        action: "create_user_error",
        error: error as Error,
        context: {
          username: req.body.username,
          email: req.body.email,
        },
      });

      if (error.message === "Username already exists") {
        res.status(409).json({
          error: "Username already exists",
          details: "A user with this username already exists",
        });
      } else if (error.message === "Email already exists") {
        res.status(409).json({
          error: "Email already exists",
          details: "A user with this email already exists",
        });
      } else {
        res.status(500).json({
          error: "Failed to create user",
          details: "Internal server error occurred while creating user",
        });
      }
    }
  };

  // PUT /api/users/:id
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid user ID provided for update",
          action: "update_user_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid user ID",
          details: "User ID must be a valid integer",
        });
        return;
      }

      const { username, email, full_name } = req.body;
      const userData: UpdateUserData = { username, email, full_name };

      // Check if at least one field is provided
      if (!username && !email && !full_name) {
        logger.logEvent({
          message: "No fields provided for user update",
          action: "update_user_validation_error",
          context: { userId: id },
        });

        res.status(400).json({
          error: "No fields to update",
          details:
            "At least one field (username, email, full_name) must be provided",
        });
        return;
      }

      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        logger.logEvent({
          message: "User not found for update",
          action: "update_user_not_found",
          context: { userId: id },
        });

        res.status(404).json({
          error: "User not found",
          details: `User with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "User updated successfully",
        action: "update_user_success",
        context: {
          userId: id,
          updatedFields: Object.keys(userData).filter(
            (key) => userData[key as keyof UpdateUserData] !== undefined
          ),
        },
      });

      res.json(user);
    } catch (error: any) {
      logger.logEvent({
        message: "Error updating user",
        action: "update_user_error",
        error: error as Error,
        context: {
          userId: req.params.id,
          updateData: req.body,
        },
      });

      if (error.message === "Username already exists") {
        res.status(409).json({
          error: "Username already exists",
          details: "A user with this username already exists",
        });
      } else if (error.message === "Email already exists") {
        res.status(409).json({
          error: "Email already exists",
          details: "A user with this email already exists",
        });
      } else if (error.message === "No fields to update") {
        res.status(400).json({
          error: "No fields to update",
          details: "At least one field must be provided for update",
        });
      } else {
        res.status(500).json({
          error: "Failed to update user",
          details: "Internal server error occurred while updating user",
        });
      }
    }
  };

  // DELETE /api/users/:id
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        logger.logEvent({
          message: "Invalid user ID provided for deletion",
          action: "delete_user_validation_error",
          context: { id: req.params.id },
        });

        res.status(400).json({
          error: "Invalid user ID",
          details: "User ID must be a valid integer",
        });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        logger.logEvent({
          message: "User not found for deletion",
          action: "delete_user_not_found",
          context: { userId: id },
        });

        res.status(404).json({
          error: "User not found",
          details: `User with ID ${id} does not exist`,
        });
        return;
      }

      logger.logEvent({
        message: "User deleted successfully",
        action: "delete_user_success",
        context: { userId: id },
      });

      res.status(204).send();
    } catch (error) {
      logger.logEvent({
        message: "Error deleting user",
        action: "delete_user_error",
        error: error as Error,
        context: { userId: req.params.id },
      });

      res.status(500).json({
        error: "Failed to delete user",
        details: "Internal server error occurred while deleting user",
      });
    }
  };
}
