import React from 'react';
import { Link } from 'react-router-dom';

const UV_AboutMe: React.FC = () => {
  const currentUser = useAppStore(state => state.authentication_state.current_user);

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-16 px-8 lg:py-20">
        <div className="max-w-4xl mx-auto bg-white shadow-lg shadow-gray-200/50 rounded-xl overflow-hidden">
          <div className="p-8 lg:p-12 space-y-6">
            <div className="text-center">
              {currentUser?.name && (
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Hello, I'm {currentUser.name}
                </h1>
              )}
              <img
                src="/path/to/profile-photo.jpg"  // ensure the correct path to the profile image
                alt={`Profile of ${currentUser?.name || "user"}`}
                className="mx-auto my-6 rounded-full h-32 w-32 lg:h-40 lg:w-40 object-cover shadow-lg"
              />
            </div>
            <div className="text-gray-700 space-y-3 leading-relaxed">
              <p>
                I am a dedicated professional with a passion for excellence in my field. My journey has taken me through a variety of roles, where I've honed my skills and expertise to deliver outstanding quality and reliable solutions.
              </p>
              <p>
                Beyond my professional pursuits, I am driven by a mission to contribute positively to my community and the world at large. My commitment to integrity and innovation motivates every decision I make, seeking sustainable impacts.
              </p>
              <p>
                I aspire to continue expanding my horizons, and I'm excited about the new challenges and opportunities that lie ahead. Whether through technology, collaborations, or creative solutions, I am always looking to bring my best to every endeavor.
              </p>
            </div>
            <div className="text-center pt-6">
              <Link to="/contact" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_AboutMe;