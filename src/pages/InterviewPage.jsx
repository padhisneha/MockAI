import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { getProblemById } from '../services/problemService';
import CodeEditor from '../components/CodeEditor';
import ChatInput from '../components/ChatInput';
import ProblemDescription from '../components/ProblemDescription';
import VideoChat from '../components/VideoChat';

// Array of different feedback options
const INTERVIEW_FEEDBACK = [
  {
    rating: 4.2,
    summary: "Strong problem-solving approach with good communication",
    strengths: ["Clear explanation of thought process", "Efficient solution approach", "Good code organization"],
    improvements: ["Consider discussing time complexity more explicitly", "Could explore edge cases further"],
    details: "You demonstrated strong technical skills and methodical problem-solving. Your approach was structured and you communicated your thought process well. The solution was implemented efficiently with good attention to coding standards. For future interviews, try to be more explicit about the time and space complexity analysis, and dedicate more time to exploring potential edge cases."
  },
  {
    rating: 3.8,
    summary: "Good technical foundation with areas to improve in explanation",
    strengths: ["Correct solution implementation", "Handled feedback well", "Good knowledge of data structures"],
    improvements: ["Work on explaining approach before coding", "More verbal communication throughout"],
    details: "Your technical skills are solid and you implemented a working solution. You showed good knowledge of relevant data structures and algorithms. To improve, focus on articulating your approach clearly before diving into code. Some interviewers will want to hear your thought process verbalized step by step, even if your code is correct."
  },
  {
    rating: 4.5,
    summary: "Excellent communication with strong problem-solving skills",
    strengths: ["Very clear explanations", "Optimized solution", "Excellent handling of edge cases"],
    improvements: ["Initial approach could be more efficient", "Consider more test cases"],
    details: "You excelled in this interview with exceptional communication skills and strong problem-solving abilities. You explained your thought process clearly and arrived at an optimized solution. Your handling of edge cases was thorough. For even better performance, try to identify the most efficient approach faster and consider a broader range of test cases to validate your solution."
  },
  {
    rating: 3.5,
    summary: "Correct solution with room for improvement in approach",
    strengths: ["Reached a working solution", "Good coding style", "Asked clarifying questions"],
    improvements: ["Consider alternative algorithms", "More systematic debugging", "Improve time management"],
    details: "You successfully solved the problem with a working implementation and demonstrated good coding practices. Your questions showed good understanding of the problem requirements. To improve, explore multiple possible algorithms before deciding on an approach, practice more systematic debugging techniques, and manage your time to ensure you can fully complete and test your solution."
  },
  {
    rating: 4.0,
    summary: "Strong technical skills with methodical approach",
    strengths: ["Well-structured code", "Good algorithm selection", "Clear variable naming"],
    improvements: ["Explain trade-offs between approaches", "More confidence in communication"],
    details: "You demonstrated strong technical skills with a methodical approach to the problem. Your code was well-structured with appropriate algorithm selection and clear variable naming. To further improve, practice articulating the trade-offs between different approaches and work on your confidence when communicating complex ideas. Overall, this was a solid performance that would likely advance you in many interview processes."
  }
];

const InterviewPage = () => {
  const { problemId } = useParams();
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'transcript'
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const initializeProblem = () => {
      setLoading(true);
      try {
        const problem = getProblemById(problemId);
        if (problem) {
          dispatch({ type: 'SET_PROBLEM', payload: problem });
          dispatch({ type: 'RESET_MESSAGES' });
          dispatch({ type: 'UPDATE_INTERVIEW_STATUS', payload: 'in_progress' });
          setError(null);
        } else {
          setError('Problem not found');
          setTimeout(() => navigate('/problems'), 2000);
        }
      } catch (err) {
        setError(`Error loading problem: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeProblem();

    return () => {
      dispatch({ type: 'RESET_STATE' });
    };
  }, [problemId, dispatch, navigate]);

  const handleExitInterview = () => {
    // Select a random feedback from the array
    const randomFeedback = INTERVIEW_FEEDBACK[Math.floor(Math.random() * INTERVIEW_FEEDBACK.length)];
    setFeedback(randomFeedback);
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    navigate('/problems');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-6">Redirecting you to the problems page...</p>
          <button
            onClick={() => navigate('/problems')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Problems
          </button>
        </div>
      </div>
    );
  }

  if (!state.currentProblem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Header with problem info */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-3 px-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{state.currentProblem.title}</h1>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  state.currentProblem.difficulty === 'Easy' ? 'bg-green-700' :
                  state.currentProblem.difficulty === 'Medium' ? 'bg-yellow-600' :
                  'bg-red-700'
                }`}>
                  {state.currentProblem.difficulty}
                </span>
                <span className="text-sm ml-3 text-blue-100">
                  Interview in progress
                </span>
              </div>
            </div>
            <button
              onClick={handleExitInterview}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Exit Interview
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left panel - Problem and Code */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-white rounded-lg shadow-md">
          {/* Tabs for Problem and Code Editor */}
          <div className="flex border-b border-gray-200">
            <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">
              Problem & Code
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Problem Description Section - Fixed size */}
            <div className="h-2/5 flex flex-col overflow-hidden border-b border-gray-200">
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex-none">
                <h2 className="text-lg font-medium text-gray-800">Problem Description</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ProblemDescription problem={state.currentProblem} />
              </div>
            </div>
            
            {/* Code Editor Section - Fixed size */}
            <div className="h-3/5 flex flex-col overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex-none">
                <h2 className="text-lg font-medium text-gray-800">Code Editor</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Video and Transcript with tabs */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-white rounded-lg shadow-md">
          {/* Tabs for Interview - Video and Transcript */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'video' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('video')}
            >
              Video
            </button>
            <button 
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'transcript' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('transcript')}
            >
              Transcript
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Video Chat Section - Only show when on video tab */}
            {activeTab === 'video' && (
              <div className="flex-1 overflow-hidden">
                <VideoChat />
              </div>
            )}
            
            {/* Transcript Section - Only show when on transcript tab */}
            {activeTab === 'transcript' && (
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Interview Transcript</h3>
                <div className="space-y-3">
                  {state.messages && state.messages.length > 0 ? (
                    state.messages.map((message, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        message.role === 'assistant' 
                          ? 'bg-blue-50 border border-blue-100 text-gray-800' 
                          : message.role === 'system'
                          ? 'bg-yellow-50 border border-yellow-100 text-gray-800'
                          : 'bg-gray-100 border border-gray-200 text-gray-800 ml-auto'
                      } ${message.role === 'assistant' ? 'max-w-[85%]' : 'max-w-[75%] ml-auto'}`}>
                        {message.role === 'system' && (
                          <div className="text-xs text-yellow-600 mb-1">System Message</div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No messages yet. Begin the interview by typing in the box below.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Chat Input - Always show at bottom */}
            <div className="flex-none">
              <ChatInput />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-800">Interview Feedback</h2>
                <div className="flex items-center">
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <span className="font-bold text-lg">{feedback.rating}</span>
                    <span className="ml-1">/5</span>
                  </div>
                </div>
              </div>

              <p className="text-lg font-medium mt-4 text-gray-700">{feedback.summary}</p>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-2">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Detailed Feedback</h3>
                <p className="text-gray-700">{feedback.details}</p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCloseFeedback}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Return to Problems
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;