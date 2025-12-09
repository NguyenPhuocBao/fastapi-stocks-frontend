// src/pages/Market.jsx - PHIÊN BẢN TỐI ƯU
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { stockService } from '../api/stockService';
import { 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
 
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Market = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [filter, setFilter] = useState({
    sector: '',
    minPrice: '',
    maxPrice: '',
    marketCap: '',
    trend: ''
  });

  // Fetch all stocks từ backend
  const { 
    data: stocks = [], 
    isLoading: stocksLoading, 
    error: stocksError,
    refetch: refetchStocks 
  } = useQuery({
    queryKey: ['market-stocks'],
    queryFn: stockService.getAllStocks,
    refetchInterval: 15000,
  });

  // Fetch market indices
  const { 
    data: indices = [],
    isLoading: indicesLoading
  } = useQuery({
    queryKey: ['market-indices'],
    queryFn: stockService.getMarketIndices,
    refetchInterval: 30000,
  });

  // Fetch sectors
  const { 
    data: sectors = []
  } = useQuery({
    queryKey: ['market-sectors'],
    queryFn: stockService.getSectors,
  });

  // State cho market stats
  const [marketStats, setMarketStats] = useState({
    advancing: 0,
    declining: 0,
    unchanged: 0,
    totalVolume: 0,
    avgChange: 0
  });

  // Tính toán market stats
  useEffect(() => {
    if (stocks.length > 0) {
      const advancing = stocks.filter(stock => {
        const change = parseFloat(stock.changePercent) || 0;
        return change > 0;
      }).length;
      
      const declining = stocks.filter(stock => {
        const change = parseFloat(stock.changePercent) || 0;
        return change < 0;
      }).length;
      
      const unchanged = stocks.filter(stock => {
        const change = parseFloat(stock.changePercent) || 0;
        return change === 0;
      }).length;
      
      const totalVolume = stocks.reduce((sum, stock) => {
        const volume = parseInt(stock.volume) || 0;
        return sum + volume;
      }, 0);
      
      const avgChange = stocks.reduce((sum, stock) => {
        const change = parseFloat(stock.changePercent) || 0;
        return sum + change;
      }, 0) / stocks.length;
      
      setMarketStats({
        advancing,
        declining,
        unchanged,
        totalVolume,
        avgChange
      });
    }
  }, [stocks]);

  // Lọc stocks
  const filteredStocks = useMemo(() => {
    let filtered = [...stocks];
    
    // Tìm kiếm
    if (searchQuery) {
      filtered = filtered.filter(stock => 
        stock.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Lọc theo sector
    if (filter.sector) {
      filtered = filtered.filter(stock => 
        stock.sector?.toLowerCase() === filter.sector.toLowerCase()
      );
    }
    
    // Lọc theo price range
    if (filter.minPrice) {
      const minPrice = parseFloat(filter.minPrice);
      filtered = filtered.filter(stock => {
        const price = stock.price || 0;
        return price >= minPrice;
      });
    }
    
    if (filter.maxPrice) {
      const maxPrice = parseFloat(filter.maxPrice);
      filtered = filtered.filter(stock => {
        const price = stock.price || 0;
        return price <= maxPrice;
      });
    }
    
    // Lọc theo trend
    if (filter.trend) {
      filtered = filtered.filter(stock => {
        const changePercent = parseFloat(stock.changePercent) || 0;
        if (filter.trend === 'up') return changePercent > 0;
        if (filter.trend === 'down') return changePercent < 0;
        if (filter.trend === 'neutral') return changePercent === 0;
        return true;
      });
    }
    
    return filtered;
  }, [stocks, searchQuery, filter]);

  // Sắp xếp stocks
  const sortedStocks = useMemo(() => {
    const sortableStocks = [...filteredStocks];
    
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'changePercent' || sortConfig.key === 'change' || sortConfig.key === 'price') {
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

  // Phân trang
  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedStocks.slice(startIndex, endIndex);
  }, [sortedStocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  // Format helpers
  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const formatVolume = (volume) => {
    const num = parseInt(volume) || 0;
    return formatNumber(num);
  };

  const formatMarketCap = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'string' && value.includes('$')) return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Xử lý sắp xếp
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Reset filter
  const resetFilter = () => {
    setFilter({
      sector: '',
      minPrice: '',
      maxPrice: '',
      marketCap: '',
      trend: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Hiển thị loading
  if (stocksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="mt-6 text-lg text-gray-600">Fetching real-time market data...</p>
        <p className="mt-2 text-sm text-gray-400">Connecting to backend API</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (stocksError) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto mt-8">
        <div className="flex items-start">
          <div className="p-3 bg-red-100 rounded-xl mr-4">
            <InformationCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Backend Connection Issue</h3>
            <p className="text-red-600 mt-2">
              Unable to connect to market data API. Please ensure the backend server is running.
            </p>
            <div className="mt-4 space-x-3">
              <button 
                onClick={() => refetchStocks()}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Retry Connection
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header với Market Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Market</h1>
            <p className="text-gray-600 mt-2">Real-time market data from Vietnam Stock Exchange</p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-700">
                  {marketStats.advancing} Advancing
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm font-medium text-gray-700">
                  {marketStats.declining} Declining
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-sm font-medium text-gray-700">
                  {marketStats.unchanged} Unchanged
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Avg Change</div>
                <div className={`text-2xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button 
                  onClick={() => refetchStocks()}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicesLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading indices...</p>
          </div>
        ) : indices.length > 0 ? (
          indices.map((index, idx) => {
            const change = parseFloat(index.change) || 0;
            const changePercent = parseFloat(index.changePercent) || 0;
            
            return (
              <div key={idx} className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{index.name}</h3>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {parseFloat(index.value).toFixed(2)}
                    </p>
                  </div>
                  <div className={`flex flex-col items-end ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center">
                      {change >= 0 ? (
                        <ArrowUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 mr-1" />
                      )}
                      <span className="font-bold text-lg">{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
                    </div>
                    <span className="text-sm mt-1">({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">Volume: {formatVolume(index.volume || 0)}</div>
                </div>
              </div>
            );
          })
        ) : (
          // Fallback indices
          <>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">VN-Index</h3>
                  <p className="text-3xl font-bold mt-2 text-gray-900">1,250.75</p>
                </div>
                <div className="text-green-600 flex flex-col items-end">
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-5 w-5 mr-1" />
                    <span className="font-bold text-lg">+15.25</span>
                  </div>
                  <span className="text-sm mt-1">(+1.23%)</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">HNX-Index</h3>
                  <p className="text-3xl font-bold mt-2 text-gray-900">325.40</p>
                </div>
                <div className="text-green-600 flex flex-col items-end">
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-5 w-5 mr-1" />
                    <span className="font-bold text-lg">+5.20</span>
                  </div>
                  <span className="text-sm mt-1">(+1.62%)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search và Filter */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stock List</h2>
            <p className="text-gray-600 mt-1">
              {stocks.length} stocks available • {searchQuery ? `Searching for "${searchQuery}"` : 'Showing all stocks'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <div className="text-sm text-gray-500">Items per page</div>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by stock symbol or company name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter(prev => ({ ...prev, trend: 'up' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.trend === 'up'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowUpIcon className="h-4 w-4 inline mr-1" />
            Advancing
          </button>
          <button
            onClick={() => setFilter(prev => ({ ...prev, trend: 'down' }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.trend === 'down'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowDownIcon className="h-4 w-4 inline mr-1" />
            Declining
          </button>
          <select
            value={filter.sector}
            onChange={(e) => {
              setFilter(prev => ({ ...prev, sector: e.target.value }));
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium"
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          
          {(filter.sector || filter.trend || searchQuery) && (
            <button
              onClick={resetFilter}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {sortedStocks.length === 0 ? (
          <div className="text-center py-16">
            <GlobeAltIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No stocks found</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {searchQuery 
                ? `No stocks match "${searchQuery}". Try a different search term.`
                : 'No stock data is currently available. Please check back later.'
              }
            </p>
            {(searchQuery || filter.sector || filter.trend) && (
              <button
                onClick={resetFilter}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Reset Search & Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'symbol', label: 'Symbol' },
                      { key: 'name', label: 'Company' },
                      { key: 'price', label: 'Price' },
                      { key: 'changePercent', label: 'Change %' },
                      { key: 'volume', label: 'Volume' },
                      { key: 'marketCap', label: 'Market Cap' },
                      { key: 'sector', label: 'Sector' }
                    ].map((column) => (
                      <th 
                        key={column.key}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center gap-1">
                          {column.label}
                          <ArrowsUpDownIcon className="h-3 w-3" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStocks.map((stock) => {
                    const price = stock.price || 0;
                    const change = stock.change || 0;
                    const changePercent = stock.changePercent || 0;
                    const volume = stock.volume || 0;
                    const marketCap = stock.marketCap || `$${(price * 1000000).toFixed(1)}M`;
                    const sector = stock.sector || 'General';
                    
                    return (
                      <tr 
                        key={stock.symbol} 
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/stocks/${stock.symbol}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-lg text-gray-900">{stock.symbol}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{stock.name || stock.symbol}</div>
                          {stock.exchange && (
                            <div className="text-xs text-gray-500 mt-1">{stock.exchange}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900 text-lg">
                            ${price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                            changePercent >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {changePercent >= 0 ? (
                              <ArrowUpIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 mr-1" />
                            )}
                            <span className="font-bold">
                              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                            <span className="ml-1 text-sm">
                              ({change >= 0 ? '+' : ''}{change.toFixed(2)})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatVolume(volume)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatMarketCap(marketCap)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sector}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedStocks.length)}</span> of{' '}
                  <span className="font-medium">{sortedStocks.length}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm border'
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="sr-only">First</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm border'
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="sr-only">Previous</span>
                  </button>
                  
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
                          className={`w-10 h-10 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-white hover:shadow-sm border'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm border'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                    <span className="sr-only">Next</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm border'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                    <span className="sr-only">Last</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Market Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Volume</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {formatVolume(marketStats.totalVolume)}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total trading volume across all stocks
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Market Breadth</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {marketStats.advancing > marketStats.declining ? 'Bullish' : 'Bearish'}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {marketStats.advancing} : {marketStats.declining} advancing vs declining
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Stocks</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stocks.length}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BuildingLibraryIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Active listings in the market
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 font-medium">Avg Daily Change</div>
                <div className={`text-3xl font-bold mt-1 ${marketStats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
                </div>
              </div>
              <div className={`p-3 rounded-xl ${marketStats.avgChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {marketStats.avgChange >= 0 ? (
                  <ArrowUpIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Average percentage change across all stocks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;