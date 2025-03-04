import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        AI-Powered Interview Preparation Platform
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Technical Interviews</h2>
          <p>Practice DSA problems with AI-guided interviews</p>
          <Link 
            to="/problems" 
            className="mt-4 block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Start Practicing
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Behavioral Interviews</h2>
          <p>Prepare for soft skills and scenario-based questions</p>
          <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            Coming Soon
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Resume Builder</h2>
          <p>Create an ATS-friendly professional resume</p>
          <button className="mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;