
import React from 'react';
import { User } from '../types';
import { Bell, Search, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { ROLE_CONFIG } from '../constants';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { logout } = useAuth();
  const roleConfig = ROLE_CONFIG[user.role];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-10 shrink-0 bg-white border-b border-slate-100">
      <div className="flex items-center space-x-4">
        <button className="p-2 text-[#637381] hover:bg-[#F4F6F8] rounded-full transition-all">
          <Search size={20} />
        </button>
        <div className="h-6 w-[1px] bg-slate-200"></div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50">
          {roleConfig?.icon}
          <span className="text-xs font-bold text-blue-600">{roleConfig?.label || user.role}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-[#637381] hover:bg-[#F4F6F8] rounded-full">
          <Globe size={20} />
        </button>
        <button className="relative p-2 text-[#637381] hover:bg-[#F4F6F8] rounded-full">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#F4F6F8] hover:border-blue-400 transition-all">
          <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-[#637381] hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all"
          title="Đăng xuất"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
