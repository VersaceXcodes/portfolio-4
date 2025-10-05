import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Project } from '@/store/types';

const fetchProjects = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio`
  );
  return data;
};

const UV_Portfolio: React.FC = () => {
  const [filters, setFilters] = useState<{ category?: string; sortOrder?: 'asc' | 'desc' }>({});
  const { data: projects, isLoading, error } = useQuery<Project[]>(
    ['projects', filters],
    fetchProjects,
    {
      staleTime: 60000,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Portfolio</h1>

          <div className="mb-8 flex justify-between items-center">
            <select
              name="category"
              className="px-4 py-2 rounded-lg border-2 border-gray-200"
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="web">Web Development</option>
              <option value="design">Design</option>
            </select>

            <select
              name="sortOrder"
              className="px-4 py-2 rounded-lg border-2 border-gray-200"
              onChange={handleFilterChange}
            >
              <option value="asc">Oldest to Newest</option>
              <option value="desc">Newest to Oldest</option>
            </select>
          </div>

          {
            isLoading ? <div>Loading...</div> : error ? <div>Error loading projects</div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects?.map((project) => (
                <div key={project.project_id} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-200">
                  <Link to={`/portfolio/${project.project_id}`} className="block">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">{project.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{project.description}</p>
                  </Link>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default UV_Portfolio;