
import React from 'react';
import { WorkOrder, Style, StyleStatus } from '../types';
import { STATUS_UI } from '../constants';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface FactoryPageProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  styles: Style[];
}

const FactoryPage: React.FC<FactoryPageProps> = ({ workOrders, onUpdateWorkOrders, styles }) => {
  const activeWOs = workOrders.filter(wo => wo.status === StyleStatus.READY_FOR_PLANNING || wo.status === StyleStatus.IN_PRODUCTION);

  const handleStartProduction = (id: string) => {
    onUpdateWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: StyleStatus.IN_PRODUCTION } : wo
    ));
  };

  const handleUpdateProgress = (id: string, amount: number) => {
    onUpdateWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, actualOutput: wo.actualOutput + amount } : wo
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Điều Hành Sản Xuất</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Theo dõi tiến độ thực tế và cập nhật sản lượng tại chuyền.</p>
        </div>
        <div className="bg-blue-600 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-xl shadow-blue-600/20 border border-blue-500">
          <Activity size={20} className="text-white" />
          <span className="text-sm font-black text-white uppercase tracking-widest">Hiệu suất xưởng: 92.4%</span>
        </div>
      </div>

      {activeWOs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-32 text-center shadow-sm">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Layers size={40} className="text-blue-300" />
          </div>
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-4">Chưa có lệnh sản xuất nào</h3>
          <p className="text-slate-400 text-sm font-medium">Vui lòng đợi bộ phận Kế hoạch giải ngân và cấp Lệnh sản xuất (WO).</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {activeWOs.map(wo => {
            const style = styles.find(s => s.id === wo.styleId);
            const progress = Math.min(100, Math.floor((wo.actualOutput / wo.quantity) * 100));
            
            return (
              <div key={wo.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden flex flex-col group transition-all hover:border-blue-200">
                <div className="p-8 bg-slate-950 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/20">
                       {style?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight">{style?.name}</h4>
                      <p className="text-xs text-blue-400 font-bold flex items-center space-x-3 mt-1 uppercase tracking-widest">
                        <span className="bg-white/10 px-2 py-0.5 rounded">{wo.id}</span>
                        <span>CHUYỀN: {wo.lineNo}</span>
                      </p>
                    </div>
                  </div>
                  {wo.status === StyleStatus.READY_FOR_PLANNING ? (
                    <button 
                      onClick={() => handleStartProduction(wo.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                      Bắt đầu may
                    </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Đang chạy máy</span>
                      <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full animate-progress-fast"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 flex-1 space-y-8 bg-gradient-to-b from-white to-blue-50/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Tiến độ hoàn thành</span>
                      <span className="text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-2xl overflow-hidden p-1.5 border border-slate-200 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-700 to-blue-400 rounded-xl transition-all duration-1000 ease-out relative group/bar shadow-sm"
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-2xl font-black text-slate-900">{wo.actualOutput.toLocaleString()}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ {wo.quantity.toLocaleString()} SẢN PHẨM</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Mục tiêu: 100%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cập nhật sản lượng</h5>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleUpdateProgress(wo.id, 10)}
                          className="flex-1 py-4 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-700 hover:bg-blue-100 active:scale-95 transition-all text-sm"
                        >
                          +10
                        </button>
                        <button 
                          onClick={() => handleUpdateProgress(wo.id, 50)}
                          className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-lg shadow-blue-600/10"
                        >
                          +50
                        </button>
                      </div>
                    </div>
                    <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
                      <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Kiểm soát lỗi (QC)</h5>
                      <button className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-rose-600 active:scale-95 transition-all text-sm shadow-lg shadow-rose-500/10">
                        <AlertCircle size={20} />
                        <span>GHI NHẬN LỖI</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-8">
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Công đoạn</p>
                      <p className="text-sm font-black text-slate-900">May hoàn thiện</p>
                    </div>
                    <div className="text-center border-x border-slate-100 group-hover:scale-105 transition-transform">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Nhân sự</p>
                      <p className="text-sm font-black text-slate-900">12 Công nhân</p>
                    </div>
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Đánh giá</p>
                      <p className="text-sm font-black text-emerald-600">Đạt kế hoạch</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        @keyframes progress-fast {
          0% { width: 0; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-progress-fast {
          animation: progress-fast 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default FactoryPage;
