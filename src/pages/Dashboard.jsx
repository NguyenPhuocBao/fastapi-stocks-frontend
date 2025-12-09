// src/pages/Dashboard.jsx - ĐÃ CẢI THIỆN VỚI PHÂN TRANG
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../api/stockService';
import { useNavigate } from 'react-router-dom'; 
import { newsService } from '../api/newsService';
import { 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon, 
  BellAlertIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  NewspaperIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  // State cho phân trang và sắp xếp
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });

  // Fetch stocks data
  const { 
    data: stocks = [], 
    isLoading: stocksLoading, 
    error: stocksError,
    refetch: refetchStocks 
  } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getAllStocks,
    refetchInterval: 30000,
  });

  // Fetch news data
  const {
    data: news = [],
    isLoading: newsLoading,
  } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsService.getAllNews(5),
    refetchInterval: 60000,
  });

  // Fetch market sentiment
  const {
    data: sentiment = {},
  } = useQuery({
    queryKey: ['sentiment'],
    queryFn: newsService.getMarketSentiment,
  });

  // State để debug
  const [debugInfo, setDebugInfo] = useState({});

  // Update debug info khi data thay đổi
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      console.log('📊 Dashboard received stocks:', stocks.length);
      console.log('Sample stock:', stocks[0]);
      setDebugInfo(prev => ({
        ...prev,
        stocksCount: stocks.length,
        sampleStock: stocks[0]
      }));
    }
    
    if (news && news.length > 0) {
      console.log('📰 Dashboard received news:', news.length);
      console.log('Sample news:', news[0]);
    }
  }, [stocks, news]);

  // Lọc stocks dựa trên search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm) return stocks;
    
    return stocks.filter(stock => 
      stock.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  // Sắp xếp stocks
  const sortedStocks = useMemo(() => {
    const sortableStocks = [...filteredStocks];
    
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Xử lý các trường đặc biệt
        if (sortConfig.key === 'changePercent' || sortConfig.key === 'change') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        
        if (sortConfig.key === 'volume') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableStocks;
  }, [filteredStocks, sortConfig]);

  // Tính toán phân trang
  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedStocks.slice(startIndex, endIndex);
  }, [sortedStocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  // Xử lý sắp xếp
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Xử lý thay đổi số lượng items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  // Calculate stats từ data thực - FIXED
  const calculateStats = () => {
    if (!stocks || stocks.length === 0) {
      return {
        totalStocks: 0,
        avgChange: '0.00%',
        topGainer: { symbol: 'N/A', changePercent: 0 },
        topLoser: { symbol: 'N/A', changePercent: 0 },
        totalVolume: '0',
        marketStatus: 'Loading...'
      };
    }

    const totalStocks = stocks.length;
    
    // Calculate average change - FIX null values
    const validChanges = stocks.filter(stock => stock.changePercent !== null);
    const avgChange = validChanges.length > 0 
      ? validChanges.reduce((sum, stock) => {
          const change = parseFloat(stock.changePercent) || 0;
          return sum + change;
        }, 0) / validChanges.length
      : 0;

    // Find top gainer and loser - FIX null values
    const stocksWithValidChange = stocks.filter(stock => stock.changePercent !== null);
    
    const topGainer = stocksWithValidChange.length > 0 
      ? stocksWithValidChange.reduce((max, stock) => {
          const change = parseFloat(stock.changePercent) || 0;
          return change > (max.changePercent || -Infinity) ? { ...stock, changePercent: change } : max;
        }, { symbol: 'N/A', changePercent: -Infinity })
      : { symbol: 'N/A', changePercent: 0 };

    const topLoser = stocksWithValidChange.length > 0
      ? stocksWithValidChange.reduce((min, stock) => {
          const change = parseFloat(stock.changePercent) || 0;
          return change < (min.changePercent || Infinity) ? { ...stock, changePercent: change } : min;
        }, { symbol: 'N/A', changePercent: Infinity })
      : { symbol: 'N/A', changePercent: 0 };

    // Calculate total volume - FIX null values
    const totalVolume = stocks.reduce((sum, stock) => {
      const volume = parseInt(stock.volume) || 0;
      return sum + volume;
    }, 0);

    // Format volume
    const formatVolume = (vol) => {
      if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`;
      if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
      if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
      return vol.toString();
    };

    return {
      totalStocks,
      avgChange: `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
      topGainer,
      topLoser,
      totalVolume: formatVolume(totalVolume),
      marketStatus: sentiment?.sentiment || 'Loading...'
    };
  };

  const statsData = calculateStats();

  const stats = [
    {
      title: 'Total Stocks',
      value: statsData.totalStocks,
      change: 'Live data',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Avg Change',
      value: statsData.avgChange,
      change: 'Market average',
      icon: ArrowTrendingUpIcon,
      color: statsData.avgChange.includes('+') ? 'bg-green-500' : 'bg-red-500',
      trend: statsData.avgChange.includes('+') ? 'up' : 'down'
    },
    {
      title: 'Market Sentiment',
      value: statsData.marketStatus,
      change: sentiment?.positive ? `${sentiment.positive}% positive` : 'Loading...',
      icon: BellAlertIcon,
      color: statsData.marketStatus === 'Bullish' ? 'bg-green-500' : 
             statsData.marketStatus === 'Bearish' ? 'bg-red-500' : 'bg-yellow-500',
      trend: 'up'
    },
    {
      title: 'Top Gainer',
      value: statsData.topGainer.symbol || 'N/A',
      change: statsData.topGainer.changePercent !== undefined 
        ? `${statsData.topGainer.changePercent > 0 ? '+' : ''}${statsData.topGainer.changePercent.toFixed(2)}%`
        : '0%',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      trend: 'up'
    }
  ];

  // Hiển thị loading
  if (stocksLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching real-time market data...</p>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (stocksError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800">⚠️ Backend Connection</h3>
        <p className="text-yellow-600 mt-2">Using demo data. Ensure backend is running on port 8000.</p>
        <button 
          onClick={() => refetchStocks()}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Market Dashboard</h1>
          <p className="text-gray-600">Real-time data from backend API</p>
          {debugInfo.stocksCount && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Connected: {debugInfo.stocksCount} stocks loaded
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid với data thực */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className={`flex items-center mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stocks Table với data thực và phân trang */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800">Live Stock Prices</h2>
          
          {/* Search và controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            {/* Search box */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600">items</span>
            </div>
          </div>
        </div>
        
        {/* Thông tin kết quả */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          <div>
            Showing {paginatedStocks.length} of {sortedStocks.length} stocks
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                (filtered by "{searchTerm}")
              </span>
            )}
          </div>
          {sortedStocks.length > 0 && (
            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
              Sorted by: {sortConfig.key} ({sortConfig.direction})
            </div>
          )}
        </div>
        
        {sortedStocks.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 rounded-lg">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? `No stocks found for "${searchTerm}"` : 'No stock data available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('symbol')}
                    >
                      <div className="flex items-center gap-1">
                        Symbol
                        <ArrowsUpDownIcon className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-1">
                        Price
                        <ArrowsUpDownIcon className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('changePercent')}
                    >
                      <div className="flex items-center gap-1">
                        Change %
                        <ArrowsUpDownIcon className="h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('volume')}
                    >
                      <div className="flex items-center gap-1">
                        Volume
                        <ArrowsUpDownIcon className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStocks.map((stock) => {
                    const price = stock.price || stock.close || 0;
                    const change = stock.change || 0;
                    const changePercent = stock.changePercent || 0;
                    const volume = stock.volume || 0;
                    const trend = stock.trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
                    
                    return (
                      <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-bold text-gray-800">{stock.symbol}</div>
                            {stock.name && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {stock.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-lg">${price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                            {trend === 'up' ? (
                              <ArrowUpIcon className="h-4 w-4 mr-1" />
                            ) : trend === 'down' ? (
                              <ArrowDownIcon className="h-4 w-4 mr-1" />
                            ) : null}
                            <span className="font-medium">
                              {change > 0 ? '+' : ''}{change.toFixed(2)}
                              <span className="text-sm ml-1">
                                ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600 font-medium">
                            {volume.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            trend === 'up' ? 'bg-green-100 text-green-800' :
                            trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trend.charAt(0).toUpperCase() + trend.slice(1)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {sortedStocks.length} total items
              </div>
              
              <div className="flex items-center gap-2">
                {/* First page button */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  First
                </button>
                
                {/* Previous page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > totalPages || pageNum < 1) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                {/* Next page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                
                {/* Last page button */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Last
                </button>
              </div>
              
              {/* Items per page */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent News với data thực */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Market News</h2>
            <NewspaperIcon className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {newsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading news...</p>
              </div>
            ) : news.length > 0 ? (
              news.map((item) => (
                <div key={item.id} className="pb-4 border-b border-gray-100 last:border-0">
                  <h3 className="font-medium text-gray-800 hover:text-primary-600 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {item.source} • {item.timeAgo}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
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
              <p className="text-gray-500 text-center py-4">No news available</p>
            )}
          </div>
        </div>

        {/* Market Summary */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Market Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Volume Today</span>
              <span className="font-bold text-lg">{statsData.totalVolume}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Advancing Stocks</span>
              <span className="font-bold text-green-700">
                {stocks.filter(s => s.trend === 'up').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">Declining Stocks</span>
              <span className="font-bold text-red-700">
                {stocks.filter(s => s.trend === 'down').length}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Top Gainer</div>
                <div className="font-bold text-lg">{statsData.topGainer.symbol}</div>
                <div className="text-sm text-green-600">
                  {statsData.topGainer.changePercent > 0 ? '+' : ''}{statsData.topGainer.changePercent?.toFixed(2)}%
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Top Loser</div>
                <div className="font-bold text-lg">{statsData.topLoser.symbol}</div>
                <div className="text-sm text-red-600">
                  {statsData.topLoser.changePercent?.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;