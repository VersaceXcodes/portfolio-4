import { z } from 'zod';

export const testimonialSchema = z.object({
  testimonial_id: z.string(),
  client_name: z.string(),
  client_company: z.string().optional(),
  testimonial_text: z.string(),
  rating: z.number().optional(),
  created_at: z.coerce.date(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;
