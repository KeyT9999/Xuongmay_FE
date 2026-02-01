
import React, { useState } from 'react';
import { Style, StyleStatus, WorkOrder } from '../types';
import { STATUS_UI } from '../constants';
import { 
  ClipboardList, 
  Calendar, 
  Plus, 
  Search, 
  Play, 
  ArrowRight,
  TrendingUp,
  Hash,
  Download
} from 'lucide-react';
import { styleService } from '../src/services/style.service';

interface PlanningPageProps {
  styles: Style[];
  workOrders: WorkOrder[];
  onUpdateWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  onUpdateStyles: React.Dispatch<React.SetStateAction<Style[]>>;
}

const PlanningPage: React.FC<PlanningPageProps> = ({ styles, workOrders, onUpdateWorkOrders, onUpdateStyles }) => {
  const approvedStyles = styles.filter(s => s.status === StyleStatus.COST_APPROVED || s.status === StyleStatus.READY_FOR_PLANNING);
  
  const [showModal, setShowModal] = useState(false);
  const [targetStyle, setTargetStyle] = useState<Style | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    qty: 1000,
    line: 'Chuyền A1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleExportExcel = async () => {
    const exportAll = confirm('Bạn muốn export tất cả Styles?\n\nOK = Export tất cả\nCancel = Export chỉ Styles đã duyệt');
    
    setIsExporting(true);
    try {
      await styleService.exportStylesToExcel({
        exportAll: exportAll,
        status: exportAll ? undefined : [StyleStatus.COST_APPROVED, StyleStatus.READY_FOR_PLANNING],
        includeBOM: true,
        includeRouting: true,
        includeCostEstimation: true,
      });
      
      alert('Đã xuất file Excel thành công!');
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất Excel: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateWO = () => {
    if (!targetStyle) return;

    const newWO: WorkOrder = {
      id: `WO-${Math.floor(Math.random() * 9000) + 1000}`,
      styleId: targetStyle.id,
      quantity: formData.qty,
      lineNo: formData.line,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: StyleStatus.READY_FOR_PLANNING,
      assignedTeam: 'Tổ May 1',
      actualOutput: 0,
      defectCount: 0
    };

    onUpdateWorkOrders(prev => [...prev, newWO]);
    onUpdateStyles(prev => prev.map(s => 
      s.id === targetStyle.id ? { ...s, status: StyleStatus.READY_FOR_PLANNING } : s
    ));
    
    setShowModal(false);
    alert('Lệnh sản xuất đã được khởi tạo và gửi tới Kho & Nhân sự.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-indigo-900">Kế Hoạch & Lệnh Sản Xuất</h2>
            <button 
              onClick={handleExportExcel}
              disabled={isExporting}
              className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span>Xuất Excel</span>
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-1">Điều phối style đã duyệt giá sang chuyền sản xuất và lập lịch.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Queue for Planning */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Search size={16} className="text-indigo-500" />
                <span>Style Chờ Lên Kế Hoạch</span>
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {approvedStyles.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-sm italic">Không có style chờ lập lịch.</p>
              ) : (
                approvedStyles.map(style => (
                  <div key={style.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => {setTargetStyle(style); setShowModal(true);}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-500">{style.code}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">{style.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{style.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Active Work Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <ClipboardList size={16} className="text-indigo-500" />
                <span>Lệnh Sản Xuất Đang Chạy (Work Orders)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Mã WO</th>
                    <th className="px-6 py-4">Sản Phẩm</th>
                    <th className="px-6 py-4">Số Lượng</th>
                    <th className="px-6 py-4">Chuyền</th>
                    <th className="px-6 py-4">Thời Gian</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm italic">Chưa có lệnh sản xuất nào được khởi tạo.</td>
                    </tr>
                  ) : (
                    workOrders.map(wo => {
                      const style = styles.find(s => s.id === wo.styleId);
                      return (
                        <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-slate-900">{wo.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{style?.name}</p>
                            <p className="text-[10px] text-slate-400">{style?.code}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-indigo-600">{wo.quantity.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">{wo.lineNo}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-500">{wo.startDate}</p>
                            <p className="text-[10px] text-slate-400">đến {wo.endDate}</p>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_UI[wo.status].color}`}>
                              <span>{STATUS_UI[wo.status].label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating Work Order */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center space-x-2">
              <Plus className="text-indigo-600" />
              <span>Khởi Tạo Lệnh Sản Xuất</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mẫu đang chọn</p>
                <p className="text-sm font-extrabold text-slate-800">{targetStyle?.name}</p>
                <p className="text-xs text-indigo-600 font-mono">{targetStyle?.code}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Số lượng sản xuất</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="number" 
                    value={formData.qty} 
                    onChange={e => setFormData({...formData, qty: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên chuyền sản xuất</label>
                <input 
                  type="text" 
                  value={formData.line} 
                  onChange={e => setFormData({...formData, line: e.target.value})}
                  placeholder="Vd: Chuyền A1, B2..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 transition-all outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hạn hoàn thành</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 transition-all outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Huỷ Bỏ
                </button>
                <button 
                  onClick={handleCreateWO}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Play size={18} />
                  <span>Xác Nhận & Lên WO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningPage;
