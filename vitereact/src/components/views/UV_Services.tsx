import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

interface Service {
  service_id: string;
  title: string;
  description: string | null;
  pricing: number | null;
  created_at: Date;
}

// API call to fetch services
const fetchServices = async () => {
  const { data } = await axios.get<Service[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/services`
  );
  return data.map(service => ({
    ...service,
    created_at: new Date(service.created_at)
  }));
};

// Zod schema for services
const serviceSchema = z.object({
  service_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  pricing: z.number().nullable(),
  created_at: z.coerce.date()
});

// Main component
const UV_Services: React.FC = () => {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    select: (data: Service[]) => data.map(service => serviceSchema.parse(service)) as Service[],
    staleTime: 60000,
    retry: 1
  });

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">Our Services</h1>
          {isLoading && (
            <div className="text-center text-xl text-blue-600">
              Loading services...
            </div>
          )}
          {error && (
            <div className="text-center text-xl text-red-600">
              Error fetching services: {error.message}
            </div>
          )}
          <div className="space-y-6">
            {services && services.map(service => (
              <div key={service.service_id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{service.title}</h2>
                <p className="text-base text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                {service.pricing !== null && (
                  <div className="text-lg text-green-700 font-medium">
                    Starting at ${service.pricing.toFixed(2)}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">Added on: {service.created_at.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Services;