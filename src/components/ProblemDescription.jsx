import React from 'react';

const ProblemDescription = ({ problem }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
      <div className="mb-4">
        <span className={`
          px-2 py-1 rounded text-sm 
          ${problem.difficulty === 'Easy' ? 'bg-green-200 text-green-800' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 
            'bg-red-200 text-red-800'}
        `}>
          {problem.difficulty}
        </span>
      </div>
      <p className="mb-4">{problem.description}</p>
      
      {problem.examples && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Examples:</h2>
          {problem.examples.map((example, index) => (
            <div key={index} className="bg-gray-100 p-3 rounded mb-2">
              <p><strong>Input:</strong> {example.input}</p>
              <p><strong>Output:</strong> {example.output}</p>
              <p><strong>Explanation:</strong> {example.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;