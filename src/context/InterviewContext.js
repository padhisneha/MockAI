import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentProblem: null,
  interviewMessages: [],
  currentCode: '',
  interviewStatus: 'not_started', // not_started, in_progress, completed
};

// Action types
const SET_PROBLEM = 'SET_PROBLEM';
const ADD_MESSAGE = 'ADD_MESSAGE';
const UPDATE_CODE = 'UPDATE_CODE';
const UPDATE_INTERVIEW_STATUS = 'UPDATE_INTERVIEW_STATUS';

// Reducer
function interviewReducer(state, action) {
  switch (action.type) {
    case 'SET_PROBLEM':
      return { 
        ...state, 
        currentProblem: action.payload,
        currentCode: '' // Reset code when problem changes
      };
    case 'RESET_MESSAGES':
      return {
        ...state,
        interviewMessages: []
      };
    case 'RESET_STATE':
      return initialState;
    case ADD_MESSAGE:
      return { 
        ...state, 
        interviewMessages: [...state.interviewMessages, action.payload] 
      };
    case UPDATE_CODE:
      return { ...state, currentCode: action.payload };
    case UPDATE_INTERVIEW_STATUS:
      return { ...state, interviewStatus: action.payload };
    default:
      return state;
  }
}

// Context
const InterviewContext = createContext();

// Provider Component
export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
};

// Custom hook
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};