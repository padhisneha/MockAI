import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          AI Interviewer
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/problems" className="hover:text-blue-200">Problems</Link>
          <Link to="/mock-interviews" className="hover:text-blue-200">Mock Interviews</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;