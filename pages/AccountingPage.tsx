
import React, { useState } from 'react';
import { Style, StyleStatus } from '../types';
import { STATUS_UI } from '../constants';
import { 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  FileSearch,
  MessageSquare,
  TrendingUp,
  Receipt,
  Calculator,
  Download
} from 'lucide-react';
import CostEstimationModal from '../src/components/CostEstimationModal';
import { styleService } from '../src/services/style.service';

interface AccountingPageProps {
  styles: Style[];
  onUpdateStyles: React.Dispatch<React.SetStateAction<Style[]>>;
}

const AccountingPage: React.FC<AccountingPageProps> = ({ styles, onUpdateStyles }) => {
  const [showCostEstimationModal, setShowCostEstimationModal] = useState(false);
  const [selectedStyleForEstimation, setSelectedStyleForEstimation] = useState<Style | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const pendingStyles = styles.filter(s => s.status === StyleStatus.SENT_TO_ACCOUNTING);
  const estimatedStyles = styles.filter(s => s.status === StyleStatus.COST_ESTIMATED);

  const handleOpenCostEstimation = (style: Style) => {
    setSelectedStyleForEstimation(style);
    setShowCostEstimationModal(true);
  };

  const handleCloseCostEstimation = () => {
    setShowCostEstimationModal(false);
    setSelectedStyleForEstimation(null);
  };

  const handleCostEstimationSuccess = async () => {
    // Reload styles
    try {
      const updatedStyles = await styleService.getStyles();
      onUpdateStyles(updatedStyles);
    } catch (error) {
      console.error('Failed to reload styles:', error);
    }
  };

  const handleReject = (id: string) => {
    onUpdateStyles(prev => prev.map(s => 
      s.id === id ? { ...s, status: StyleStatus.DRAFT } : s
    ));
    alert('Đã từ chối và gửi phản hồi lại cho bộ phận Kỹ thuật.');
  };

  const handleExportExcel = async () => {
    const exportAll = confirm('Bạn muốn export tất cả Styles?\n\nOK = Export tất cả\nCancel = Export chỉ danh sách cần thẩm định');
    
    setIsExporting(true);
    try {
      await styleService.exportStylesToExcel({
        exportAll: exportAll,
        status: exportAll ? undefined : [StyleStatus.SENT_TO_ACCOUNTING, StyleStatus.COST_ESTIMATED],
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Thẩm Định Tài Chính</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Xem xét các bản đề xuất từ Kỹ thuật và dự trù chi phí sản xuất.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          disabled={isExporting}
          className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span>Xuất Excel</span>
        </button>
      </div>

      {pendingStyles.length === 0 && estimatedStyles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-32 text-center shadow-sm">
          <CheckCircle2 size={56} className="text-emerald-200 mx-auto mb-6" />
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Hộp thư trống</h3>
          <p className="text-slate-400 text-sm font-medium mt-2">Tất cả các đề xuất báo giá đã được xử lý xong.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {pendingStyles.map(style => (
            <div key={style.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 p-8 flex flex-col space-y-6 group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Cần thẩm định</span>
                <span className="text-xs text-slate-400 font-mono font-bold tracking-widest">{style.code}</span>
              </div>
              
              <div>
                <h4 className="font-black text-[#212B36] text-xl tracking-tight leading-tight">{style.name}</h4>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 mt-2 leading-relaxed">{style.description}</p>
              </div>

              <div className="bg-slate-50/80 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Giá Đề Xuất</p>
                    <p className="text-2xl font-black text-[#212B36] leading-none tracking-tighter">
                      {style.proposedPrice?.toLocaleString()}<span className="text-sm ml-1 text-slate-400">đ</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleOpenCostEstimation(style)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <Calculator size={16} />
                  <span>Dự Trù Chi Phí</span>
                </button>
                <button 
                  onClick={() => handleReject(style.id)}
                  className="bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <XCircle size={16} />
                  <span>Từ Chối</span>
                </button>
              </div>

              <button className="w-full py-4 text-slate-400 hover:text-blue-600 flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest transition-all border-t border-slate-50 mt-4 group/btn">
                <FileSearch size={14} className="group-hover/btn:scale-110 transition-transform" />
                <span>Xem hồ sơ kỹ thuật</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Estimated Styles Section */}
      {estimatedStyles.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-[#212B36] text-lg flex items-center space-x-3">
              <Calculator size={24} className="text-amber-600" />
              <span>Đã Dự Trù - Chờ Kỹ Thuật Xem Xét</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {estimatedStyles.map(style => (
              <div key={style.id} className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    Đã Dự Trù
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold">{style.code}</span>
                </div>
                <h4 className="font-black text-[#212B36] text-lg mb-2">{style.name}</h4>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600">Giá dự trù:</span>
                    <span className="text-lg font-black text-amber-600">
                      {style.accountingFinalPrice?.toLocaleString() || style.proposedPrice?.toLocaleString()} đ
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCostEstimation(style)}
                    className="w-full mt-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-xl transition-colors"
                  >
                    Xem / Chỉnh Sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#212B36] text-lg flex items-center space-x-3">
              <Receipt size={24} className="text-blue-600" />
              <span>Sổ Nhật Ký Duyệt Giá</span>
            </h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Tải báo cáo tổng hợp</button>
        </div>
        <div className="space-y-4">
          {styles.filter(s => s.status === StyleStatus.COST_APPROVED).slice(0, 4).map(style => (
            <div key={style.id} className="flex items-center justify-between py-4 px-6 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-blue-50/30 transition-all group">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {style.code.substring(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{style.name}</p>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{style.code}</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ĐÃ PHÊ DUYỆT {style.proposedPrice?.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Đã chốt</p>
                <p className="text-xs font-bold text-slate-500 mt-1">2 giờ trước</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Estimation Modal */}
      {selectedStyleForEstimation && (
        <CostEstimationModal
          isOpen={showCostEstimationModal}
          onClose={handleCloseCostEstimation}
          style={selectedStyleForEstimation}
          onSuccess={handleCostEstimationSuccess}
        />
      )}
    </div>
  );
};

export default AccountingPage;
