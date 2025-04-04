import Groq from 'groq-sdk';

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Only for frontend, not recommended for production
});

// Maintain conversation state
let conversationState = {
  hasStarted: false,
  previousMessages: [],
  retryCount: 0
};

// Example responses for when API is unavailable/rate-limited
const FALLBACK_RESPONSES = {
  greeting: "Let's get started with the interview. I'll be asking you about the problem you're trying to solve. Can you walk me through your approach to solving this problem?",
  codeFeedback: {
    'two-sum': {
      nestedLoops: "I see you've implemented a solution using nested loops with O(n²) time complexity. That's a working approach, but not optimal. Have you considered using a HashMap to reduce the time complexity to O(n)?",
      hashMap: "Great job using a HashMap approach! This gives you O(n) time complexity which is optimal for this problem. Can you explain how your solution works?",
      partial: "Your solution passes some test cases but not all of them. It looks like you're on the right track with the HashMap approach, but there might be an edge case you're missing. Can you walk me through your logic?"
    },
    'palindrome-number': {
      success: "Your solution for checking if a number is a palindrome works correctly! There are a few approaches to this problem - can you explain your thought process?",
      failure: "Your solution for the palindrome problem doesn't pass all test cases. Remember that we're checking if a number reads the same forward and backward. How would you handle negative numbers or edge cases?"
    },
    default: "I see you've run your code and got some test results. Can you explain your approach and what you think about the results?"
  },
  fallback: "That's an interesting approach. Could you explain more about how you're handling edge cases in your solution?"
};

// Reset conversation (useful for starting new interviews)
export const resetConversation = () => {
  conversationState = {
    hasStarted: false,
    previousMessages: [],
    retryCount: 0
  };
};

/**
 * Generate interviewer response using Groq API
 */
