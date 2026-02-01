import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { Shirt, LogIn, Loader2, AlertCircle, X, CheckCircle2, Mail } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordIdentifier, setForgotPasswordIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify'>('request');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);

  // Call onLoginSuccess if already authenticated
  useEffect(() => {
    if (isAuthenticated && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setIsLoading(false);
      return;
    }

    try {
      await login({ username, password });
      // Call onLoginSuccess callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Shirt className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-[#212B36] tracking-tight mb-2">
            Quản Lý Xưởng May
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Hệ thống quản lý xưởng may
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-blue-900/5 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#212B36] tracking-tight mb-1">
              Đăng nhập
            </h2>
            <p className="text-slate-500 text-sm">
              Nhập thông tin để truy cập hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-900"
                placeholder="Nhập tên đăng nhập hoặc email"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-900"
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Demo: admin / admin123
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <Mail className="text-blue-600" size={24} />
                <span>Quên mật khẩu</span>
              </h3>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordStep('request');
                  setForgotPasswordIdentifier('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setForgotPasswordError(null);
                  setForgotPasswordSuccess(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {forgotPasswordStep === 'request' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Nhập tên đăng nhập hoặc email của bạn. Chúng tôi sẽ gửi mã OTP đến email đã đăng ký.
                </p>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Tên đăng nhập hoặc Email
                  </label>
                  <input
                    type="text"
                    value={forgotPasswordIdentifier}
                    onChange={(e) => setForgotPasswordIdentifier(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                    placeholder="Nhập tên đăng nhập hoặc email"
                    disabled={isSendingOtp}
                  />
                </div>

                {forgotPasswordSuccess && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">{forgotPasswordSuccess}</span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-600 font-medium mb-1">💡 Lưu ý:</p>
                      <p className="text-xs text-blue-700">
                        • Kiểm tra thư mục <strong>Spam/Junk</strong> nếu không thấy email<br/>
                        • Email có thể bị delay vài phút<br/>
                        • Kiểm tra đúng địa chỉ email: <strong>{forgotPasswordIdentifier}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {forgotPasswordError && (
                  <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{forgotPasswordError}</span>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStep('request');
                      setForgotPasswordIdentifier('');
                      setForgotPasswordError(null);
                      setForgotPasswordSuccess(null);
                    }}
                    className="flex-1 py-3 px-4 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // #region agent log
                      fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:248',message:'Forgot password button clicked',data:{identifier:forgotPasswordIdentifier?forgotPasswordIdentifier.substring(0,3)+'***':null,hasIdentifier:!!forgotPasswordIdentifier.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      // #endregion
                      if (!forgotPasswordIdentifier.trim()) {
                        setForgotPasswordError('Vui lòng nhập tên đăng nhập hoặc email');
                        return;
                      }
                      setIsSendingOtp(true);
                      setForgotPasswordError(null);
                      setForgotPasswordSuccess(null);
                      try {
                        // #region agent log
                        fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:256',message:'Calling forgotPassword API',data:{identifier:forgotPasswordIdentifier.trim().substring(0,3)+'***'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        const result = await authService.forgotPassword(forgotPasswordIdentifier.trim());
                        // #region agent log
                        fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:260',message:'Forgot password success',data:{message:result.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        setForgotPasswordSuccess(result.message);
                        setTimeout(() => {
                          setForgotPasswordStep('verify');
                        }, 1500);
                      } catch (err: any) {
                        // #region agent log
                        fetch('http://127.0.0.1:7246/ingest/b8c5c32e-4bc2-4136-b3e2-da74b7a15dbc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:265',message:'Forgot password error',data:{errorMessage:err?.message,responseStatus:err?.response?.status,responseData:err?.response?.data,hasResponse:!!err?.response},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                        setForgotPasswordError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
                      } finally {
                        setIsSendingOtp(false);
                      }
                    }}
                    disabled={isSendingOtp}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center space-x-2"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <span>Gửi mã OTP</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới.
                </p>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isResettingPassword}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    disabled={isResettingPassword}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all outline-none font-medium"
                    placeholder="Nhập lại mật khẩu"
                    disabled={isResettingPassword}
                  />
                </div>

                {forgotPasswordError && (
                  <div className="flex items-center space-x-2 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{forgotPasswordError}</span>
                  </div>
                )}

                {forgotPasswordSuccess && (
                  <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">{forgotPasswordSuccess}</span>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep('request');
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setForgotPasswordError(null);
                      setForgotPasswordSuccess(null);
                    }}
                    className="flex-1 py-3 px-4 border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    disabled={isResettingPassword}
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!otp || otp.length !== 6) {
                        setForgotPasswordError('Mã OTP phải có 6 chữ số');
                        return;
                      }
                      if (!newPassword || newPassword.length < 6) {
                        setForgotPasswordError('Mật khẩu phải có tối thiểu 6 ký tự');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setForgotPasswordError('Mật khẩu xác nhận không khớp');
                        return;
                      }
                      setIsResettingPassword(true);
                      setForgotPasswordError(null);
                      setForgotPasswordSuccess(null);
                      try {
                        const result = await authService.resetPassword(
                          forgotPasswordIdentifier.trim(),
                          otp,
                          newPassword
                        );
                        setForgotPasswordSuccess(result.message);
                        setTimeout(() => {
                          setShowForgotPassword(false);
                          setForgotPasswordStep('request');
                          setForgotPasswordIdentifier('');
                          setOtp('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setForgotPasswordError(null);
                          setForgotPasswordSuccess(null);
                        }, 2000);
                      } catch (err: any) {
                        setForgotPasswordError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
                      } finally {
                        setIsResettingPassword(false);
                      }
                    }}
                    disabled={isResettingPassword}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center space-x-2"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Đặt lại mật khẩu</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
