import React from 'react';
import { Link } from 'react-router-dom';
import { getAllProblems } from '../services/problemService';

const ProblemList = () => {
  const problems = getAllProblems();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DSA Problems</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Difficulty</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b">
                <td className="p-3">{problem.title}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded 
                    ${problem.difficulty === 'Easy' ? 'bg-green-200 text-green-800' : 
                      problem.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 
                      'bg-red-200 text-red-800'}
                  `}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link 
                    to={`/interview/${problem.id}`} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Start Interview
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemList;