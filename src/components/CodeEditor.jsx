import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useInterview } from '../context/InterviewContext';
import { getProblemById } from '../services/problemService';

const SUPPORTED_LANGUAGES = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python'
};

const CodeEditor = () => {
  const { state, dispatch } = useInterview();
  const [language, setLanguage] = useState('cpp'); // Default language: C++

  const getDefaultCode = (problem, lang) => {
    return problem?.starterCode?.[lang] || '// Write your solution here';
  };

  useEffect(() => {
    if (state.currentProblem) {
      const problem = getProblemById(state.currentProblem.id);
      const defaultCode = getDefaultCode(problem, language);
      dispatch({ type: 'UPDATE_CODE', payload: defaultCode });
    }
  }, [state.currentProblem?.id, language]);

  const handleEditorChange = (value) => {
    dispatch({ type: 'UPDATE_CODE', payload: value });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Code Editor</h2>
        <select
          className="border p-2 rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Run Code
        </button>
      </div>
      <Editor
        height="400px"
        language={language}
        value={state.currentCode || getDefaultCode(getProblemById(state.currentProblem?.id), language)}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          suggest: { snippetsPreventQuickSuggestions: false },
          quickSuggestions: true, // Enables IntelliSense suggestions
        }}
      />
    </div>
  );
};

export default CodeEditor;
