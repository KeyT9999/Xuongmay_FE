import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Layers } from 'lucide-react';
import { Style, Material, BOMItem } from '../types';
import { styleService } from '../services/style.service';
import { materialService } from '../services/material.service';

interface BOMEditorProps {
  style: Style;
  onStyleUpdate: (updatedStyle: Style) => void;
}

const BOMEditor: React.FC<BOMEditorProps> = ({ style, onStyleUpdate }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    wasteRate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await materialService.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ materialId: '', quantity: '', wasteRate: '0' });
    setErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ materialId: '', quantity: '', wasteRate: '0' });
    setErrors({});
  };

  const handleEdit = (item: BOMItem) => {
    setEditingId(item.id);
    setFormData({
      materialId: item.materialId,
      quantity: item.quantity.toString(),
      wasteRate: item.wasteRate.toString(),
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.materialId) {
      newErrors.materialId = 'Vui lòng chọn vật tư';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0';
    }
    if (formData.wasteRate === '' || parseFloat(formData.wasteRate) < 0) {
      newErrors.wasteRate = 'Tỷ lệ hao hụt phải >= 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let updatedStyle: Style;
      if (editingId) {
        updatedStyle = await styleService.updateBOMItem(style.id, editingId, {
          quantity: parseFloat(formData.quantity),
          wasteRate: parseFloat(formData.wasteRate),
        });
      } else {
        updatedStyle = await styleService.addBOMItem(style.id, {
          materialId: formData.materialId,
          quantity: parseFloat(formData.quantity),
          wasteRate: parseFloat(formData.wasteRate),
        });
      }
      onStyleUpdate(updatedStyle);
      handleCancel();
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bomId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vật tư này?')) return;

    setIsLoading(true);
    try {
      const updatedStyle = await styleService.deleteBOMItem(style.id, bomId);
      onStyleUpdate(updatedStyle);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || 'N/A';
  };

  const getMaterialUnit = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.unit || '';
  };

  const calculateItemCost = (item: BOMItem): number => {
    const material = materials.find(m => m.id === item.materialId);
    if (!material) return 0;
    const amount = item.quantity * (1 + item.wasteRate / 100);
    return amount * material.costPerUnit;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
          <Layers size={14} className="text-blue-500" />
          <span>Định mức (BOM)</span>
        </h5>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-3 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Vật tư <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.materialId}
              onChange={(e) => {
                setFormData({ ...formData, materialId: e.target.value });
                setErrors({ ...errors, materialId: '' });
              }}
              className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${
                errors.materialId ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
              }`}
              disabled={isLoading || !!editingId}
            >
              <option value="">-- Chọn vật tư --</option>
              {materials.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} ({mat.unit})
                </option>
              ))}
            </select>
            {errors.materialId && (
              <p className="mt-1 text-[10px] text-rose-500">{errors.materialId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Số lượng <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({ ...formData, quantity: e.target.value });
                  setErrors({ ...errors, quantity: '' });
                }}
                className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${
                  errors.quantity ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
                }`}
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.quantity && (
                <p className="mt-1 text-[10px] text-rose-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                % Hao hụt
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.wasteRate}
                onChange={(e) => {
                  setFormData({ ...formData, wasteRate: e.target.value });
                  setErrors({ ...errors, wasteRate: '' });
                }}
                className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${
                  errors.wasteRate ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
                }`}
                disabled={isLoading}
                placeholder="0"
              />
              {errors.wasteRate && (
                <p className="mt-1 text-[10px] text-rose-500">{errors.wasteRate}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="text-[10px] text-rose-500">{errors.submit}</p>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              <Check size={14} />
              <span>{editingId ? 'Lưu' : 'Thêm'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {style.bom.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 text-center py-4">Chưa có vật tư nào</p>
        )}
        {style.bom.map((item) => {
          const isEditing = editingId === item.id;
          if (isEditing) return null;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group"
            >
              <div className="flex-1">
                <p className="text-xs font-black text-slate-800 tracking-tight">
                  {getMaterialName(item.materialId)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {item.quantity} {getMaterialUnit(item.materialId)} • {item.wasteRate}% Hao hụt
                </p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">
                  {calculateItemCost(item).toLocaleString()}đ
                </p>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BOMEditor;
