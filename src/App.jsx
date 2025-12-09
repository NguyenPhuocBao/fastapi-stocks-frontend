import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import AIAnalysis from './pages/AIAnalysis'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      
      <div className="flex">
        {isAuthenticated && <Sidebar />}
        
        <main className="flex-1 p-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/market" element={
              isAuthenticated ? <Market /> : <Navigate to="/login" />
            } />
            <Route path="/stock/:symbol" element={
              isAuthenticated ? <StockDetail /> : <Navigate to="/login" />
            } />
            
            {/* Default Route */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            } />
          </Routes>

          

          
        </main>
      </div>
    </div>
  );
}

export default App;