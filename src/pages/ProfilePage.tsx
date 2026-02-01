import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, UpdateUserRequest } from '../services/user.service';
import { User } from '../../types';
import { 
  User as UserIcon, 
  Save, 
  Upload, 
  X, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Camera,
  Mail,
  UserCircle
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
      setError('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await userService.uploadAvatar(file);
      setSuccess('Cập nhật avatar thành công!');
      await refreshUser();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateUserRequest = {
        name: formData.name,
        email: formData.email,
      };
      const updatedUser = await userService.updateProfile(updateData);
      setSuccess('Cập nhật thông tin thành công!');
      await refreshUser();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Hồ Sơ Cá Nhân</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Quản lý thông tin và avatar của bạn.</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
          <XCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-[#212B36] mb-6">Ảnh Đại Diện</h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=128`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm flex items-center space-x-2 transition-all active:scale-95 disabled:active:scale-100"
              >
                <Camera size={18} />
                <span>{isUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}</span>
              </button>

              <p className="text-xs text-slate-500 text-center">
                JPG, PNG, GIF hoặc WEBP<br/>
                Tối đa 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-black text-[#212B36] mb-6">Thông Tin Cá Nhân</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Tên đăng nhập
                </label>
                <div className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-600 font-medium">
                  {user.username || 'N/A'}
                </div>
                <p className="mt-1 text-xs text-slate-500">Tên đăng nhập không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Chức vụ
                </label>
                <div className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-600 font-medium">
                  {user.role || 'N/A'}
                </div>
                <p className="mt-1 text-xs text-slate-500">Chức vụ không thể thay đổi</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
