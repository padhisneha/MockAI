import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaUserTie, FaFileAlt, FaEnvelope, FaStar, FaUsers, FaLaptopCode } from 'react-icons/fa';

const Home = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
            Your Career Success <span className="text-blue-600">Starts Here</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Ace your next interview with our AI-powered preparation platform. 
            From coding challenges to perfect resumes, we've got you covered.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/problems"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Practicing Now
            </Link>
            <a 
              href="#features" 
              className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2,500+</div>
            <div className="text-gray-600">Practice Problems</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">89%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">100+</div>
            <div className="text-gray-600">Companies Hiring</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">AI Support</div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="pt-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Prepare with Confidence</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Technical Interviews */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                <FaCode className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Technical Interviews</h3>
              <p className="text-gray-600 mb-5">Master data structures and algorithms with our AI-guided interview practice.</p>
              <Link
                to="/problems"
                className="inline-block text-blue-600 font-medium hover:text-blue-800"
              >
                Start Practicing →
              </Link>
            </div>

            {/* Behavioral Interviews */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                <FaUserTie className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Behavioral Interviews</h3>
              <p className="text-gray-600 mb-5">Prepare compelling answers for soft skills and scenario-based questions.</p>
              <Link
                to="/behaviouralinterview"
                className="inline-block text-green-600 font-medium hover:text-green-800"
              >
                Start Practicing →
              </Link>
            </div>

            {/* Resume Builder */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                <FaFileAlt className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Resume Builder</h3>
              <p className="text-gray-600 mb-5">Create an ATS-friendly resume that stands out to recruiters and algorithms.</p>
              <Link
                to="/resume"
                className="inline-block text-purple-600 font-medium hover:text-purple-800"
              >
                Start Building →
              </Link>
            </div>

            {/* Cover Letter Generator */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
              <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center mb-5">
                <FaEnvelope className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Cover Letter Generator</h3>
              <p className="text-gray-600 mb-5">Create tailored, professional cover letters that complement your resume perfectly.</p>
              <Link
                to="/coverletter"
                className="inline-block text-red-600 font-medium hover:text-red-800"
              >
                Start Generating →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-blue-600 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <FaUsers className="mx-auto text-4xl mb-6 opacity-75" />
            <h2 className="text-3xl font-bold mb-6">What Our Users Say</h2>
            <blockquote className="text-xl font-light italic mb-8">
              "This platform completely transformed my interview preparation. I aced my technical interview at Google and the resume builder helped me get calls from top companies."
            </blockquote>
            <div className="font-medium">
              <p>Alex Johnson</p>
              <p className="text-blue-200">Software Engineer at Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gray-900 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to land your dream job?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful candidates who prepared with our platform.
          </p>
          <Link
            to="/problems"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <FaLaptopCode className="mr-2" />
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;