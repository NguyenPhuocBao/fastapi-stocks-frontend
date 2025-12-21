// src/pages/AIAnalysis.jsx - ĐÃ SỬA LỖI IMPORTS
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BeakerIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:8003';

const AIAnalysis = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedStock, setSelectedStock] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [stockPredictions, setStockPredictions] = useState([]);
  
  // Fetch AI Analysis data với useCallback để tránh dependency warning
  const fetchAiAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch latest analysis
      const response = await fetch(`${API_BASE_URL}/api/ai/latest?include_predictions=true`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        const analysis = result.data[0];
        setAiAnalysis(analysis);
        
        // Get detailed analysis for predictions
        const detailResponse = await fetch(`${API_BASE_URL}/api/ai/date/${analysis.analysis_date}`);
        const detailResult = await detailResponse.json();
        
        if (detailResult.success) {
          const predictions = detailResult.data.predictions || [];
          setStockPredictions(predictions);
          
          // Set initial selected stock
          if (predictions.length > 0 && !selectedStock) {
            setSelectedStock(predictions[0].symbol);
          }
        }
      } else {
        setError('No AI analysis data available');
      }
      
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError('Failed to load AI analysis data. Please check API connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  useEffect(() => {
    fetchAiAnalysis();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAiAnalysis, 300000);
    return () => clearInterval(interval);
  }, [fetchAiAnalysis]);

  // Get selected stock prediction
  const selectedStockData = stockPredictions.find(p => p.symbol === selectedStock);
  
  // Get top performers (sorted by predicted_change)
  const topPerformers = [...stockPredictions]
    .sort((a, b) => b.predicted_change - a.predicted_change)
    .slice(0, 6);

  // Get risk alerts from aiAnalysis
  const riskAlerts = aiAnalysis?.risk_warnings || [];

  // Tabs
  const tabs = [
    { id: 'predictions', name: 'Dự Đoán AI', icon: ChartBarIcon },
    { id: 'portfolio', name: 'Đề Xuất Đầu Tư', icon: ChartPieIcon },
    { id: 'alerts', name: 'Cảnh Báo', icon: ExclamationTriangleIcon },
    { id: 'news', name: 'Tin Tức', icon: NewspaperIcon },
  ];

  // Timeframes
  const timeframes = [
    { id: '1H', name: '1 Giờ' },
    { id: '1D', name: '1 Ngày' },
    { id: '1W', name: '1 Tuần' },
    { id: '1M', name: '1 Tháng' },
  ];

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return '$' + parseFloat(value).toFixed(2);
  };

  // Format percentage
  const formatPercent = (value) => {
    if (!value) return '0.00%';
    const num = parseFloat(value);
    return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
  };

  // Get trend class
  const getTrendClass = (trend) => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-neutral';
  };

  // Get recommendation class
  const getRecommendationClass = (predictedChange) => {
    if (predictedChange > 2) return 'buy';
    if (predictedChange > 0) return 'hold';
    return 'sell';
  };

  // Calculate confidence score
  const calculateConfidence = (change) => {
    return Math.min(Math.abs(change) * 15, 95);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu phân tích AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAiAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Phân Tích & Dự Đoán Chứng Khoán</h1>
          <p className="text-gray-600">Dự đoán xu hướng giá bằng AI thời gian thực</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                aiAnalysis?.market_trend === 'up' ? 'bg-green-500' :
                aiAnalysis?.market_trend === 'down' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                Xu hướng: <span className={`font-medium ${getTrendClass(aiAnalysis?.market_trend)}`}>
                  {aiAnalysis?.market_trend === 'up' ? 'TĂNG' :
                   aiAnalysis?.market_trend === 'down' ? 'GIẢM' :
                   'ỔN ĐỊNH'}
                </span>
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Cập nhật: {aiAnalysis?.time_ago || 'Vừa xong'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAiAnalysis}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Cập nhật dữ liệu
          </button>
        </div>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Cổ phiếu tăng điểm</div>
              <div className="text-2xl font-bold text-gray-900">{aiAnalysis?.bullish_count || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center">
            <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Cổ phiếu giảm điểm</div>
              <div className="text-2xl font-bold text-gray-900">{aiAnalysis?.bearish_count || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Độ tin cậy AI</div>
              <div className="text-2xl font-bold text-gray-900">{aiAnalysis?.confidence_score || 0}%</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-sm text-gray-600">Top performer</div>
              <div className="text-2xl font-bold text-gray-900">{aiAnalysis?.top_performer || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Stock Selection & Timeframe */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn Cổ Phiếu</h3>
                
                {/* Stock Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {topPerformers.map(stock => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock.symbol)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedStock === stock.symbol
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 mt-1">{stock.company}</div>
                        <div className={`text-sm font-medium mt-2 ${
                          stock.predicted_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercent(stock.predicted_change)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Timeframe Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Khung Thời Gian Dự Đoán</h4>
                <div className="flex flex-wrap gap-2">
                  {timeframes.map(tf => (
                    <button
                      key={tf.id}
                      onClick={() => setTimeframe(tf.id)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        timeframe === tf.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tf.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Prediction Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Dự Đoán AI: {selectedStockData?.symbol || 'Chọn cổ phiếu'}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Ngày phân tích: {aiAnalysis?.analysis_date || 'N/A'}
                  </div>
                </div>
                
                {selectedStockData ? (
                  <>
                    {/* Prediction Result */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Giá hiện tại</div>
                          <div className="text-3xl font-bold text-gray-900 mt-1">
                            {formatCurrency(selectedStockData.current_price)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Dự đoán {timeframe}</div>
                          <div className={`text-3xl font-bold mt-1 ${
                            selectedStockData.predicted_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(selectedStockData.predicted_price)}
                          </div>
                          <div className={`flex items-center text-sm font-medium ${
                            selectedStockData.predicted_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedStockData.predicted_change >= 0 ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            )}
                            {formatPercent(selectedStockData.predicted_change)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Trend Prediction */}
                      <div className="p-4 bg-gray-50 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              selectedStockData.predicted_change >= 0 ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {selectedStockData.predicted_change >= 0 ? (
                                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Xu hướng dự đoán</div>
                              <div className="text-sm text-gray-600">
                                {selectedStockData.predicted_change >= 0 ? 'TĂNG GIÁ' : 'GIẢM GIÁ'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Độ tin cậy AI</div>
                            <div className="text-xl font-bold text-blue-600">
                              {calculateConfidence(selectedStockData.predicted_change).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Model Details */}
                      <button
                        onClick={() => setShowModelDetails(!showModelDetails)}
                        className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-between"
                      >
                        <span className="font-medium">Chi tiết phân tích</span>
                        {showModelDetails ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                      
                      {showModelDetails && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Khuyến nghị</div>
                              <div className={`font-medium ${
                                getRecommendationClass(selectedStockData.predicted_change) === 'buy' ? 'text-green-600' :
                                getRecommendationClass(selectedStockData.predicted_change) === 'sell' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {getRecommendationClass(selectedStockData.predicted_change).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Mức độ rủi ro</div>
                              <div className="font-medium capitalize">{selectedStockData.risk_level || 'medium'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Công ty</div>
                              <div className="font-medium">{selectedStockData.company}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Trend</div>
                              <div className="font-medium capitalize">{selectedStockData.trend || 'neutral'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chọn một cổ phiếu để xem dự đoán AI</p>
                    <p className="text-sm text-gray-500 mt-1">Dữ liệu từ AI Analysis API</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Model Metrics */}
            <div className="space-y-6">
              {/* Market Trend */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CpuChipIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Xu Hướng Thị Trường
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Trend chính</span>
                      <span className={`font-medium ${getTrendClass(aiAnalysis?.market_trend)}`}>
                        {aiAnalysis?.market_trend || 'neutral'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Độ tin cậy</span>
                      <span>{aiAnalysis?.confidence_score || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${aiAnalysis?.confidence_score || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">Tổng cổ phiếu phân tích</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(aiAnalysis?.bullish_count || 0) + (aiAnalysis?.bearish_count || 0)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống Kê AI</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stockPredictions.length}</div>
                    <div className="text-sm text-gray-600">Cổ phiếu phân tích</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{aiAnalysis?.bullish_count || 0}</div>
                    <div className="text-sm text-gray-600">Bullish</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{aiAnalysis?.bearish_count || 0}</div>
                    <div className="text-sm text-gray-600">Bearish</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{aiAnalysis?.top_performer || '-'}</div>
                    <div className="text-sm text-gray-600">Top performer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Đề Xuất Đầu Tư Thông Minh</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Portfolio Recommendations */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Danh Mục AI Đề Xuất</h4>
              <div className="space-y-4">
                {stockPredictions.slice(0, 6).map((stock, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="font-bold text-lg text-gray-900 mr-3">{stock.symbol}</div>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          stock.predicted_change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {formatPercent(stock.predicted_change)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating: <span className={`font-medium ${
                          getRecommendationClass(stock.predicted_change) === 'buy' ? 'text-green-600' :
                          getRecommendationClass(stock.predicted_change) === 'sell' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {getRecommendationClass(stock.predicted_change).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{stock.company}</p>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Giá hiện tại: {formatCurrency(stock.current_price)}</span>
                      <span>Dự đoán: {formatCurrency(stock.predicted_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Portfolio Analysis */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Phân Tích Danh Mục</h4>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="font-medium text-green-800">Đa dạng hóa tốt</div>
                      <div className="text-sm text-green-700">{stockPredictions.length} cổ phiếu</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CalculatorIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-blue-800">Tỷ lệ Bullish/Bearish</div>
                      <div className="text-sm text-blue-700">
                        {aiAnalysis?.bullish_count || 0}:{aiAnalysis?.bearish_count || 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartPieIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <div className="font-medium text-purple-800">Độ tin cậy trung bình</div>
                      <div className="text-sm text-purple-700">{aiAnalysis?.confidence_score || 0}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Cảnh Báo Rủi Ro</h3>
            <div className="text-sm text-gray-500">
              Từ AI Analysis • Cập nhật real-time
            </div>
          </div>
          
          {riskAlerts.length > 0 ? (
            <div className="space-y-4">
              {riskAlerts.map((alert, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg mr-3 bg-red-100">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Rủi ro: {alert.symbol} - {alert.company}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Phát hiện tin tức tiêu cực ({alert.news_count} bài)
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📊 {alert.symbol}</span>
                          <span>💰 {formatCurrency(alert.price)}</span>
                          <span>⚠️ {alert.news_count} tin tức</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      CAO
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Không có cảnh báo rủi ro nào</p>
              <p className="text-sm text-gray-500 mt-1">Thị trường đang ổn định</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'news' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tin Tức Tác Động Thị Trường</h3>
          
          {aiAnalysis?.news_impact && aiAnalysis.news_impact.length > 0 ? (
            <div className="space-y-4">
              {aiAnalysis.news_impact.map((news, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start">
                    <NewspaperIcon className="h-5 w-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{news.title}</h4>
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Xem bài viết →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có dữ liệu tin tức</p>
              <p className="text-sm text-gray-500 mt-1">Dữ liệu sẽ được cập nhật từ n8n workflow</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;