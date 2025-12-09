// src/pages/StockDetail.jsx - SỬA LỖI VÀ LOẠI BỎ RECHARTS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Removed unused Link import
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ShareIcon,
  BellIcon,
  StarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  NewspaperIcon,
  LightBulbIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { stockService } from '../api/stockService';
import { newsService } from '../api/newsService';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  
  const [timeRange, setTimeRange] = useState('1D');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState([]);

  // Fetch stock detail từ backend
  const { 
    data: stock, 
    isLoading: stockLoading, 
    error: stockError,
    refetch: refetchStock
  } = useQuery({
    queryKey: ['stock-detail', symbol],
    queryFn: () => stockService.getStockDetail(symbol),
    refetchInterval: 10000,
    enabled: !!symbol,
  });

  // Fetch news cho stock này
  const {
    data: news = [],
    isLoading: newsLoading,
  } = useQuery({
    queryKey: ['stock-news', symbol],
    queryFn: () => newsService.getStockNews(symbol),
    enabled: !!symbol,
  });

  // Tạo chart data đơn giản (không cần recharts)
  useEffect(() => {
    if (stock) {
      const generateChartData = () => {
        const dataPoints = timeRange === '1D' ? 24 : 
                          timeRange === '1W' ? 7 : 
                          timeRange === '1M' ? 30 : 
                          timeRange === '3M' ? 90 : 
                          timeRange === '1Y' ? 12 : 60;
        
        const basePrice = stock.price || 50;
        const volatility = timeRange === '1D' ? 0.02 : 
                          timeRange === '1W' ? 0.05 : 
                          timeRange === '1M' ? 0.1 : 
                          timeRange === '3M' ? 0.15 : 0.2;
        
        const data = [];
        for (let i = 0; i < dataPoints; i++) {
          const price = basePrice * (1 + (Math.random() - 0.5) * volatility * (dataPoints - i) / dataPoints);
          data.push({
            time: i,
            price: price,
            label: timeRange === '1D' ? `${i}:00` : 
                   timeRange === '1W' ? `Day ${i + 1}` : 
                   timeRange === '1M' ? `Day ${i + 1}` : 
                   `Week ${i + 1}`
          });
        }
        return data;
      };
      
      setChartData(generateChartData());
    }
  }, [stock, timeRange]);

  // Kiểm tra nếu stock đã được thêm vào watchlist
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(symbol));
  }, [symbol]);

  // Toggle favorite
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter(fav => fav !== symbol);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } else {
      favorites.push(symbol);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  // Tạo alert
  const handleCreateAlert = () => {
    if (!alertPrice) return;
    
    const alerts = JSON.parse(localStorage.getItem('price-alerts') || '[]');
    alerts.push({
      symbol,
      price: parseFloat(alertPrice),
      createdAt: new Date().toISOString(),
      triggered: false
    });
    localStorage.setItem('price-alerts', JSON.stringify(alerts));
    
    setAlertPrice('');
    setShowAlertModal(false);
    
    alert(`Alert set for ${symbol} at $${parseFloat(alertPrice).toFixed(2)}`);
  };

  // Format helpers
  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (typeof num === 'string') return num;
    
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num) => {
    if (!num) return '0.00%';
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Tính toán các metrics
  const calculateMetrics = () => {
    if (!stock) return {};
    
    const currentPrice = stock.price || 0;
    const dayLow = stock.low || currentPrice * 0.98;
    const dayHigh = stock.high || currentPrice * 1.02;
    const yearLow = stock.yearLow || currentPrice * 0.8;
    const yearHigh = stock.yearHigh || currentPrice * 1.2;
    
    return {
      dayRange: `${dayLow.toFixed(2)} - ${dayHigh.toFixed(2)}`,
      yearRange: `${yearLow.toFixed(2)} - ${yearHigh.toFixed(2)}`,
      priceChange: stock.change || 0,
      percentChange: stock.changePercent || 0,
      volume: stock.volume || 0,
      avgVolume: stock.avgVolume || stock.volume || 0,
      marketCap: formatNumber(stock.marketCap),
      peRatio: stock.peRatio ? stock.peRatio.toFixed(2) : 'N/A',
      dividendYield: stock.dividendYield ? `${stock.dividendYield}%` : 'N/A',
      beta: stock.beta ? stock.beta.toFixed(2) : 'N/A',
      eps: stock.eps ? `$${stock.eps}` : 'N/A',
      sharesOutstanding: formatNumber(stock.sharesOutstanding)
    };
  };

  const metrics = calculateMetrics();

  // Tính toán chart dimensions
  const getChartMinMax = () => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    const prices = chartData.map(d => d.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const { min: chartMin, max: chartMax } = getChartMinMax();
  const chartRange = chartMax - chartMin;

  // Render chart đơn giản với SVG
  const renderSimpleChart = () => {
    if (chartData.length === 0) return null;
    
    const chartHeight = 300;
    const chartWidth = 800;
    const pointWidth = chartWidth / (chartData.length - 1);
    
    // Tạo path cho line chart
    let path = '';
    chartData.forEach((point, index) => {
      const x = index * pointWidth;
      const y = chartHeight - ((point.price - chartMin) / chartRange) * chartHeight;
      
      if (index === 0) {
        path += `M ${x} ${y} `;
      } else {
        path += `L ${x} ${y} `;
      }
    });
    
    return (
      <div className="relative h-80">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Gradient background */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metrics.percentChange >= 0 ? '#10b98120' : '#ef444420'} />
              <stop offset="100%" stopColor={metrics.percentChange >= 0 ? '#10b98100' : '#ef444400'} />
            </linearGradient>
          </defs>
          
          {/* Area under line */}
          <path 
            d={`${path} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
            fill="url(#chartGradient)"
          />
          
          {/* Line */}
          <path 
            d={path}
            fill="none"
            stroke={metrics.percentChange >= 0 ? '#10b981' : '#ef4444'}
            strokeWidth="2"
          />
          
          {/* Data points */}
          {chartData.filter((_, i) => i % 5 === 0).map((point, index) => {
            const x = index * 5 * pointWidth;
            const y = chartHeight - ((point.price - chartMin) / chartRange) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="white"
                stroke={metrics.percentChange >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Chart labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          {chartData.length > 0 && (
            <>
              <span>{chartData[0].label}</span>
              <span>{chartData[Math.floor(chartData.length / 2)].label}</span>
              <span>{chartData[chartData.length - 1].label}</span>
            </>
          )}
        </div>
        
        {/* Price labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 py-2">
          <span>${chartMax.toFixed(2)}</span>
          <span>${((chartMax + chartMin) / 2).toFixed(2)}</span>
          <span>${chartMin.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  // Hiển thị loading
  if (stockLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary-600"></div>
          <ChartBarIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-primary-500 animate-pulse" />
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700">Loading {symbol} data...</p>
        <p className="mt-2 text-gray-500">Fetching real-time stock information</p>
      </div>
    );
  }

  // Hiển thị error
  if (stockError) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8">
          <div className="flex items-start">
            <div className="p-3 bg-red-100 rounded-xl mr-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-800">Stock Not Found</h3>
              <p className="text-red-600 mt-2">
                Unable to load data for {symbol}. The stock symbol may be incorrect or the data is temporarily unavailable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/market')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Market
                </button>
                <button 
                  onClick={() => refetchStock()}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header với Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/market')}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">{symbol?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
              <p className="text-gray-600 text-lg">{stock.name || 'N/A'}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {stock.sector || 'N/A'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {stock.exchange || 'HNX'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">${stock.price?.toFixed(2) || '0.00'}</div>
            <div className={`flex items-center ${metrics.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.percentChange >= 0 ? (
                <ArrowUpIcon className="h-5 w-5" />
              ) : (
                <ArrowDownIcon className="h-5 w-5" />
              )}
              <span className="font-medium">
                {metrics.priceChange > 0 ? '+' : ''}{metrics.priceChange?.toFixed(2) || '0.00'}
                <span className="ml-1">({formatPercent(metrics.percentChange)})</span>
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <ClockIcon className="h-3 w-3 inline mr-1" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAlertModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
        >
          <BellIcon className="h-5 w-5 mr-2" />
          Set Alert
        </button>
        
        <button
          onClick={toggleFavorite}
          className={`px-5 py-2.5 rounded-lg font-medium flex items-center ${
            isFavorite
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <StarIcon className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          {isFavorite ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
        
        <button className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center">
          <ShareIcon className="h-5 w-5 mr-2" />
          Share
        </button>
        
        <button className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center ml-auto">
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          Trade {symbol}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">Market Cap</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{metrics.marketCap}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">P/E Ratio</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{metrics.peRatio}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">Dividend Yield</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{metrics.dividendYield}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">Volume</div>
          <div className="text-lg font-bold mt-1 text-gray-900">
            {(stock.volume || 0).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">Beta</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{metrics.beta}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-medium">EPS</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{metrics.eps}</div>
        </div>
      </div>

      {/* Main Content với Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Tabs */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900">Price Chart</h2>
              
              <div className="flex flex-wrap gap-2">
                {['1D', '1W', '1M', '3M', '1Y'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart */}
            <div className="h-80">
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <ChartBarIcon className="h-16 w-16 text-primary-500 mb-4 opacity-50" />
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              ) : (
                <div className="relative">
                  {renderSimpleChart()}
                </div>
              )}
            </div>
            
            {/* Chart Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Open</div>
                <div className="font-bold text-gray-900">${stock.open?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">High</div>
                <div className="font-bold text-gray-900">${stock.high?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Low</div>
                <div className="font-bold text-gray-900">${stock.low?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Prev Close</div>
                <div className="font-bold text-gray-900">${stock.prevClose?.toFixed(2) || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Tabs for Overview/News/Fundamentals */}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['Overview', 'Financials', 'News', 'Analysis'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.toLowerCase()
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">About {stock.name}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {stock.description || `${stock.name} (${stock.symbol}) is a leading company in the ${stock.sector} sector. The company specializes in ${stock.industry || 'its industry'} and has shown consistent growth over the years.`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Sector</span>
                        <span className="font-medium">{stock.sector || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Industry</span>
                        <span className="font-medium">{stock.industry || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Exchange</span>
                        <span className="font-medium">{stock.exchange || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Day Range</span>
                        <span className="font-medium">{metrics.dayRange}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">52 Week Range</span>
                        <span className="font-medium">{metrics.yearRange}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Avg Volume</span>
                        <span className="font-medium">{metrics.avgVolume.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'news' && (
                <div className="space-y-4">
                  {newsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading news...</p>
                    </div>
                  ) : news.length > 0 ? (
                    news.map((item, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                              {item.title}
                            </h4>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span>{item.source}</span>
                              <span className="mx-2">•</span>
                              <span>{item.timeAgo || item.time}</span>
                            </div>
                          </div>
                          <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                            item.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            item.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.sentiment}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <NewspaperIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No news available for {symbol}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Trading Widget */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Trade {symbol}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-medium">
                  Buy
                </button>
                <button className="px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium">
                  Sell
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated Cost</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-bold text-gray-900">{metrics.marketCap}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shares Outstanding</span>
                <span className="font-bold text-gray-900">{metrics.sharesOutstanding}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">P/E Ratio</span>
                <span className="font-bold text-gray-900">{metrics.peRatio}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Dividend Yield</span>
                <span className="font-bold text-gray-900">{metrics.dividendYield}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Beta</span>
                <span className="font-bold text-gray-900">{metrics.beta}</span>
              </div>
            </div>
          </div>

          {/* Analyst Sentiment */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-blue-600" />
              Analyst Sentiment
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Buy</span>
                  <span>12 analysts</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Hold</span>
                  <span>5 analysts</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Sell</span>
                  <span>3 analysts</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="text-center">
                <div className="text-sm text-gray-600">Consensus</div>
                <div className="text-lg font-bold text-green-700">Buy</div>
                <div className="text-xs text-gray-500 mt-1">Target Price: ${(stock.price * 1.15).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Set Price Alert</h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert when {symbol} reaches
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAlertPrice((stock.price * 1.05).toFixed(2))}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  +5% (${(stock.price * 1.05).toFixed(2)})
                </button>
                <button
                  onClick={() => setAlertPrice((stock.price * 0.95).toFixed(2))}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  -5% (${(stock.price * 0.95).toFixed(2)})
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Current Price</span>
                  <span className="font-bold">${stock.price?.toFixed(2)}</span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateAlert}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Set Alert
                  </button>
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;