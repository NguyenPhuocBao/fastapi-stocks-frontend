// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authAPI.getStoredUser());
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state
  const initializeAuth = async () => {
    setLoading(true);
    
    // Check if token exists and is valid
    const storedToken = localStorage.getItem('token');
    const storedUser = authAPI.getStoredUser();
    
    console.log('🔍 initializeAuth:', { storedToken: !!storedToken, storedUser });
    
    if (!storedToken) {
      console.log('❌ No token found');
      setLoading(false);
      return;
    }
    
    // Check token expiration using JWT decode
    try {
      const decodedToken = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        console.log('❌ Token expired');
        authAPI.logout();
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      
      // Token valid, set user state
      if (storedUser) {
        console.log('✅ Token valid, user found');
        setUser(storedUser);
        setToken(storedToken);
      } else {
        // Try to get user from API
        console.log('🔄 Getting user from API...');
        try {
          const result = await authAPI.getCurrentUser();
          if (result.success) {
            setUser(result.data.user);
          } else {
            authAPI.logout();
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to get user from API:', error);
          // Use stored user if API fails
          if (storedUser) {
            setUser(storedUser);
            setToken(storedToken);
          }
        }
      }
    } catch (error) {
      console.error('❌ Token decode error:', error);
      authAPI.logout();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function - SỬA: Đồng bộ với API mới
  // Trong hàm login của AuthProvider
const login = async (username, password) => {
  setLoading(true);
  try {
    console.log('🔐 AuthContext.login() called:', username);
    
    // Gọi API
    const result = await authAPI.login(username, password);
    console.log('📥 AuthContext.login() API result:', result);
    
    if (result.success && result.data) {
      const token = result.data.access_token;
      const user = result.data.user;
      const expiresIn = result.data.expires_in;
      
      console.log('✅ Login successful, parsed data:', { 
        username: user?.username, 
        tokenLength: token?.length,
        expiresIn 
      });
      
      if (!token || !user) {
        console.error('❌ Missing token or user in response');
        return { 
          success: false, 
          error: 'Invalid response: missing token or user' 
        };
      }
      
      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (expiresIn) {
        localStorage.setItem('token_expiry', Date.now() + (expiresIn * 1000));
      }
      
      console.log('💾 Saved to localStorage');
      console.log('- token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('- user:', localStorage.getItem('user'));
      
      // Cập nhật state
      setUser(user);
      setToken(token);
      
      return { 
        success: true, 
        user: user 
      };
    } else {
      console.error('❌ Login failed:', result.error);
      return { 
        success: false, 
        error: result.error || 'Đăng nhập thất bại' 
      };
    }
  } catch (error) {
    console.error('🔥 AuthContext.login() error:', error);
    return { 
      success: false, 
      error: error.message || 'Đăng nhập thất bại' 
    };
  } finally {
    setLoading(false);
  }
};

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authAPI.register(userData);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.message || 'Đăng ký thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('👋 Logging out...');
    authAPI.logout();
    setUser(null);
    setToken(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const result = await authAPI.updateProfile(profileData);
      if (result.success) {
        // Update local user data
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
    
    // Check token expiry every 30 seconds
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            console.log('⏰ Token expired, logging out...');
            logout();
          }
        } catch (error) {
          console.error('Token check error:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      register,
      updateProfile,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-gray-800 mb-2">Đang xác thực...</p>
          <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
    window.location.href = '/login';
    return null;
  }

  return children;
};