import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { generateInterviewerResponse } from '../services/groqService';
import { Send, Loader2, Mic, Square, Volume2 } from 'lucide-react';

const ChatInput = () => {
  const { state, dispatch } = useInterview();
  const [isSending, setIsSending] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [testResultsProcessed, setTestResultsProcessed] = useState(false);
  
  // Refs
  const textInputRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastTestResultsRef = useRef(null);
  const aiResponseTimeoutRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    initializeSpeechRecognition();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (aiResponseTimeoutRef.current) {
        clearTimeout(aiResponseTimeoutRef.current);
      }
      stopRecording();
    };
  }, []);
  
  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition;
    speechRecognitionRef.current = new SpeechRecognition();
    speechRecognitionRef.current.continuous = true;
    speechRecognitionRef.current.interimResults = true;
    
    // Configure for efficiency
    speechRecognitionRef.current.lang = 'en-US';
    speechRecognitionRef.current.maxAlternatives = 1;
    
    speechRecognitionRef.current.onresult = (event) => {
      // Get combined transcripts
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Only update if we have content
      if (finalTranscript || interimTranscript) {
        setTranscript(finalTranscript || interimTranscript);
        
        // If we got a final transcript and it's a meaningful length, update the input
        if (finalTranscript && finalTranscript.length > 3) {
          setTextInput(prevInput => {
            const newInput = prevInput ? `${prevInput} ${finalTranscript}` : finalTranscript;
            return newInput;
          });
        }
      }
    };
    
    speechRecognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // This is common and not a critical error
        return;
      }
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };
    
    speechRecognitionRef.current.onend = () => {
      // Only reset recording state if we weren't manually stopping
      if (isRecording) {
        // Try to restart if it stopped unexpectedly
        try {
          speechRecognitionRef.current.start();
        } catch (e) {
          console.error('Could not restart speech recognition:', e);
          setIsRecording(false);
        }
      }
    };
  };
  
  // Start voice recording
  const startRecording = async () => {
    if (!speechRecognitionRef.current) {
      initializeSpeechRecognition();
    }
    
    if (!speechRecognitionRef.current) {
      setError('Speech recognition not available in your browser');
      return;
    }
    
    try {
      // Clear existing transcript
      setTranscript('');
      
      // Start recognition
      speechRecognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not start speech recognition');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (speechRecognitionRef.current && isRecording) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsRecording(false);
    }
  };
  
  // Send initial greeting on first load
  useEffect(() => {
    const shouldSendGreeting = !state.messages || state.messages.length === 0;
    if (shouldSendGreeting) {
      setTimeout(() => sendInitialGreeting(), 800);
    }
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
        const codeIsEmpty = !state.currentCode || state.currentCode.trim().length < 30;
        
        if (codeIsEmpty) {
          promptMessage = "I haven't implemented a solution yet. Can you give me some hints to get started?";
        } else if (testResultSummary.success) {
          promptMessage = `My solution passed all ${totalTests} test cases. Is this optimal? Any improvements?`;
        } else {
          promptMessage = `My solution passed ${passing} out of ${totalTests} test cases. What's wrong with my approach?`;
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
    
    // Don't proceed if empty input or already sending
    if (!textInput.trim() || isSending) return;
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
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
    setTranscript(''); // Clear any transcript
    
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
      
      {/* Speech transcript (only show when recording is active) */}
      {isRecording && transcript && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 max-w-xl mx-auto">
          <div className="flex items-center text-xs text-blue-600 mb-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
            <span>Listening...</span>
          </div>
          <p className="text-sm text-gray-800">{transcript}</p>
        </div>
      )}
      
      {/* Text input form with voice button */}
      <form onSubmit={sendTextInput} className="mb-4 max-w-xl mx-auto">
        <div className="flex rounded-lg overflow-hidden border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="text"
            ref={textInputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type or speak your response..."}
            className="flex-1 p-3 outline-none text-sm"
            disabled={isSending}
          />
          
          {/* Voice recording button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-3 flex items-center justify-center transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            disabled={isSending}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
          </button>
          
          {/* Send button */}
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