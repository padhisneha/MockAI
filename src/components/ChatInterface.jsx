import React, { useState, useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { generateInterviewerResponse } from '../services/groqService';

const ChatInterface = () => {
  const { state, dispatch } = useInterview();
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.interviewMessages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { 
        role: 'user', 
        content: userInput 
      }
    });

    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponse = await generateInterviewerResponse({
        problem: state.currentProblem,
        code: state.currentCode,
        lastMessage: userInput
      });

      // Add AI message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { 
          role: 'assistant', 
          content: aiResponse 
        }
      });
    } catch (error) {
      console.error('Error generating response:', error);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error processing your message.' 
        }
      });
    }

    setUserInput('');
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {state.interviewMessages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 p-3 rounded-lg max-w-[80%] 
              ${message.role === 'user' 
                ? 'bg-blue-100 text-blue-800 ml-auto' 
                : 'bg-gray-200 text-gray-800 mr-auto'}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 p-3 rounded-lg bg-gray-200 text-gray-800">
            AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Discuss your approach with the AI interviewer..."
            className="flex-1 p-2 border rounded-lg"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white 
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;