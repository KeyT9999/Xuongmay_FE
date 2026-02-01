import React from 'react';
import { Style, Material } from '../types';

interface PriceBreakdownProps {
  style: Style;
  materials: Material[];
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ style, materials }) => {
  // Calculate material cost
  const materialCost = style.bom.reduce((acc, item) => {
    const material = materials.find(m => m.id === item.materialId);
    if (!material) return acc;
    const amount = item.quantity * (1 + item.wasteRate / 100);
    return acc + (amount * material.costPerUnit);
  }, 0);

  // Calculate labor cost
  const laborCost = style.routing.reduce((acc, step) => {
    return acc + (step.minutes * step.laborRate / 60);
  }, 0);

  const totalCost = materialCost + laborCost;
  const profit = style.proposedPrice - totalCost;
  const profitMargin = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

  return (
    <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-600/20">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">
        Giá Đề Xuất (Tạm tính)
      </p>

      <div className="space-y-3 mb-4 pb-4 border-b border-white/20">
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Vật tư:</span>
          <span className="font-bold">{materialCost.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Công:</span>
          <span className="font-bold">{laborCost.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Tổng chi phí:</span>
          <span className="font-bold">{totalCost.toLocaleString()}đ</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-80">Lợi nhuận ({profitMargin.toFixed(1)}%):</span>
          <span className="font-bold">{profit.toLocaleString()}đ</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
            Tổng giá đề xuất
          </p>
          <p className="text-3xl font-black tracking-tighter">
            {style.proposedPrice.toLocaleString()}
            <span className="text-lg ml-1 opacity-60">đ</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;
