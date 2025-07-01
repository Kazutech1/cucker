import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/Auth';
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
import AdminLogin from './admin/Login';
import ADashboard from './admin/components/Dashboard';
import AWithdrawals from './admin/components/Withdrawal';
import ADeposits from './admin/components/Deposit';
import ANotifications from './admin/components/Notifications';
import AWallets from './admin/components/Wallet';
import VipManagement from './admin/components/Vip';

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
                      <Route path="/adlog" element={<AdminLogin />} />
                         <Route path="/admin/dashboard" element={<ADashboard />} />
                            <Route path="/admin/withdrawals" element={<AWithdrawals />} />
                             <Route path="/admin/deposits" element={<ADeposits />} />
                                 <Route path="/admin/notifications" element={<ANotifications />} />
                                     <Route path="/admin/wallets" element={<AWallets />} />
                                          <Route path="/admin/vip" element={<VipManagement />} />






      </Routes>
    </Router>
  );
}

export default App;