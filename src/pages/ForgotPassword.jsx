import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetInfo, setResetInfo] = useState(null);

  const API_BASE_URL = 'http://localhost:8004';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResetInfo(null);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log('Forgot password response:', result);

      if (response.ok && result.success) {
        setSuccess(result.message);
        
        // Nếu là demo và có reset link trong response
        if (result.data?.reset_link) {
          setResetInfo({
            token: result.data.reset_token,
            link: result.data.reset_link,
            expiresIn: result.data.expires_in
          });
        }
      } else {
        setError(result.detail || result.message || 'Yêu cầu thất bại');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quên mật khẩu</h1>
          <p className="text-gray-600">Nhập email để nhận link đặt lại mật khẩu</p>
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
              
              {/* Demo info - chỉ hiển thị trong môi trường phát triển */}
              {resetInfo && process.env.NODE_ENV === 'development' && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-800 font-medium mb-1">🔗 Demo Reset Link:</p>
                  <a 
                    href={resetInfo.link}
                    className="text-xs text-blue-600 break-all hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetInfo.link}
                  </a>
                  <p className="text-xs text-gray-600 mt-1">
                    Token: <code className="text-xs">{resetInfo.token}</code>
                  </p>
                  <p className="text-xs text-gray-600">
                    Expires in: {Math.floor(resetInfo.expiresIn / 60)} minutes
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi yêu cầu...
                </span>
              ) : 'Gửi link đặt lại mật khẩu'}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              💡 <strong>Demo mode:</strong> Link reset sẽ hiển thị trên trang này.<br/>
              Trong môi trường production, link sẽ được gửi qua email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;