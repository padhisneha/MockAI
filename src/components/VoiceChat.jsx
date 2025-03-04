import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { generateInterviewerResponse } from '../services/groqService';
import { Mic, Square, Volume2, Send } from 'lucide-react';

const VoiceChat = () => {
  const { state, dispatch } = useInterview();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    initializeSpeechRecognition();

    // Initial AI greeting
    sendInitialGreeting();
  }, []);

  const initializeSpeechRecognition = () => {
    if (window.webkitSpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      
      speechRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };
    }
  };

  const sendInitialGreeting = async () => {
    try {
      const greeting = await generateInterviewerResponse({
        problem: state.currentProblem,
        code: state.currentCode,
        lastMessage: 'START_INTERVIEW'
      });

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'assistant',
          content: greeting
        }
      });

      // Convert greeting to speech
      speakText(greeting);
    } catch (error) {
      console.error('Error generating initial greeting:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    }
  };

  const sendRecordedAudio = async () => {
    if (!audioBlob) return;
    
    setIsSending(true);
    
    // Add user's message to the chat
    if (transcript) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'user',
          content: transcript
        }
      });
    }

    try {
      const aiResponse = await generateInterviewerResponse({
        problem: state.currentProblem,
        code: state.currentCode,
        lastMessage: transcript || 'Recorded audio'
      });

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          role: 'assistant',
          content: aiResponse
        }
      });

      // Convert AI response to speech
      speakText(aiResponse);
      
      // Reset after sending
      setAudioBlob(null);
      setTranscript('');
      setIsSending(false);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsSending(false);
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mb-4">
        {transcript && audioBlob && !isRecording && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={isSending}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </button>
          
          {audioBlob && !isRecording && (
            <>
              <button
                onClick={() => {
                  const audio = new Audio(URL.createObjectURL(audioBlob));
                  audio.play();
                }}
                className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                disabled={isSending}
              >
                <Volume2 size={24} />
              </button>
              
              <button
                onClick={sendRecordedAudio}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
                disabled={isSending}
              >
                <Send size={24} />
              </button>
            </>
          )}
        </div>
        
        {isSending && (
          <div className="mt-4 text-center">
            <div className="animate-pulse">Sending your response...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;

// import React, { useState, useEffect, useRef } from 'react';
// import { useInterview } from '../context/InterviewContext';
// import { generateInterviewerResponse } from '../services/groqService';
// import { Mic, Square, Volume2, CheckCircle, XCircle, Send } from 'lucide-react';

// const VoiceChat = () => {
//   const { state, dispatch } = useInterview();
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const speechRecognitionRef = useRef(null);

//   useEffect(() => {
//     // Initialize Web Speech API
//     initializeSpeechRecognition();

//     // Initial AI greeting
//     sendInitialGreeting();
//   }, []);

//   const initializeSpeechRecognition = () => {
//     if (window.webkitSpeechRecognition) {
//       const SpeechRecognition = window.webkitSpeechRecognition;
//       speechRecognitionRef.current = new SpeechRecognition();
//       speechRecognitionRef.current.continuous = true;
//       speechRecognitionRef.current.interimResults = true;
      
//       speechRecognitionRef.current.onresult = (event) => {
//         let finalTranscript = '';
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             finalTranscript += event.results[i][0].transcript;
//           }
//         }
//         if (finalTranscript) {
//           setTranscript(finalTranscript);
//         }
//       };
//     }
//   };

//   const sendInitialGreeting = async () => {
//     try {
//       const greeting = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: 'START_INTERVIEW'
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: greeting
//         }
//       });

//       // Convert greeting to speech
//       speakText(greeting);
//     } catch (error) {
//       console.error('Error generating initial greeting:', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       chunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         chunksRef.current.push(event.data);
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         setAudioBlob(audioBlob);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
      
//       // Start speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.start();
//       }
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
      
//       // Stop speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.stop();
//       }
//     }
//   };

//   const sendRecordedAudio = async () => {
//     if (!audioBlob) return;
    
//     setIsSending(true);
    
//     // Add user's message to the chat
//     if (transcript) {
//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'user',
//           content: transcript
//         }
//       });
//     }

//     try {
//       const aiResponse = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: transcript || 'Recorded audio'
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: aiResponse
//         }
//       });

//       // Convert AI response to speech
//       speakText(aiResponse);
      
//       // Reset after sending
//       setAudioBlob(null);
//       setTranscript('');
//       setIsSending(false);
//     } catch (error) {
//       console.error('Error generating AI response:', error);
//       setIsSending(false);
//     }
//   };

//   const endInterview = () => {
//     dispatch({ type: 'UPDATE_INTERVIEW_STATUS', payload: 'completed' });
//     // Navigate to the interview analytics page
//   };

//   const speakText = (text) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setIsPlaying(true);
//     utterance.onend = () => setIsPlaying(false);
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <div className="w-full max-w-2xl mb-4">
//         {transcript && audioBlob && !isRecording && (
//           <div className="mb-4 p-3 bg-gray-100 rounded-lg">
//             <p className="text-gray-800">{transcript}</p>
//           </div>
//         )}
        
//         <div className="flex justify-center space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`p-4 rounded-full ${
//               isRecording 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-blue-500 hover:bg-blue-600'
//             } text-white`}
//             disabled={isSending}
//           >
//             {isRecording ? <Square size={24} /> : <Mic size={24} />}
//           </button>
          
//           {audioBlob && !isRecording && (
//             <>
//               <button
//                 onClick={() => {
//                   const audio = new Audio(URL.createObjectURL(audioBlob));
//                   audio.play();
//                 }}
//                 className="p-4 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
//                 disabled={isSending}
//               >
//                 <Volume2 size={24} />
//               </button>
              
//               <button
//                 onClick={sendRecordedAudio}
//                 className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
//                 disabled={isSending}
//               >
//                 <Send size={24} />
//               </button>
//             </>
//           )}
          
//           <button
//             onClick={endInterview}
//             className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
//             disabled={isSending}
//           >
//             <XCircle size={24} />
//           </button>
//         </div>
        
//         {isSending && (
//           <div className="mt-4 text-center">
//             <div className="animate-pulse">Sending your response...</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VoiceChat;

// import React, { useState, useEffect, useRef } from 'react';
// import { useInterview } from '../context/InterviewContext';
// import { generateInterviewerResponse } from '../services/groqService';
// import { Mic, Square, Volume2, CheckCircle, XCircle } from 'lucide-react';

// const VoiceChat = () => {
//   const { state, dispatch } = useInterview();
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const speechRecognitionRef = useRef(null);

//   useEffect(() => {
//     // Initialize Web Speech API
//     initializeSpeechRecognition();

//     // Initial AI greeting
//     sendInitialGreeting();
//   }, []);

//   const initializeSpeechRecognition = () => {
//     if (window.webkitSpeechRecognition) {
//       const SpeechRecognition = window.webkitSpeechRecognition;
//       speechRecognitionRef.current = new SpeechRecognition();
//       speechRecognitionRef.current.continuous = true;
//       speechRecognitionRef.current.interimResults = true;
      
//       speechRecognitionRef.current.onresult = (event) => {
//         let finalTranscript = '';
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             finalTranscript += event.results[i][0].transcript;
//           }
//         }
//         if (finalTranscript) {
//           setTranscript(finalTranscript);
//         }
//       };
//     }
//   };

//   const sendInitialGreeting = async () => {
//     try {
//       const greeting = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: 'START_INTERVIEW'
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: greeting
//         }
//       });

//       // Convert greeting to speech
//       speakText(greeting);
//     } catch (error) {
//       console.error('Error generating initial greeting:', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       chunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         chunksRef.current.push(event.data);
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         setAudioBlob(audioBlob);
//         setIsSending(true);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
      
//       // Start speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.start();
//       }
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
      
//       // Stop speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.stop();
//       }
//     }
//   };

//   const sendRecordedAudio = async () => {
//     setIsSending(false);

//     try {
//       const aiResponse = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: 'Recorded audio'
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: aiResponse
//         }
//       });

//       // Convert AI response to speech
//       speakText(aiResponse);
//     } catch (error) {
//       console.error('Error generating AI response:', error);
//     }
//   };

//   const endInterview = () => {
//     dispatch({ type: 'UPDATE_INTERVIEW_STATUS', payload: 'completed' });
//     // Navigate to the interview analytics page
//   };

//   const speakText = (text) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setIsPlaying(true);
//     utterance.onend = () => setIsPlaying(false);
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <div className="w-full max-w-2xl mb-4">
//         <div className="flex justify-center space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`p-4 rounded-full ${
//               isRecording 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-blue-500 hover:bg-blue-600'
//             } text-white`}
//           >
//             {isRecording ? <Square size={24} /> : <Mic size={24} />}
//           </button>
//           {audioBlob && isSending && (
//             <button
//               onClick={sendRecordedAudio}
//               className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
//             >
//               <CheckCircle size={24} />
//             </button>
//           )}
//           {audioBlob && !isSending && (
//             <button
//               onClick={() => {
//                 const audio = new Audio(URL.createObjectURL(audioBlob));
//                 audio.play();
//               }}
//               className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
//             >
//               <Volume2 size={24} />
//             </button>
//           )}
//           <button
//             onClick={endInterview}
//             className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white"
//           >
//             <XCircle size={24} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VoiceChat;

// import React, { useState, useEffect, useRef } from 'react';
// import { useInterview } from '../context/InterviewContext';
// import { generateInterviewerResponse } from '../services/groqService';
// import { Mic, Square, Volume2 } from 'lucide-react';

// const VoiceChat = () => {
//   const { state, dispatch } = useInterview();
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const speechRecognitionRef = useRef(null);

//   useEffect(() => {
//     // Initialize Web Speech API
//     if (window.webkitSpeechRecognition) {
//       const SpeechRecognition = window.webkitSpeechRecognition;
//       speechRecognitionRef.current = new SpeechRecognition();
//       speechRecognitionRef.current.continuous = true;
//       speechRecognitionRef.current.interimResults = true;
      
//       speechRecognitionRef.current.onresult = (event) => {
//         let finalTranscript = '';
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           if (event.results[i].isFinal) {
//             finalTranscript += event.results[i][0].transcript;
//           }
//         }
//         if (finalTranscript) {
//           setTranscript(finalTranscript);
//         }
//       };
//     }

//     // Initial AI greeting when interview starts
//     if (state.interviewMessages.length === 0) {
//       sendInitialGreeting();
//     }
//   }, []);

//   const sendInitialGreeting = async () => {
//     try {
//       const greeting = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: 'START_INTERVIEW'
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: greeting
//         }
//       });

//       // Convert greeting to speech
//       speakText(greeting);
//     } catch (error) {
//       console.error('Error generating initial greeting:', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       chunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         chunksRef.current.push(event.data);
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         setAudioBlob(audioBlob);
        
//         // If we have a transcript, send it to the AI
//         if (transcript) {
//           await sendMessageToAI(transcript);
//           setTranscript('');
//         }
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
      
//       // Start speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.start();
//       }
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
      
//       // Stop speech recognition
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.stop();
//       }
//     }
//   };

//   const sendMessageToAI = async (message) => {
//     dispatch({
//       type: 'ADD_MESSAGE',
//       payload: {
//         role: 'user',
//         content: message
//       }
//     });

//     try {
//       const aiResponse = await generateInterviewerResponse({
//         problem: state.currentProblem,
//         code: state.currentCode,
//         lastMessage: message
//       });

//       dispatch({
//         type: 'ADD_MESSAGE',
//         payload: {
//           role: 'assistant',
//           content: aiResponse
//         }
//       });

//       // Convert AI response to speech
//       speakText(aiResponse);
//     } catch (error) {
//       console.error('Error generating AI response:', error);
//     }
//   };

//   const speakText = (text) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setIsPlaying(true);
//     utterance.onend = () => setIsPlaying(false);
//     window.speechSynthesis.speak(utterance);
//   };

//   return (
//     <div className="flex flex-col items-center p-4">
//       <div className="w-full max-w-2xl mb-4">
//         <div className="flex justify-center space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`p-4 rounded-full ${
//               isRecording 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-blue-500 hover:bg-blue-600'
//             } text-white`}
//           >
//             {isRecording ? <Square size={24} /> : <Mic size={24} />}
//           </button>
//           {audioBlob && (
//             <button
//               onClick={() => {
//                 const audio = new Audio(URL.createObjectURL(audioBlob));
//                 audio.play();
//               }}
//               className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white"
//             >
//               <Volume2 size={24} />
//             </button>
//           )}
//         </div>
//         {transcript && (
//           <div className="mt-4 p-4 bg-gray-100 rounded-lg">
//             <p className="text-gray-700">{transcript}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VoiceChat;