// components/AdminProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './admin/components/AdminLayout';
import { useAuth } from './AuthContext';
import { useState } from 'react';


const AdminProtectedRoute = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin/adlog" replace />;
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminProtectedRoute;