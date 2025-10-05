import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Interfaces for data types.
interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string | null;
  accomplishments: string[];
}

interface Skill {
  name: string;
  rating: number; // For visual indication
}

const fetchResumeData = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/resume`);
  return response.data;
};

const UV_ResumeCV: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);

  const { data, isLoading, error } = useQuery(['resumeData'], fetchResumeData, {
    staleTime: 600000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  return (
    <>
      <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center">
        {isLoading && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
            <p className="text-sm">Failed to load resume data, please try again later.</p>
          </div>
        )}

        {data && (
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6 space-y-8">
            <header className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">Resume / CV</h1>
              <p className="text-gray-600 mt-2">A comprehensive overview of my professional journey</p>
            </header>

            {/* Education Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Education</h2>
              <ul className="space-y-4 mt-4">
                {data.education.map((edu: Education, index: number) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-gray-500">{edu.year}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Work Experience Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Work Experience</h2>
              <ul className="space-y-4 mt-4">
                {data.work_experience.map((work: WorkExperience, index: number) => (
                  <li key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold">{work.position} at {work.company}</h3>
                    <p className="text-gray-600">
                      {work.start_date} to {work.end_date || 'Present'}
                    </p>
                    <ul className="list-disc pl-6">
                      {work.accomplishments.map((acc, i) => (
                        <li key={i} className="text-gray-700">{acc}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>

            {/* Skills Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>
              <ul className="flex flex-wrap mt-4 space-x-4">
                {data.skills.map((skill: Skill, index: number) => (
                  <li key={index} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <div className="text-lg font-medium text-gray-800 flex items-center">
                      {skill.name}
                      <span className="text-yellow-500 ml-2">{'★'.repeat(skill.rating)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-4">
            <p className="text-gray-700">Interested in learning more? Please <Link to="/contact" className="text-blue-600 hover:text-blue-500">contact me</Link> for further information.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_ResumeCV;