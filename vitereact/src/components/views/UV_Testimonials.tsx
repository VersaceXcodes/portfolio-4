import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { testimonialSchema, Testimonial } from '@/schemas/testimonialSchema';
import { z } from 'zod';

const UV_Testimonials: React.FC = () => {
  const fetchTestimonials = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/testimonials`);
    return z.array(testimonialSchema).parse(response.data);
  };

  const { data: testimonials = [], isLoading, error } = useQuery<Testimonial[], Error>({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    staleTime: 60000,
    retry: 1
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Testimonials</h1>

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-center">
              <p className="text-sm">Failed to load testimonials: {error.message}</p>
            </div>
          )}

          {testimonials && testimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.testimonial_id} className="bg-white shadow-lg rounded-xl p-6">
                  <div className="text-lg font-medium text-gray-900 mb-2">{testimonial.testimonial_text}</div>
                  {testimonial.rating !== undefined && testimonial.rating !== null && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">{'★'.repeat(testimonial.rating)}</span>
                      <span className="text-gray-500 ml-2">{'★'.repeat(5 - testimonial.rating)}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-700 mt-4">
                    <p className="font-semibold">{testimonial.client_name}</p>
                    {testimonial.client_company && <p className="text-gray-500">{testimonial.client_company}</p>}
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

export default UV_Testimonials;