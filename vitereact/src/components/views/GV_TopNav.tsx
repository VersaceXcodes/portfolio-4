import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_TopNav: React.FC = () => {
  const [expandedMenu, setExpandedMenu] = React.useState(false);
  
  // Individual Zustand Selectors
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  const toggleMenu = () => {
    setExpandedMenu(!expandedMenu);
  };

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 w-full z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              Portfolio-4
            </Link>
          </div>
          <button onClick={toggleMenu} className="md:hidden p-2 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
            <span className="sr-only">Open main menu</span>
            {expandedMenu ? (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
          <div className={`md:flex space-x-6 ${expandedMenu ? "block" : "hidden"} md:block`}>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">About Me</Link>
            <Link to="/resume" className="text-gray-700 hover:text-blue-600">Resume/CV</Link>
            <Link to="/portfolio" className="text-gray-700 hover:text-blue-600">Portfolio</Link>
            <Link to="/testimonials" className="text-gray-700 hover:text-blue-600">Testimonials</Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600">Services</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            <Link to="/blog" className="text-gray-700 hover:text-blue-600">Blog</Link>
            {isAuthenticated ? (
              <span className="text-gray-700 hover:text-blue-600">Welcome, {currentUser?.name}</span>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default GV_TopNav;