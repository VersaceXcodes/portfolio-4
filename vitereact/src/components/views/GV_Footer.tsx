import React from 'react';
import { Link } from 'react-router-dom';

const GV_Footer: React.FC = () => {
  const footerLinks = [
    '/about',
    '/resume',
    '/portfolio',
    '/testimonials',
    '/services',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const socialMediaLinks = [
    { url: 'https://facebook.com/', label: 'Facebook' },
    { url: 'https://twitter.com/', label: 'Twitter' },
    { url: 'https://linkedin.com/', label: 'LinkedIn' },
  ];

  return (
    <>
      <footer className="bg-white shadow-lg shadow-gray-200/50 rounded-xl border-t border-gray-100 overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center space-x-4 text-base text-gray-700">
              {footerLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link}
                  className="hover:text-blue-600 transition-all duration-200"
                >
                  {link.replace('/', '').replace('-', ' ').toUpperCase()}
                </Link>
              ))}
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-4">
              {socialMediaLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-all duration-200"
                  aria-label={`Visit our ${social.label} page`}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          {/* Legal and Contact */}
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Portfolio-4. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;