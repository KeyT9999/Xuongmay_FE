import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, CreateUserRequest, UpdateUserRequest } from '../services/user.service';
import { User, UserRole } from '../../types';
import { ROLE_CONFIG } from '../../constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus,
  X,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: UserRole.TECH,
    avatar: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Không thể tải danh sách người dùng');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      await userService.createUser(formData);
      setSuccess(`Tạo người dùng thành công! Email đã được gửi đến ${formData.email} với thông tin đăng nhập.`);
      setShowCreateModal(false);
      resetForm();
      loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tạo người dùng');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      setError(null);
      const updateData: UpdateUserRequest = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
      };
      // Only include password if it's provided (not empty)
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      await userService.updateUser(editingUser.id, updateData);
      setSuccess(`Cập nhật người dùng thành công! Email thông báo đã được gửi đến ${formData.email || editingUser.email}.`);
      setEditingUser(null);
      resetForm();
      loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleDelete = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa người dùng ${userToDelete?.name}? Email thông báo sẽ được gửi đến ${userToDelete?.email}.`)) {
      return;
    }
    try {
      await userService.deleteUser(userId);
      setSuccess(`Vô hiệu hóa người dùng thành công! Email thông báo đã được gửi đến ${userToDelete?.email}.`);
      loadUsers();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError('Không thể vô hiệu hóa người dùng');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: UserRole.TECH,
      avatar: '',
    });
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show password
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Chỉ quản trị viên mới có quyền truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#212B36] tracking-tight">Quản Lý Người Dùng</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Tạo và quản lý tài khoản người dùng trong hệ thống.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
            setEditingUser(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center space-x-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Tạo Người Dùng</span>
        </button>
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

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole)}
            className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
          >
            <option value="">Tất cả chức vụ</option>
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{ROLE_CONFIG[role]?.label || role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Tên đăng nhập</th>
                <th className="px-8 py-5">Họ và Tên</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Chức vụ</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={24} />
                    <p className="text-slate-400">Đang tải...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-mono text-sm font-bold text-slate-900">{user.username}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-[#212B36] text-sm">{user.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                        {ROLE_CONFIG[user.role]?.icon}
                        <span>{ROLE_CONFIG[user.role]?.label || user.role}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {user.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600">
                          <CheckCircle2 size={12} />
                          <span>Hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600">
                          <XCircle size={12} />
                          <span>Vô hiệu hóa</span>
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-all"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <UserPlus className="text-blue-600" size={24} />
                <span>{editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                  setError(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingUser) {
                  handleUpdate();
                } else {
                  handleCreate();
                }
              }}
              className="space-y-4"
            >
              {!editingUser && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
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
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                  placeholder="user@example.com"
                />
                {!editingUser && (
                  <p className="mt-2 text-xs text-slate-500">
                    📧 Email này sẽ nhận thông tin đăng nhập (username và password) sau khi tạo tài khoản.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Chức vụ *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{ROLE_CONFIG[role]?.label || role}</option>
                  ))}
                </select>
              </div>

              {editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Mật khẩu mới (Tùy chọn)
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                    placeholder="Để trống nếu không đổi mật khẩu"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Chỉ nhập nếu muốn đổi mật khẩu. Tối thiểu 6 ký tự.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    resetForm();
                    setError(null);
                  }}
                  className="flex-1 py-3 px-4 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
