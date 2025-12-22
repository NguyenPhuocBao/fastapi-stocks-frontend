import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import AIAnalysis from './pages/AIAnalysis';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    // Kiểm tra token trong localStorage khi khởi động
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Kiểm tra token có hợp lệ không (có thể decode JWT để check expiry)
        return true;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        
        <main className={`flex-1 ${isAuthenticated ? 'p-6' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <Login onLoginSuccess={() => setIsAuthenticated(true)} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <Register />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? 
                  <Dashboard onLogout={() => setIsAuthenticated(false)} /> : 
                  <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/market" 
              element={
                isAuthenticated ? 
                  <Market /> : 
                  <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/stock/:symbol" 
              element={
                isAuthenticated ? 
                  <StockDetail /> : 
                  <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/ai-analysis" 
              element={
                isAuthenticated ? 
                  <AIAnalysis /> : 
                  <Navigate to="/login" />
              } 
            />
            
            {/* Default Route */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/login" />
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;