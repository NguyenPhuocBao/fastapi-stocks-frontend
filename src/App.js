import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Market from './pages/Market';
import AIAnalysis from './pages/AIAnalysis';
import News from './pages/News';
import StockDetail from './pages/StockDetail';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext'; // SỬA: './contexts/' → './context/'
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Layout component for protected routes (with Navbar & Sidebar)
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Layout for auth pages (without Navbar & Sidebar)
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <Router>
          <Routes>
            {/* Public routes (no auth required) */}
            <Route path="/login" element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            } />

            {/* Protected routes (require auth) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/market" element={
              <ProtectedRoute>
                <Layout>
                  <Market />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/stock/:symbol" element={
              <ProtectedRoute>
                <Layout>
                  <StockDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/stocks/:symbol" element={
              <ProtectedRoute>
                <Layout>
                  <StockDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/news" element={
              <ProtectedRoute>
                <Layout>
                  <News />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ai-analysis" element={
              <ProtectedRoute>
                <Layout>
                  <AIAnalysis />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Redirect root to dashboard (protected) */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Forgot Password and Reset Password routes */}
            <Route path="/forgot-password" element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            } />
            <Route path="/reset-password" element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            } />

            {/* 404 Route - redirect to login if not authenticated */}
            <Route path="*" element={
              <Navigate to="/login" replace />
            } />
          </Routes>
        </Router>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;