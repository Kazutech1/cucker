import { useState, useEffect } from 'react';
import { 
  Settings,
  Save,
  DollarSign,
  Bitcoin,
  
  Wallet,
  Gift,
  ClipboardList,
  Feather
} from 'lucide-react';
import useAppSettings from '../../../hooks/useSettings';

const SettingsPage = () => {
  const { 
    loading, 
    error, 
    getAppSettings, 
    updateAppSettings 
  } = useAppSettings();
  
  const [settings, setSettings] = useState({
    totalSignupTasks: 0,
    signalBalance: 0,
    ethereumWallet: '',
    totalSignupBonus: 0,
    bitcoinWallet: '',
    usdtWallet: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getAppSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAppSettings(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  if (loading && !settings.ethereumWallet) return (
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="mr-2" size={24} />
            App Settings
          </h2>
          <button
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            <Save className="mr-2" size={16} />
            Update Settings
          </button>
        </div>

        {/* Payment Settings Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center">
              <DollarSign className="mr-2" size={18} />
              Payment Settings
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <ClipboardList className="mr-2" size={16} />
                Total Signup Tasks
              </label>
              <input
                type="number"
                name="totalSignupTasks"
                value={settings.totalSignupTasks}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="mr-2" size={16} />
                Signal balance ($)
              </label>
              <input
                type="number"
                name="signalBalance"
                value={settings.signalBalance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Feather className="mr-2" size={16} />
                Ethereum Wallet
              </label>
              <input
                type="text"
                name="ethereumWallet"
                value={settings.ethereumWallet}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="0x..."
              />
            </div>
          </div>
        </div>

        {/* Update Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-800">Update</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Gift className="mr-2" size={16} />
                Total Signup Bonus
              </label>
              <input
                type="number"
                name="totalSignupBonus"
                value={settings.totalSignupBonus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Bitcoin className="mr-2" size={16} />
                Bitcoin Wallet
              </label>
              <input
                type="text"
                name="bitcoinWallet"
                value={settings.bitcoinWallet}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="1..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Wallet className="mr-2" size={16} />
                USDT Wallet
              </label>
              <input
                type="text"
                name="usdtWallet"
                value={settings.usdtWallet}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="T..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;