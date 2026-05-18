

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginnPage from './pages/LoginnPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ReportPage from './pages/ReportPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Analysiss from './pages/Analysiss';
import SignnupPage from './pages/Signnup';
import SingleDetection from './pages/SingleDetection';
import SettingsPage from './pages/SettingsPage';
import SummaryStatsProvider from './context/SummaryStatsProvider';
import ThemeProvider from './context/ThemeContext';
import QAPage from './pages/QAPage';
import EduAwareness from './pages/EduAwareness';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SummaryStatsProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginnPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/Analysiss" element={<Analysiss />} />
          <Route path="/loginn" element={<LoginnPage />} />
          <Route path="/signnup" element={<SignnupPage />} />
          <Route path="/detections/:id" element={<SingleDetection />} />
            <Route path="/qa" element={<QAPage />} />
               <Route path="/edu" element={<EduAwareness />} />
        </Routes>
      </SummaryStatsProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
