import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`transition-all duration-300 z-10 ${isScrolled
        ? 'bg-white text-gray-800 shadow-md'
        : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white'
      }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 mr-2 ${isScrolled ? 'text-blue-600' : 'text-white'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className={`font-bold text-xl ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                AI Interviewer
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')
                  ? isScrolled ? 'bg-blue-100 text-blue-700' : 'bg-white bg-opacity-20 text-white'
                  : isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                }`}
            >
              Home
            </Link>

            <Link
              to="/problems"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/problems')
                  ? isScrolled ? 'bg-blue-100 text-blue-700' : 'bg-white bg-opacity-20 text-white'
                  : isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                }`}
            >
              Problems
            </Link>

            {/* <Link
              to="/mock-interviews"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/mock-interviews')
                  ? isScrolled ? 'bg-blue-100 text-blue-700' : 'bg-white bg-opacity-20 text-white'
                  : isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                }`}
            >
              Mock Interviews
            </Link> */}

            {/* <button
              className={`ml-4 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-700 hover:bg-blue-50'
                }`}
            >
              Sign In
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
