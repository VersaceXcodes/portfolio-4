export interface BlogPost {
  blog_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Project {
  project_id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  category?: string;
  created_at: Date;
}

export interface Testimonial {
  testimonial_id: string;
  client_name: string;
  client_company?: string;
  testimonial_text: string;
  rating?: number;
  created_at: Date;
}
