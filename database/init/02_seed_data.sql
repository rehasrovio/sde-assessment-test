-- Seed data for Task Management System
-- This file populates the database with sample data for testing

-- Insert sample users
INSERT INTO users (username, email, full_name) VALUES
('john_doe', 'john.doe@example.com', 'John Doe'),
('jane_smith', 'jane.smith@example.com', 'Jane Smith'),
('bob_wilson', 'bob.wilson@example.com', 'Bob Wilson'),
('alice_brown', 'alice.brown@example.com', 'Alice Brown'),
('charlie_davis', 'charlie.davis@example.com', 'Charlie Davis')
ON CONFLICT (username) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, assigned_to) VALUES
('Setup development environment', 'Install Node.js, PostgreSQL, and set up the project structure', 'done', 'high', '2024-01-15', 1),
('Design database schema', 'Create tables for users and tasks with proper relationships', 'done', 'high', '2024-01-16', 1),
('Implement user authentication', 'Add login/logout functionality with JWT tokens', 'in-progress', 'medium', '2024-01-20', 2),
('Create task CRUD operations', 'Implement create, read, update, delete operations for tasks', 'todo', 'high', '2024-01-22', 1),
('Add task filtering and search', 'Implement filters by status, priority, and search by title/description', 'todo', 'medium', '2024-01-25', 3),
('Write unit tests', 'Create comprehensive test suite for all API endpoints', 'todo', 'medium', '2024-01-28', 2),
('Optimize database queries', 'Add proper indexes and optimize slow queries', 'todo', 'low', '2024-02-01', 4),
('Implement task assignment', 'Allow assigning tasks to users and viewing assigned tasks', 'todo', 'medium', '2024-01-30', 3),
('Add input validation', 'Validate all user inputs and handle edge cases', 'todo', 'high', '2024-01-24', 1),
('Create API documentation', 'Document all endpoints with examples and response formats', 'todo', 'low', '2024-02-05', 5),
('Setup CI/CD pipeline', 'Configure automated testing and deployment', 'todo', 'low', '2024-02-10', 4),
('Performance testing', 'Test application with large datasets and optimize bottlenecks', 'todo', 'low', '2024-02-15', 5),
('Code review and refactoring', 'Review code quality and refactor as needed', 'todo', 'medium', '2024-02-12', 2),
('Security audit', 'Review and implement security best practices', 'todo', 'high', '2024-02-08', 1),
('User interface improvements', 'Enhance UI/UX based on user feedback', 'todo', 'low', '2024-02-20', 3),
('Database backup strategy', 'Implement automated database backups', 'todo', 'medium', '2024-02-18', 4),
('Monitoring and logging', 'Add application monitoring and comprehensive logging', 'todo', 'medium', '2024-02-22', 5),
('Mobile app development', 'Create mobile version of the task management app', 'todo', 'low', '2024-03-01', 2),
('Integration testing', 'Test integration between frontend and backend', 'todo', 'medium', '2024-02-25', 3),
('Deployment to production', 'Deploy application to production environment', 'todo', 'high', '2024-02-28', 1)
ON CONFLICT DO NOTHING;

-- Insert some tasks without assignment (to test unassigned tasks)
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
('Research new technologies', 'Investigate latest trends in web development', 'todo', 'low', '2024-03-05'),
('Plan team building event', 'Organize quarterly team building activities', 'todo', 'medium', '2024-03-10'),
('Review company policies', 'Update and review existing company policies', 'todo', 'high', '2024-03-15')
ON CONFLICT DO NOTHING;
