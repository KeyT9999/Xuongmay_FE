import React, { useState, useEffect } from 'react';
import { X, Save, Send, Calculator, Package, Wrench, FileText, DollarSign } from 'lucide-react';
import { Style, Material } from '../../types';
import { styleService } from '../services/style.service';
import { materialService } from '../services/material.service';

interface CostEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: Style | null;
  onSuccess: () => void;
}

const CostEstimationModal: React.FC<CostEstimationModalProps> = ({
  isOpen,
  onClose,
  style,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'override' | 'summary'>('breakdown');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Breakdown tab state
  const [bomAdjustments, setBomAdjustments] = useState<Record<string, number>>({});
  const [routingAdjustments, setRoutingAdjustments] = useState<Record<string, number>>({});
  
  // Override tab state
  const [overrideData, setOverrideData] = useState({
    estimatedMaterialCost: '',
    estimatedLaborCost: '',
    profitMargin: '',
    finalPrice: '',
  });
  
  // Summary tab state
  const [notes, setNotes] = useState('');
  
  // Calculated values
  const [calculatedMaterialCost, setCalculatedMaterialCost] = useState(0);
  const [calculatedLaborCost, setCalculatedLaborCost] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (isOpen && style) {
      loadMaterials();
    }
  }, [isOpen, style]);

  useEffect(() => {
    if (isOpen && style && materials.length > 0) {
      initializeData();
    }
  }, [isOpen, style, materials]);

  const loadMaterials = async () => {
    try {
      const data = await materialService.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const initializeData = () => {
    if (!style) return;
    
    // Initialize from existing cost estimation or style data
    if (style.estimatedMaterialCost !== undefined) {
      setOverrideData({
        estimatedMaterialCost: style.estimatedMaterialCost.toString(),
        estimatedLaborCost: style.estimatedLaborCost?.toString() || '',
        profitMargin: style.accountingProfitMargin?.toString() || '',
        finalPrice: style.accountingFinalPrice?.toString() || '',
      });
    }
    
    if (style.accountingNotes) {
      setNotes(style.accountingNotes);
    }
    
    // Initialize BOM adjustments
    const bomAdj: Record<string, number> = {};
    if (style.bom && style.bom.length > 0) {
      style.bom.forEach(item => {
        const material = materials.find(m => m.id === item.materialId);
        if (material) {
          bomAdj[item.id] = material.costPerUnit;
        }
      });
    }
    setBomAdjustments(bomAdj);
    
    // Initialize routing adjustments
    const routingAdj: Record<string, number> = {};
    if (style.routing && style.routing.length > 0) {
      style.routing.forEach(step => {
        routingAdj[step.id] = step.laborRate;
      });
    }
    setRoutingAdjustments(routingAdj);
    
    calculateCosts();
  };

  const calculateCosts = () => {
    if (!style) return;
    
    let materialCost = 0;
    let laborCost = 0;
    
    // Calculate from BOM adjustments if available
    if (style.bom && style.bom.length > 0 && Object.keys(bomAdjustments).length > 0) {
      style.bom.forEach(item => {
        const adjustedPrice = bomAdjustments[item.id] || 0;
        const amount = item.quantity * (1 + item.wasteRate / 100);
        materialCost += amount * adjustedPrice;
      });
    } else if (overrideData.estimatedMaterialCost) {
      materialCost = parseFloat(overrideData.estimatedMaterialCost) || 0;
    }
    
    // Calculate from routing adjustments if available
    if (style.routing && style.routing.length > 0 && Object.keys(routingAdjustments).length > 0) {
      style.routing.forEach(step => {
        const adjustedRate = routingAdjustments[step.id] || step.laborRate;
        laborCost += (step.minutes * adjustedRate) / 60;
      });
    } else if (overrideData.estimatedLaborCost) {
      laborCost = parseFloat(overrideData.estimatedLaborCost) || 0;
    }
    
    setCalculatedMaterialCost(materialCost);
    setCalculatedLaborCost(laborCost);
    
    // Calculate final price
    const profitMargin = parseFloat(overrideData.profitMargin) || 0;
    const directPrice = parseFloat(overrideData.finalPrice) || 0;
    
    if (directPrice > 0) {
      setFinalPrice(directPrice);
    } else {
      const totalCost = materialCost + laborCost;
      setFinalPrice(Math.ceil(totalCost * (1 + profitMargin / 100)));
    }
  };

  useEffect(() => {
    calculateCosts();
  }, [bomAdjustments, routingAdjustments, overrideData]);

  const handleBOMPriceChange = (bomId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBomAdjustments({ ...bomAdjustments, [bomId]: numValue });
  };

  const handleRoutingRateChange = (stepId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setRoutingAdjustments({ ...routingAdjustments, [stepId]: numValue });
  };

  const handleSaveDraft = async () => {
    if (!style) return;
    
    setIsLoading(true);
    try {
      const data: any = {
        estimatedMaterialCost: calculatedMaterialCost,
        estimatedLaborCost: calculatedLaborCost,
        profitMargin: parseFloat(overrideData.profitMargin) || 0,
        finalPrice: finalPrice,
        notes: notes,
      };
      
      // If override mode, use override values
      if (overrideData.estimatedMaterialCost || overrideData.estimatedLaborCost) {
        data.estimatedMaterialCost = parseFloat(overrideData.estimatedMaterialCost) || calculatedMaterialCost;
        data.estimatedLaborCost = parseFloat(overrideData.estimatedLaborCost) || calculatedLaborCost;
      }
      
      if (style.estimatedMaterialCost !== undefined) {
        await styleService.updateCostEstimation(style.id, data);
      } else {
        await styleService.createCostEstimation(style.id, data);
      }
      
      onSuccess();
      alert('Đã lưu nháp dự trù chi phí');
    } catch (error: any) {
      console.error('Failed to save cost estimation:', error);
      alert('Lỗi khi lưu dự trù: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!style) return;
    
    // Validate
    if (finalPrice <= 0 && !overrideData.finalPrice) {
      alert('Vui lòng nhập giá cuối cùng hoặc điều chỉnh các thành phần chi phí');
      return;
    }
    
    setIsLoading(true);
    try {
      const data: any = {
        estimatedMaterialCost: calculatedMaterialCost,
        estimatedLaborCost: calculatedLaborCost,
        profitMargin: parseFloat(overrideData.profitMargin) || 0,
        finalPrice: finalPrice,
        notes: notes,
      };
      
      // If override mode, use override values
      if (overrideData.estimatedMaterialCost || overrideData.estimatedLaborCost) {
        data.estimatedMaterialCost = parseFloat(overrideData.estimatedMaterialCost) || calculatedMaterialCost;
        data.estimatedLaborCost = parseFloat(overrideData.estimatedLaborCost) || calculatedLaborCost;
      }
      
      if (style.estimatedMaterialCost !== undefined) {
        await styleService.updateCostEstimation(style.id, data);
      } else {
        await styleService.createCostEstimation(style.id, data);
      }
      
      await styleService.submitCostEstimation(style.id);
      
      onSuccess();
      alert('Đã gửi dự trù chi phí cho Kỹ thuật xem xét');
      onClose();
    } catch (error: any) {
      console.error('Failed to submit cost estimation:', error);
      alert('Lỗi khi gửi dự trù: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !style) return null;

  const formatPrice = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || materialId;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-[#212B36]">Dự Trù Chi Phí</h2>
            <p className="text-sm text-slate-500 mt-1">{style.code} - {style.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
              activeTab === 'breakdown'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package size={16} />
              <span>Breakdown Chi Tiết</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('override')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
              activeTab === 'override'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calculator size={16} />
              <span>Nhập Trực Tiếp</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Tổng Hợp & Ghi Chú</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              {/* BOM Table */}
              {style.bom && style.bom.length > 0 ? (
                <div>
                  <h3 className="text-lg font-black text-[#212B36] mb-4 flex items-center space-x-2">
                    <Package size={20} />
                    <span>Vật Tư (BOM)</span>
                  </h3>
                  <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Vật Tư</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Số Lượng</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Hao Hụt</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Giá Gốc</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Giá Điều Chỉnh</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Tổng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {style.bom.map((item) => {
                          const material = materials.find(m => m.id === item.materialId);
                          const originalPrice = material?.costPerUnit || 0;
                          const adjustedPrice = bomAdjustments[item.id] || originalPrice;
                          const amount = item.quantity * (1 + item.wasteRate / 100);
                          const total = amount * adjustedPrice;
                          
                          return (
                            <tr key={item.id} className="border-t border-slate-100 hover:bg-white">
                              <td className="p-4 font-bold text-slate-900">{getMaterialName(item.materialId)}</td>
                              <td className="p-4 text-right text-slate-600">{item.quantity}</td>
                              <td className="p-4 text-right text-slate-600">{item.wasteRate}%</td>
                              <td className="p-4 text-right text-slate-500">{formatPrice(originalPrice)} đ</td>
                              <td className="p-4 text-right">
                                <input
                                  type="number"
                                  value={adjustedPrice || ''}
                                  onChange={(e) => handleBOMPriceChange(item.id, e.target.value)}
                                  className="w-32 text-right px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  step="1000"
                                />
                              </td>
                              <td className="p-4 text-right font-black text-blue-600">{formatPrice(total)} đ</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                  <Package size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Không có BOM từ Kỹ thuật</p>
                  <p className="text-sm text-slate-400 mt-2">Sử dụng tab "Nhập Trực Tiếp" để nhập giá</p>
                </div>
              )}

              {/* Routing Table */}
              {style.routing && style.routing.length > 0 ? (
                <div>
                  <h3 className="text-lg font-black text-[#212B36] mb-4 flex items-center space-x-2">
                    <Wrench size={20} />
                    <span>Công Đoạn (Routing)</span>
                  </h3>
                  <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Công Đoạn</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Phút</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Rate Gốc</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Rate Điều Chỉnh</th>
                          <th className="text-right p-4 text-xs font-black text-slate-600 uppercase tracking-wider">Tổng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {style.routing.map((step) => {
                          const originalRate = step.laborRate;
                          const adjustedRate = routingAdjustments[step.id] || originalRate;
                          const total = (step.minutes * adjustedRate) / 60;
                          
                          return (
                            <tr key={step.id} className="border-t border-slate-100 hover:bg-white">
                              <td className="p-4 font-bold text-slate-900">{step.operation}</td>
                              <td className="p-4 text-right text-slate-600">{step.minutes}</td>
                              <td className="p-4 text-right text-slate-500">{formatPrice(originalRate)} đ/giờ</td>
                              <td className="p-4 text-right">
                                <input
                                  type="number"
                                  value={adjustedRate || ''}
                                  onChange={(e) => handleRoutingRateChange(step.id, e.target.value)}
                                  className="w-32 text-right px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  min="0"
                                  step="1000"
                                />
                              </td>
                              <td className="p-4 text-right font-black text-blue-600">{formatPrice(total)} đ</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                  <Wrench size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Không có Routing từ Kỹ thuật</p>
                  <p className="text-sm text-slate-400 mt-2">Sử dụng tab "Nhập Trực Tiếp" để nhập giá</p>
                </div>
              )}
            </div>
          )}

          {/* Override Tab */}
          {activeTab === 'override' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-black text-[#212B36] mb-4">Nhập Trực Tiếp Chi Phí</h3>
                <p className="text-sm text-slate-500 mb-6">Nhập trực tiếp các giá trị chi phí mà không cần dựa vào BOM/Routing</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tổng Giá Vật Tư (đ)</label>
                  <input
                    type="number"
                    value={overrideData.estimatedMaterialCost}
                    onChange={(e) => setOverrideData({ ...overrideData, estimatedMaterialCost: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tổng Giá Công (đ)</label>
                  <input
                    type="number"
                    value={overrideData.estimatedLaborCost}
                    onChange={(e) => setOverrideData({ ...overrideData, estimatedLaborCost: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tỷ Lệ Lợi Nhuận (%)</label>
                  <input
                    type="number"
                    value={overrideData.profitMargin}
                    onChange={(e) => setOverrideData({ ...overrideData, profitMargin: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Giá Cuối Cùng (đ) - Tùy chọn</label>
                  <input
                    type="number"
                    value={overrideData.finalPrice}
                    onChange={(e) => setOverrideData({ ...overrideData, finalPrice: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tự động tính nếu để trống"
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-slate-400 mt-2">Nếu để trống, giá sẽ được tính tự động từ (Vật tư + Công) × (1 + Lợi nhuận%)</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-black text-[#212B36] mb-4">Tổng Hợp Chi Phí</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-bold">Tổng Giá Vật Tư:</span>
                    <span className="text-xl font-black text-slate-900">{formatPrice(calculatedMaterialCost)} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-bold">Tổng Giá Công:</span>
                    <span className="text-xl font-black text-slate-900">{formatPrice(calculatedLaborCost)} đ</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-slate-600 font-bold">Tổng Chi Phí:</span>
                    <span className="text-xl font-black text-blue-600">{formatPrice(calculatedMaterialCost + calculatedLaborCost)} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-bold">Lợi Nhuận ({overrideData.profitMargin || 0}%):</span>
                    <span className="text-xl font-black text-emerald-600">
                      {formatPrice(Math.ceil((calculatedMaterialCost + calculatedLaborCost) * (parseFloat(overrideData.profitMargin) || 0) / 100))} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-blue-200">
                    <span className="text-lg font-black text-slate-900">Giá Cuối Cùng:</span>
                    <span className="text-3xl font-black text-blue-600">{formatPrice(finalPrice)} đ</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ghi Chú</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Nhập ghi chú về dự trù chi phí..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50">
          <div className="text-sm text-slate-500">
            Giá đề xuất ban đầu: <span className="font-bold text-slate-700">{formatPrice(style.proposedPrice || 0)} đ</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Lưu Nháp</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-blue-600/20"
            >
              <Send size={18} />
              <span>Gửi Cho Kỹ Thuật</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationModal;
