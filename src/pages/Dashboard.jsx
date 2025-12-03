// src/pages/Dashboard.jsx - PHẦN QUAN TRỌNG
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../api/stockService';
import { newsService } from '../api/newsService';
import { 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon, 
  BellAlertIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  NewspaperIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
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

      {/* Stocks Table với data thực - FIXED */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Live Stock Prices</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{stocks.length} stocks</span>
            {stocks.length === 0 && (
              <span className="text-sm text-yellow-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                No data available
              </span>
            )}
          </div>
        </div>
        
        {stocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No stock data available. Please check backend connection.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stocks.slice(0, 10).map((stock) => {
                    // FIX: Kiểm tra null values
                    const price = stock.price || stock.close || 0;
                    const change = stock.change || 0;
                    const changePercent = stock.changePercent || 0;
                    const volume = stock.volume || 0;
                    const trend = stock.trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
                    
                    return (
                      <tr key={stock.symbol} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-800">{stock.symbol}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-lg">${price.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <div className="text-gray-600">
                            {volume.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            trend === 'up' ? 'bg-green-100 text-green-800' :
                            trend === 'down' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trend}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {stocks.length > 10 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {stocks.length} stocks
                </p>
              </div>
            )}
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

      {/* Debug Section (optional) */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="font-medium text-gray-700 cursor-pointer">Debug Information</summary>
        <div className="mt-2 text-sm">
          <p>Stocks loaded: {stocks.length}</p>
          <p>News loaded: {news.length}</p>
          <p>Sentiment: {JSON.stringify(sentiment)}</p>
          {stocks.length > 0 && (
            <pre className="bg-gray-800 text-white p-2 rounded mt-2 overflow-auto text-xs">
              First stock: {JSON.stringify(stocks[0], null, 2)}
            </pre>
          )}
        </div>
      </details>
    </div>
  );
};

export default Dashboard;