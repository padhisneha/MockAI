import React, { useEffect, useState, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Volume2, VolumeX, Pause } from 'lucide-react';

const VideoChat = () => {
  const videoRef = useRef(null);
  const { state } = useInterview();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState(null);
  
  // References to track speech
  const utteranceRef = useRef(null);
  const messageQueueRef = useRef([]);
  const processingQueueRef = useRef(false);
  
  // Initialize webcam
  useEffect(() => {
    const setupWebcam = async () => {
      try {
        const constraints = { 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            aspectRatio: { ideal: 4/3 }
          }, 
          audio: false 
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };
    setupWebcam();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      // Cancel any speech when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Track messages and speak new AI messages
  useEffect(() => {
    const speakNewMessages = () => {
      const messages = state.messages || [];
      
      // Find any new AI messages that haven't been spoken yet
      const newAIMessages = messages.filter(
        msg => msg.role === 'assistant' && 
        (lastSpokenMessageId === null || 
         messages.indexOf(msg) > messages.findIndex(m => m === lastSpokenMessageId))
      );
      
      if (newAIMessages.length > 0) {
        // Add new messages to the queue
        messageQueueRef.current = [
          ...messageQueueRef.current,
          ...newAIMessages
        ];
        
        // Process the queue if not already processing
        if (!processingQueueRef.current) {
          processMessageQueue();
        }
      }
    };
    
    speakNewMessages();
  }, [state.messages, lastSpokenMessageId]);
  
  // Process message queue one at a time
  const processMessageQueue = async () => {
    if (!speechEnabled || messageQueueRef.current.length === 0) {
      processingQueueRef.current = false;
      return;
    }
    
    processingQueueRef.current = true;
    const nextMessage = messageQueueRef.current[0];
    
    // Remove from queue
    messageQueueRef.current = messageQueueRef.current.slice(1);
    
    // Speak the message
    await speakText(nextMessage.content);
    
    // Update last spoken message
    setLastSpokenMessageId(nextMessage);
    
    // Continue processing queue if more messages exist
    if (messageQueueRef.current.length > 0) {
      processMessageQueue();
    } else {
      processingQueueRef.current = false;
    }
  };
  
  // Speech synthesis function
  const speakText = async (text) => {
    return new Promise((resolve) => {
      // If speech is disabled, resolve immediately
      if (!speechEnabled) {
        resolve();
        return;
      }
      
      // Cancel any previous speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      if (!('speechSynthesis' in window)) {
        console.error("Speech synthesis not supported");
        resolve();
        return;
      }
      
      try {
        // Update UI
        setCurrentMessage(text);
        setIsSpeaking(true);
        
        // Create new speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a good voice
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Premium') || 
          voice.name.includes('Daniel') ||
          voice.name.includes('David')
        ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Set properties
        utterance.rate = 1.0;  // Normal speed
        utterance.pitch = 1.05; // Slightly higher
        utterance.volume = 1.0; // Full volume
        
        // Event handlers
        utterance.onstart = () => {
          console.log("Speech started");
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log("Speech ended");
          setIsSpeaking(false);
          setCurrentMessage('');
          resolve();
        };
        
        utterance.onerror = (error) => {
          console.error("Speech error:", error);
          setIsSpeaking(false);
          setCurrentMessage('');
          resolve();
        };
        
        // Speak
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error in speech synthesis:", error);
        setIsSpeaking(false);
        setCurrentMessage('');
        resolve();
      }
    });
  };
  
  // Fix voices in Chrome
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // This forces Chrome to load voices
      speechSynthesis.getVoices();
      
      // Set up event listener for when voices are loaded
      speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        console.log(`Loaded ${voices.length} voices`);
      };
    }
  }, []);
  
  // Toggle speech on/off
  const toggleSpeech = () => {
    if (isSpeaking) {
      // Cancel current speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCurrentMessage('');
    }
    
    // Toggle global speech setting
    setSpeechEnabled(!speechEnabled);
  };
  
  // Pause current speech
  const pauseCurrentSpeech = () => {
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-6 p-4">
      {/* AI Interviewer Panel */}
      <div className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg flex items-center justify-center relative">
  <div className="absolute inset-0 bg-blue-900 opacity-10"></div>
  <div className="flex flex-col items-center justify-center z-10 p-4 text-center w-full">
    {/* Avatar with speaking animation */}
    <div
      className={`w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 ${
        isSpeaking ? 'border-green-400 animate-pulse' : 'border-white border-opacity-30'
      }`}
    >
      <span className="text-white text-2xl font-bold">AI</span>
    </div>

    <div className="bg-black bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full mt-2">
      <p className="text-white font-medium text-xs">
        {isSpeaking ? 'Speaking...' : 'Technical Interviewer'}
      </p>
    </div>

    {/* Current message being spoken */}
    {isSpeaking && currentMessage && (
      <div className="mt-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 w-full max-w-sm mx-auto">
        <div className="max-h-24 overflow-y-auto">
          <p className="text-white text-xs break-words">{currentMessage}</p>
        </div>
      </div>
    )}

    {/* Speech controls */}
    <div className="mt-3 flex space-x-2">
      <button
        onClick={toggleSpeech}
        className={`p-1.5 rounded-full ${speechEnabled ? 'bg-green-500' : 'bg-red-500'} text-white`}
        title={speechEnabled ? 'Mute AI' : 'Unmute AI'}
      >
        {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {isSpeaking && (
        <button
          onClick={pauseCurrentSpeech}
          className="p-1.5 rounded-full bg-yellow-500 text-white"
          title="Stop current speech"
        >
          <Pause size={16} />
        </button>
      )}
    </div>
  </div>
</div>
      
      {/* User Webcam Panel */}
      <div className="flex-1 bg-gray-800 rounded-xl shadow-lg overflow-hidden relative">
        {/* Video container with proper aspect ratio */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background overlay for when webcam isn't active */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0">
            <div className="text-gray-400 text-sm">Loading webcam...</div>
          </div>
          
          {/* Video element with proper sizing to maintain aspect ratio */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute max-w-full max-h-full object-contain z-10"
          />
          
          {/* Status indicator */}
          <div className="absolute bottom-3 right-3 z-20">
            <div className="flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;