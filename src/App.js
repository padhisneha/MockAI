import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProblemList from './pages/ProblemList';
import InterviewPage from './pages/InterviewPage';
import ResumeBuilder from './components/ResumeBuilder';

function App() {
  return (
    <Router>
      <InterviewProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/interview/:problemId" element={<InterviewPage />} />
            <Route path="/resume" element={<ResumeBuilder />} />
          </Routes>
        </div>
      </InterviewProvider>
    </Router>
  );
}

export default App;