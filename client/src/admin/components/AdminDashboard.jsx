import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminDashboard;