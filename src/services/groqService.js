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

// Professional but honest fallback responses
const FALLBACK_RESPONSES = {
  greeting: "Let's get started with the interview. I'll be assessing your approach to solving the given problem. I'll be looking at code quality, algorithm choice, and time complexity as we go through this problem together.",
  codeFeedback: {
    'two-sum': {
      emptyCode: "I see you're still working on your implementation. For the Two Sum problem, consider using a hash-based approach which would give you O(n) time complexity instead of the brute force O(n²) approach. Would you like some guidance on how to implement that?",
      nestedLoops: "I see you're using nested loops which gives O(n²) time complexity. While this works, in an interview setting we're typically looking for the more efficient O(n) solution using a HashMap. Would you like to explore that approach?",
      hashMap: "Great work using a HashMap approach - this gives you O(n) time complexity which is optimal for this problem. In an interview, they'd likely ask you to explain the space-time tradeoff here.",
      partial: "Your solution has the right approach with a HashMap, but it's not passing all test cases. Check your implementation for edge cases - this is something interviewers pay close attention to."
    },
    'palindrome-number': {
      emptyCode: "I see you're still working on your implementation for the Palindrome Number problem. You can approach this either by converting to a string or by using mathematical operations. Let me know if you'd like some guidance.",
      success: "Your palindrome solution passes all test cases, which is good. In an interview, you might be asked about the time and space complexity of your approach, and possibly about alternative implementations.",
      failure: "Your palindrome solution isn't passing all test cases. Check for edge cases like negative numbers, which are not palindromes by definition, and ensure your reversal logic is correct."
    },
    emptyCode: "I see you haven't implemented a solution yet. In an interview, it's important to start with a working solution, even if it's not the most optimal one. Would you like some hints to get started?",
    default: "I've reviewed your code and there are some issues that need to be addressed. In an interview setting, it's important to ensure your algorithm works correctly for all test cases."
  },
  fallback: "Let's analyze your approach further. Can you explain your thought process and how you're handling edge cases?"
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
    // Check if we have test results and if code is empty
    const hasTestResults = context.testResults !== undefined && context.testResults !== null;
    const isEmptyCode = hasTestResults && context.testResults.summary && context.testResults.summary.isEmpty;
    
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
    
    // Handle empty code with API issues
    if (isEmptyCode && conversationState.retryCount > 0) {
      const problemId = context.problem?.id || 'default';
      
      if (problemId === 'two-sum') {
        return FALLBACK_RESPONSES.codeFeedback['two-sum'].emptyCode;
      } else if (problemId === 'palindrome-number') {
        return FALLBACK_RESPONSES.codeFeedback['palindrome-number'].emptyCode;
      } else {
        return FALLBACK_RESPONSES.codeFeedback.emptyCode;
      }
    }
    
    // If we have test results and API issues, provide appropriate fallback
    if (hasTestResults && !isEmptyCode && conversationState.retryCount > 0) {
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
    }
    
    // Build system prompt based on context
    let systemPrompt;
    
    if (isInitialGreeting) {
      systemPrompt = `You are a professional technical interviewer conducting a coding interview.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        Provide a brief introduction to start the interview. Your response should:
        1. Be professional and clear
        2. Set expectations for the technical assessment
        3. Briefly mention the problem
        4. Ask them to start by explaining their approach
        5. Sound like an experienced interviewer who is fair but will provide honest feedback`;
    }
    else if (isEmptyCode) {
      // They've run empty/starter code
      systemPrompt = `You are a professional technical interviewer evaluating a candidate who has submitted essentially empty code.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        The candidate has run the code but hasn't implemented a real solution yet.
        
        Your response must:
        1. Acknowledge that they haven't implemented a solution yet
        2. Explain that in an interview, they would need to provide at least an initial approach
        3. Give a helpful hint about a potential approach without giving away the full solution
        4. Maintain a professional tone while being honest about expectations
        5. Ask them what approach they're considering`;
    }
    else if (hasTestResults && !isEmptyCode) {
      // They've run their code and gotten test results - provide honest feedback
      systemPrompt = `You are a professional technical interviewer evaluating a candidate's code.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        TEST RESULTS:
        Total Tests: ${context.testResults.summary.totalTests}
        Passing Tests: ${context.testResults.summary.passing}
        Failing Tests: ${context.testResults.summary.failing}
        
        CODE ANALYSIS:
        Time Complexity: ${context.testResults.analysis?.timeComplexity || 'Unknown'}
        Space Complexity: ${context.testResults.analysis?.spaceComplexity || 'Unknown'}
        Using Hash Map: ${context.testResults.analysis?.usesHashMap ? 'Yes' : 'No'}
        Has Nested Loops: ${context.testResults.analysis?.hasNestedLoops ? 'Yes' : 'No'}
        Issues: ${JSON.stringify(context.testResults.analysis?.specificIssues || [])}
        
        CANDIDATE'S CODE SNIPPET:
        \`\`\`
        ${context.testResults.codeSnippet || context.code || 'No code available'}
        \`\`\`
        
        ${context.testResults.summary.usesOptimalSolution === false ? 
          `The candidate is using an approach with ${context.testResults.analysis?.timeComplexity || 'suboptimal'} time complexity. 
           For this problem, a more efficient solution would use a hash map approach with O(n) time complexity.
           Be honest about this but remain professional and constructive.` : 
          ''}
        
        ${context.testResults.failingTests && context.testResults.failingTests.length > 0 ?
          `There are failing test cases:
          Input: ${context.testResults.failingTests[0].input}
          Expected: ${context.testResults.failingTests[0].expectedOutput}
          Actual: ${context.testResults.failingTests[0].actualOutput}
          
          Explain the importance of handling test cases correctly in an interview.` : 
          ''}
        
        ${context.testResults.summary.success ? 
          `All tests are passing. Provide honest feedback on their approach, time complexity, and any potential optimizations.` :
          `Not all tests are passing. Provide honest but constructive feedback on where their solution may be falling short.`}
        
        Your response must:
        1. Provide specific, code-related feedback based on their implementation
        2. Be honest about time and space complexity issues
        3. Reference their specific code patterns (hash map, nested loops, etc.)
        4. Be constructive - point out issues while suggesting improvements
        5. Use a professional tone that an experienced interviewer would use`;
    }
    else if (isDiscussingCode) {
      // They're talking about their code approach
      systemPrompt = `You are a professional technical interviewer evaluating a candidate's code approach.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        CANDIDATE'S CODE:
        \`\`\`
        ${context.code || 'No code submitted yet'}
        \`\`\`
        
        CANDIDATE'S LAST MESSAGE:
        "${context.lastMessage}"
        
        ${mentionsOptimization ? 'The candidate is asking about optimization. Explain the optimal approach - for Two Sum, discuss using a HashMap for O(n) time complexity.' : ''}
        
        Your response must:
        1. Be specific to their code implementation
        2. Provide honest but professional feedback about algorithm efficiency
        3. Reference specific aspects of THEIR code, not generic feedback
        4. Maintain the tone of an experienced interviewer who provides fair assessment
        5. Be constructive in your criticism while still being honest about issues`;
    }
    else {
      // General conversation
      systemPrompt = `You are a professional technical interviewer having a conversation with a candidate.
        
        PROBLEM DETAILS:
        Title: ${context.problem.title}
        Description: ${context.problem.description}
        
        CANDIDATE'S LAST MESSAGE:
        "${context.lastMessage}"
        
        Your response must:
        1. Be specific to what they've asked or stated
        2. Ask thoughtful questions that probe their technical understanding
        3. Maintain a professional tone while still being honest
        4. Use the style of an experienced technical interviewer who is fair but thorough
        5. Provide honest feedback without being unnecessarily harsh`;
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
    } else if (context.testResults && context.testResults.summary.isEmpty) {
      // Handle empty code
      const problemId = context.problem?.id || 'default';
      
      if (problemId === 'two-sum') {
        return FALLBACK_RESPONSES.codeFeedback['two-sum'].emptyCode;
      } else if (problemId === 'palindrome-number') {
        return FALLBACK_RESPONSES.codeFeedback['palindrome-number'].emptyCode;
      } else {
        return FALLBACK_RESPONSES.codeFeedback.emptyCode;
      }
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