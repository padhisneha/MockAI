// InterviewSimulator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Pause, Play, SkipForward, AlertCircle, Award, FileText } from 'lucide-react';

// Sample behavioral interview questions
const QUESTIONS = [
  "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?",
  "Describe a situation where you had to meet a tight deadline. What steps did you take to ensure you met the deadline?",
  "Give an example of when you showed leadership qualities in a professional setting.",
  "Tell me about a time when you failed. How did you handle the situation and what did you learn?",
  "Describe a situation where you had to work with limited resources. How did you overcome this challenge?",
  "Give an example of a time when you had to make a difficult decision quickly.",
  "Tell me about a time when you received criticism. How did you respond to it?",
  "Describe a situation where you had to adapt to a significant change at work or school.",
  "Tell me about a time when you went above and beyond for a project or task.",
  "Give an example of a time when you had to resolve a conflict between team members.",
  "Describe a situation where you had to persuade someone to see things your way.",
  "Tell me about a time when you had to learn a new skill quickly. How did you approach it?",
  "Give an example of a time when you had to prioritize multiple tasks. How did you decide what to do first?",
  "Describe a situation where you had to deliver bad news to someone.",
  "Tell me about a time when you had to work with someone with a different working style than yours.",
  "Give an example of a time when you showed initiative.",
  "Describe a situation where you had to solve a complex problem. What was your approach?",
  "Tell me about a time when you had to make a decision without all the information you needed.",
  "Give an example of a time when you had to motivate a team or individual.",
  "Describe a situation where you had to deal with a high-pressure situation.",
  "Tell me about a time when you had to give a presentation or speak in public.",
  "Give an example of a time when you had to work on a project outside your comfort zone.",
  "Describe a situation where you had to handle multiple responsibilities simultaneously.",
  "Tell me about a time when you had to negotiate to get what you wanted.",
  "Give an example of a time when you had to use data to make a decision.",
  "Describe a situation where you had to work with a difficult client or customer.",
  "Tell me about a time when you had to meet challenging goals.",
  "Give an example of a time when you had to be creative to solve a problem.",
  "Describe a situation where you had to build consensus among team members.",
  "Tell me about a time when you had to give difficult feedback to someone."
];

// Groq API utility function (mock implementation)
const analyzeResponse = async (videoBlob, question, response) => {
  try {
    // In a real implementation, you would:
    // 1. Convert video to audio or transcribe it
    // 2. Send the transcription to Groq API for analysis
    
    // Mock response for demonstration
    return {
      clarity: Math.floor(Math.random() * 5) + 1,
      relevance: Math.floor(Math.random() * 5) + 1,
      structure: Math.floor(Math.random() * 5) + 1,
      confidence: Math.floor(Math.random() * 5) + 1,
      feedback: "Your response demonstrated good problem-solving skills. Consider providing more specific examples and quantifiable results to strengthen your answer. Your body language was confident, but try to maintain more consistent eye contact.",
      strengths: ["Clear communication", "Logical structure", "Relevant examples"],
      improvements: ["More specific metrics", "Better eye contact", "More concise introduction"]
    };
  } catch (error) {
    console.error("Error analyzing response:", error);
    return null;
  }
};

