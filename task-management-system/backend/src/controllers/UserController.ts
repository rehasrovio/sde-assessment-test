import { Request, Response } from 'express';
import { UserService, CreateUserData, UpdateUserData } from '../services/UserService';
import { logger } from '../config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      logger.logEvent({
        message: 'Error fetching users',
        action: 'get_all_users_error',
        error: error as Error
      });
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  // GET /api/users/:id
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  // POST /api/users
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, full_name } = req.body;

      // Basic validation
      if (!username || !email || !full_name) {
        res.status(400).json({ error: 'Username, email, and full_name are required' });
        return;
      }

      const userData: CreateUserData = { username, email, full_name };
      const user = await this.userService.createUser(userData);
      
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  };

  // PUT /api/users/:id
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const { username, email, full_name } = req.body;
      const userData: UpdateUserData = { username, email, full_name };
      
      const user = await this.userService.updateUser(id, userData);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update user' });
      }
    }
  };

  // DELETE /api/users/:id
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const deleted = await this.userService.deleteUser(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
}
