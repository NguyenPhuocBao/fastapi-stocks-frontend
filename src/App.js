import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <QueryProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/market" element={<Market />} />
                <Route path="/stock/:symbol" element={<StockDetail />} />
                <Route path="/stocks/:symbol" element={<StockDetail />} />    
                <Route path="/news" element={<News />} />
                <Route path="/ai-analysis" element={<AIAnalysis />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryProvider>
  );
}

export default App;