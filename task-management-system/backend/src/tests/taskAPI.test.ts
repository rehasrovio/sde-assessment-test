/**
 * Task API Test Suite
 * Tests all task-related endpoints with comprehensive scenarios
 */

import request from 'supertest';
import { logger } from '../configs/logger';
import createApp from '../app';

// Create test app using shared configuration
const app = createApp();

// Initialize logger for tests
logger.initialize('task-api-tests');

describe('Task API Tests', () => {
  let createdTaskId: number;
  let createdUserId: number;

  // Helper function to create a user for testing
  const createTestUser = async () => {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      full_name: 'Test User'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    return response.body;
  };

  // Helper function to create a task for testing
  const createTestTask = async (taskData: any = {}) => {
    const defaultTaskData = {
      title: 'Test Task',
      description: 'Test task description',
      status: 'todo',
      priority: 'medium',
      due_date: '2024-12-31',
      ...taskData
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(defaultTaskData)
      .expect(201);

    return response.body;
  };

  beforeAll(async () => {
    // Create a test user for task assignment
    const user = await createTestUser();
    createdUserId = user.id;
    
    // Create a test task for testing
    const task = await createTestTask();
    createdTaskId = task.id;
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks with pagination metadata', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.tasks)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('count');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.pagination).toHaveProperty('hasMore');
    });

    it('should filter tasks by status', async () => {
      // Create a task with specific status
      await createTestTask({ status: 'in-progress' });

      const response = await request(app)
        .get('/api/tasks?status=in-progress')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(task.status).toBe('in-progress');
      });
    });

    it('should filter tasks by priority', async () => {
      // Create a task with specific priority
      await createTestTask({ priority: 'high' });

      const response = await request(app)
        .get('/api/tasks?priority=high')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(task.priority).toBe('high');
      });
    });

    it('should filter tasks by assigned user', async () => {
      // Create a task assigned to the test user
      await createTestTask({ assigned_to: createdUserId });

      const response = await request(app)
        .get(`/api/tasks?assignedTo=${createdUserId}`)
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(task.assigned_to).toBe(createdUserId);
      });
    });

    it('should filter unassigned tasks', async () => {
      // Create an unassigned task
      await createTestTask({ assigned_to: null });

      const response = await request(app)
        .get('/api/tasks?assignedTo=unassigned')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(task.assigned_to).toBeNull();
      });
    });

    it('should search tasks by title and description', async () => {
      // Create a task with specific title
      await createTestTask({ title: 'Search Test Task', description: 'This is a searchable description' });

      const response = await request(app)
        .get('/api/tasks?search=Search Test')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(
          task.title.toLowerCase().includes('search test') ||
          task.description.toLowerCase().includes('search test')
        ).toBe(true);
      });
    });

    it('should sort tasks by created_at in descending order', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=created_at&sortOrder=desc')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      if (response.body.tasks.length > 1) {
        const firstTask = new Date(response.body.tasks[0].created_at);
        const secondTask = new Date(response.body.tasks[1].created_at);
        expect(firstTask.getTime()).toBeGreaterThanOrEqual(secondTask.getTime());
      }
    });

    it('should sort tasks by title in ascending order', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=title&sortOrder=asc')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      if (response.body.tasks.length > 1) {
        expect(response.body.tasks[0].title.localeCompare(response.body.tasks[1].title)).toBeLessThanOrEqual(0);
      }
    });

    it('should sort tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=priority&sortOrder=asc')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      // Priority order: high, low, medium (alphabetical)
      const priorities = response.body.tasks.map((task: any) => task.priority);
      const sortedPriorities = [...priorities].sort();
      expect(priorities).toEqual(sortedPriorities);
    });

    it('should paginate results with limit and offset', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=2&offset=0')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      expect(response.body.tasks.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=101')
        .expect(400);

      expect(response.body.error).toBe('Invalid limit parameter');
      expect(response.body.details).toBe('limit must be between 1 and 100');
    });

    it('should return 400 for invalid offset parameter', async () => {
      const response = await request(app)
        .get('/api/tasks?offset=-1')
        .expect(400);

      expect(response.body.error).toBe('Invalid offset parameter');
      expect(response.body.details).toBe('offset must be 0 or greater');
    });

    it('should return 400 for invalid assignedTo parameter', async () => {
      const response = await request(app)
        .get('/api/tasks?assignedTo=invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid assignedTo parameter');
      expect(response.body.details).toBe('assignedTo must be a valid user ID or \'unassigned\'');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'New Test Task',
        description: 'This is a new test task',
        status: 'todo',
        priority: 'high',
        due_date: '2024-12-31',
        assigned_to: createdUserId
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.due_date).toBe(taskData.due_date);
      expect(response.body.assigned_to).toBe(taskData.assigned_to);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('should create a task with minimal required data', async () => {
      const taskData = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.status).toBe('todo'); // Default value
      expect(response.body.priority).toBe('medium'); // Default value
      expect(response.body.assigned_to).toBeNull(); // Default value
    });

    it('should return 400 for missing required title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Task without title',
          status: 'todo'
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.details).toBe('Title is required');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: '',
          description: 'Task with empty title'
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.details).toBe('Title is required');
    });

    it('should return 400 for title too long', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'a'.repeat(201), // 201 characters
          description: 'Task with title too long'
        })
        .expect(400);

      expect(response.body.error).toBe('Title too long');
      expect(response.body.details).toBe('Title must be 200 characters or less');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid status');
      expect(response.body.details).toBe('Status must be one of: todo, in-progress, done');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          priority: 'invalid-priority'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid priority');
      expect(response.body.details).toBe('Priority must be one of: low, medium, high');
    });

    it('should return 400 for invalid due_date format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          due_date: 'invalid-date'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid due_date format');
      expect(response.body.details).toBe('Due date must be in YYYY-MM-DD format');
    });

    it('should return 400 for invalid due_date value', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          due_date: '2024-13-45' // Invalid date
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid due_date');
      expect(response.body.details).toBe('Due date must be a valid date');
    });

    it('should return 400 for invalid assigned_to', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          assigned_to: 'invalid-user-id'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid assigned_to');
      expect(response.body.details).toBe('Assigned user ID must be a positive integer or null');
    });

    it('should return 400 for non-existent assigned user', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          assigned_to: 99999 // Non-existent user ID
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid assigned user');
      expect(response.body.details).toBe('The assigned user does not exist');
    });

    it('should trim whitespace from title and description', async () => {
      const taskData = {
        title: '  Whitespace Task  ',
        description: '  This has whitespace  '
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe('Whitespace Task');
      expect(response.body.description).toBe('This has whitespace');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by valid ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdTaskId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('priority');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
      expect(response.body.details).toBe('Task ID must be a positive integer');
    });

    it('should return 404 for non-existent task ID', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
      expect(response.body.details).toBe('Task with ID 99999 does not exist');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task with valid data', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'in-progress',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      expect(response.body.priority).toBe(updateData.priority);
      expect(response.body.id).toBe(createdTaskId);
    });

    it('should update only provided fields', async () => {
      const originalTask = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .expect(200);

      const updateData = {
        description: 'Updated description only'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
      expect(response.body.title).toBe(originalTask.body.title); // Should remain unchanged
      expect(response.body.status).toBe(originalTask.body.status); // Should remain unchanged
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .put('/api/tasks/invalid')
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
      expect(response.body.details).toBe('Task ID must be a positive integer');
    });

    it('should return 400 for no fields to update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No fields to update');
      expect(response.body.details).toBe('At least one field must be provided for update');
    });

    it('should return 404 for non-existent task ID', async () => {
      const response = await request(app)
        .put('/api/tasks/99999')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
      expect(response.body.details).toBe('Task with ID 99999 does not exist');
    });

    it('should return 400 for invalid status during update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.error).toBe('Invalid status');
      expect(response.body.details).toBe('Status must be one of: todo, in-progress, done');
    });

    it('should return 400 for invalid priority during update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ priority: 'invalid-priority' })
        .expect(400);

      expect(response.body.error).toBe('Invalid priority');
      expect(response.body.details).toBe('Priority must be one of: low, medium, high');
    });

    it('should return 400 for invalid due_date format during update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ due_date: 'invalid-date' })
        .expect(400);

      expect(response.body.error).toBe('Invalid due_date format');
      expect(response.body.details).toBe('Due date must be in YYYY-MM-DD format');
    });

    it('should return 400 for non-existent assigned user during update', async () => {
      const response = await request(app)
        .put(`/api/tasks/${createdTaskId}`)
        .send({ assigned_to: 99999 })
        .expect(400);

      expect(response.body.error).toBe('Invalid assigned user');
      expect(response.body.details).toBe('The assigned user does not exist');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task with valid ID', async () => {
      // Create a task to delete
      const taskToDelete = await createTestTask({ title: 'Task to Delete' });

      const response = await request(app)
        .delete(`/api/tasks/${taskToDelete.id}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
      expect(response.body.details).toBe('Task ID must be a positive integer');
    });

    it('should return 404 for non-existent task ID', async () => {
      const response = await request(app)
        .delete('/api/tasks/99999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
      expect(response.body.details).toBe('Task with ID 99999 does not exist');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body for POST', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.details).toBe('Title is required');
    });

    it('should handle null values in POST', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: null,
          description: null,
          status: null
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.details).toBe('Title is required');
    });

    it('should handle very long description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'a'.repeat(1001) // 1001 characters
        })
        .expect(400);

      expect(response.body.error).toBe('Description too long');
      expect(response.body.details).toBe('Description must be 1000 characters or less');
    });

    it('should handle description with maximum allowed length', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'a'.repeat(1000) // 1000 characters (max allowed)
        })
        .expect(201);

      expect(response.body.description).toBe('a'.repeat(1000));
    });

    it('should handle title with maximum allowed length', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'a'.repeat(200) // 200 characters (max allowed)
        })
        .expect(201);

      expect(response.body.title).toBe('a'.repeat(200));
    });

    it('should handle all valid status values', async () => {
      const statuses = ['todo', 'in-progress', 'done'];
      
      for (const status of statuses) {
        const response = await request(app)
          .post('/api/tasks')
          .send({
            title: `Task with status ${status}`,
            status: status
          })
          .expect(201);

        expect(response.body.status).toBe(status);
      }
    });

    it('should handle all valid priority values', async () => {
      const priorities = ['low', 'medium', 'high'];
      
      for (const priority of priorities) {
        const response = await request(app)
          .post('/api/tasks')
          .send({
            title: `Task with priority ${priority}`,
            priority: priority
          })
          .expect(201);

        expect(response.body.priority).toBe(priority);
      }
    });

    it('should handle future due dates', async () => {
      const futureDate = '2025-12-31';
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Future Task',
          due_date: futureDate
        })
        .expect(201);

      expect(response.body.due_date).toBe(futureDate);
    });

    it('should handle past due dates', async () => {
      const pastDate = '2020-01-01';
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Past Task',
          due_date: pastDate
        })
        .expect(201);

      expect(response.body.due_date).toBe(pastDate);
    });

    it('should handle unassigned tasks (assigned_to = null)', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Unassigned Task',
          assigned_to: null
        })
        .expect(201);

      expect(response.body.assigned_to).toBeNull();
    });

    it('should handle tasks assigned to valid user', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Assigned Task',
          assigned_to: createdUserId
        })
        .expect(201);

      expect(response.body.assigned_to).toBe(createdUserId);
    });
  });

  describe('Complex Filtering and Sorting', () => {
    it('should combine multiple filters', async () => {
      // Create tasks with different combinations
      await createTestTask({ status: 'todo', priority: 'high', assigned_to: createdUserId });
      await createTestTask({ status: 'in-progress', priority: 'high', assigned_to: null });

      const response = await request(app)
        .get(`/api/tasks?status=todo&priority=high&assignedTo=${createdUserId}`)
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      response.body.tasks.forEach((task: any) => {
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('high');
        expect(task.assigned_to).toBe(createdUserId);
      });
    });

    it('should handle case-insensitive search', async () => {
      await createTestTask({ title: 'CASE SENSITIVE TASK', description: 'This is a test' });

      const response = await request(app)
        .get('/api/tasks?search=case sensitive')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      expect(response.body.tasks.length).toBeGreaterThan(0);
    });

    it('should handle empty search string', async () => {
      const response = await request(app)
        .get('/api/tasks?search=')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      // Should return all tasks when search is empty
    });

    it('should handle invalid sort field gracefully', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=invalid_field')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      // Should default to created_at sorting
    });

    it('should handle invalid sort order gracefully', async () => {
      const response = await request(app)
        .get('/api/tasks?sortBy=title&sortOrder=invalid')
        .expect(200);

      expect(response.body.tasks).toBeDefined();
      // Should default to desc order
    });
  });
});
