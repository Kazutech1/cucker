import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import AdminProtectedRoute from './AdminProtectedRoute';
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
// import ATasks from './admin/components/Tasks';
// import ATaskz from './admin/components/UesrManagement';
// import UserTasks from './admin/components/TasksManagement';
import ATests from './admin/components/Test';
import AUsers from './admin/components/TasksManagement';
import AdminDashboard from './admin/components/AdminDashboard';
import adminRoutes from './admin/components/adminRoutes';
import ReferralPage from './pages/Referrals';
import CustomerService from './pages/CustomerService';



function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/start" element={<Dashboard />} />
      <Route path="/level" element={<VIPLevelsPage />} />
      <Route path="/withdraw" element={<WithdrawPage />} />
      <Route path="/transactions" element={<TransactionHistory />} />
      <Route path="/referrals" element={<ReferralPage />} />
      <Route path="/support" element={<CustomerService />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/personal" element={<UpdateProfilePage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/adlog" element={<AdminLogin />} />
      
      <Route path="/admin" element={<AdminProtectedRoute><Outlet /></AdminProtectedRoute>}>
        {adminRoutes.map((route) => (
          <Route 
            key={route.path} 
            path={route.path} 
            element={route.element} 
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;