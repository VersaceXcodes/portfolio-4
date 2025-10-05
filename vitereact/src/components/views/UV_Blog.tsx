import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BlogPost } from '@/types';  // Assume BlogPost type is defined in shared types
import { blogPostSchema } from '@/zodschemas';

const fetchBlogPosts = async () => {
  const response = await axios.get<BlogPost[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog`
  );
  return response.data.map(post => ({
    ...post,
    created_at: new Date(post.created_at),  // Map string to Date if needed
  }));
};

const UV_Blog: React.FC = () => {
  const {
    data: blogPosts = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: fetchBlogPosts,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: data => blogPostSchema.array().parse(data)
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl leading-tight font-bold text-center text-gray-900 mb-12">
            Blog
          </h1>

          {isError && (
            <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-md mb-4" aria-live="polite">
              <p>Error loading blog posts: {error instanceof Error && error.message}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts?.map(post => (
                <div key={post.blog_id} className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 line-clamp-3 mb-4">{post.content}</p>
                    <Link to={`/blog/${post.blog_id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_Blog;