/**
 * User API Test Suite
 * Tests all user-related endpoints with comprehensive scenarios
 */

import request from 'supertest';
import express from 'express';
import { logger } from '../configs/logger';
import userRoutes from '../routes/userRoutes';
import { errorHandler, notFoundHandler } from '../middlewares/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize logger for tests
logger.initialize('user-api-tests');

describe('User API Tests', () => {
  let createdUserId: number;

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser123',
        email: 'testuser123@example.com',
        full_name: 'Test User 123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.full_name).toBe(userData.full_name);
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('updated_at');

      createdUserId = response.body.id;
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          // missing email and full_name
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser2',
          email: 'invalid-email',
          full_name: 'Test User 2'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    it('should return 400 for username too long', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'a'.repeat(51), // 51 characters
          email: 'test@example.com',
          full_name: 'Test User'
        })
        .expect(400);

      expect(response.body.error).toBe('Username too long');
    });

    it('should return 409 for duplicate username', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser123', // Same as created user
          email: 'different@example.com',
          full_name: 'Different User'
        })
        .expect(409);

      expect(response.body.error).toBe('Username already exists');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'differentuser',
          email: 'testuser123@example.com', // Same as created user
          full_name: 'Different User'
        })
        .expect(409);

      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by valid ID', async () => {
      const response = await request(app)
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('full_name');
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with valid data', async () => {
      const updateData = {
        full_name: 'Updated Test User 123'
      };

      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.full_name).toBe(updateData.full_name);
      expect(response.body.id).toBe(createdUserId);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .put('/api/users/invalid')
        .send({ full_name: 'Updated Name' })
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });

    it('should return 400 for no fields to update', async () => {
      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No fields to update');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .put('/api/users/99999')
        .send({ full_name: 'Updated Name' })
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 409 for duplicate username', async () => {
      // First create another user
      await request(app)
        .post('/api/users')
        .send({
          username: 'anotheruser',
          email: 'another@example.com',
          full_name: 'Another User'
        });

      // Try to update first user with duplicate username
      const response = await request(app)
        .put(`/api/users/${createdUserId}`)
        .send({ username: 'anotheruser' })
        .expect(409);

      expect(response.body.error).toBe('Username already exists');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .delete('/api/users/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid user ID');
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should handle null values', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: null,
          email: null,
          full_name: null
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should handle very long strings', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'a'.repeat(51),
          email: 'a'.repeat(101) + '@example.com',
          full_name: 'a'.repeat(101)
        })
        .expect(400);

      expect(response.body.error).toBe('Username too long');
    });

    it('should trim whitespace from input', async () => {
      const userData = {
        username: '  whitespaceuser  ',
        email: '  whitespace@example.com  ',
        full_name: '  Whitespace User  '
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.username).toBe('whitespaceuser');
      expect(response.body.email).toBe('whitespace@example.com');
      expect(response.body.full_name).toBe('Whitespace User');

      // Clean up
      await request(app)
        .delete(`/api/users/${response.body.id}`)
        .expect(204);
    });
  });
});
