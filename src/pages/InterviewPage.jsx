import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import { getProblemById } from '../services/problemService';
import CodeEditor from '../components/CodeEditor';
import VoiceChat from '../components/VoiceChat';
import ProblemDescription from '../components/ProblemDescription';

const InterviewPage = () => {
  const { problemId } = useParams();
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeProblem = () => {
      const problem = getProblemById(problemId);
      if (problem) {
        dispatch({ type: 'SET_PROBLEM', payload: problem });
        dispatch({ type: 'RESET_MESSAGES' });
        dispatch({ type: 'UPDATE_INTERVIEW_STATUS', payload: 'in_progress' });
      } else {
        navigate('/problems');
      }
    };

    initializeProblem();

    return () => {
      dispatch({ type: 'RESET_STATE' });
    };
  }, [problemId, dispatch, navigate]);

  if (!state.currentProblem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 overflow-y-auto">
        <ProblemDescription problem={state.currentProblem} />
        <CodeEditor />
      </div>
      <div className="w-1/2 border-l flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {state.interviewMessages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-100 text-blue-800 ml-auto'
                  : 'bg-gray-200 text-gray-800 mr-auto'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <VoiceChat />
      </div>
    </div>
  );
};

export default InterviewPage;

// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useInterview } from '../context/InterviewContext';
// import { getProblemById } from '../services/problemService';
// import CodeEditor from '../components/CodeEditor';
// import VoiceChat from '../components/VoiceChat';
// import ProblemDescription from '../components/ProblemDescription';

// const InterviewPage = () => {
//   const { problemId } = useParams();
//   const { state, dispatch } = useInterview();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const initializeProblem = () => {
//       const problem = getProblemById(problemId);
//       if (problem) {
//         dispatch({ type: 'SET_PROBLEM', payload: problem });
//         dispatch({ type: 'RESET_MESSAGES' });
//       } else {
//         navigate('/problems');
//       }
//     };

//     initializeProblem();

//     return () => {
//       dispatch({ type: 'RESET_STATE' });
//     };
//   }, [problemId, dispatch, navigate]);

//   if (!state.currentProblem) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <div className="w-1/2 p-4 overflow-y-auto">
//         <ProblemDescription problem={state.currentProblem} />
//         <CodeEditor />
//       </div>
//       <div className="w-1/2 border-l flex flex-col">
//         <div className="flex-1 overflow-y-auto p-4">
//           {state.interviewMessages.map((message, index) => (
//             <div
//               key={index}
//               className={`mb-4 p-3 rounded-lg max-w-[80%] ${
//                 message.role === 'user'
//                   ? 'bg-blue-100 text-blue-800 ml-auto'
//                   : 'bg-gray-200 text-gray-800 mr-auto'
//               }`}
//             >
//               {message.content}
//             </div>
//           ))}
//         </div>
//         <VoiceChat />
//       </div>
//     </div>
//   );
// };

// export default InterviewPage;









// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useInterview } from '../context/InterviewContext';
// import { getProblemById } from '../services/problemService';
// import CodeEditor from '../components/CodeEditor';
// import ChatInterface from '../components/ChatInterface';
// import ProblemDescription from '../components/ProblemDescription';

// const InterviewPage = () => {
//   const { problemId } = useParams();
//   const { state, dispatch } = useInterview();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Reset state when component mounts or problem changes
//     const initializeProblem = () => {
//       const problem = getProblemById(problemId);
//       if (problem) {
//         dispatch({ 
//           type: 'SET_PROBLEM', 
//           payload: problem 
//         });
//         // Reset interview messages
//         dispatch({
//           type: 'RESET_MESSAGES'
//         });
//       } else {
//         // Redirect to problems list if problem not found
//         navigate('/problems');
//       }
//     };

//     initializeProblem();

//     // Cleanup function to reset state when component unmounts
//     return () => {
//       dispatch({ type: 'RESET_STATE' });
//     };
//   }, [problemId, dispatch, navigate]);

//   if (!state.currentProblem) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <div className="w-1/2 p-4 overflow-y-auto">
//         <ProblemDescription problem={state.currentProblem} />
//         <CodeEditor />
//       </div>
//       <div className="w-1/2 border-l">
//         <ChatInterface />
//       </div>
//     </div>
//   );
// };

// export default InterviewPage;