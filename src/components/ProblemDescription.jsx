import React from 'react';

const ProblemDescription = ({ problem }) => {
  if (!problem) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4 border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{problem.title}</h2>
        <div className="flex items-center mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
            }`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700">{problem.description}</p>
        </div>
      </div>

      {problem.examples && problem.examples.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Examples</h3>
          <div className="space-y-4">
            {problem.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Input:</span>
                  <pre className="mt-1 bg-gray-100 p-2 rounded overflow-x-auto text-sm text-gray-800 font-mono">{example.input}</pre>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Output:</span>
                  <pre className="mt-1 bg-gray-100 p-2 rounded overflow-x-auto text-sm text-gray-800 font-mono">{example.output}</pre>
                </div>
                {example.explanation && (
                  <div>
                    <span className="font-medium text-gray-700">Explanation:</span>
                    <p className="mt-1 text-sm text-gray-600">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Interview Tips</h3>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>Start by explaining your approach before coding</li>
            <li>Consider edge cases in your solution</li>
            <li>Think about time and space complexity</li>
            <li>If you're stuck, talk through your thought process</li>
            <li>Test your solution with the provided examples</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProblemDescription;
