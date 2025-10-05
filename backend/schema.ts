import { z } from 'zod';

// User Schemas
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.coerce.date(),
  password_hash: z.string()
});

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password_hash: z.string().min(8),
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  password_hash: z.string().min(8).optional(),
});

export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

// Authentication Token Schemas
export const authenticationTokenSchema = z.object({
  token_id: z.string(),
  user_id: z.string(),
  token: z.string(),
  created_at: z.coerce.date()
});

export const createAuthTokenInputSchema = z.object({
  user_id: z.string(),
  token: z.string().min(1)
});

export const updateAuthTokenInputSchema = z.object({
  token_id: z.string(),
  user_id: z.string().optional(),
  token: z.string().min(1).optional(),
});

export const searchAuthTokenInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AuthenticationToken = z.infer<typeof authenticationTokenSchema>;
export type CreateAuthTokenInput = z.infer<typeof createAuthTokenInputSchema>;
export type UpdateAuthTokenInput = z.infer<typeof updateAuthTokenInputSchema>;
export type SearchAuthTokenInput = z.infer<typeof searchAuthTokenInputSchema>;

// Project Schemas
export const projectSchema = z.object({
  project_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  media_urls: z.string().nullable(),
  created_at: z.coerce.date(),
  category: z.string().nullable()
});

export const createProjectInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  media_urls: z.string().nullable(),
  category: z.string().nullable()
});

export const updateProjectInputSchema = z.object({
  project_id: z.string(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  media_urls: z.string().nullable().optional(),
  category: z.string().nullable().optional()
});

export const searchProjectInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type SearchProjectInput = z.infer<typeof searchProjectInputSchema>;

// Testimonial Schemas
export const testimonialSchema = z.object({
  testimonial_id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  rating: z.number().nullable(),
  created_at: z.coerce.date()
});

export const createTestimonialInputSchema = z.object({
  project_id: z.string(),
  user_id: z.string(),
  content: z.string().min(1),
  rating: z.number().min(0).max(5).nullable(),
});

export const updateTestimonialInputSchema = z.object({
  testimonial_id: z.string(),
  project_id: z.string().optional(),
  user_id: z.string().optional(),
  content: z.string().min(1).optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
});

export const searchTestimonialInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['content', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Testimonial = z.infer<typeof testimonialSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialInputSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialInputSchema>;
export type SearchTestimonialInput = z.infer<typeof searchTestimonialInputSchema>;

// Service Schemas
export const serviceSchema = z.object({
  service_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  pricing: z.number().nullable(),
  created_at: z.coerce.date()
});

export const createServiceInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  pricing: z.number().min(0).nullable()
});

export const updateServiceInputSchema = z.object({
  service_id: z.string(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  pricing: z.number().min(0).nullable().optional(),
});

export const searchServiceInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Service = z.infer<typeof serviceSchema>;
export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;
export type SearchServiceInput = z.infer<typeof searchServiceInputSchema>;

// Blog Post Schemas
export const blogPostSchema = z.object({
  post_id: z.string(),
  post_slug: z.string(),
  title: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  category: z.string().nullable()
});

export const createBlogPostInputSchema = z.object({
  post_slug: z.string().min(1),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.string().nullable()
});

export const updateBlogPostInputSchema = z.object({
  post_id: z.string(),
  post_slug: z.string().min(1).optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
});

export const searchBlogPostInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type BlogPost = z.infer<typeof blogPostSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;
export type SearchBlogPostInput = z.infer<typeof searchBlogPostInputSchema>;

// Contact Request Schemas
export const contactRequestSchema = z.object({
  request_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  created_at: z.coerce.date()
});

export const createContactRequestInputSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  message: z.string().min(1)
});

export const updateContactRequestInputSchema = z.object({
  request_id: z.string(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  message: z.string().min(1).optional(),
});

export const searchContactRequestInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
export type CreateContactRequestInput = z.infer<typeof createContactRequestInputSchema>;
export type UpdateContactRequestInput = z.infer<typeof updateContactRequestInputSchema>;
export type SearchContactRequestInput = z.infer<typeof searchContactRequestInputSchema>;