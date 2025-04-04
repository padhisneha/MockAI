import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useInterview } from '../context/InterviewContext';
import { getProblemById } from '../services/problemService';

const SUPPORTED_LANGUAGES = {
  cpp: { name: 'C++', monacoId: 'cpp', fileExt: '.cpp' },
  java: { name: 'Java', monacoId: 'java', fileExt: '.java' },
  python: { name: 'Python', monacoId: 'python', fileExt: '.py' }
};

const CodeEditor = () => {
  const { state, dispatch } = useInterview();
  const [language, setLanguage] = useState('java'); // Default language
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const getDefaultCode = (problem, lang) => {
    return problem?.starterCode?.[lang] || '// Write your solution here';
  };
  
  useEffect(() => {
    if (state.currentProblem) {
      const problem = getProblemById(state.currentProblem.id);
      const defaultCode = getDefaultCode(problem, language);
      dispatch({ type: 'UPDATE_CODE', payload: defaultCode });
    }
  }, [state.currentProblem?.id, language, dispatch]);
  
  const handleEditorChange = (value) => {
    dispatch({ type: 'UPDATE_CODE', payload: value });
  };
  
  const executeCode = async () => {
    if (!state.currentCode || !state.currentProblem) return;
    
    setIsRunning(true);
    setResults(null);
    setError(null);
    setStatusMessage('Running your code...');
    
    try {
      // Get the problem and its test cases
      const problem = getProblemById(state.currentProblem.id);
      
      if (!problem || !problem.testCases || problem.testCases.length === 0) {
        throw new Error('No test cases available for this problem');
      }
      
      // Mock execution with simulated results
      const testResults = await simulateCodeExecution(state.currentCode, language, problem);
      
      // Share test results with the interview context
      dispatch({ type: 'SET_TEST_RESULTS', payload: testResults });
      
      // Add a message about the code results to the chat
      const resultSummary = getResultSummary(testResults);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'user',
          content: `I ran my code and got the following results: ${resultSummary}`
        }
      });
      
    } catch (err) {
      setError(err.message);
      setStatusMessage('Execution failed. See error details.');
    } finally {
      setIsRunning(false);
    }
  };
  
  const getResultSummary = (results) => {
    if (!results) return "No results available.";
    
    const { summary } = results;
    
    if (summary.success) {
      return `All ${summary.totalTests} tests passed successfully! The solution appears to be correct.`;
    } else {
      return `${summary.passing} out of ${summary.totalTests} tests passed. There are still ${summary.failing} failing tests.`;
    }
  };
  
  const simulateCodeExecution = async (code, lang, problem) => {
    return new Promise((resolve) => {
      // Simulate network request
      setTimeout(() => {
        // Simple logic to check if code looks reasonable
        const passingTestCases = [];
        const failingTestCases = [];
        
        // Check for key patterns in code based on problem
        let passMinimumCheck = false;
        
        if (problem.id === 'two-sum') {
          // Check for HashMap/Map usage for Two Sum problem
          passMinimumCheck = code.includes('return') && 
                             (code.includes('Map') || code.includes('HashMap') || code.includes('map')) &&
                             (code.includes('target') || code.includes('nums'));
        } else if (problem.id === 'palindrome-number') {
          passMinimumCheck = code.includes('return') && 
                             (code.includes('str(') || code.includes('String') || 
                              code.includes('reverse') || code.includes('for'));
        } else if (problem.id === 'longest-substring') {
          passMinimumCheck = code.includes('return') && 
                             (code.includes('set(') || code.includes('Set') || 
                              code.includes('map') || code.includes('Map') ||
                              code.includes('for') || code.includes('while'));
        } else {
          passMinimumCheck = code.includes('return') && code.length > 50;
        }
        
        // If code uses nested loops for two-sum, it will fail some test cases
        const usesNestedLoops = (problem.id === 'two-sum') && 
                               code.includes('for') && 
                               code.split('for').length > 2 &&
                               !code.includes('Map') && 
                               !code.includes('HashMap');
        
        // Process each test case
        problem.testCases.forEach((testCase, index) => {
          // Decide if test passes based on code quality
          // For two-sum: If using nested loops, make it fail at least one test
          const testPasses = passMinimumCheck && 
                            !(usesNestedLoops && index === problem.testCases.length - 1);
          
          const testCaseResult = {
            id: index,
            input: JSON.stringify(testCase.input),
            expectedOutput: JSON.stringify(testCase.expectedOutput),
            actualOutput: testPasses 
              ? JSON.stringify(testCase.expectedOutput)
              : JSON.stringify(generateFakeOutput(testCase.expectedOutput)),
            status: testPasses ? 'PASS' : 'FAIL'
          };
          
          if (testPasses) {
            passingTestCases.push(testCaseResult);
          } else {
            failingTestCases.push(testCaseResult);
          }
        });
        
        // Generate final results
        const finalResults = {
          summary: {
            totalTests: problem.testCases.length,
            passing: passingTestCases.length,
            failing: failingTestCases.length,
            success: passingTestCases.length === problem.testCases.length,
            usesOptimalSolution: (problem.id === 'two-sum') ? 
                                code.includes('Map') || code.includes('HashMap') : true
          },
          passingTests: passingTestCases,
          failingTests: failingTestCases,
          codeSnippet: code.length > 100 ? code.substring(0, 100) + '...' : code,
          problemId: problem.id,
          timestamp: new Date().getTime() // Add timestamp to ensure it's treated as a new result
        };
        
        setResults(finalResults);
        setStatusMessage(
          finalResults.summary.success ? 
          'All tests passed! Great job! 🎉' : 
          `${finalResults.summary.passing}/${finalResults.summary.totalTests} tests passed`
        );
        
        resolve(finalResults);
      }, 1500); // Simulate network delay
    });
  };
  
  const generateFakeOutput = (expected) => {
    // Generate a plausible but incorrect output for failed tests
    if (Array.isArray(expected)) {
      // Shuffle or change one element
      const copy = [...expected];
      if (copy.length > 0) {
        const index = Math.floor(Math.random() * copy.length);
        copy[index] = typeof copy[index] === 'number' ? copy[index] + 1 : copy[index];
      }
      return copy;
    } else if (typeof expected === 'number') {
      return expected + (Math.random() > 0.5 ? 1 : -1);
    } else if (typeof expected === 'boolean') {
      return !expected;
    } else {
      return expected;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-gray-50 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <select
            className="border border-gray-300 p-1 rounded text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([key, langInfo]) => (
              <option key={key} value={key}>{langInfo.name}</option>
            ))}
          </select>
        </div>
        <button 
          className={`px-3 py-1 rounded text-sm font-medium text-white
                     ${isRunning 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'}`}
          onClick={executeCode}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
              Running
            </>
          ) : (
            'Run Code'
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={SUPPORTED_LANGUAGES[language]?.monacoId || language}
          value={state.currentCode || getDefaultCode(getProblemById(state.currentProblem?.id), language)}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2
          }}
        />
      </div>
      
      {/* Results section - Only show when there are results */}
      {(results || error || (statusMessage && statusMessage !== 'Running your code...')) && (
        <div className="border-t border-gray-200 p-2 max-h-40 overflow-y-auto bg-gray-50">
          {statusMessage && statusMessage !== 'Running your code...' && (
            <div className={`mb-2 px-3 py-1 rounded ${
              results?.summary?.success ? 'bg-green-100 text-green-800' : 
              error ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          
          {results && (
            <div className="text-xs space-y-2">
              {/* Just show summary for passing tests */}
              {results.passingTests.length > 0 && (
                <div className="p-1.5 bg-green-50 border border-green-100 rounded">
                  <span className="font-medium text-green-700">
                    {results.passingTests.length} passing tests
                  </span>
                </div>
              )}
              
              {/* Show details for failing tests */}
              {results.failingTests.length > 0 && results.failingTests.slice(0, 2).map(test => (
                <div key={test.id} className="p-1.5 bg-red-50 border border-red-100 rounded">
                  <div className="font-medium text-red-700 mb-1">Test #{test.id + 1} failed</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div><span className="font-medium">Expected:</span> {test.expectedOutput}</div>
                    <div><span className="font-medium">Got:</span> {test.actualOutput}</div>
                  </div>
                </div>
              ))}
              
              {/* Optimization hint for two-sum */}
              {results.failingTests.length > 0 && results.summary.usesOptimalSolution === false && (
                <div className="p-1.5 bg-yellow-50 border border-yellow-100 rounded">
                  <span className="font-medium text-yellow-700">
                    Hint: Consider using a HashMap for better performance.
                  </span>
                </div>
              )}
              
              {/* Truncation notice if needed */}
              {results.failingTests.length > 2 && (
                <div className="text-gray-500 text-center text-xs">
                  {results.failingTests.length - 2} more failing tests not shown
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;