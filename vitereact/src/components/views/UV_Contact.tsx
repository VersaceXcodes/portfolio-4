import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { createContactRequestInputSchema } from '@/schemas';
import { useAppStore } from '@/store/main';

const UV_Contact: React.FC = () => {
  const [contactDetails, setContactDetails] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submissionStatus, setSubmissionStatus] = useState({
    is_submitting: false,
    success: false,
    error_message: null,
  });

  const email = useAppStore(state => state.authentication_state.current_user?.email);

  const contactMutation = useMutation({
    mutationFn: async ({ name, email, message }: { name: string; email: string; message: string }) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/contact`, 
        { name, email, message }, 
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },
    onMutate: () => {
      setSubmissionStatus(prev => ({ ...prev, is_submitting: true, error_message: null }));
    },
    onSuccess: () => {
      setSubmissionStatus({ is_submitting: false, success: true, error_message: null });
      setContactDetails({ name: '', email: '', message: '' });
    },
    onError: (error: any) => {
      setSubmissionStatus({ is_submitting: false, success: false, error_message: error.response?.data?.message || error.message || 'Something went wrong' });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactDetails(prev => ({ ...prev, [name]: value }));
    setSubmissionStatus(prev => ({ ...prev, error_message: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createContactRequestInputSchema.parse(contactDetails);
      contactMutation.mutate(contactDetails);
    } catch (error) {
      setSubmissionStatus(prev => ({ ...prev, error_message: 'Invalid input data.' }));
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or&nbsp;
              <Link to="/about" className="font-medium text-blue-600 hover:text-blue-500">learn more&nbsp;</Link> 
              about us
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {submissionStatus.error_message && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{submissionStatus.error_message}</p>
              </div>
            )}
            {submissionStatus.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="text-sm">Message sent successfully!</p>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={contactDetails.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={contactDetails.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={contactDetails.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submissionStatus.is_submitting}
              >
                {submissionStatus.is_submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_Contact;