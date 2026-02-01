
import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Shirt, 
  Calculator, 
  CalendarRange, 
  Warehouse, 
  Factory, 
  Settings,
  Users,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { ROLE_CONFIG } from '../constants';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  menuItems: any[];
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, menuItems, userRole }) => {
  const { user } = useAuth();
  const roleConfig = user ? ROLE_CONFIG[user.role] : null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'profile': return <UserCircle size={20} />;
      case 'dashboard': return <LayoutDashboard size={20} />;
      case 'users': return <Users size={20} />;
      case 'tech': return <Shirt size={20} />;
      case 'accounting': return <Calculator size={20} />;
      case 'planning': return <CalendarRange size={20} />;
      case 'warehouse': return <Warehouse size={20} />;
      case 'production': return <Factory size={20} />;
      default: return <Settings size={20} />;
    }
  };

  return (
    <div className="w-72 bg-white h-full flex flex-col border-r border-dashed border-slate-200">
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Shirt className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#212B36]">Quản Lý Xưởng May</span>
        </div>
      </div>

      {user && (
        <div className="px-5 mb-8">
          <div className="bg-[#F4F6F8] rounded-[16px] p-4 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <img src={user.avatar || 'https://i.pravatar.cc/150?u=user'} alt="Người dùng" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm text-[#212B36] truncate">{user.name}</p>
              <p className="text-xs text-[#637381] font-medium">{roleConfig?.label || user.role}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-[12px] transition-all duration-200 group relative ${
              activeTab === item.id 
                ? 'bg-[#E3F2FD] text-[#1976D2]' 
                : 'text-[#637381] hover:bg-[#F4F6F8]'
            }`}
          >
            <span className={`mr-4 ${activeTab === item.id ? 'text-[#1976D2]' : 'text-[#637381] group-hover:text-[#212B36]'}`}>
              {getIcon(item.id)}
            </span>
            <span className={`font-semibold text-sm ${activeTab === item.id ? 'font-bold' : ''}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1976D2] rounded-l-full" />
            )}
          </button>
        ))}
      </nav>
      
      <div className="p-6">
        <div className="bg-[#FFF7CD] p-6 rounded-[20px] text-center border border-[#FFE16A]">
          <p className="text-xs font-bold text-[#7A4F01] mb-1">Cần hỗ trợ?</p>
          <p className="text-[10px] text-[#7A4F01] opacity-70 mb-4">Xem tài liệu hướng dẫn</p>
          <button className="w-full py-2 bg-[#7A4F01] text-white rounded-[8px] text-[11px] font-bold uppercase">Trợ giúp</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
