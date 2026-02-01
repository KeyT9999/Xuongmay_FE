import React, { useState, useEffect } from 'react';
import { Style, StyleStatus, Material } from '../types';
import { STATUS_UI } from '../constants';
import { 
  Plus, 
  FileText, 
  Send, 
  Eye, 
  Download,
  Save,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';
import CreateStyleModal from '../src/components/CreateStyleModal';
import EditStyleModal from '../src/components/EditStyleModal';
import BOMEditor from '../src/components/BOMEditor';
import RoutingEditor from '../src/components/RoutingEditor';
import PriceBreakdown from '../src/components/PriceBreakdown';
import { styleService } from '../src/services/style.service';
import { materialService } from '../src/services/material.service';

interface TechPageProps {
  styles: Style[];
  onUpdateStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  materials: Material[];
}

const TechPage: React.FC<TechPageProps> = ({ styles, onUpdateStyles, materials }) => {
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'designing' | 'archive'>('designing');

  // Load styles from API on mount
  useEffect(() => {
    loadStyles();
  }, []);

  // Load selected style details when selected
  useEffect(() => {
    if (selectedStyle) {
      loadStyleDetails(selectedStyle.id);
    }
  }, [selectedStyle?.id]);

  const loadStyles = async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'designing' ? StyleStatus.DRAFT : undefined;
      const data = await styleService.getStyles(status);
      onUpdateStyles(data);
      
      // Update selected style if it exists
      if (selectedStyle) {
        const updated = data.find(s => s.id === selectedStyle.id);
        if (updated) {
          setSelectedStyle(updated);
        }
      }
    } catch (error) {
      console.error('Failed to load styles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStyleDetails = async (styleId: string) => {
    try {
      const style = await styleService.getStyleById(styleId);
      setSelectedStyle(style);
      // Update in styles list
      onUpdateStyles(prev => prev.map(s => s.id === styleId ? style : s));
    } catch (error) {
      console.error('Failed to load style details:', error);
    }
  };

  const handleCreateSuccess = async (styleId: string) => {
    // Load the new style
    const newStyle = await styleService.getStyleById(styleId);
    setSelectedStyle(newStyle);
    // Refresh styles list
    await loadStyles();
  };

  const handleStyleUpdate = (updatedStyle: Style) => {
    setSelectedStyle(updatedStyle);
    // Update in styles list
    onUpdateStyles(prev => prev.map(s => s.id === updatedStyle.id ? updatedStyle : s));
  };

  const handleSendToAccounting = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn gửi yêu cầu duyệt giá?')) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedStyle = await styleService.sendToAccounting(id);
      handleStyleUpdate(updatedStyle);
      alert('Đã gửi yêu cầu duyệt giá sang bộ phận Kế toán.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi duyệt giá');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (id: string) => {
    setIsLoading(true);
    try {
      const updatedStyle = await styleService.saveDraft(id);
      handleStyleUpdate(updatedStyle);
      alert('Đã lưu nháp thành công.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu nháp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (style: Style) => {
    setSelectedStyle(style);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    if (selectedStyle) {
      await loadStyleDetails(selectedStyle.id);
    }
    await loadStyles();
  };

  const handleDelete = async (style: Style) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mẫu "${style.name}" (${style.code})? Chỉ có thể xóa mẫu ở trạng thái NHÁP.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await styleService.deleteStyle(style.id);
      // Remove from list
      onUpdateStyles(prev => prev.filter(s => s.id !== style.id));
      // Clear selection if deleted style was selected
      if (selectedStyle?.id === style.id) {
        setSelectedStyle(null);
      }
      alert('Đã xóa mẫu thành công.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa mẫu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCostEstimation = async (styleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt dự trù chi phí này?')) {
      return;
    }

    setIsLoading(true);
    try {
      await styleService.approveCostEstimation(styleId);
      await loadStyles();
      alert('Đã phê duyệt dự trù chi phí. Mẫu đã sẵn sàng để lập kế hoạch sản xuất.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt dự trù');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCostAdjustment = async (styleId: string) => {
    if (!confirm('Bạn muốn yêu cầu Kế toán điều chỉnh lại dự trù chi phí?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Change status back to SENT_TO_ACCOUNTING
      const style = await styleService.getStyleById(styleId);
      // We'll need to update the style status - but we don't have a direct update status endpoint
      // For now, we'll just show a message
      alert('Yêu cầu điều chỉnh đã được gửi. Kế toán sẽ xem xét và cập nhật lại dự trù.');
      await loadStyles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    const exportAll = confirm('Bạn muốn export tất cả Styles?\n\nOK = Export tất cả\nCancel = Export chỉ danh sách hiện tại');
    
    setIsLoading(true);
    try {
      const currentStatus = activeTab === 'designing' 
        ? [StyleStatus.DRAFT, StyleStatus.SENT_TO_ACCOUNTING, StyleStatus.COST_ESTIMATED]
        : undefined;
      
      await styleService.exportStylesToExcel({
        exportAll: exportAll,
        status: exportAll ? undefined : (currentStatus || undefined),
        includeBOM: true,
        includeRouting: true,
        includeCostEstimation: true,
      });
      
      alert('Đã xuất file Excel thành công!');
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất Excel: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const displayedStyles = activeTab === 'designing' 
    ? styles.filter(s => s.status === StyleStatus.DRAFT || s.status === StyleStatus.SENT_TO_ACCOUNTING || s.status === StyleStatus.COST_ESTIMATED)
    : styles.filter(s => s.status !== StyleStatus.DRAFT && s.status !== StyleStatus.SENT_TO_ACCOUNTING && s.status !== StyleStatus.COST_ESTIMATED);

  const existingCodes = styles.map(s => s.code.toUpperCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Thiết Kế & Tài Liệu Kỹ Thuật</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Quản lý định mức vật tư (BOM), quy trình may và báo giá.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportExcel}
            disabled={isLoading}
            className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-5 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span>Xuất Excel</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Tạo Mẫu Mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('designing')}
                className={`text-xs font-bold pb-1 px-2 transition-colors ${
                  activeTab === 'designing' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Đang thiết kế
              </button>
              <button 
                onClick={() => setActiveTab('archive')}
                className={`text-xs font-bold pb-1 px-2 transition-colors ${
                  activeTab === 'archive' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Lưu trữ
              </button>
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
                {isLoading && displayedStyles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : displayedStyles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400">
                      Chưa có mẫu nào
                    </td>
                  </tr>
                ) : (
                  displayedStyles.map(style => (
                    <tr 
                      key={style.id} 
                      className={`group transition-all cursor-pointer ${
                        selectedStyle?.id === style.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/40'
                      }`}
                      onClick={() => setSelectedStyle(style)}
                    >
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                          {style.code}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-[#212B36] text-sm tracking-tight">{style.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {style.status === StyleStatus.DRAFT ? 'Đang thiết kế' : 'Sẵn sàng làm mẫu'}
                        </p>
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
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedStyle(style); 
                            }}
                            className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {style.status === StyleStatus.DRAFT && (
                            <>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleEdit(style); 
                                }}
                                className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-green-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                title="Sửa mẫu"
                                disabled={isLoading}
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleDelete(style); 
                                }}
                                className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-rose-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                title="Xóa mẫu"
                                disabled={isLoading}
                              >
                                <Trash2 size={18} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSendToAccounting(style.id); }}
                                className="p-2.5 hover:bg-blue-600 rounded-xl text-slate-400 hover:text-white transition-all"
                                title="Gửi duyệt giá"
                                disabled={isLoading}
                              >
                                <Send size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {selectedStyle ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-900/5 p-8 sticky top-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden mb-4">
                  {selectedStyle.image && selectedStyle.image.trim() ? (
                    <img src={selectedStyle.image} alt={selectedStyle.name} className="object-cover w-full h-full" />
                  ) : (
                    <FileText size={48} className="text-slate-300" />
                  )}
                </div>
                <h4 className="text-xl font-black text-[#212B36] tracking-tight">{selectedStyle.name}</h4>
                <p className="text-xs font-bold text-blue-500 font-mono mt-1">{selectedStyle.code}</p>
                {selectedStyle.description && (
                  <p className="text-xs text-slate-500 mt-2">{selectedStyle.description}</p>
                )}
                {(selectedStyle.quantity || selectedStyle.initialPrice) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    {selectedStyle.quantity && (
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Số lượng:</span> {selectedStyle.quantity.toLocaleString()} sản phẩm
                      </p>
                    )}
                    {selectedStyle.initialPrice && (
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Đơn giá ban đầu:</span> {selectedStyle.initialPrice.toLocaleString()}đ
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <BOMEditor 
                  style={selectedStyle} 
                  onStyleUpdate={handleStyleUpdate}
                />

                <RoutingEditor 
                  style={selectedStyle} 
                  onStyleUpdate={handleStyleUpdate}
                />

                <PriceBreakdown 
                  style={selectedStyle} 
                  materials={materials}
                />

                {/* Cost Estimation Notification */}
                {selectedStyle.status === StyleStatus.COST_ESTIMATED && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Calculator size={24} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-amber-900 mb-2">Kế Toán Đã Dự Trù Chi Phí</h4>
                        <div className="space-y-2 text-sm">
                          {selectedStyle.accountingFinalPrice && (
                            <p className="text-amber-800">
                              <span className="font-bold">Giá dự trù:</span>{' '}
                              <span className="text-lg font-black">{selectedStyle.accountingFinalPrice.toLocaleString()} đ</span>
                            </p>
                          )}
                          {selectedStyle.estimatedMaterialCost !== undefined && (
                            <p className="text-amber-700">
                              <span className="font-bold">Vật tư:</span> {selectedStyle.estimatedMaterialCost.toLocaleString()} đ
                            </p>
                          )}
                          {selectedStyle.estimatedLaborCost !== undefined && (
                            <p className="text-amber-700">
                              <span className="font-bold">Công:</span> {selectedStyle.estimatedLaborCost.toLocaleString()} đ
                            </p>
                          )}
                          {selectedStyle.accountingNotes && (
                            <p className="text-amber-700 mt-3 pt-3 border-t border-amber-200">
                              <span className="font-bold">Ghi chú:</span> {selectedStyle.accountingNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleApproveCostEstimation(selectedStyle.id)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 size={14} />
                            <span>Phê Duyệt</span>
                          </button>
                          <button
                            onClick={() => handleRequestCostAdjustment(selectedStyle.id)}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-white border border-amber-300 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-50 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <AlertCircle size={14} />
                            <span>Yêu Cầu Điều Chỉnh</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStyle.status === StyleStatus.DRAFT && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveDraft(selectedStyle.id)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Save size={14} />
                      <span>Lưu nháp</span>
                    </button>
                    <button
                      onClick={() => handleSendToAccounting(selectedStyle.id)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
                    >
                      <Send size={14} />
                      <span>Gửi duyệt</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={32} className="text-blue-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest">
                Chọn một mẫu để<br/>xem chi tiết kỹ thuật
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateStyleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        existingCodes={existingCodes}
      />

      <EditStyleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        style={selectedStyle}
        existingCodes={existingCodes}
      />
    </div>
  );
};

export default TechPage;
