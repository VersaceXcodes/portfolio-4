export interface Project {
  project_id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  category?: string;
  created_at: Date;
}
