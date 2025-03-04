import Groq from 'groq-sdk';

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Only for frontend, not recommended for production
});

// Keep track of conversation state - in a real app, this should be managed in your application state
const conversationState = {
  hasStarted: false
};

export const generateInterviewerResponse = async (context) => {
  try {
    // Only send the initial greeting if we haven't started the conversation
    const isInitialGreeting = context.lastMessage === 'START_INTERVIEW' && !conversationState.hasStarted;
    
    // Mark conversation as started to prevent duplicate greetings
    if (isInitialGreeting) {
      conversationState.hasStarted = true;
    }

    // Skip generating a response if this is a duplicate START_INTERVIEW message
    if (context.lastMessage === 'START_INTERVIEW' && !isInitialGreeting) {
      return null; // Return null to indicate no message should be sent
    }

    const systemPrompt = isInitialGreeting 
      ? `You are an AI technical interviewer for a software development interview. 
         Provide EXACTLY ONE concise introduction to start the interview.
         Your message must:
         - Start with "Let's get started with the interview."
         - Briefly explain the problem
         - Ask the candidate to implement a solution
         - Mention you'll discuss their approach, complexity, and optimizations
         - Be professional but brief
         
         YOUR RESPONSE WILL BE THE ONLY INITIAL MESSAGE. DO NOT SEND MULTIPLE MESSAGES.`
      : `You are an AI technical interviewer evaluating a candidate's solution.
         Keep your responses concise and focused.
         DO NOT say "I'd be happy to simulate..." or introduce yourself again.
         Instead, directly respond to what the candidate just said with:
         - Specific questions about their approach
         - Brief discussion of time/space complexity
         - Short suggestions for optimizations
         - Direct feedback`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Problem: ${context.problem.title}
          Problem Description: ${context.problem.description}
          Current Code:
          \`\`\`javascript
          ${context.code || 'No code submitted yet'}
          \`\`\`
          Last User Message: ${context.lastMessage}`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 300,
      top_p: 1,
      stop: null,
      stream: false
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    return "I'm having trouble processing your response. Could you elaborate on your approach?";
  }
};

// import Groq from 'groq-sdk';

// // Initialize Groq
// const groq = new Groq({
//   apiKey: process.env.REACT_APP_GROQ_API_KEY,
//   dangerouslyAllowBrowser: true // Only for frontend, not recommended for production
// });

// export const generateInterviewerResponse = async (context) => {
//   try {
//     const response = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are an AI technical interviewer for a software development interview. 
//           Evaluate the candidate's approach to solving the problem. 
//           Your goal is to:
//           - Ask probing questions about their solution
//           - Discuss time and space complexity
//           - Suggest potential optimizations
//           - Provide constructive feedback
//           - Simulate a real technical interview scenario`
//         },
//         {
//           role: "user",
//           content: `Problem: ${context.problem.title}
//           Problem Description: ${context.problem.description}
//           Current Code:
//           \`\`\`javascript
//           ${context.code || 'No code submitted yet'}
//           \`\`\`
//           Last User Message: ${context.lastMessage}`
//         }
//       ],
//       model: "llama3-8b-8192", // You can change this to other available Groq models
//       temperature: 0.7,
//       max_tokens: 300,
//       top_p: 1,
//       stop: null,
//       stream: false
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Groq API Error:", error);
//     return "I'm having trouble processing your response. Could you elaborate on your approach?";
//   }
// };