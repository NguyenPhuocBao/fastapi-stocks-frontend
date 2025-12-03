// Đổi tên file từ Market.jsx thành MarketPage.jsx
// Hoặc fix export trong Market.jsx:

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const Market = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const stocks = [
    { symbol: 'VNM', name: 'Vinamilk', price: 75.50, change: 1.23, changePercent: 1.65, volume: '1.5M', marketCap: '$12.5B' },
    { symbol: 'FPT', name: 'FPT Corporation', price: 120.25, change: 2.50, changePercent: 2.12, volume: '850K', marketCap: '$8.2B' },
    { symbol: 'SSI', name: 'SSI Securities', price: 45.80, change: -0.30, changePercent: -0.65, volume: '2.1M', marketCap: '$3.8B' },
    { symbol: 'HPG', name: 'Hoa Phat Group', price: 62.40, change: 1.20, changePercent: 1.96, volume: '1.2M', marketCap: '$15.3B' },
  ];

  const indices = [
    { name: 'VN-Index', value: 1250.75, change: 15.25, changePercent: 1.23 },
    { name: 'HNX-Index', value: 325.40, change: 5.20, changePercent: 1.62 },
  ];

  const filteredStocks = searchQuery 
    ? stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Market</h1>
          <p className="text-gray-600">Real-time prices and market data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indices.map((index) => (
          <div key={index.name} className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-800">{index.name}</h3>
                <p className="text-2xl font-bold mt-1">{index.value.toFixed(2)}</p>
              </div>
              <div className={`flex items-center ${index.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {index.change > 0 ? (
                  <ArrowUpIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 mr-1" />
                )}
                <div className="text-right">
                  <div className="font-bold">{index.change > 0 ? '+' : ''}{index.change.toFixed(2)}</div>
                  <div className="text-sm">({index.changePercent.toFixed(2)}%)</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{stock.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">${stock.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Market;