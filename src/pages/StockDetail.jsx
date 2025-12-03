import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ShareIcon,
  BellIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const StockDetail = () => {
  const { symbol } = useParams();
  
  const stock = {
    symbol: symbol || 'VNM',
    name: 'Vinamilk Corporation',
    price: 75.50,
    change: 1.23,
    changePercent: 1.65,
    volume: '1.5M',
    marketCap: '$12.5B',
    peRatio: 18.5,
    dividendYield: '3.2%',
    dayRange: '$74.80 - $76.20',
    yearRange: '$65.40 - $82.10',
    avgVolume: '1.2M',
    sector: 'Consumer Staples',
    industry: 'Food Products'
  };

  const news = [
    { title: 'Vinamilk reports strong Q3 earnings', source: 'VNExpress', time: '2 hours ago', sentiment: 'positive' },
    { title: 'Milk consumption rises in Vietnam', source: 'Bloomberg', time: '5 hours ago', sentiment: 'positive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-700">{stock.symbol}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{stock.symbol}</h1>
              <p className="text-gray-600">{stock.name}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-800">${stock.price.toFixed(2)}</span>
              <div className={`flex items-center ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change > 0 ? (
                  <ArrowUpIcon className="h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              As of {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <ShareIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <BellIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <StarIcon className="h-5 w-5" />
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Trade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Market Cap</div>
          <div className="text-lg font-bold mt-1">{stock.marketCap}</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">P/E Ratio</div>
          <div className="text-lg font-bold mt-1">{stock.peRatio}</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Dividend Yield</div>
          <div className="text-lg font-bold mt-1">{stock.dividendYield}</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Volume</div>
          <div className="text-lg font-bold mt-1">{stock.volume}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Price Chart</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg">1D</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">1W</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">1M</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">1Y</button>
              </div>
            </div>
            
            <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Interactive chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Stock Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sector</span>
                <span className="font-medium">{stock.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry</span>
                <span className="font-medium">{stock.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day Range</span>
                <span className="font-medium">{stock.dayRange}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-medium">
              Set Price Alert
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;