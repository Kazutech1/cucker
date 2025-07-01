import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth';
import Home from './pages/Home';
import ProfilePage from './pages/Profile';
import Dashboard from './pages/Start';
import VIPLevelsPage from './pages/Level';
import WithdrawPage from './pages/Withdrawal';
import TransactionHistory from './pages/Transaction';
import DepositPage from './pages/Deposit';
import NotificationsPage from './pages/messages';
import UpdateProfilePage from './pages/Personal';
import AboutUsPage from './components/About';
import TermsAndConditions from './components/Terms';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/start" element={<Dashboard />} />
        <Route path="/level" element={<VIPLevelsPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/deposit" element={<DepositPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
         <Route path="/personal" element={<UpdateProfilePage />} />
          <Route path="/about" element={<AboutUsPage />} />
           <Route path="/terms" element={<TermsAndConditions />} />




      </Routes>
    </Router>
  );
}

export default App;