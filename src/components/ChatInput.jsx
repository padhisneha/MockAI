import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { generateInterviewerResponse } from '../services/groqService';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = () => {
  const { state, dispatch } = useInterview();
  const [isSending, setIsSending] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);
  const [testResultsProcessed, setTestResultsProcessed] = useState(false);
  const textInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastTestResultsRef = useRef(null);
  const aiResponseTimeoutRef = useRef(null);
  
  // Send initial greeting on first load
  useEffect(() => {
    const shouldSendGreeting = !state.messages || state.messages.length === 0;
    if (shouldSendGreeting) {
      setTimeout(() => sendInitialGreeting(), 800);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (aiResponseTimeoutRef.current) {
        clearTimeout(aiResponseTimeoutRef.current);
      }
    };
  }, []);
  
  // Monitor test results and trigger AI response with debounce
  useEffect(() => {
    // Function to handle test results with debouncing
    const handleTestResults = () => {
      // Clear any existing timeout
      if (aiResponseTimeoutRef.current) {
        clearTimeout(aiResponseTimeoutRef.current);
      }
      
      // Check if we have new test results that haven't been processed
      if (state.testResults && 
          (!lastTestResultsRef.current || 
           JSON.stringify(lastTestResultsRef.current) !== JSON.stringify(state.testResults)) &&
          !testResultsProcessed) {
        
        // Store the current test results to avoid duplicate processing
        lastTestResultsRef.current = state.testResults;
        setTestResultsProcessed(true);
        
        // Set a timeout to request AI feedback (give time for UI to update)
        aiResponseTimeoutRef.current = setTimeout(() => {
          requestAIFeedback();
          // Reset the processed flag after a delay to allow for new test results
          setTimeout(() => setTestResultsProcessed(false), 5000);
        }, 1000); // Delay for 1 second
      }
    };
    
    handleTestResults();
  }, [state.testResults]);

  const sendInitialGreeting = async () => {
    try {
      setIsSending(true);
      
      // Check if problem is loaded
      if (!state.currentProblem) {
        console.log("Waiting for problem to load before sending greeting");
        timeoutRef.current = setTimeout(sendInitialGreeting, 1000);
        return;
      }
      
      const greeting = await generateInterviewerResponse({
        problem: state.currentProblem,
        code: state.currentCode || '',
        lastMessage: 'START_INTERVIEW'
      });

      if (greeting) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            role: 'assistant',
            content: greeting
          }
        });
      }
    } catch (error) {
      console.error('Error generating initial greeting:', error);
      setError("Couldn't connect to the interview service. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };
  
  // Request AI feedback on code and test results
  const requestAIFeedback = async () => {
    if (isSending) return; // Prevent multiple simultaneous requests
    
    setIsSending(true);
    setError(null);
    
    try {
      console.log("Requesting AI feedback on test results...");
      
      // Set up a timeout to avoid hanging forever
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error("Request timed out. The interview service is taking too long to respond."));
        }, 15000);
      });
      
      // Generate a message specifically about the code results
      const testResultSummary = state.testResults?.summary;
      let promptMessage = "Can you review my code and test results?";
      
      if (testResultSummary) {
        const totalTests = testResultSummary.totalTests;
        const passing = testResultSummary.passing;
        const problemId = state.testResults.problemId;
        
        if (testResultSummary.success) {
          promptMessage = `My solution for the ${problemId} problem passed all ${totalTests} test cases. Is this optimal? Any improvements?`;
        } else {
          promptMessage = `My solution for the ${problemId} problem passed ${passing} out of ${totalTests} test cases. What's wrong with my approach?`;
        }
      }
      
      // Race the API call against the timeout
      const aiResponse = await Promise.race([
        generateInterviewerResponse({
          problem: state.currentProblem,
          code: state.currentCode || '',
          lastMessage: promptMessage,
          testResults: state.testResults
        }),
        timeoutPromise
      ]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (aiResponse) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            role: 'assistant',
            content: aiResponse
          }
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError(error.message || "Couldn't connect to the interview service. Please try again.");
      
      // Add a system message about the error
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'system',
          content: "There was an issue connecting to the interview service. Please try again in a moment."
        }
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const sendTextInput = async (event) => {
    if (event) event.preventDefault();
    
    if (!textInput.trim() || isSending) return;
    
    setIsSending(true);
    setError(null);
    
    // Add user's message to the chat
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        role: 'user',
        content: textInput
      }
    });
    
    const userMessage = textInput;
    setTextInput(''); // Clear input right away
    
    try {
      // Set up a timeout to avoid hanging forever
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error("Request timed out. The interview service is taking too long to respond."));
        }, 15000); // 15 second timeout
      });
      
      // Race the API call against the timeout
      const aiResponse = await Promise.race([
        generateInterviewerResponse({
          problem: state.currentProblem,
          code: state.currentCode || '',
          lastMessage: userMessage,
          testResults: state.testResults // Include test results if available
        }),
        timeoutPromise
      ]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (aiResponse) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            role: 'assistant',
            content: aiResponse
          }
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError(error.message || "Couldn't connect to the interview service. Please try again.");
      
      // Add a system message about the error
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'system',
          content: "There was an issue connecting to the interview service. Please try again in a moment."
        }
      });
    } finally {
      setIsSending(false);
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }
  };

  return (
    <div className="bg-white p-5 border-t border-gray-200 rounded-b-lg">
      {/* Error message if any */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-center max-w-md mx-auto">
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs text-blue-600 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Text input form */}
      <form onSubmit={sendTextInput} className="mb-4 max-w-xl mx-auto">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="text"
            ref={textInputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your response here..."
            className="flex-1 p-3 outline-none text-sm"
            disabled={isSending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isSending}
            className={`px-4 flex items-center justify-center transition-colors ${
              !textInput.trim() || isSending 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
      
      {/* Status indicator */}
      {isSending && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            <Loader2 size={12} className="animate-spin mr-2" />
            <span>AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;