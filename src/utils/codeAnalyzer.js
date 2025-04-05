/**
 * Utility functions to analyze code and provide specific feedback
 */

// Analyze specific code patterns for different problems
export const analyzeCode = (code, problemId, language) => {
  // Skip if code is empty or null
  if (!code) return { 
    isEmpty: true,
    feedback: "No code has been implemented."
  };
  
  const analysis = {
    isEmpty: isCodeEmpty(code, language),
    hasNestedLoops: false,
    usesHashMap: false,
    usesRecursion: false,
    usesStringConversion: false,
    usesOptimalApproach: false,
    timeComplexity: null,
    spaceComplexity: null,
    specificIssues: [],
    feedback: ""
  };
  
  // If code is empty, return basic analysis
  if (analysis.isEmpty) {
    analysis.feedback = "No meaningful solution has been implemented.";
    return analysis;
  }
  
  // Detect common patterns
  analysis.hasNestedLoops = detectNestedLoops(code, language);
  analysis.usesHashMap = detectHashMap(code, language);
  analysis.usesRecursion = detectRecursion(code, language);
  analysis.usesStringConversion = detectStringConversion(code, language);
  
  // Problem-specific analysis
  switch (problemId) {
    case 'two-sum':
      analyzeTwoSum(code, language, analysis);
      break;
    case 'palindrome-number':
      analyzePalindrome(code, language, analysis);
      break;
    case 'longest-substring':
      analyzeLongestSubstring(code, language, analysis);
      break;
    case 'merge-k-sorted-lists':
      analyzeMergeKLists(code, language, analysis);
      break;
    default:
      // Generic analysis
      if (analysis.hasNestedLoops) {
        analysis.timeComplexity = "O(n²)";
        analysis.specificIssues.push("Using nested loops which may be inefficient");
      } else if (analysis.usesHashMap) {
        analysis.timeComplexity = "O(n)";
        analysis.usesOptimalApproach = true;
      }
      
      analysis.feedback = "Generic code analysis performed.";
  }
  
  return analysis;
};

// Check if code is essentially empty/default
export const isCodeEmpty = (code, language) => {
  if (!code || code.trim().length === 0) return true;
  
  // Check if it's just a comment or the default code
  const minMeaningfulLength = 30; // Arbitrary threshold for "real" code
  if (code.trim().length < minMeaningfulLength) return true;
  
  // Check for common starter code patterns
  const starterPatterns = [
    '// Write your solution here',
    '# Write your solution',
    'return new int[0]',
    'return []',
    'return {}'
  ];
  
  return starterPatterns.some(pattern => code.includes(pattern));
};

