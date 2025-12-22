import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const token = searchParams.get('token');
  const API_BASE_URL = 'http://localhost:8004';

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      setVerifying(false);
      return;
    }

    // Check token validity
    const checkToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token?token=${token}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setVerifying(false);
        } else {
          setError(result.detail || 'Reset token is invalid or expired');
          setVerifying(false);
        }
      } catch (err) {
        setError('Cannot verify reset token. Please try again.');
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (formData.new_password !== formData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.new_password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      setLoading(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(formData.new_password);
    const hasLowerCase = /[a-z]/.test(formData.new_password);
    const hasNumbers = /\d/.test(formData.new_password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password
        }),
      });

      const result = await response.json();
      console.log('Reset password response:', result);

      if (response.ok && result.success) {
        setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.detail || result.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-gray-800 mb-2">Đang xác thực reset token...</p>
          <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Link không hợp lệ</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Yêu cầu link mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg mb-4">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-600">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 text-center">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="Mật khẩu mới"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    formData.new_password && formData.confirm_password && formData.new_password !== formData.confirm_password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Xác nhận mật khẩu"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.new_password && formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">📝 Yêu cầu mật khẩu:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.new_password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Ít nhất 8 ký tự
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Có chữ hoa (A-Z)
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Có chữ thường (a-z)
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Có số (0-9)
                </li>
                <li className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Có ký tự đặc biệt (!@#$%^&*...)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;