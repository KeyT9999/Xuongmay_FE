import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { Workflow } from 'lucide-react';
import { Style, RoutingStep } from '../../types';
import { styleService } from '../services/style.service';

interface RoutingEditorProps {
  style: Style;
  onStyleUpdate: (updatedStyle: Style) => void;
}

const RoutingEditor: React.FC<RoutingEditorProps> = ({ style, onStyleUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    operation: '',
    minutes: '',
    laborRate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ operation: '', minutes: '', laborRate: '' });
    setErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ operation: '', minutes: '', laborRate: '' });
    setErrors({});
  };

  const handleEdit = (step: RoutingStep) => {
    setEditingId(step.id);
    setFormData({
      operation: step.operation,
      minutes: step.minutes.toString(),
      laborRate: step.laborRate.toString(),
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.operation.trim()) {
      newErrors.operation = 'Tên công đoạn không được để trống';
    }
    if (!formData.minutes || parseFloat(formData.minutes) <= 0) {
      newErrors.minutes = 'Số phút phải lớn hơn 0';
    }
    if (!formData.laborRate || parseFloat(formData.laborRate) <= 0) {
      newErrors.laborRate = 'Rate công phải lớn hơn 0';
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
        updatedStyle = await styleService.updateRoutingStep(style.id, editingId, {
          operation: formData.operation.trim(),
          minutes: parseFloat(formData.minutes),
          laborRate: parseFloat(formData.laborRate),
        });
      } else {
        updatedStyle = await styleService.addRoutingStep(style.id, {
          operation: formData.operation.trim(),
          minutes: parseFloat(formData.minutes),
          laborRate: parseFloat(formData.laborRate),
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

  const handleDelete = async (stepId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công đoạn này?')) return;

    setIsLoading(true);
    try {
      const updatedStyle = await styleService.deleteRoutingStep(style.id, stepId);
      onStyleUpdate(updatedStyle);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = style.routing.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= style.routing.length) return;

    // Create new order
    const newOrder = [...style.routing];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    setIsLoading(true);
    try {
      const updatedStyle = await styleService.reorderRouting(style.id, {
        stepIds: newOrder.map(s => s.id),
      });
      onStyleUpdate(updatedStyle);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi sắp xếp');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStepCost = (step: RoutingStep): number => {
    return (step.minutes * step.laborRate) / 60;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
          <Workflow size={14} className="text-blue-500" />
          <span>Quy trình (Routing)</span>
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
              Tên công đoạn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.operation}
              onChange={(e) => {
                setFormData({ ...formData, operation: e.target.value });
                setErrors({ ...errors, operation: '' });
              }}
              className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${errors.operation ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
                }`}
              disabled={isLoading}
              placeholder="VD: Cắt vải, May thân..."
            />
            {errors.operation && (
              <p className="mt-1 text-[10px] text-rose-500">{errors.operation}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Số phút <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.minutes}
                onChange={(e) => {
                  setFormData({ ...formData, minutes: e.target.value });
                  setErrors({ ...errors, minutes: '' });
                }}
                className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${errors.minutes ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
                  }`}
                disabled={isLoading}
                placeholder="0.0"
              />
              {errors.minutes && (
                <p className="mt-1 text-[10px] text-rose-500">{errors.minutes}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Rate công <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="100"
                min="0.01"
                value={formData.laborRate}
                onChange={(e) => {
                  setFormData({ ...formData, laborRate: e.target.value });
                  setErrors({ ...errors, laborRate: '' });
                }}
                className={`w-full px-3 py-2 text-xs bg-white border-2 rounded-lg focus:outline-none transition-all ${errors.laborRate ? 'border-rose-300' : 'border-slate-200 focus:border-blue-500'
                  }`}
                disabled={isLoading}
                placeholder="0"
              />
              {errors.laborRate && (
                <p className="mt-1 text-[10px] text-rose-500">{errors.laborRate}</p>
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
        {style.routing.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 text-center py-4">Chưa có công đoạn nào</p>
        )}
        {style.routing.map((step, index) => {
          const isEditing = editingId === step.id;
          if (isEditing) return null;

          return (
            <div
              key={step.id}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <p className="text-xs font-black text-slate-800 tracking-tight">
                    {step.operation}
                  </p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {step.minutes} phút • {step.laborRate.toLocaleString()}đ/phút
                </p>
                <p className="text-[10px] font-bold text-blue-600 mt-1">
                  {calculateStepCost(step).toLocaleString()}đ
                </p>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <div className="flex flex-col">
                  <button
                    onClick={() => handleMove(step.id, 'up')}
                    disabled={isLoading || index === 0}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMove(step.id, 'down')}
                    disabled={isLoading || index === style.routing.length - 1}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>
                <button
                  onClick={() => handleEdit(step)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(step.id)}
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

export default RoutingEditor;
