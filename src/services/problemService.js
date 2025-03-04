const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, 
    return indices of the two numbers such that they add up to target.
    You may assume that each input would have exactly one solution, 
    and you may not use the same element twice.
    You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    testCases: [
      { input: [2,7,11,15], target: 9, expectedOutput: [0,1] },
      { input: [3,2,4], target: 6, expectedOutput: [1,2] }
    ],
    starterCode: {
      cpp: `#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}`,
      java: `import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
      python: `def two_sum(nums, target):\n    # Write your solution here\n    return []`,
    },
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.
    An integer is a palindrome when it reads the same forward and backward.`,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      }
    ],
    testCases: [
      { input: 121, expectedOutput: true },
      { input: -121, expectedOutput: false },
      { input: 10, expectedOutput: false }
    ],
    starterCode: {
      cpp: `#include <iostream>\nbool isPalindrome(int x) {\n    // Write your solution here\n    return false;\n}`,
      java: `class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your solution here\n        return false;\n    }\n}`,
      python: `def is_palindrome(x):\n    # Write your solution here\n    return False`,
    },
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: "The answer is 'abc', with the length of 3."
      }
    ],
    testCases: [
      { input: "abcabcbb", expectedOutput: 3 },
      { input: "bbbbb", expectedOutput: 1 },
      { input: "pwwkew", expectedOutput: 3 }
    ],
    starterCode: {
      cpp: `#include <string>\nusing namespace std;\nint lengthOfLongestSubstring(string s) {\n    // Write your solution here\n    return 0;\n}`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      python: `def length_of_longest_substring(s):\n    # Write your solution here\n    return 0`,
    },
  },
  {
    id: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.
    Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "The linked-lists are merged in sorted order."
      }
    ],
    testCases: [
      { 
        input: [[1,4,5],[1,3,4],[2,6]], 
        expectedOutput: [1,1,2,3,4,4,5,6]
      },
      {
        input: [],
        expectedOutput: []
      }
    ],
    starterCode: {
      cpp: `#include <vector>\nusing namespace std;\nvector<int> mergeKLists(vector<vector<int>>& lists) {\n    // Write your solution here\n    return {};\n}`,
      java: `import java.util.*;\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your solution here\n        return null;\n    }\n}`,
      python: `def merge_k_lists(lists):\n    # Write your solution here\n    return []`,
    },
  }
];

export const getProblemById = (id) => {
  return PROBLEMS.find(problem => problem.id === id);
};

export const getAllProblems = () => {
  return PROBLEMS;
};