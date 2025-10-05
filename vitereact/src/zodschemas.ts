import { z } from 'zod';

export const blogPostSchema = z.object({
  blog_id: z.string(),
  title: z.string(),
  content: z.string(),
  author_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
});

export const projectSchema = z.object({
  project_id: z.string(),
  title: z.string(),
  description: z.string(),
  image_url: z.string().optional(),
  project_url: z.string().optional(),
  category: z.string().optional(),
  created_at: z.coerce.date(),
});

export const testimonialSchema = z.object({
  testimonial_id: z.string(),
  client_name: z.string(),
  client_company: z.string().optional(),
  testimonial_text: z.string(),
  rating: z.number().optional(),
  created_at: z.coerce.date(),
});
