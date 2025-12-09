// src/pages/AIAnalysis.jsx - SỬA LỖI IMPORTS
import React, { useState } from 'react'; // Xóa useEffect và useRef không dùng
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  BoltIcon,
  BeakerIcon,
  ClockIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowsRightLeftIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon // THÊM Icon này
} from '@heroicons/react/24/outline';

const AIAnalysis = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedStock, setSelectedStock] = useState('VNM');
  const [timeframe, setTimeframe] = useState('1D');
  const [showModelDetails, setShowModelDetails] = useState(false);
  
  // Danh sách cổ phiếu
  const stocks = [
    { symbol: 'VNM', name: 'Vinamilk', price: 75.50, change: 1.23 },
    { symbol: 'FPT', name: 'FPT Corp', price: 120.25, change: 2.50 },
    { symbol: 'HPG', name: 'Hoa Phat', price: 62.40, change: 1.20 },
    { symbol: 'VCB', name: 'Vietcombank', price: 95.80, change: 0.80 },
    { symbol: 'SSI', name: 'SSI Securities', price: 45.30, change: -0.30 },
    { symbol: 'MWG', name: 'Mobile World', price: 68.90, change: 1.80 },
  ];

  // Dữ liệu mẫu
  const predictions = [
    {
      symbol: 'VNM',
      current_price: 75.50,
      predicted_price: 76.80,
      prediction_change: 1.72,
      prediction_trend: 'up',
      confidence: 88,
      model: 'lstm',
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'FPT',
      current_price: 120.25,
      predicted_price: 122.80,
      prediction_change: 2.12,
      prediction_trend: 'up',
      confidence: 85,
      model: 'xgboost',
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'HPG',
      current_price: 62.40,
      predicted_price: 61.20,
      prediction_change: -1.92,
      prediction_trend: 'down',
      confidence: 79,
      model: 'lstm',
      timestamp: new Date().toISOString(),
    },
  ];

  const stockPrediction = predictions.find(p => p.symbol === selectedStock) || {};

  const modelMetrics = {
    accuracy: 87.5,
    rmse: 2.34,
    auc_roc: 0.89,
    mae: 1.87,
  };

  const alerts = [
    {
      id: 1,
      symbol: 'VNM',
      type: 'price_surge',
      title: 'Giá tăng mạnh dự đoán',
      message: 'AI dự đoán VNM tăng 1.7% trong 24h tới với độ tin cậy 88%',
      severity: 'medium',
      confidence: 88,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 2,
      symbol: 'SSI',
      type: 'high_volatility',
      title: 'Biến động cao',
      message: 'Phát hiện biến động bất thường, chênh lệch dự đoán >2.5%',
      severity: 'high',
      confidence: 91,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    },
  ];

  const tabs = [
    { id: 'predictions', name: 'Dự Đoán AI', icon: ChartBarIcon },
    { id: 'portfolio', name: 'Đề Xuất Đầu Tư', icon: ChartPieIcon },
    { id: 'alerts', name: 'Cảnh Báo', icon: ExclamationTriangleIcon },
    { id: 'models', name: 'Mô Hình AI', icon: CpuChipIcon },
  ];

  const timeframes = [
    { id: '1H', name: '1 Giờ' },
    { id: '1D', name: '1 Ngày' },
    { id: '1W', name: '1 Tuần' },
    { id: '1M', name: '1 Tháng' },
  ];

  // XÓA HÀM formatNumber KHÔNG DÙNG
  // const formatNumber = (num) => {
  //   if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  //   if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  //   if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  //   return num?.toFixed(2) || '0';
  // };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Phân Tích & Dự Đoán</h1>
          <p className="text-gray-600">Dự đoán xu hướng giá và cảnh báo biến động bằng AI</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Mô hình đang hoạt động</span>
            </div>
            <div className="text-sm text-gray-500">
              Cập nhật: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Cập nhật dự đoán
          </button>
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chọn Cổ Phiếu & Thời Gian</h3>
                
                {/* Stock Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {stocks.map(stock => (
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
                        <div className="text-sm text-gray-600 mt-1">{stock.name}</div>
                        <div className={`text-sm font-medium mt-2 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
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
                    Dự Đoán AI: {selectedStock}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Mô hình: LSTM • Cập nhật: 5 phút trước
                  </div>
                </div>
                
                {stockPrediction.symbol ? (
                  <>
                    {/* Prediction Result */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Giá hiện tại</div>
                          <div className="text-3xl font-bold text-gray-900 mt-1">
                            ${stockPrediction.current_price?.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Dự đoán {timeframe}</div>
                          <div className={`text-3xl font-bold mt-1 ${
                            stockPrediction.prediction_trend === 'up' ? 'text-green-600' :
                            stockPrediction.prediction_trend === 'down' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            ${stockPrediction.predicted_price?.toFixed(2)}
                          </div>
                          <div className={`flex items-center text-sm font-medium ${
                            stockPrediction.prediction_change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stockPrediction.prediction_trend === 'up' ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : stockPrediction.prediction_trend === 'down' ? (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            ) : null}
                            {stockPrediction.prediction_change >= 0 ? '+' : ''}
                            {stockPrediction.prediction_change?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Trend Prediction */}
                      <div className="p-4 bg-gray-50 rounded-lg mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              stockPrediction.prediction_trend === 'up' ? 'bg-green-100' :
                              stockPrediction.prediction_trend === 'down' ? 'bg-red-100' :
                              'bg-yellow-100'
                            }`}>
                              {stockPrediction.prediction_trend === 'up' ? (
                                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                              ) : stockPrediction.prediction_trend === 'down' ? (
                                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                              ) : (
                                <ArrowsRightLeftIcon className="h-5 w-5 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Xu hướng dự đoán</div>
                              <div className="text-sm text-gray-600">
                                {stockPrediction.prediction_trend === 'up' ? 'TĂNG MẠNH' :
                                 stockPrediction.prediction_trend === 'down' ? 'GIẢM MẠNH' :
                                 'ỔN ĐỊNH'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Độ tin cậy</div>
                            <div className="text-xl font-bold text-blue-600">
                              {stockPrediction.confidence}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Model Details */}
                      <button
                        onClick={() => setShowModelDetails(!showModelDetails)}
                        className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-between"
                      >
                        <span className="font-medium">Chi tiết mô hình dự đoán</span>
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
                              <div className="text-sm text-gray-500">Model sử dụng</div>
                              <div className="font-medium">LSTM + XGBoost Ensemble</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Training period</div>
                              <div className="font-medium">2 năm (2022-2024)</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Features</div>
                              <div className="font-medium">OHLC + Volume + RSI + MACD</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Last backtest</div>
                              <div className="font-medium">Accuracy: 87.3%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Backtest Chart */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">So Sánh Dự Đoán vs Thực Tế (Backtest)</h4>
                      <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <ChartBarIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                          <p className="text-gray-600">Biểu đồ backtest sẽ hiển thị tại đây</p>
                          <p className="text-sm text-gray-500 mt-1">Dữ liệu từ MongoDB prediction collection</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có dự đoán cho {selectedStock}</p>
                    <p className="text-sm text-gray-500 mt-1">AI model đang xử lý dữ liệu mới nhất</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Model Metrics */}
            <div className="space-y-6">
              {/* Model Performance */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Độ Tin Cậy Mô Hình
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Accuracy</span>
                      <span>{modelMetrics.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${modelMetrics.accuracy}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>RMSE (Root Mean Square Error)</span>
                      <span>{modelMetrics.rmse}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${100 - (modelMetrics.rmse * 10)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>AUC-ROC Score</span>
                      <span>{modelMetrics.auc_roc}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${modelMetrics.auc_roc * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">Overall Rating</div>
                    <div className="text-2xl font-bold text-green-600">Excellent</div>
                    <div className="text-xs text-gray-500">Dựa trên backtest 30 ngày</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thống Kê Nhanh</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Dự đoán hôm nay</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">87.5%</div>
                    <div className="text-sm text-gray-600">Accuracy TB</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <div className="text-sm text-gray-600">Cảnh báo 24h</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1.2s</div>
                    <div className="text-sm text-gray-600">Thời gian xử lý</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Đề Xuất Danh Mục Đầu Tư Thông Minh</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Portfolio Recommendations */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Danh Mục AI Đề Xuất</h4>
              <div className="space-y-4">
                {[
                  { symbol: 'VNM', allocation: 25, reason: 'Blue-chip ổn định, dividend cao' },
                  { symbol: 'FPT', allocation: 20, reason: 'Tăng trưởng mạnh, hợp đồng quốc tế' },
                  { symbol: 'HPG', allocation: 18, reason: 'Ngành thép phục hồi' },
                  { symbol: 'VCB', allocation: 15, reason: 'Ngân hàng dẫn đầu' },
                  { symbol: 'MWG', allocation: 12, reason: 'Bán lẻ phục hồi' },
                  { symbol: 'SSI', allocation: 10, reason: 'Hưởng lợi từ thị trường' },
                ].map((stock, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="font-bold text-lg text-gray-900 mr-3">{stock.symbol}</div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {stock.allocation}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating: <span className="font-medium text-green-600">BUY</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{stock.reason}</p>
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
                      <div className="text-sm text-green-700">6 ngành khác nhau</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CalculatorIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-blue-800">Risk Score: 4.2/10</div>
                      <div className="text-sm text-blue-700">Rủi ro thấp, phù hợp đầu tư dài hạn</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartPieIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <div className="font-medium text-purple-800">Expected Return: 15-20%</div>
                      <div className="text-sm text-purple-700">Trong 12 tháng tới</div>
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
            <h3 className="text-xl font-bold text-gray-900">Cảnh Báo AI Tự Động</h3>
            <div className="text-sm text-gray-500">
              Từ workflow n8n • Cập nhật real-time
            </div>
          </div>
          
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.type === 'high_volatility' ? 'bg-red-50 border-red-200' :
                  alert.type === 'price_surge' ? 'bg-green-50 border-green-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${
                      alert.type === 'high_volatility' ? 'bg-red-100' :
                      alert.type === 'price_surge' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      {alert.type === 'high_volatility' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      ) : alert.type === 'price_surge' ? (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <BoltIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>📊 {alert.symbol}</span>
                        <span>⏰ {new Date(alert.timestamp).toLocaleTimeString()}</span>
                        <span>⚡ {alert.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity === 'high' ? 'CAO' : 
                     alert.severity === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'models' && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Mô Hình AI & Workflow</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Workflow Diagram */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Workflow n8n AI Prediction</h4>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Schedule Trigger', desc: 'Chạy mỗi giờ', icon: ClockIcon, color: 'gray' },
                  { step: 2, title: 'MongoDB Find', desc: 'Lấy 10 mã cổ phiếu gần nhất', icon: ChartBarIcon, color: 'green' },
                  { step: 3, title: 'FastAPI /predict', desc: 'Gửi OHLC + Volume → nhận dự đoán', icon: BoltIcon, color: 'blue' },
                  { step: 4, title: 'Function Node', desc: 'Tính chênh lệch predicted vs actual', icon: CalculatorIcon, color: 'purple' },
                  { step: 5, title: 'IF Condition', desc: 'Nếu chênh lệch > 2% → cảnh báo', icon: ExclamationTriangleIcon, color: 'red' },
                  { step: 6, title: 'Telegram Bot', desc: 'Gửi cảnh báo real-time', icon: CheckCircleIcon, color: 'cyan' },
                  { step: 7, title: 'MongoDB Insert', desc: 'Lưu vào collection prediction', icon: ChartBarIcon, color: 'green' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className={`p-3 rounded-lg mr-4 bg-${item.color}-100`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <div className="text-sm text-gray-500">Step {item.step}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Model Architecture */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Kiến Trúc Mô Hình AI</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h5 className="font-bold text-gray-900 mb-2">📊 LSTM Model</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• 3 LSTM layers (128, 64, 32 units)</li>
                    <li>• Dropout: 0.2 để tránh overfitting</li>
                    <li>• Dense output layer với activation linear</li>
                    <li>• Training data: 70% train, 15% validation, 15% test</li>
                    <li>• Loss function: Mean Squared Error</li>
                    <li>• Optimizer: Adam (learning rate: 0.001)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h5 className="font-bold text-gray-900 mb-2">📈 Feature Engineering</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-white rounded">OHLC Prices</div>
                    <div className="p-2 bg-white rounded">Volume</div>
                    <div className="p-2 bg-white rounded">RSI (14)</div>
                    <div className="p-2 bg-white rounded">MACD</div>
                    <div className="p-2 bg-white rounded">Bollinger Bands</div>
                    <div className="p-2 bg-white rounded">Moving Averages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;