export const generateInterviewerResponse = async (context) => {
  // Flag for initial greeting
  const isInitialGreeting = context.lastMessage === 'START_INTERVIEW' && !conversationState.hasStarted;
  
  // If it's a greeting, mark conversation as started
  if (isInitialGreeting) {
    conversationState.hasStarted = true;
    conversationState.previousMessages = [];
  }
  
  // Skip duplicate greeting requests
  if (context.lastMessage === 'START_INTERVIEW' && !isInitialGreeting) {
    return null;
  }
  
  try {
    // Check if this is about test results
    const hasTestResults = context.testResults !== undefined && context.testResults !== null;
    
    // Determine message type based on content
    const isDiscussingCode = context.code && (
      hasTestResults ||
      context.lastMessage.toLowerCase().includes('solution') ||
      context.lastMessage.toLowerCase().includes('code') ||
      context.lastMessage.toLowerCase().includes('approach') ||
      context.lastMessage.toLowerCase().includes('algorithm') ||
      context.lastMessage.toLowerCase().includes('implementat')
    );
    
    // Find keywords about algorithmic concepts
    const mentionsOptimization = context.lastMessage.toLowerCase().includes('optimize') || 
                                 context.lastMessage.toLowerCase().includes('better') ||
                                 context.lastMessage.toLowerCase().includes('faster') ||
                                 context.lastMessage.toLowerCase().includes('complexity');
    
    // If we have test results and API issues, provide appropriate fallback
    if (hasTestResults && conversationState.retryCount > 0) {
      const problemId = context.problem.id;
      
      if (problemId === 'two-sum') {
        if (context.testResults.summary.usesOptimalSolution === false) {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].nestedLoops;
        } else if (context.testResults.summary.success) {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].hashMap;
        } else {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].partial;
        }
      } else if (problemId === 'palindrome-number') {
        return context.testResults.summary.success ? 
          FALLBACK_RESPONSES.codeFeedback['palindrome-number'].success : 
          FALLBACK_RESPONSES.codeFeedback['palindrome-number'].failure;
      } else {
        return FALLBACK_RESPONSES.codeFeedback.default;
      }
    }
    
    // Build system prompt based on context
    let systemPrompt;
    
    if (isInitialGreeting) {
      systemPrompt = `You are an AI technical interviewer conducting a coding interview.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        Provide a brief, friendly introduction to start the interview. Your response should:
        1. Be 3-4 sentences long
        2. Start with "Let's get started with the interview"
        3. Briefly mention the problem
        4. Ask the candidate to share their initial thoughts
        5. Sound conversational and encouraging`;
    }
    else if (hasTestResults) {
      // They've run their code and gotten test results
      systemPrompt = `You are an experienced technical interviewer evaluating a candidate's code test results.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        TEST RESULTS:
        Total Tests: ${context.testResults.summary.totalTests}
        Passing Tests: ${context.testResults.summary.passing}
        Failing Tests: ${context.testResults.summary.failing}
        
        CANDIDATE'S CODE:
        \`\`\`
        ${context.testResults.codeSnippet || context.code || 'No code available'}
        \`\`\`
        
        ${context.testResults.summary.usesOptimalSolution === false ? 
          'The candidate is using nested loops which is O(n²) time complexity. You should suggest using a HashMap for O(n) time complexity.' : 
          ''}
        
        ${context.testResults.failingTests.length > 0 ?
          `One of the failing tests has:
          Input: ${context.testResults.failingTests[0].input}
          Expected: ${context.testResults.failingTests[0].expectedOutput}
          Actual: ${context.testResults.failingTests[0].actualOutput}` : 
          ''}
        
        Your response must:
        1. Be 3-4 sentences only
        2. Provide feedback on their code based on the test results
        3. Be encouraging but highlight areas for improvement
        4. Ask a follow-up question that will help them understand the problem better
        5. Sound like a real human interviewer speaking conversationally`;
    }
    else if (isDiscussingCode) {
      // They're talking about their code approach
      systemPrompt = `You are an experienced technical interviewer evaluating a candidate's code.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        CANDIDATE'S CODE:
        \`\`\`
        ${context.code || 'No code submitted yet'}
        \`\`\`
        
        CANDIDATE'S LAST MESSAGE:
        "${context.lastMessage}"
        
        ${mentionsOptimization ? 'The candidate is asking about optimization. Suggest using a HashMap/Dictionary approach for better time complexity.' : ''}
        
        Your response must:
        1. Be 3-4 sentences only
        2. Evaluate their algorithm's time and space complexity
        3. If they used nested loops for the two-sum problem, suggest using a HashMap for O(n) time complexity
        4. Be constructive, specific, and actionable
        5. Sound like a real human interviewer speaking conversationally`;
    }
    else {
      // General conversation
      systemPrompt = `You are an experienced technical interviewer having a conversation with a candidate.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        CANDIDATE'S LAST MESSAGE:
        "${context.lastMessage}"
        
        Your response must:
        1. Be 3-4 sentences only
        2. Be specific to what the candidate just said
        3. Ask 1 thoughtful follow-up question
        4. Sound like a real human interviewer having a conversation
        5. Avoid excessive formality or robot-like responses`;
    }
    
    // Build conversation history
    const conversationHistory = [
      ...conversationState.previousMessages,
      { role: "user", content: context.lastMessage }
    ];
    
    // Prepare the API call
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];
    
    // Call the Groq API
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 300,
      top_p: 1,
      stop: null,
      stream: false
    });
    
    // Extract the response
    const aiResponse = response.choices[0].message.content;
    
    // Update conversation history
    conversationState.previousMessages.push(
      { role: "user", content: context.lastMessage },
      { role: "assistant", content: aiResponse }
    );
    
    // Limit conversation history to last 10 messages
    if (conversationState.previousMessages.length > 10) {
      conversationState.previousMessages = conversationState.previousMessages.slice(-10);
    }
    
    // Reset retry count on successful API call
    conversationState.retryCount = 0;
    
    return aiResponse;
    
  } catch (error) {
    console.error("Groq API Error:", error);
    
    // Increment retry count
    conversationState.retryCount++;
    
    // Return fallback responses when API fails
    if (isInitialGreeting) {
      return FALLBACK_RESPONSES.greeting;
    } else if (context.testResults) {
      // Handle test results with fallback
      const problemId = context.problem?.id || 'default';
      
      if (problemId === 'two-sum') {
        if (context.testResults.summary.usesOptimalSolution === false) {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].nestedLoops;
        } else if (context.testResults.summary.success) {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].hashMap;
        } else {
          return FALLBACK_RESPONSES.codeFeedback['two-sum'].partial;
        }
      } else if (problemId === 'palindrome-number') {
        return context.testResults.summary.success ? 
          FALLBACK_RESPONSES.codeFeedback['palindrome-number'].success : 
          FALLBACK_RESPONSES.codeFeedback['palindrome-number'].failure;
      } else {
        return FALLBACK_RESPONSES.codeFeedback.default;
      }
    } else if (context.code && context.code.includes('for') && context.code.includes('for')) {
      return FALLBACK_RESPONSES.codeFeedback;
    } else {
      return FALLBACK_RESPONSES.fallback;
    }
  }
};