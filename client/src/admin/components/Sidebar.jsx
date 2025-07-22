import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ArrowUpDown,
  Settings
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
     { id: 'deposits', icon: <Wallet size={20} />, label: 'Deposits' },
         { id: 'withdrawals', icon: <ArrowUpDown size={20} />, label: 'Withdrawals' },
         { id: 'vip', icon: <ArrowUpDown size={20} />, label: 'Vip Management' },

    { id: 'users', icon: <Users size={20} />, label: 'Users' },
   
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    // Add new pages here by adding more tab objects
  ];

  return (
    <div className="hidden md:flex flex-col h-full bg-black text-white w-64 border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center w-full px-6 py-4 text-left transition-colors ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <span className="mr-3">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;