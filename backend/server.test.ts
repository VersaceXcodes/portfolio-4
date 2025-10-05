import request from 'supertest';
import { app, pool } from './server.ts'; // Import your app and database

// Mocking the database pool
jest.mock('./server.ts', () => {
  const originalModule = jest.requireActual('./server.ts');
  return {
    ...originalModule,
    pool: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockReturnValue({
          query: jest.fn(),
          release: jest.fn(),
        }),
      };
    }),
  };
});

describe('Portfolio-4 API tests', () => {
  beforeAll(async () => {
    // Setup and initialize database mock or state
    await pool.connect().query(`TRUNCATE TABLE users, projects, testimonials, services, blog_posts, contact_requests RESTART IDENTITY;`);
  });

  afterAll(async () => {
    // Gracefully shutdown server and database connection
    await pool.connect().query(`TRUNCATE TABLE users, projects, testimonials, services, blog_posts, contact_requests RESTART IDENTITY;`);
    await pool.end();
  });

  describe('User Authentication Tests', () => {
    test('User registration should succeed', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new_user@example.com',
          name: 'New User',
          password_hash: 'password123',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user_id');
    });

    test('User login should succeed and return a token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('Accessing protected route without token should fail', async () => {
      const response = await request(app)
        .get('/users/user_1');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Project Management Tests', () => {
    test('Create a new project should succeed', async () => {
      const response = await request(app)
        .post('/portfolio')
        .set('Authorization', `Bearer token_abc123`)
        .send({
          title: 'New Project',
          description: 'A test project',
          media_urls: 'https://example.com/image.png',
          category: 'Testing',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('project_id');
    });

    test('Get projects should return a list', async () => {
      const response = await request(app)
        .get('/portfolio')
        .set('Authorization', `Bearer token_abc123`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    test('Update a project should succeed', async () => {
      const response = await request(app)
        .patch('/portfolio/project_1')
        .set('Authorization', `Bearer token_abc123`)
        .send({
          title: 'Updated Project',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Project');
    });

    test('Delete a project should succeed', async () => {
      const response = await request(app)
        .delete('/portfolio/project_1')
        .set('Authorization', `Bearer token_abc123`);

      expect(response.statusCode).toBe(204);
    });
  });

  describe('Contact Submission Tests', () => {
    test('Submit a contact request should succeed', async () => {
      const response = await request(app)
        .post('/contact')
        .send({
          name: 'Contact User',
          email: 'contact.user@example.com',
          message: 'I am interested in your work.',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('request_id');
    });
  });

  // Additional tests for Testimonials, Services, and Blog Posts can be similarly structured.
});