// Detect nested loops
const detectNestedLoops = (code, language) => {
  if (language === 'python') {
    // Count the number of indentation increases after for/while
    const lines = code.split('\n');
    let inLoop = false;
    let nestedLoopCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('for ') || line.startsWith('while ')) {
        if (inLoop) {
          nestedLoopCount++;
        }
        inLoop = true;
      }
    }
    
    return nestedLoopCount > 0;
  } else {
    // For C++, Java, etc. - count the number of for/while keywords
    const forCount = (code.match(/\bfor\s*\(/g) || []).length;
    const whileCount = (code.match(/\bwhile\s*\(/g) || []).length;
    
    // Check if there's more than one loop in the same scope
    const loopTotal = forCount + whileCount;
    return loopTotal >= 2;
  }
};

// Detect HashMap usage
const detectHashMap = (code, language) => {
  switch (language) {
    case 'java':
      return code.includes('HashMap') || code.includes('Map<');
    case 'cpp':
      return code.includes('unordered_map') || code.includes('map<');
    case 'python':
      return code.includes('dict(') || code.includes('{}') || code.includes(' = {}') || 
             code.includes('defaultdict') || code.includes(' in ') && !code.includes('for ') && !code.includes('while ');
    default:
      return code.includes('Map') || code.includes('map') || code.includes('dict') || code.includes('{}');
  }
};

// Detect recursion
const detectRecursion = (code, language) => {
  // Extract function name and check if it's called within its body
  if (language === 'java') {
    const functionNameMatch = code.match(/\s+(\w+)\s*\([^)]*\)\s*{/);
    if (functionNameMatch && functionNameMatch[1]) {
      const functionName = functionNameMatch[1];
      return new RegExp(`\\b${functionName}\\s*\\(`).test(code);
    }
  } else if (language === 'python') {
    const functionNameMatch = code.match(/def\s+(\w+)\s*\(/);
    if (functionNameMatch && functionNameMatch[1]) {
      const functionName = functionNameMatch[1];
      return new RegExp(`\\b${functionName}\\s*\\(`).test(code);
    }
  } else if (language === 'cpp') {
    const functionNameMatch = code.match(/\w+\s+(\w+)\s*\([^)]*\)\s*{/);
    if (functionNameMatch && functionNameMatch[1]) {
      const functionName = functionNameMatch[1];
      return new RegExp(`\\b${functionName}\\s*\\(`).test(code);
    }
  }
  
  return false;
};

// Detect string conversion
const detectStringConversion = (code, language) => {
  switch (language) {
    case 'java':
      return code.includes('.toString()') || code.includes('String.valueOf');
    case 'cpp':
      return code.includes('to_string') || code.includes('std::string');
    case 'python':
      return code.includes('str(') || code.includes('.__str__');
    default:
      return code.includes('toString') || code.includes('String');
  }
};

// Analyze Two Sum solution
const analyzeTwoSum = (code, language, analysis) => {
  // Check for optimal HashMap approach
  if (analysis.usesHashMap) {
    analysis.usesOptimalApproach = true;
    analysis.timeComplexity = "O(n)";
    analysis.spaceComplexity = "O(n)";
    
    // Check for single-pass implementation
    if (code.includes('return') && !code.includes('sort')) {
      analysis.feedback = "Using optimal HashMap approach with O(n) time complexity.";
    } else {
      analysis.specificIssues.push("Using HashMap but with multiple passes through the array");
      analysis.feedback = "Using HashMap approach but could be further optimized.";
    }
  } 
  // Check for brute force approach
  else if (analysis.hasNestedLoops) {
    analysis.usesOptimalApproach = false;
    analysis.timeComplexity = "O(n²)";
    analysis.spaceComplexity = "O(1)";
    analysis.specificIssues.push("Using inefficient nested loops with O(n²) time complexity");
    analysis.feedback = "Using brute force approach with nested loops. This is inefficient.";
  }
  // Other implementation
  else {
    analysis.timeComplexity = "Unknown";
    analysis.spaceComplexity = "Unknown";
    analysis.specificIssues.push("Implementation approach is unclear");
    analysis.feedback = "Implementation approach is unclear. Check if it handles all cases correctly.";
  }
};

// Analyze Palindrome Number solution
const analyzePalindrome = (code, language, analysis) => {
  // Check for string conversion approach
  if (analysis.usesStringConversion) {
    analysis.timeComplexity = "O(n)";  // Where n is the number of digits
    analysis.spaceComplexity = "O(n)";
    analysis.specificIssues.push("Using string conversion requires additional space");
    analysis.feedback = "Using string conversion approach. Works but uses extra space.";
  } 
  // Check for mathematical approach (more optimal)
  else if (code.includes('/') && code.includes('%') && !analysis.usesStringConversion) {
    analysis.usesOptimalApproach = true;
    analysis.timeComplexity = "O(log n)";  // Where n is the number value (log n = number of digits)
    analysis.spaceComplexity = "O(1)";
    analysis.feedback = "Using optimal mathematical approach with O(1) space complexity.";
  }
  // Other implementation
  else {
    analysis.timeComplexity = "Unknown";
    analysis.spaceComplexity = "Unknown";
    analysis.specificIssues.push("Implementation approach is unclear");
    analysis.feedback = "Implementation approach is unclear. Check if it handles edge cases like negative numbers.";
  }
};

// Analyze Longest Substring solution
const analyzeLongestSubstring = (code, language, analysis) => {
  // Check for sliding window with HashSet/HashMap
  if (analysis.usesHashMap) {
    // Check for single-pass sliding window
    if ((code.includes('while') || code.includes('for')) && !analysis.hasNestedLoops) {
      analysis.usesOptimalApproach = true;
      analysis.timeComplexity = "O(n)";
      analysis.spaceComplexity = "O(min(m,n))"; // m=charset size, n=string length
      analysis.feedback = "Using optimal sliding window approach with O(n) time complexity.";
    } else {
      analysis.timeComplexity = "O(n²)";
      analysis.spaceComplexity = "O(min(m,n))";
      analysis.specificIssues.push("Using HashMap but without proper sliding window technique");
      analysis.feedback = "Using HashMap but could be optimized with sliding window technique.";
    }
  }
  // Brute force approach
  else if (analysis.hasNestedLoops) {
    analysis.usesOptimalApproach = false;
    analysis.timeComplexity = "O(n³)";  // Nested loops + string operations
    analysis.spaceComplexity = "O(min(m,n))";
    analysis.specificIssues.push("Using inefficient brute force approach");
    analysis.feedback = "Using inefficient brute force approach. Consider a sliding window with HashMap.";
  }
  // Other implementation
  else {
    analysis.timeComplexity = "Unknown";
    analysis.spaceComplexity = "Unknown";
    analysis.specificIssues.push("Implementation approach is unclear");
    analysis.feedback = "Implementation approach is unclear. Check efficiency and correctness.";
  }
};

// Analyze Merge K Sorted Lists solution
const analyzeMergeKLists = (code, language, analysis) => {
  // Check for priority queue / heap approach
  const usesPriorityQueue = 
    (language === 'java' && (code.includes('PriorityQueue') || code.includes('Heap'))) ||
    (language === 'cpp' && (code.includes('priority_queue') || code.includes('make_heap'))) ||
    (language === 'python' && (code.includes('heapq') || code.includes('PriorityQueue')));
  
  if (usesPriorityQueue) {
    analysis.usesOptimalApproach = true;
    analysis.timeComplexity = "O(n log k)"; // n total elements, k lists
    analysis.spaceComplexity = "O(k)";
    analysis.feedback = "Using optimal priority queue/heap approach with O(n log k) time complexity.";
  }
  // Check for merge sort like divide and conquer
  else if (analysis.usesRecursion && !analysis.hasNestedLoops) {
    analysis.usesOptimalApproach = true;
    analysis.timeComplexity = "O(n log k)";
    analysis.spaceComplexity = "O(log k)"; // recursion stack
    analysis.feedback = "Using efficient divide and conquer approach with O(n log k) time complexity.";
  }
  // Check for sequential merging (suboptimal)
  else if (!analysis.hasNestedLoops && (code.includes('merge') || 
             (code.includes('next') && (code.includes('->') || code.includes('.next'))))) {
    analysis.usesOptimalApproach = false;
    analysis.timeComplexity = "O(nk)";
    analysis.spaceComplexity = "O(1)";
    analysis.specificIssues.push("Sequential merging is not optimal for large k");
    analysis.feedback = "Using sequential merging which is O(nk). Consider priority queue for O(n log k).";
  }
  // Brute force approach
  else if (analysis.hasNestedLoops) {
    analysis.usesOptimalApproach = false;
    analysis.timeComplexity = "O(n²)";
    analysis.spaceComplexity = "O(n)";
    analysis.specificIssues.push("Using inefficient approach with nested loops");
    analysis.feedback = "Using inefficient approach. Consider priority queue or divide and conquer.";
  }
  // Other implementation
  else {
    analysis.timeComplexity = "Unknown";
    analysis.spaceComplexity = "Unknown";
    analysis.specificIssues.push("Implementation approach is unclear");
    analysis.feedback = "Implementation approach is unclear. Check efficiency for large inputs.";
  }
};

export default {
  analyzeCode,
  isCodeEmpty
};