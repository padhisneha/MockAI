import React, { useState } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.min.mjs`;

const CoverLetterGenerator = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileContent, setResumeFileContent] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');

  const extractTextFromPDF = async (file) => {
    try {
      setFileLoading(true);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeFileContent(fullText);
      setFileLoading(false);
      return fullText;
    } catch (err) {
      console.error('Error extracting text from PDF:', err);
      setError('Failed to extract text from PDF. Please paste your resume text instead.');
      setFileLoading(false);
      return '';
    }
  };

  const extractTextFromDOCX = async (file) => {
    try {
      setFileLoading(true);
      
      // Read the file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      setResumeFileContent(text);
      setFileLoading(false);
      return text;
    } catch (err) {
      console.error('Error extracting text from DOCX:', err);
      setError('Failed to extract text from DOCX. Please paste your resume text instead.');
      setFileLoading(false);
      return '';
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setResumeFile(file);
    setError('');
    
    // Determine file type and handle accordingly
    const fileType = file.type;
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      extractedText = await extractTextFromDOCX(file);
    } else if (fileType === 'text/plain') {
      extractedText = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeFileContent(e.target.result);
          resolve(e.target.result);
        };
        reader.readAsText(file);
      });
    } else {
      setError('Unsupported file format. Please upload a PDF, DOC, DOCX, or TXT file.');
    }
  };

  // Clean AI response to remove prefatory text
  const cleanAIResponse = (text) => {
    // Remove common prefatory phrases
    const cleanedText = text
      .replace(/^(Here is|Here's|I've created|I have created|Please find) (a|your|the) (professional|tailored|customized|personalized|concise|compelling)( and (professional|tailored|customized|personalized|concise|compelling))* cover letter( for you| based on your resume and the job description)*:?\s*/i, '')
      .replace(/^Cover Letter:?\s*/i, '')
      .replace(/^Draft Cover Letter:?\s*/i, '')
      .trim();
    
    return cleanedText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCoverLetter('');

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      setLoading(false);
      return;
    }

    // Use resume text from textarea or from file, whichever is available
    const resumeContent = resumeText.trim() || resumeFileContent.trim();
    
    if (!resumeContent) {
      setError('Please upload a resume or paste your resume text');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional cover letter writer. Create a tailored, compelling cover letter based on the job description and resume provided. Do NOT include phrases like "Here is your cover letter:" or "I have created a cover letter for you:" - just provide the letter itself.'
            },
            {
              role: 'user',
              content: `Job Description: ${jobDescription}\n\nResume: ${resumeContent}\n\nPlease create a professional cover letter that highlights my relevant skills and experience for this position. Start directly with the cover letter content without any introduction.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Clean response before setting it
      const rawResponse = response.data.choices[0].message.content;
      const cleanedResponse = cleanAIResponse(rawResponse);
      setCoverLetter(cleanedResponse);
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError('Failed to generate cover letter. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Cover Letter Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Generate Your Cover Letter</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="jobDescription">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="resumeText">
                Your Resume
              </label>
              <textarea
                id="resumeText"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here or upload a file..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="resumeUpload">
                Or Upload Resume File
              </label>
              <input
                id="resumeUpload"
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {resumeFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    File loaded: {resumeFile.name}
                  </p>
                  {fileLoading && (
                    <div className="flex items-center mt-1">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Processing file...</span>
                    </div>
                  )}
                  {resumeFileContent && !fileLoading && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Resume text extracted successfully
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || fileLoading}
            >
              {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Cover Letter</h2>
            {coverLetter && (
              <div className="flex space-x-2">
                <button
                  onClick={handleCopy}
                  className="bg-gray-200 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-gray-200 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Download
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : coverLetter ? (
            <div className="border border-gray-300 rounded-md p-4 h-96 overflow-y-auto whitespace-pre-wrap">
              {coverLetter}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md p-4 h-96 flex items-center justify-center text-gray-500">
              Your generated cover letter will appear here
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Tips for a great cover letter:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide a detailed job description to get a more tailored cover letter</li>
          <li>Include your most relevant experience in your resume</li>
          <li>Always proofread and personalize the generated cover letter before sending</li>
          <li>Add specific examples of your achievements when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;