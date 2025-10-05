-- Create Tables

CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE authentication_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    token TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE projects (
    project_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    media_urls TEXT,
    created_at TEXT NOT NULL,
    category TEXT
);

CREATE TABLE testimonials (
    testimonial_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(project_id),
    user_id TEXT NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    rating NUMERIC,
    created_at TEXT NOT NULL
);

CREATE TABLE services (
    service_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    pricing NUMERIC,
    created_at TEXT NOT NULL
);

CREATE TABLE blog_posts (
    post_id TEXT PRIMARY KEY,
    post_slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    category TEXT
);

CREATE TABLE contact_requests (
    request_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Seed Data

INSERT INTO users (user_id, email, name, created_at, password_hash) VALUES
('user_1', 'john.doe@example.com', 'John Doe', '2023-10-01T10:00:00Z', 'password123'),
('user_2', 'jane.smith@example.com', 'Jane Smith', '2023-10-01T10:30:00Z', 'password123');

INSERT INTO authentication_tokens (token_id, user_id, token, created_at) VALUES
('token_1', 'user_1', 'token_abc123', '2023-10-01T10:05:00Z'),
('token_2', 'user_2', 'token_def456', '2023-10-01T10:35:00Z');

INSERT INTO projects (project_id, title, description, media_urls, created_at, category) VALUES
('project_1', 'Project Alpha', 'First project description', 'https://picsum.photos/200/300?random=1', '2023-09-30T09:00:00Z', 'Category A'),
('project_2', 'Project Beta', 'Second project description', 'https://picsum.photos/200/300?random=2', '2023-10-01T11:00:00Z', 'Category B');

INSERT INTO testimonials (testimonial_id, project_id, user_id, content, rating, created_at) VALUES
('testimonial_1', 'project_1', 'user_1', 'Great job on the project!', 5, '2023-10-01T12:00:00Z'),
('testimonial_2', 'project_2', 'user_2', 'Not too bad, but needs improvement.', 3, '2023-10-01T12:30:00Z');

INSERT INTO services (service_id, title, description, pricing, created_at) VALUES
('service_1', 'Service One', 'Description of service one', 100.0, '2023-09-29T08:00:00Z'),
('service_2', 'Service Two', 'Description of service two', 150.0, '2023-09-30T09:30:00Z');

INSERT INTO blog_posts (post_id, post_slug, title, content, created_at, category) VALUES
('post_1', 'getting-started', 'Getting Started', 'Content of getting started post', '2023-10-01T13:00:00Z', 'Introduction'),
('post_2', 'advanced-tips', 'Advanced Tips', 'Content of advanced tips post', '2023-10-01T13:30:00Z', 'Tutorial');

INSERT INTO contact_requests (request_id, name, email, message, created_at) VALUES
('request_1', 'Alice Johnson', 'alice.j@example.com', 'I need more info about your services.', '2023-10-02T14:00:00Z'),
('request_2', 'Bob Brown', 'bob.b@example.com', 'How can I subscribe to your newsletter?', '2023-10-02T14:30:00Z');