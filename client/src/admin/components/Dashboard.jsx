import { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  ArrowUpDown, 
  LayoutDashboard,
  Eye,
  Edit,
  Trash2,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import useAdminAPI from '../../../hooks/useDashboard';

const Dashboard = () => {
  const { loading, error, getDashboardStats, getUsers, deleteUser } = useAdminAPI();
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          getDashboardStats(),
          getUsers(),
        ]);
        setStats(statsData);
        setUserList(usersData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUserList(userList.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center text-red-500 bg-white rounded-lg shadow-sm max-w-md mx-auto">
      {error}
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Dashboard Overview</h2>
        
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<Users size={20} />}
            />
            <StatCard 
              title="Blocked Users" 
              value={stats.blockedUsers} 
              icon={<Shield size={20} />}
            />
            <StatCard 
              title="Total Deposits" 
              value={stats.totalDeposits} 
              icon={<Wallet size={20} />}
            />
            <StatCard 
              title="Total Withdrawals" 
              value={stats.totalWithdrawals} 
              icon={<ArrowUpDown size={20} />}
            />
            <StatCard 
              title="Total Earnings" 
              value={`$${stats.totalEarnings.toLocaleString()}`} 
              icon={<Activity size={20} />}
            />
            <StatCard 
              title="Deactivated Products" 
              value={stats.deactivatedProducts} 
              icon={<XCircle size={20} />}
            />
            <StatCard 
              title="Total Tasks" 
              value={stats.totalTasks} 
              icon={<Clock size={20} />}
            />
            <StatCard 
              title="Completed Tasks" 
              value={stats.completedTasks} 
              icon={<CheckCircle size={20} />}
            />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user.profilePicture ? (
                            <img className="h-full w-full object-cover" src={user.profilePicture} alt="" />
                          ) : (
                            <User size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${user.balance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.referredBy || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          <Eye size={18} />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced StatCard component with floating effect
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className="bg-black text-white p-3 mr-4 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;