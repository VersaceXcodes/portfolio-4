import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Project {
  project_id: string;
  title: string;
  description: string | null;
  media_urls: string | null;
  created_at: string;
}

interface Service {
  service_id: string;
  title: string;
  description: string | null;
  pricing: number | null;
  created_at: string;
}

const UV_HomePage: React.FC = () => {
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['projects', 'featured'],
    queryFn: () => axios.get<Project[]>(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/portfolio?sort_by=created_at&sort_order=desc&limit=3`).then(res => res.data),
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['services', 'overview'],
    queryFn: () => axios.get<Service[]>(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/services?limit=3`).then(res => res.data),
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-12">
          <header className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">Welcome to My Professional Portfolio</h1>
            <p className="text-xl text-gray-600 mt-4">Showcasing my work, expertise, and the services I provide.</p>
          </header>
          
          <section aria-labelledby="services-heading">
            <h2 id="services-heading" className="text-3xl font-semibold text-gray-900">Services Overview</h2>
            {isLoadingServices ? (
              <p className="text-center text-gray-600">Loading services...</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <li key={service.service_id} className="rounded-xl bg-white shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-blue-600">{service.title}</h3>
                    {service.description && <p className="text-base text-gray-600 mt-2">{service.description}</p>}
                    <Link to="/services" className="text-blue-600 hover:underline mt-4 inline-block">Learn more</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="featured-work-heading">
            <h2 id="featured-work-heading" className="text-3xl font-semibold text-gray-900">Featured Work</h2>
            {isLoadingProjects ? (
              <p className="text-center text-gray-600">Loading projects...</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <li key={project.project_id} className="rounded-xl bg-white shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-blue-600">{project.title}</h3>
                    {project.description && <p className="text-base text-gray-600 mt-2">{project.description}</p>}
                    <Link to={`/portfolio/${project.project_id}`} className="text-blue-600 hover:underline mt-4 inline-block">View details</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default UV_HomePage;