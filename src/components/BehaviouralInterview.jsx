import React, { useState, useEffect, useRef } from 'react';
import { Camera, Pause, Play, SkipForward, AlertCircle, Award, FileText } from 'lucide-react';

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

const analyzeResponse = async (videoBlob, question, response) => {
  return {
    clarity: Math.floor(Math.random() * 5) + 1,
    relevance: Math.floor(Math.random() * 5) + 1,
    structure: Math.floor(Math.random() * 5) + 1,
    confidence: Math.floor(Math.random() * 5) + 1,
    feedback: "Your response demonstrated good problem-solving skills. Consider providing more specific examples and quantifiable results to strengthen your answer. Your body language was confident, but try to maintain more consistent eye contact.",
    strengths: ["Clear communication", "Logical structure", "Relevant examples"],
    improvements: ["More specific metrics", "Better eye contact", "More concise introduction"]
  };
};

const BehaviouralInterview = () => {
  const [status, setStatus] = useState('ready');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [results, setResults] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    selectRandomQuestions();
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused && (status === 'prep' || status === 'recording')) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (status === 'prep') startRecording();
            else if (status === 'recording') stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, status, isPaused]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          alert("Could not play webcam preview. Please check permissions.");
        });
      };
    }
  }, [stream, status]);

  const selectRandomQuestions = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 2));
  };

  const checkCameraStatus = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        alert("No camera detected.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Camera check error:", err);
      alert("Error checking camera. Please allow permission.");
      return false;
    }
  };

  const startInterview = async () => {
    try {
      if (stream) stream.getTracks().forEach(track => track.stop());

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true
      });

      setStream(userStream);
      setStatus('prep');
      setTimeRemaining(30);
    } catch (err) {
      console.error("Media error:", err);
      alert("Please allow camera and mic access.");
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const question = selectedQuestions[currentQuestionIndex];
      const analysis = await analyzeResponse(blob, question, null);
      setResults(prev => [...prev, {
        question,
        videoBlob: blob,
        videoUrl: URL.createObjectURL(blob),
        analysis
      }]);

      if (currentQuestionIndex < selectedQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setStatus('prep');
        setTimeRemaining(30);
      } else {
        setStatus('completed');
      }
    };

    recorder.start(1000);
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    setStatus('recording');
    setTimeRemaining(120);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      // Keeping the status as 'recording' until the recorder.onstop callback runs
      // This prevents the UI from flashing in an incorrect state
    }
  };

  const togglePause = () => setIsPaused(prev => !prev);

  const skipToNext = () => {
    if (status === 'prep') {
      clearInterval(timerRef.current);
      startRecording();
    } else if (status === 'recording') {
      clearInterval(timerRef.current);
      stopRecording();
    }
  };

  const resetInterview = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (timerRef.current) clearInterval(timerRef.current);

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

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-full">
          {status === 'ready' && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-bold">Behavioral Interview Simulator</h2>
              <p className="text-center text-gray-700 max-w-md">
                You'll be presented with 2 behavioral interview questions. You'll have 30 seconds to read each question, followed by 2 minutes to answer.
              </p>
              <button
                onClick={async () => {
                  const cameraAvailable = await checkCameraStatus();
                  if (cameraAvailable) startInterview();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Camera className="mr-2" size={20} /> Start Interview
              </button>
            </div>
          )}
          {(status === 'prep' || status === 'recording' || status === 'reviewing') && (
            <div className="w-full max-w-2xl">
              <p className="text-xl font-medium mb-4">{selectedQuestions[currentQuestionIndex]}</p>
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" />
              <div className="mt-2 text-lg font-bold">
                {status === 'recording' && <span className="text-red-600 animate-pulse">● Recording</span>}
                {' '}Time Remaining: {formatTime(timeRemaining)}
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={togglePause} className="bg-gray-200 px-4 py-2 rounded-lg">
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button onClick={skipToNext} className="bg-gray-200 px-4 py-2 rounded-lg">
                  <SkipForward size={20} />
                </button>
              </div>
            </div>
          )}
          {status === 'completed' && (
            <div className="w-full max-w-3xl flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
              {results.map((result, index) => (
                <div key={index} className="mb-6 bg-white p-4 rounded shadow">
                  <h3 className="font-semibold mb-2">Question {index + 1}: {result.question}</h3>
                  <video src={result.videoUrl} controls className="w-full rounded mb-3" />
                  <p><strong>Feedback:</strong> {result.analysis.feedback}</p>
                </div>
              ))}
              <button onClick={resetInterview} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">
                <Camera className="mr-2 inline " size={20} /> Start New Interview
              </button>
            </div>
          )}
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