import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  // Sử dụng AuthContext
  const { login: authLogin } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8004';

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/health`, {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        console.error('API connection error:', err);
        setApiStatus('error');
      }
    };

    checkApiStatus();
    
    // Load saved credentials if remember me was checked
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', formData.username);
      
      // Sử dụng authLogin từ AuthContext
      const result = await authLogin(formData.username, formData.password);
      
      console.log('📥 AuthContext login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful via AuthContext');
        console.log('👤 User:', result.user);
        
        // Remember username if checked
        if (rememberMe) {
          localStorage.setItem('remembered_username', formData.username);
        } else {
          localStorage.removeItem('remembered_username');
        }

        setError('');
        
        // CHUYỂN HƯỚNG - Sửa chỗ này
        console.log('🎯 Login successful, navigating to dashboard...');
        console.log('📍 Current URL:', window.location.href);
        
        // Cách 1: Dùng window.location (chắc chắn nhất)
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        
        // Hoặc cách 2: Dùng navigate với replace
        // navigate('/dashboard', { replace: true });
        
      } else {
        console.error('❌ Login failed:', result.error);
        // ĐẢM BẢO error là string, không phải object
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || JSON.stringify(result.error);
        setError(errorMessage || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('🔥 Login error:', err);
      // ĐẢM BẢO error là string
      const errorMessage = typeof err === 'string' 
        ? err 
        : err?.message || JSON.stringify(err);
        
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError(`Không thể kết nối đến máy chủ: ${API_BASE_URL}. Kiểm tra:
        1. Backend có đang chạy trên port 8004 không?
        2. CORS settings có đúng không?`);
      } else {
        setError(errorMessage || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleDemoLogin = async () => {
    setFormData({
      username: 'admin',
      password: 'abc123'  // Dùng tài khoản admin đã test thành công
    });
    
    // Auto-submit sau khi cập nhật state
    setTimeout(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      }
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Render API status indicator
  const renderApiStatus = () => {
    switch(apiStatus) {
      case 'connected':
        return (
          <div className="inline-flex items-center text-green-600 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            ✅ API Connected
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center text-red-600 text-sm">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
            ❌ API Disconnected
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center text-yellow-600 text-sm">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
            🔄 Checking API...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            StockAI Trading
          </h1>
          <p className="text-gray-600 text-lg">Phân tích chứng khoán thông minh với AI</p>
          
          {/* API Status */}
          <div className="mt-4">
            {renderApiStatus()}
          </div>
          {apiStatus === 'error' && (
            <p className="text-sm text-red-500 mt-2">
              Không thể kết nối đến {API_BASE_URL}. Hãy đảm bảo backend đang chạy.
            </p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Error Display - ĐÃ SỬA LỖI RENDERING OBJECT */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 font-medium">
                  {/* ĐẢM BẢO error là string, không phải object */}
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Tên đăng nhập
                </div>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Nhập tên đăng nhập của bạn"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center">
                  <LockClosedIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Mật khẩu
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-offset-0"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-3 text-gray-700 font-medium">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || apiStatus === 'error'}
              className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] ${
                loading || apiStatus === 'error'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Đăng Nhập
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link 
                  to="/register" 
                  className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Section */}
          <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="text-center mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                🚀 Test Account (Đã xác nhận hoạt động)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-700">Username</div>
                <div className="text-gray-900 font-mono">admin</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-gray-700">Password</div>
                <div className="text-gray-900 font-mono">abc123</div>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading || apiStatus === 'error'}
              className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Đăng nhập bằng tài khoản Test
              </span>
            </button>
            <p className="text-xs text-green-600 mt-2 text-center">
              ✅ Tài khoản này đã test thành công qua API
            </p>
          </div>

          {/* API Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}</code>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Đảm bảo backend authentication đang chạy trên port 8004
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 StockAI. Bản quyền thuộc về StockAI Trading Platform.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">Điều khoản</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">Bảo mật</a>
            <a href="#" className="text-sm text-gray-500 hover:text-blue-600">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;