/**
 * Task Routes
 * Defines all task-related API endpoints
 */

import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "../middlewares/taskValidation";

const router = Router();
const taskController = new TaskController();

// GET /api/tasks - Get all tasks with filtering, sorting, and pagination
router.get("/", taskController.getAllTasks);

// GET /api/tasks/:id - Get a specific task by ID
router.get("/:id", validateTaskId, taskController.getTaskById);

// POST /api/tasks - Create a new task
router.post("/", validateCreateTask, taskController.createTask);

// PUT /api/tasks/:id - Update a task
router.put(
  "/:id",
  validateTaskId,
  validateUpdateTask,
  taskController.updateTask
);

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", validateTaskId, taskController.deleteTask);

export default router;
