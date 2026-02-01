
import React from 'react';
import { 
  Shirt, 
  Calculator, 
  CalendarRange, 
  Warehouse, 
  Users, 
  Factory, 
  Settings,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { UserRole, StyleStatus } from './types';

export const ROLE_CONFIG = {
  [UserRole.TECH]: { label: 'Kỹ Thuật', icon: <Shirt size={18} />, color: 'text-blue-500' },
  [UserRole.ACCOUNTANT]: { label: 'Kế Toán', icon: <Calculator size={18} />, color: 'text-blue-600' },
  [UserRole.PLANNER]: { label: 'Kế Hoạch', icon: <CalendarRange size={18} />, color: 'text-blue-700' },
  [UserRole.WAREHOUSE]: { label: 'Kho Vật Tư', icon: <Warehouse size={18} />, color: 'text-blue-800' },
  [UserRole.HR]: { label: 'Nhân Sự', icon: <Users size={18} />, color: 'text-blue-400' },
  [UserRole.FACTORY_MANAGER]: { label: 'Quản Lý Xưởng', icon: <Factory size={18} />, color: 'text-sky-600' },
  [UserRole.ADMIN]: { label: 'Quản Trị Viên', icon: <Settings size={18} />, color: 'text-slate-600' },
};

export const STATUS_UI: Record<StyleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [StyleStatus.DRAFT]: { label: 'Nháp', color: 'bg-slate-100 text-slate-600', icon: <Clock size={14} /> },
  [StyleStatus.SENT_TO_ACCOUNTING]: { label: 'Chờ Duyệt Giá', color: 'bg-blue-50 text-blue-600 border border-blue-100', icon: <AlertCircle size={14} /> },
  [StyleStatus.COST_APPROVED]: { label: 'Đã Duyệt Giá', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: <CheckCircle2 size={14} /> },
  [StyleStatus.READY_FOR_PLANNING]: { label: 'Sẵn Sàng SX', color: 'bg-sky-100 text-sky-700', icon: <TrendingUp size={14} /> },
  [StyleStatus.IN_PRODUCTION]: { label: 'Đang Sản Xuất', color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: <Factory size={14} /> },
  [StyleStatus.DONE]: { label: 'Hoàn Thành', color: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle2 size={14} /> },
  [StyleStatus.CANCELLED]: { label: 'Đã Hủy', color: 'bg-rose-50 text-rose-700', icon: <XCircle size={14} /> },
};
export const MOCK_MATERIALS = [
  { id: 'M1', name: 'Vải Cotton 100%', unit: 'Mét', stock: 1500, costPerUnit: 45000 },
  { id: 'M2', name: 'Nút áo nhựa', unit: 'Cái', stock: 50000, costPerUnit: 200 },
  { id: 'M3', name: 'Chỉ may 40/2', unit: 'Cuộn', stock: 200, costPerUnit: 12000 },
  { id: 'M4', name: 'Khóa kéo YKK 15cm', unit: 'Cái', stock: 450, costPerUnit: 5500 },
];

export const MOCK_STYLES = [
  { 
    id: 'S1', 
    code: 'POLO-001', 
    name: 'Áo Polo Nam Classic', 
    description: 'Cotton thun cá sấu 4 chiều, thoáng mát', 
    status: StyleStatus.DRAFT,
    bom: [
      { id: 'B1', materialId: 'M1', quantity: 1.2, wasteRate: 5 },
      { id: 'B2', materialId: 'M2', quantity: 3, wasteRate: 1 }
    ],
    routing: [
      { id: 'R1', operation: 'Cắt vải', minutes: 5, laborRate: 1500 },
      { id: 'R2', operation: 'May thân', minutes: 15, laborRate: 2000 }
    ],
    proposedPrice: 125000
  },
  { 
    id: 'S2', 
    code: 'PANT-99', 
    name: 'Quần Jean Slimfit', 
    description: 'Vải Jean co giãn, wash nhẹ kiểu hiện đại', 
    status: StyleStatus.COST_APPROVED,
    bom: [],
    routing: [],
    proposedPrice: 210000
  }
];

