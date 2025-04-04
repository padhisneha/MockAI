import React, { createContext, useReducer, useContext } from 'react';

// Default initial state
const initialState = {
  currentProblem: null,
  currentCode: '',
  messages: [], // Ensure this is initialized as an empty array
  interviewStatus: 'not_started', // 'not_started', 'in_progress', 'completed'
  testResults: null // Store code execution results
};

// Create the context
const InterviewContext = createContext();

// Reducer function
const interviewReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROBLEM':
      return {
        ...state,
        currentProblem: action.payload
      };
    case 'UPDATE_CODE':
      return {
        ...state,
        currentCode: action.payload
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'UPDATE_INTERVIEW_STATUS':
      return {
        ...state,
        interviewStatus: action.payload
      };
    case 'RESET_MESSAGES':
      return {
        ...state,
        messages: []
      };
    case 'SET_TEST_RESULTS':
      return {
        ...state,
        testResults: action.payload
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Context provider
export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);
  
  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
};

// Custom hook to use the context
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};