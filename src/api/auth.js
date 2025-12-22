const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8004';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.detail || data.message || 'API request failed',
        data
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    
    if (error.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      window.location.href = '/login';
    }
    
    return { 
      success: false, 
      error: error.message || 'Network error',
      status: error.status
    };
  }
};

// Authentication API functions
export const authAPI = {
  // Login user - SỬA: Dùng JSON thay vì FormData
 login: async (username, password) => {
  try {
    console.log('🌐 authAPI.login() calling:', `${API_BASE_URL}/api/auth/login`);
    console.log('📤 Request body:', { username, password });
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    });

    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📥 Full response data:', data);
    
    if (!response.ok) {
      // Xử lý validation errors (422)
      if (response.status === 422 && data.detail) {
        const errorMsg = Array.isArray(data.detail) 
          ? data.detail.map(err => err.msg || err.loc?.join('.')).join(', ')
          : data.detail;
        return { 
          success: false, 
          error: errorMsg || 'Validation failed'
        };
      }
      
      return { 
        success: false, 
        error: data.detail || data.message || `Login failed (${response.status})`
      };
    }

    // API trả về format: {success, message, data: {...}}
    if (data.success && data.data) {
      console.log('✅ API login successful');
      return { 
        success: true, 
        data: data.data  // data.data chứa access_token, user, etc.
      };
    } else {
      console.error('❌ Invalid response format:', data);
      return { 
        success: false, 
        error: 'Invalid response format from server'
      };
    }
  } catch (error) {
    console.error('🔥 authAPI.login() error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error' 
    };
  }
},

  // Register new user
  register: async (userData) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user info
  getCurrentUser: async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { success: false, error: 'No token found' };
  }

  try {
    console.log('🔍 authAPI.getCurrentUser() calling with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('📥 getCurrentUser response status:', response.status);
    
    const data = await response.json();
    console.log('📥 getCurrentUser response data:', data);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: data.detail || data.message || 'Failed to get user'
      };
    }

    // API verify trả về format: {success, message, data: {user: {...}}}
    if (data.success && data.data) {
      return { 
        success: true, 
        data: data.data.user || data.data
      };
    } else {
      return { 
        success: false, 
        error: 'Invalid response format'
      };
    }
  } catch (error) {
    console.error('🔥 authAPI.getCurrentUser() error:', error);
    return { 
      success: false, 
      error: error.message || 'Network error'
    };
  }
},

  // Verify token
  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    return apiCall('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Check token validity - SỬA: Dùng verify endpoint
  checkToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { valid: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return { 
        valid: response.ok && data.success, 
        status: response.status,
        data: data
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
    
    // Redirect to login page
    window.location.href = '/login';
  },

  // Check if token is expired
  isTokenExpired: () => {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  },

  // Get stored user
  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Store user data
  storeUserData: (token, user, expiresIn) => {
    console.log('💾 Storing user data:', { user, expiresIn });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    if (expiresIn) {
      localStorage.setItem('token_expiry', Date.now() + (expiresIn * 1000));
    }
  }
};

// API functions for main backend
export const mainAPI = {
  // Get stocks
  getStocks: async () => {
    const MAIN_API_URL = process.env.REACT_APP_MAIN_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${MAIN_API_URL}/api/stocks`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stocks');
    }
    
    return response.json();
  },

  // Get stock details
  getStockDetails: async (symbol) => {
    const MAIN_API_URL = process.env.REACT_APP_MAIN_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${MAIN_API_URL}/api/stocks/${symbol}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch details for ${symbol}`);
    }
    
    return response.json();
  },

  // Get market data
  getMarketData: async () => {
    const MAIN_API_URL = process.env.REACT_APP_MAIN_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${MAIN_API_URL}/api/market`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    return response.json();
  },

  // Get news
  getNews: async () => {
    const MAIN_API_URL = process.env.REACT_APP_MAIN_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${MAIN_API_URL}/api/news`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    return response.json();
  }
};

// Custom hooks for API calls
export const useAuth = () => {
  const login = async (username, password) => {
    try {
      console.log('🔄 useAuth.login called with:', username);
      const result = await authAPI.login(username, password);
      console.log('📥 useAuth.login result:', result);
      
      if (result.success) {
        // Lưu thông tin user
        authAPI.storeUserData(
          result.data.access_token,
          result.data.user,
          result.data.expires_in
        );
        return { 
          success: true, 
          user: result.data.user 
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('🔥 useAuth.login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    return authAPI.register(userData);
  };

  const logout = () => {
    authAPI.logout();
  };

  const checkAuth = async () => {
    if (authAPI.isTokenExpired()) {
      authAPI.logout();
      return false;
    }

    const result = await authAPI.checkToken();
    if (!result.valid) {
      authAPI.logout();
      return false;
    }

    return true;
  };

  return {
    login,
    register,
    logout,
    checkAuth,
    getCurrentUser: authAPI.getCurrentUser,
    getStoredUser: authAPI.getStoredUser,
    isAuthenticated: () => {
      const user = authAPI.getStoredUser();
      const token = localStorage.getItem('token');
      const isExpired = authAPI.isTokenExpired();
      console.log('🔍 isAuthenticated check:', { user: !!user, token: !!token, isExpired });
      return !!user && !!token && !isExpired;
    }
  };
};

export default authAPI;