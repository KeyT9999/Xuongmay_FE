
import React from 'react';
import { Style, WorkOrder } from '../types';
import { 
  Shirt, 
  ShoppingCart, 
  Users, 
  AlertCircle,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardPageProps {
  styles: Style[];
  workOrders: WorkOrder[];
}

const visitData = [
  { name: 'Th2', value: 40 },
  { name: 'Th3', value: 30 },
  { name: 'Th4', value: 65 },
  { name: 'Th5', value: 45 },
  { name: 'Th6', value: 75 },
  { name: 'Th7', value: 55 },
  { name: 'CN', value: 90 },
];

const pieData = [
  { name: 'Châu Mỹ', value: 400 },
  { name: 'Châu Á', value: 300 },
  { name: 'Châu Âu', value: 300 },
  { name: 'Châu Phi', value: 200 },
];
const COLORS = ['#1976D2', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardPage: React.FC<DashboardPageProps> = ({ styles, workOrders }) => {
  const stats = [
    { label: 'Mẫu Thiết Kế Tuần', value: '714', icon: <Shirt size={24} />, bg: 'bg-[#D1E9FF]', text: 'text-[#04297A]' },
    { label: 'Tổng Đơn Hàng', value: '1.35k', icon: <ShoppingCart size={24} />, bg: 'bg-[#D0F2FF]', text: 'text-[#04297A]' },
    { label: 'Nhân Lực Xưởng', value: '1,728', icon: <Users size={24} />, bg: 'bg-[#FFF7CD]', text: 'text-[#7A4F01]' },
    { label: 'Báo Cáo Lỗi (QC)', value: '23', icon: <AlertCircle size={24} />, bg: 'bg-[#FFE7D9]', text: 'text-[#7A0C2E]' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-[#212B36]">Chào mừng trở lại, Quản trị viên</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-[24px] p-10 flex flex-col items-center justify-center text-center shadow-sm`}>
            <div className={`p-4 rounded-full bg-white/30 ${stat.text} mb-4`}>
              {stat.icon}
            </div>
            <p className={`text-3xl font-bold ${stat.text} mb-1`}>{stat.value}</p>
            <p className={`text-sm font-semibold ${stat.text} opacity-70`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#212B36]">Sản Lượng Hoàn Thành</h3>
              <p className="text-xs text-[#637381] font-medium">(+43%) so với năm ngoái</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#637381'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#637381'}} />
                <Tooltip 
                  labelFormatter={(label) => `Thứ: ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} 
                />
                <Area type="monotone" dataKey="value" name="Sản lượng" stroke="#1976D2" strokeWidth={3} fill="#E3F2FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#212B36] mb-8">Thị Trường Xuất Khẩu</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