const BehaviouralInterview = () => {
  // State variables
  const [status, setStatus] = useState('ready'); // ready, prep, recording, reviewing, completed
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [results, setResults] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Select random questions on mount
  useEffect(() => {
    selectRandomQuestions();
  }, []);

  // Cleanup media streams on unmount
  useEffect(() => {
    // Clean up function to stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isPaused && (status === 'prep' || status === 'recording')) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (status === 'prep') {
              startRecording();
            } else if (status === 'recording') {
              stopRecording();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, status, isPaused]);

  // Select 2 random questions from the question bank
  const selectRandomQuestions = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 2));
  };

  // Check camera status before starting the interview
  const checkCameraStatus = async () => {
    try {
      // Check if we can access the camera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        alert("No camera detected. Please connect a camera and try again.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking camera:", error);
      alert("Unable to check camera status. Please ensure your browser has permission to access media devices.");
      return false;
    }
  };

  // Start the interview process
  const startInterview = async () => {
    try {
      // Stop any existing streams first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Request camera and microphone access with explicit constraints
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      
      // Set the stream
      setStream(userStream);
      
      // Handle the video element
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        
        // Make sure to handle the video playing correctly
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .catch(error => {
              console.error("Error playing video:", error);
              alert("Could not play video. Please check your camera permissions.");
            });
        };
      }
      
      // Continue with the interview flow
      setStatus('prep');
      setTimeRemaining(30);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera and microphone. Please ensure permissions are granted in your browser settings.");
    }
  };

  // Start recording the answer
  const startRecording = () => {
    if (!stream) return;
    
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    
    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const question = selectedQuestions[currentQuestionIndex];
      
      // In a real app, you would analyze the video here
      const analysis = await analyzeResponse(blob, question, null);
      
      setResults(prev => [...prev, {
        question,
        videoBlob: blob,
        videoUrl: URL.createObjectURL(blob),
        analysis
      }]);
      
      // Move to the next question or complete
      if (currentQuestionIndex < selectedQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setStatus('prep');
        setTimeRemaining(30);
      } else {
        setStatus('completed');
      }
    };
    
    recorder.start(1000); // Collect data in 1-second chunks
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    setStatus('recording');
    setTimeRemaining(120); // 2 minutes to answer
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setStatus('reviewing');
    }
  };

  // Pause or resume the timer
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Skip to the next phase
  const skipToNext = () => {
    if (status === 'prep') {
      clearInterval(timerRef.current);
      startRecording();
    } else if (status === 'recording') {
      clearInterval(timerRef.current);
      stopRecording();
    }
  };

  // Reset the interview
  const resetInterview = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setStatus('ready');
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setRecordedChunks([]);
    setMediaRecorder(null);
    setStream(null);
    setResults([]);
    setIsPaused(false);
    selectRandomQuestions();
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render the appropriate screen based on status
  const renderContent = () => {
    switch (status) {
      case 'ready':
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <h2 className="text-2xl font-bold">Behavioral Interview Simulator</h2>
            <p className="text-center text-gray-700 max-w-md">
              You'll be presented with 2 behavioral interview questions. You'll have 30 seconds to read each question, followed by 2 minutes to answer.
            </p>
            <button
              onClick={async () => {
                const cameraAvailable = await checkCameraStatus();
                if (cameraAvailable) {
                  startInterview();
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Camera className="mr-2" size={20} />
              Start Interview
            </button>
          </div>
        );

      case 'prep':
      case 'recording':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 w-full">
            <div className="w-full max-w-2xl bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                {status === 'prep' ? 'Preparation Time' : 'Recording Answer'}
              </h3>
              <p className="text-xl font-medium">
                {selectedQuestions[currentQuestionIndex]}
              </p>
            </div>
            
            <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden relative">
              {/* Fallback message if video isn't displaying */}
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {!stream && <p>Camera access required</p>}
              </div>
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted={status === 'prep'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            
            <div className="flex items-center justify-between w-full max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${timeRemaining < 10 && status === 'recording' ? 'text-red-600' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-gray-600">
                  {status === 'prep' ? 'Reading Time' : 'Answer Time'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePause}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button
                  onClick={skipToNext}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  <SkipForward size={20} />
                </button>
              </div>
            </div>
            
            {status === 'recording' && (
              <div className="flex items-center justify-center">
                <div className="animate-pulse w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span className="text-red-600 font-medium">Recording</span>
              </div>
            )}
          </div>
        );

      case 'reviewing':
        return (
          <div className="flex flex-col items-center justify-center space-y-6 w-full">
            <div className="w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Processing Your Answer...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
              </div>
              <p className="text-gray-600 mt-2">Please wait while we analyze your response...</p>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="flex flex-col items-center justify-center space-y-8 w-full">
            <h2 className="text-2xl font-bold">Interview Complete!</h2>
            
            <div className="w-full max-w-3xl space-y-10">
              {results.map((result, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">Question {index + 1}</h3>
                  <p className="text-gray-800 mb-4 font-medium">{result.question}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Your Response</h4>
                    <video 
                      src={result.videoUrl} 
                      controls 
                      className="w-full rounded-lg mb-4"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Analysis</h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
                      {['Clarity', 'Relevance', 'Structure', 'Confidence'].map((category, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-gray-600 text-sm mb-1">{category}</div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold mr-1">
                              {result.analysis[category.toLowerCase()]}
                            </span>
                            <span className="text-gray-500">/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Feedback</h5>
                      <p className="text-gray-700">{result.analysis.feedback}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h5 className="font-medium mb-2 flex items-center">
                          <Award className="mr-2 text-green-600" size={18} />
                          Strengths
                        </h5>
                        <ul className="list-disc pl-5 text-gray-700">
                          {result.analysis.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2 flex items-center">
                          <AlertCircle className="mr-2 text-amber-600" size={18} />
                          Areas for Improvement
                        </h5>
                        <ul className="list-disc pl-5 text-gray-700">
                          {result.analysis.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={resetInterview}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Camera className="mr-2" size={20} />
                  Start New Interview
                </button>
                
                <button
                  onClick={() => {
                    // In a real app, you would generate and download a PDF report here
                    alert("Report download functionality would be implemented here");
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FileText className="mr-2" size={20} />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-blue-800">Behavioral Interview Simulator</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-full">
          {renderContent()}
        </div>
      </main>
      
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Interview Simulator</p>
        </div>
      </footer>
    </div>
  );
};

export default BehaviouralInterview;