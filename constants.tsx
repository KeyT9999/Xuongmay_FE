import React from 'react';
import {
  Users,
  Settings,
  UserCircle
} from 'lucide-react';
import { UserRole } from './types';

export const ROLE_CONFIG = {
  [UserRole.TECH]: { label: 'Kỹ Thuật', icon: <Settings size={18} />, color: 'text-blue-500' },
  [UserRole.ACCOUNTANT]: { label: 'Kế Toán', icon: <Settings size={18} />, color: 'text-blue-600' },
  [UserRole.PLANNER]: { label: 'Kế Hoạch', icon: <Settings size={18} />, color: 'text-blue-700' },
  [UserRole.WAREHOUSE]: { label: 'Kho Vật Tư', icon: <Settings size={18} />, color: 'text-blue-800' },
  [UserRole.HR]: { label: 'Nhân Sự', icon: <Users size={18} />, color: 'text-blue-400' },
  [UserRole.FACTORY_MANAGER]: { label: 'Quản Lý Xưởng', icon: <Settings size={18} />, color: 'text-sky-600' },
  [UserRole.ADMIN]: { label: 'Quản Trị Viên', icon: <Settings size={18} />, color: 'text-slate-600' },
};
