import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Import Zod schemas
import {
  userSchema,
  createUserInputSchema,
  updateUserInputSchema,
  searchUserInputSchema,
  projectSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
  searchProjectInputSchema,
  testimonialSchema,
  createTestimonialInputSchema,
  updateTestimonialInputSchema,
  searchTestimonialInputSchema,
  serviceSchema,
  createServiceInputSchema,
  updateServiceInputSchema,
  searchServiceInputSchema,
  blogPostSchema,
  createBlogPostInputSchema,
  updateBlogPostInputSchema,
  searchBlogPostInputSchema,
  contactRequestSchema,
  createContactRequestInputSchema
} from './schema.js';

dotenv.config();

// Error response utility
function createErrorResponse(message: string, error: any = null, errorCode: string | null = null) {
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    response.error_code = errorCode;
  }

  if (error) {
    response.details = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return response;
}

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { rejectUnauthorized: false } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { rejectUnauthorized: false },
      }
);

const app = express();
const PORT = process.env.PORT || 3000;

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(morgan('combined'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/*
  Authentication middleware for protected routes
  Validates JWT token and attaches user data to request
*/
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_MISSING'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; email: string };
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
      
      if (result.rows.length === 0) {
        return res.status(401).json(createErrorResponse('Invalid token - user not found', null, 'AUTH_USER_NOT_FOUND'));
      }

      req.user = result.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

/*
  User Registration Endpoint
  Creates a new user account with email, name, and password
  Returns user data and JWT token for immediate authentication
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    // Validate input using Zod schema
    const validatedInput = createUserInputSchema.parse(req.body);
    const { email, name, password_hash } = validatedInput;

    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
      }

      // Create new user with generated ID and timestamp
      const user_id = uuidv4();
      const created_at = new Date().toISOString();
      
      const result = await client.query(
        'INSERT INTO users (user_id, email, name, created_at, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, name, created_at',
        [user_id, email.toLowerCase().trim(), name.trim(), created_at, password_hash]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        },
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  User Login Endpoint
  Authenticates user with email and password
  Returns user data and JWT token on successful authentication
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_REQUIRED_FIELDS'));
    }

    const client = await pool.connect();
    
    try {
      // Find user by email and verify password (direct comparison for development)
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (result.rows.length === 0) {
        return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
      }

      const user = result.rows[0];

      // Direct password comparison for development
      if (password !== user.password_hash) {
        return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          created_at: user.created_at
        },
        token
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get User Profile Endpoint
  Retrieves user profile information by user_id
  Requires authentication
*/
app.get('/api/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [user_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
      }

      const user = result.rows[0];
      res.json({
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Portfolio Projects Endpoint
  Retrieves list of projects with filtering, sorting, and pagination
  Supports query search, sorting by title/created_at, and pagination
*/
app.get('/api/portfolio', async (req, res) => {
  try {
    const queryParams = searchProjectInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = queryParams;

    const client = await pool.connect();
    
    try {
      let sql = 'SELECT project_id, title, description, media_urls, created_at, category FROM projects';
      let params = [];
      let paramCount = 0;

      // Add search functionality
      if (query) {
        paramCount++;
        sql += ` WHERE (title ILIKE $${paramCount} OR description ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
        params.push(`%${query}%`);
      }

      // Add sorting
      sql += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;

      // Add pagination
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await client.query(sql, params);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid query parameters', error, 'VALIDATION_ERROR'));
    }
    console.error('Get portfolio error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Create New Project Endpoint
  Creates a new portfolio project with title, description, media URLs, and category
  Requires authentication
*/
app.post('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const validatedInput = createProjectInputSchema.parse(req.body);
    const { title, description, media_urls, category } = validatedInput;

    const client = await pool.connect();
    
    try {
      const project_id = uuidv4();
      const created_at = new Date().toISOString();

      const result = await client.query(
        'INSERT INTO projects (project_id, title, description, media_urls, created_at, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [project_id, title, description, media_urls, created_at, category]
      );

      const project = result.rows[0];
      res.status(201).json({
        project_id: project.project_id,
        title: project.title,
        description: project.description,
        media_urls: project.media_urls,
        created_at: project.created_at,
        category: project.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Create project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Project Details Endpoint
  Retrieves detailed information for a specific project by project_id
*/
app.get('/api/portfolio/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM projects WHERE project_id = $1', [project_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      const project = result.rows[0];
      res.json({
        project_id: project.project_id,
        title: project.title,
        description: project.description,
        media_urls: project.media_urls,
        created_at: project.created_at,
        category: project.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Update Project Endpoint
  Updates an existing project with new data
  Requires authentication
*/
app.patch('/api/portfolio/:project_id', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    const updateData = { project_id, ...req.body };
    const validatedInput = updateProjectInputSchema.parse(updateData);

    const client = await pool.connect();
    
    try {
      // Build dynamic update query
      const updateFields = [];
      const params = [project_id];
      let paramCount = 1;

      if (validatedInput.title !== undefined) {
        paramCount++;
        updateFields.push(`title = $${paramCount}`);
        params.push(validatedInput.title);
      }
      if (validatedInput.description !== undefined) {
        paramCount++;
        updateFields.push(`description = $${paramCount}`);
        params.push(validatedInput.description);
      }
      if (validatedInput.media_urls !== undefined) {
        paramCount++;
        updateFields.push(`media_urls = $${paramCount}`);
        params.push(validatedInput.media_urls);
      }
      if (validatedInput.category !== undefined) {
        paramCount++;
        updateFields.push(`category = $${paramCount}`);
        params.push(validatedInput.category);
      }

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      const sql = `UPDATE projects SET ${updateFields.join(', ')} WHERE project_id = $1 RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      const project = result.rows[0];
      res.json({
        project_id: project.project_id,
        title: project.title,
        description: project.description,
        media_urls: project.media_urls,
        created_at: project.created_at,
        category: project.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Update project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Delete Project Endpoint
  Removes a project from the portfolio
  Requires authentication
*/
app.delete('/api/portfolio/:project_id', authenticateToken, async (req, res) => {
  try {
    const { project_id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM projects WHERE project_id = $1 RETURNING project_id', [project_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Project not found', null, 'PROJECT_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Testimonials Endpoint
  Retrieves list of testimonials with filtering, sorting, and pagination
*/
app.get('/api/testimonials', async (req, res) => {
  try {
    const queryParams = searchTestimonialInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = queryParams;

    const client = await pool.connect();
    
    try {
      let sql = 'SELECT testimonial_id, project_id, user_id, content, rating, created_at FROM testimonials';
      let params = [];
      let paramCount = 0;

      if (query) {
        paramCount++;
        sql += ` WHERE content ILIKE $${paramCount}`;
        params.push(`%${query}%`);
      }

      sql += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
      
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await client.query(sql, params);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid query parameters', error, 'VALIDATION_ERROR'));
    }
    console.error('Get testimonials error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Create Testimonial Endpoint
  Creates a new testimonial for a project
  Requires authentication
*/
app.post('/api/testimonials', authenticateToken, async (req, res) => {
  try {
    const validatedInput = createTestimonialInputSchema.parse(req.body);
    const { project_id, user_id, content, rating } = validatedInput;

    const client = await pool.connect();
    
    try {
      const testimonial_id = uuidv4();
      const created_at = new Date().toISOString();

      const result = await client.query(
        'INSERT INTO testimonials (testimonial_id, project_id, user_id, content, rating, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [testimonial_id, project_id, user_id, content, rating, created_at]
      );

      const testimonial = result.rows[0];
      res.status(201).json({
        testimonial_id: testimonial.testimonial_id,
        project_id: testimonial.project_id,
        user_id: testimonial.user_id,
        content: testimonial.content,
        rating: testimonial.rating,
        created_at: testimonial.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Create testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Update Testimonial Endpoint
  Updates an existing testimonial
  Requires authentication
*/
app.patch('/api/testimonials/:testimonial_id', authenticateToken, async (req, res) => {
  try {
    const { testimonial_id } = req.params;
    const updateData = { testimonial_id, ...req.body };
    const validatedInput = updateTestimonialInputSchema.parse(updateData);

    const client = await pool.connect();
    
    try {
      const updateFields = [];
      const params = [testimonial_id];
      let paramCount = 1;

      if (validatedInput.project_id !== undefined) {
        paramCount++;
        updateFields.push(`project_id = $${paramCount}`);
        params.push(validatedInput.project_id);
      }
      if (validatedInput.user_id !== undefined) {
        paramCount++;
        updateFields.push(`user_id = $${paramCount}`);
        params.push(validatedInput.user_id);
      }
      if (validatedInput.content !== undefined) {
        paramCount++;
        updateFields.push(`content = $${paramCount}`);
        params.push(validatedInput.content);
      }
      if (validatedInput.rating !== undefined) {
        paramCount++;
        updateFields.push(`rating = $${paramCount}`);
        params.push(String(validatedInput.rating));
      }

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      const sql = `UPDATE testimonials SET ${updateFields.join(', ')} WHERE testimonial_id = $1 RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Testimonial not found', null, 'TESTIMONIAL_NOT_FOUND'));
      }

      const testimonial = result.rows[0];
      res.json({
        testimonial_id: testimonial.testimonial_id,
        project_id: testimonial.project_id,
        user_id: testimonial.user_id,
        content: testimonial.content,
        rating: testimonial.rating,
        created_at: testimonial.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Update testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Delete Testimonial Endpoint
  Removes a testimonial
  Requires authentication
*/
app.delete('/api/testimonials/:testimonial_id', authenticateToken, async (req, res) => {
  try {
    const { testimonial_id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM testimonials WHERE testimonial_id = $1 RETURNING testimonial_id', [testimonial_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Testimonial not found', null, 'TESTIMONIAL_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Services Endpoint
  Retrieves list of services with filtering, sorting, and pagination
*/
app.get('/api/services', async (req, res) => {
  try {
    const queryParams = searchServiceInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = queryParams;

    const client = await pool.connect();
    
    try {
      let sql = 'SELECT service_id, title, description, pricing, created_at FROM services';
      let params = [];
      let paramCount = 0;

      if (query) {
        paramCount++;
        sql += ` WHERE (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${query}%`);
      }

      sql += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
      
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await client.query(sql, params);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid query parameters', error, 'VALIDATION_ERROR'));
    }
    console.error('Get services error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Create Service Endpoint
  Creates a new service offering
  Requires authentication
*/
app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const validatedInput = createServiceInputSchema.parse(req.body);
    const { title, description, pricing } = validatedInput;

    const client = await pool.connect();
    
    try {
      const service_id = uuidv4();
      const created_at = new Date().toISOString();

      const result = await client.query(
        'INSERT INTO services (service_id, title, description, pricing, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [service_id, title, description, pricing, created_at]
      );

      const service = result.rows[0];
      res.status(201).json({
        service_id: service.service_id,
        title: service.title,
        description: service.description,
        pricing: service.pricing,
        created_at: service.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Create service error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Update Service Endpoint
  Updates an existing service
  Requires authentication
*/
app.patch('/api/services/:service_id', authenticateToken, async (req, res) => {
  try {
    const { service_id } = req.params;
    const updateData = { service_id, ...req.body };
    const validatedInput = updateServiceInputSchema.parse(updateData);

    const client = await pool.connect();
    
    try {
      const updateFields = [];
      const params = [service_id];
      let paramCount = 1;

      if (validatedInput.title !== undefined) {
        paramCount++;
        updateFields.push(`title = $${paramCount}`);
        params.push(validatedInput.title);
      }
      if (validatedInput.description !== undefined) {
        paramCount++;
        updateFields.push(`description = $${paramCount}`);
        params.push(validatedInput.description);
      }
      if (validatedInput.pricing !== undefined) {
        paramCount++;
        updateFields.push(`pricing = $${paramCount}`);
        params.push(String(validatedInput.pricing));
      }

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      const sql = `UPDATE services SET ${updateFields.join(', ')} WHERE service_id = $1 RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Service not found', null, 'SERVICE_NOT_FOUND'));
      }

      const service = result.rows[0];
      res.json({
        service_id: service.service_id,
        title: service.title,
        description: service.description,
        pricing: service.pricing,
        created_at: service.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Update service error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Delete Service Endpoint
  Removes a service offering
  Requires authentication
*/
app.delete('/api/services/:service_id', authenticateToken, async (req, res) => {
  try {
    const { service_id } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM services WHERE service_id = $1 RETURNING service_id', [service_id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Service not found', null, 'SERVICE_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Blog Posts Endpoint
  Retrieves list of blog posts with filtering, sorting, and pagination
*/
app.get('/api/blog', async (req, res) => {
  try {
    const queryParams = searchBlogPostInputSchema.parse(req.query);
    const { query, limit, offset, sort_by, sort_order } = queryParams;

    const client = await pool.connect();
    
    try {
      let sql = 'SELECT post_id, post_slug, title, content, created_at, category FROM blog_posts';
      let params = [];
      let paramCount = 0;

      if (query) {
        paramCount++;
        sql += ` WHERE (title ILIKE $${paramCount} OR content ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
        params.push(`%${query}%`);
      }

      sql += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
      
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);
      
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await client.query(sql, params);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid query parameters', error, 'VALIDATION_ERROR'));
    }
    console.error('Get blog posts error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Create Blog Post Endpoint
  Creates a new blog post
  Requires authentication
*/
app.post('/api/blog', authenticateToken, async (req, res) => {
  try {
    const validatedInput = createBlogPostInputSchema.parse(req.body);
    const { post_slug, title, content, category } = validatedInput;

    const client = await pool.connect();
    
    try {
      // Check if slug already exists
      const existingPost = await client.query('SELECT post_id FROM blog_posts WHERE post_slug = $1', [post_slug]);
      if (existingPost.rows.length > 0) {
        return res.status(400).json(createErrorResponse('Blog post with this slug already exists', null, 'SLUG_ALREADY_EXISTS'));
      }

      const post_id = uuidv4();
      const created_at = new Date().toISOString();

      const result = await client.query(
        'INSERT INTO blog_posts (post_id, post_slug, title, content, created_at, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [post_id, post_slug, title, content, created_at, category]
      );

      const blogPost = result.rows[0];
      res.status(201).json({
        post_id: blogPost.post_id,
        post_slug: blogPost.post_slug,
        title: blogPost.title,
        content: blogPost.content,
        created_at: blogPost.created_at,
        category: blogPost.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Create blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Get Blog Post Details Endpoint
  Retrieves detailed information for a specific blog post by slug
*/
app.get('/api/blog/:post_slug', async (req, res) => {
  try {
    const { post_slug } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM blog_posts WHERE post_slug = $1', [post_slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      const blogPost = result.rows[0];
      res.json({
        post_id: blogPost.post_id,
        post_slug: blogPost.post_slug,
        title: blogPost.title,
        content: blogPost.content,
        created_at: blogPost.created_at,
        category: blogPost.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Update Blog Post Endpoint
  Updates an existing blog post
  Requires authentication
*/
app.patch('/api/blog/:post_slug', authenticateToken, async (req, res) => {
  try {
    const { post_slug } = req.params;
    const updateData = { post_slug, ...req.body };
    const validatedInput = updateBlogPostInputSchema.parse(updateData);

    const client = await pool.connect();
    
    try {
      const updateFields = [];
      const params = [post_slug];
      let paramCount = 1;

      if (validatedInput.post_slug !== undefined && validatedInput.post_slug !== post_slug) {
        // Check if new slug already exists
        const existingPost = await client.query('SELECT post_id FROM blog_posts WHERE post_slug = $1', [validatedInput.post_slug]);
        if (existingPost.rows.length > 0) {
          return res.status(400).json(createErrorResponse('Blog post with this slug already exists', null, 'SLUG_ALREADY_EXISTS'));
        }
        
        paramCount++;
        updateFields.push(`post_slug = $${paramCount}`);
        params.push(validatedInput.post_slug);
      }
      if (validatedInput.title !== undefined) {
        paramCount++;
        updateFields.push(`title = $${paramCount}`);
        params.push(validatedInput.title);
      }
      if (validatedInput.content !== undefined) {
        paramCount++;
        updateFields.push(`content = $${paramCount}`);
        params.push(validatedInput.content);
      }
      if (validatedInput.category !== undefined) {
        paramCount++;
        updateFields.push(`category = $${paramCount}`);
        params.push(validatedInput.category);
      }

      if (updateFields.length === 0) {
        return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
      }

      const sql = `UPDATE blog_posts SET ${updateFields.join(', ')} WHERE post_slug = $1 RETURNING *`;
      const result = await client.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      const blogPost = result.rows[0];
      res.json({
        post_id: blogPost.post_id,
        post_slug: blogPost.post_slug,
        title: blogPost.title,
        content: blogPost.content,
        created_at: blogPost.created_at,
        category: blogPost.category
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Update blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Delete Blog Post Endpoint
  Removes a blog post
  Requires authentication
*/
app.delete('/api/blog/:post_slug', authenticateToken, async (req, res) => {
  try {
    const { post_slug } = req.params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM blog_posts WHERE post_slug = $1 RETURNING post_id', [post_slug]);
      
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse('Blog post not found', null, 'BLOG_POST_NOT_FOUND'));
      }

      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

/*
  Submit Contact Request Endpoint
  Handles contact form submissions and stores them in the database
  No authentication required for contact form
*/
app.post('/api/contact', async (req, res) => {
  try {
    const validatedInput = createContactRequestInputSchema.parse(req.body);
    const { name, email, message } = validatedInput;

    const client = await pool.connect();
    
    try {
      const request_id = uuidv4();
      const created_at = new Date().toISOString();

      const result = await client.query(
        'INSERT INTO contact_requests (request_id, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [request_id, name.trim(), email.toLowerCase().trim(), message.trim(), created_at]
      );

      const contactRequest = result.rows[0];
      res.status(201).json({
        request_id: contactRequest.request_id,
        name: contactRequest.name,
        email: contactRequest.email,
        message: contactRequest.message,
        created_at: contactRequest.created_at
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json(createErrorResponse('Invalid input data', error, 'VALIDATION_ERROR'));
    }
    console.error('Create contact request error:', error);
    res.status(500).json(createErrorResponse('Internal server error', error, 'INTERNAL_SERVER_ERROR'));
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route for SPA routing - serves index.html for non-API routes
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and listening on 0.0.0.0`);
});