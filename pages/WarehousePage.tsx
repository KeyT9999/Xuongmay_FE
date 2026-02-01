
import React from 'react';
import { Material, WorkOrder } from '../types';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCcw, 
  Search,
  AlertTriangle
} from 'lucide-react';

interface WarehousePageProps {
  materials: Material[];
  onUpdateMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  workOrders: WorkOrder[];
}

const WarehousePage: React.FC<WarehousePageProps> = ({ materials, onUpdateMaterials, workOrders }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-amber-900">Quản Lý Kho & Vật Tư</h2>
          <p className="text-slate-500 text-sm mt-1">Kiểm soát tồn kho, xuất liệu theo Work Order và nhập kho nguyên liệu.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 hover:bg-amber-200 transition-all border border-amber-200">
            <ArrowDownLeft size={18} />
            <span>Nhập Kho</span>
          </button>
          <button className="bg-white text-slate-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 border border-slate-200 hover:bg-slate-50 transition-all">
            <Package size={18} />
            <span>Kiểm Kê</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {materials.map(mat => (
          <div key={mat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Package size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${mat.stock < 500 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {mat.stock < 500 ? 'SẮP HẾT' : 'AN TOÀN'}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 line-clamp-1">{mat.name}</h4>
            <p className="text-2xl font-black text-slate-900 mt-1">{mat.stock.toLocaleString()} <span className="text-sm text-slate-400 font-medium tracking-normal">{mat.unit}</span></p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Giá vốn: {mat.costPerUnit.toLocaleString()}đ</span>
              <button className="text-indigo-600 hover:underline">Chi tiết</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span>Cảnh Báo Thiếu Liệu Cho Work Order</span>
          </h3>
          <span className="text-[10px] text-slate-400">Tự động tính toán dựa trên BOM x QTY</span>
        </div>
        <div className="p-12 text-center">
          <RefreshCcw size={40} className="text-slate-200 mx-auto mb-4 animate-spin-slow" />
          <p className="text-slate-400 text-sm">Hiện tại các Work Order đang đủ nguyên liệu để triển khai.<br/>Hệ thống sẽ cảnh báo nếu số lượng sản xuất vượt mức tồn kho.</p>
        </div>
      </div>
    </div>
  );
};

export default WarehousePage;
