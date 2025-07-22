import { Menu, X, LayoutDashboard, Users, Wallet, ArrowUpDown, Settings, Star } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current tab from URL (handles nested routes)
  const currentTab = location.pathname.split('/')[2] || 'dashboard';

  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'users', icon: <Users size={20} />, label: 'Users' },
    { id: 'deposits', icon: <Wallet size={20} />, label: 'Deposits' },
    { id: 'withdrawals', icon: <ArrowUpDown size={20} />, label: 'Withdrawals' },
    { id: 'products', icon: <Star size={20} />, label: 'Products Management' }, // Changed icon to Star
    { id: 'vip', icon: <Star size={20} />, label: 'VIP Management' }, // Changed icon to Star
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const handleTabChange = (tabId) => {
    navigate(`/admin/${tabId}`);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full bg-black text-white w-64 border-r border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center w-full px-6 py-4 text-left transition-colors ${
                currentTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-20 bg-black text-white p-2 rounded-md"
      >
        <Menu size={20} />
      </button>
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-10">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-20 h-full bg-black text-white w-64">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <nav>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center w-full px-6 py-4 text-left ${
                    currentTab === tab.id ? 'bg-gray-900' : 'hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden">
          <h1 className="text-xl font-bold">
            {tabs.find(tab => tab.id === currentTab)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;