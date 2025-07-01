import { FiAward, FiHome, FiTrendingUp, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// BottomNav Component
const BottomNav = () => {
   const navigate = useNavigate();
  const location = window.location.pathname;

  const navItems = [
    { icon: <FiHome className="w-5 h-5" />, label: "Home", path: "/home" },
    { icon: <FiTrendingUp className="w-5 h-5" />, label: "Start", path: "/start" },
    { icon: <FiAward className="w-5 h-5" />, label: "Level", path: "/level" },
    { icon: <FiUser className="w-5 h-5" />, label: "Profile", path: "/profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-teal-400/15 rounded-t-3xl z-40">
      <div className="max-w-md mx-auto flex justify-around items-center p-2">
        {navItems.map((item, index) => (
          <button
            key={index}
             onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              location === item.path ? 'text-teal-400 bg-teal-400/10' : 'text-gray-400 hover:text-teal-400'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav