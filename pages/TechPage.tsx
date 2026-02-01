
import React, { useState } from 'react';
import { Style, StyleStatus, Material, BOMItem, RoutingStep } from '../types';
import { STATUS_UI } from '../constants';
import { 
  Plus, 
  FileText, 
  Layers, 
  Workflow, 
  Send, 
  Eye, 
  MoreVertical,
  Trash2,
  DollarSign,
  Settings,
  Download
} from 'lucide-react';

interface TechPageProps {
  styles: Style[];
  onUpdateStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  materials: Material[];
}

const TechPage: React.FC<TechPageProps> = ({ styles, onUpdateStyles, materials }) => {
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const handleSendToAccounting = (id: string) => {
    onUpdateStyles(prev => prev.map(s => 
      s.id === id ? { ...s, status: StyleStatus.SENT_TO_ACCOUNTING } : s
    ));
    alert('Đã gửi yêu cầu duyệt giá sang bộ phận Kế toán.');
  };

  const calculateProposedPrice = (style: Style) => {
    const materialCost = style.bom.reduce((acc, item) => {
      const mat = materials.find(m => m.id === item.materialId);
      if (!mat) return acc;
      const amount = item.quantity * (1 + item.wasteRate / 100);
      return acc + (amount * mat.costPerUnit);
    }, 0);
    const laborCost = style.routing.reduce((acc, step) => {
      return acc + (step.minutes * step.laborRate / 60);
    }, 0);
    return Math.ceil((materialCost + laborCost) * 1.3);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Thiết Kế & Tài Liệu Kỹ Thuật</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Quản lý định mức vật tư (BOM), quy trình may và báo giá.</p>
        </div>
        <div className="flex space-x-3">
           <button className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all">
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
            <Plus size={20} />
            <span>Tạo Mẫu Mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex space-x-4">
              <button className="text-xs font-bold text-blue-600 border-b-2 border-blue-600 pb-1 px-2">Đang thiết kế</button>
              <button className="text-xs font-bold text-slate-400 hover:text-slate-600 pb-1 px-2">Lưu trữ</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5">Mã Mẫu</th>
                  <th className="px-8 py-5">Tên Sản Phẩm</th>
                  <th className="px-8 py-5">Trạng Thái</th>
                  <th className="px-8 py-5">Giá Dự Kiến</th>
                  <th className="px-8 py-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {styles.map(style => (
                  <tr 
                    key={style.id} 
                    className={`group transition-all cursor-pointer ${selectedStyle?.id === style.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/40'}`}
                    onClick={() => setSelectedStyle(style)}
                  >
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                        {style.code}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-[#212B36] text-sm tracking-tight">{style.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sẵn sàng làm mẫu</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_UI[style.status].color}`}>
                        {STATUS_UI[style.status].icon}
                        <span>{STATUS_UI[style.status].label}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-[#212B36]">
                        {style.proposedPrice ? style.proposedPrice.toLocaleString() + 'đ' : '--'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                          <Eye size={18} />
                        </button>
                        {style.status === StyleStatus.DRAFT && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSendToAccounting(style.id); }}
                            className="p-2.5 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all"
                            title="Gửi duyệt giá"
                          >
                            <Send size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {selectedStyle ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-900/5 p-8 sticky top-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden mb-4">
                  <img src={`https://picsum.photos/seed/${selectedStyle.code}/400/400`} alt="Sản phẩm" className="object-cover w-full h-full" />
                </div>
                <h4 className="text-xl font-black text-[#212B36] tracking-tight">{selectedStyle.name}</h4>
                <p className="text-xs font-bold text-blue-500 font-mono mt-1">{selectedStyle.code}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                      <Layers size={14} className="text-blue-500" />
                      <span>Định mức (BOM)</span>
                    </h5>
                    <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Plus size={14}/></button>
                  </div>
                  <div className="space-y-3">
                    {selectedStyle.bom.map(item => {
                      const mat = materials.find(m => m.id === item.materialId);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                          <div className="flex-1">
                            <p className="text-xs font-black text-slate-800 tracking-tight">{mat?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.quantity} {mat?.unit} • {item.wasteRate}% Hao hụt</p>
                          </div>
                          <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-600/20">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Giá Đề Xuất (Tạm tính)</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-black tracking-tighter">
                        {calculateProposedPrice(selectedStyle).toLocaleString()}
                        <span className="text-lg ml-1 opacity-60">đ</span>
                      </p>
                      <button 
                        onClick={() => handleSendToAccounting(selectedStyle.id)}
                        disabled={selectedStyle.status !== StyleStatus.DRAFT}
                        className="bg-white text-blue-700 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
                      >
                        Gửi duyệt
                      </button>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                 <FileText size={32} className="text-blue-300" />
               </div>
               <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest">Chọn một mẫu để<br/>xem chi tiết kỹ thuật</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechPage;
