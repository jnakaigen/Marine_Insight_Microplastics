// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';


// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import DashboardPage from './pages/DashboardPage';
// import UploadPage from './pages/UploadPage';
// import ResultsPage from './pages/ResultsPage';
// import ReportPage from './pages/ReportPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import Analysiss from './pages/Analysiss';
// import LoginnPage from './pages/LoginnPage';
// import SignnupPage from './pages/Signnup';
// import SingleDetection from './pages/SingleDetection';
// import SummaryStatsProvider from './context/SummaryStatsProvider';


// function App() {
//   return (
//     <BrowserRouter>
//       <SummaryStatsProvider>
// <Router>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignupPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
//         <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/upload" element={<UploadPage />} />
//         <Route path="/results" element={<ResultsPage />} />
//           <Route path="/results/:id" element={<ResultsPage />} />
//         <Route path="/report" element={<ReportPage />} />
//        <Route path="/Analysiss" element={<Analysiss/>}/>
//         <Route path="/loginn" element={<LoginnPage/>}/>
//         <Route path="/signnup" element={<SignnupPage/>}/>
//         <Route path="/detections/:id" element={<SingleDetection />} />
//       </Routes>
//     </Router>
//       </SummaryStatsProvider>
    
//     </BrowserRouter>
    
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ReportPage from './pages/ReportPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Analysiss from './pages/Analysiss';
import LoginnPage from './pages/LoginnPage';
import SignnupPage from './pages/Signnup';
import SingleDetection from './pages/SingleDetection';
import SummaryStatsProvider from './context/SummaryStatsProvider';
import QAPage from './pages/QAPage';
import EduAwareness from './pages/EduAwareness';

function App() {
  return (
    <BrowserRouter>
      <SummaryStatsProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/Analysiss" element={<Analysiss />} />
          <Route path="/loginn" element={<LoginnPage />} />
          <Route path="/signnup" element={<SignnupPage />} />
          <Route path="/detections/:id" element={<SingleDetection />} />
            <Route path="/qa" element={<QAPage />} />
               <Route path="/edu" element={<EduAwareness />} />
        </Routes>
      </SummaryStatsProvider>
    </BrowserRouter>
  );
}

export default App;
