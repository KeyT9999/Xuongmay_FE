import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { styleService } from '../services/style.service';
import { Style } from '../../types';

interface EditStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  style: Style | null;
  existingCodes: string[];
}

const EditStyleModal: React.FC<EditStyleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  style,
  existingCodes,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: undefined as number | undefined,
    initialPrice: undefined as number | undefined,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load style data when modal opens
  useEffect(() => {
    if (isOpen && style) {
      setFormData({
        name: style.name || '',
        description: style.description || '',
        quantity: style.quantity,
        initialPrice: style.initialPrice,
      });
      setImagePreview(style.image && style.image.trim() ? style.image : null);
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, style]);

  const formatPrice = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parsePrice = (value: string): number => {
    return Number(value.replace(/,/g, ''));
  };

  const validateQuantity = (value: string): string | null => {
    if (!value.trim()) return null;
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Số lượng phải lớn hơn 0';
    }
    if (!Number.isInteger(num)) {
      return 'Số lượng phải là số nguyên';
    }
    return null;
  };

  const validatePrice = (value: string): string | null => {
    if (!value.trim()) return null;
    const num = parsePrice(value);
    if (isNaN(num) || num < 0) {
      return 'Đơn giá không được âm';
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
        setErrors({ ...errors, image: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Kích thước file không được vượt quá 5MB' });
        return;
      }
      setImageFile(file);
      setErrors({ ...errors, image: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!style) return;

    const nameError = !formData.name.trim() ? 'Tên sản phẩm không được để trống' : null;
    const quantityError = formData.quantity ? validateQuantity(formData.quantity.toString()) : null;
    const priceError = formData.initialPrice ? validatePrice(formData.initialPrice.toString()) : null;

    if (nameError || quantityError || priceError) {
      setErrors({
        name: nameError || '',
        quantity: quantityError || '',
        initialPrice: priceError || '',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update style
      await styleService.updateStyle(style.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        quantity: formData.quantity,
        initialPrice: formData.initialPrice,
      });

      // Upload new image if provided
      if (imageFile) {
        await styleService.uploadStyleImage(style.id, imageFile);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mẫu' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', quantity: undefined, initialPrice: undefined });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen || !style) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <span>Sửa Mẫu</span>
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Mã Mẫu</p>
            <p className="text-sm font-black text-slate-800 font-mono">{style.code}</p>
            <p className="text-xs text-slate-500 mt-1">Mã mẫu không thể thay đổi</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tên Sản Phẩm <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              placeholder="VD: Áo Polo Nam Classic"
              className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none font-bold transition-all ${
                errors.name ? 'border-rose-300' : 'border-slate-100 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Mô Tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả về sản phẩm..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Số lượng sản xuất dự kiến
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, quantity: value ? Number(value) : undefined });
                  const error = validateQuantity(value);
                  setErrors({ ...errors, quantity: error || '' });
                }}
                placeholder="VD: 1000"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none font-bold transition-all ${
                  errors.quantity ? 'border-rose-300' : 'border-slate-100 focus:border-blue-500'
                }`}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-rose-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Đơn giá đề xuất ban đầu
              </label>
              <input
                type="text"
                value={formData.initialPrice !== undefined ? formatPrice(formData.initialPrice.toString()) : ''}
                onChange={(e) => {
                  const formatted = formatPrice(e.target.value);
                  const numValue = formatted ? parsePrice(formatted) : undefined;
                  setFormData({ ...formData, initialPrice: numValue });
                  const error = formatted ? validatePrice(formatted) : null;
                  setErrors({ ...errors, initialPrice: error || '' });
                }}
                placeholder="VD: 125,000"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl focus:outline-none font-bold transition-all ${
                  errors.initialPrice ? 'border-rose-300' : 'border-slate-100 focus:border-blue-500'
                }`}
                disabled={isLoading}
              />
              {errors.initialPrice && (
                <p className="mt-1 text-xs text-rose-500">{errors.initialPrice}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Hình Ảnh
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-slate-900/60 text-white rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                >
                  <ImageIcon size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Click để chọn ảnh</p>
                  <p className="text-xs text-slate-300 mt-1">JPG, PNG, GIF, WEBP (tối đa 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              {errors.image && (
                <p className="text-xs text-rose-500">{errors.image}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Lưu Thay Đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStyleModal;
