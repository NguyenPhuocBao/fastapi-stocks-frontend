import React, { useState, useEffect } from 'react';

const StockTicker = () => {
  const [stocks, setStocks] = useState([
    { symbol: 'VNM', price: 75.50, change: 1.23 },
    { symbol: 'FPT', price: 120.25, change: 2.50 },
    { symbol: 'SSI', price: 45.80, change: -0.30 },
    { symbol: 'HPG', price: 62.40, change: 1.20 },
    { symbol: 'VIC', price: 85.90, change: 3.10 },
    { symbol: 'VCB', price: 95.60, change: 0.85 },
    { symbol: 'BVH', price: 78.30, change: -0.45 },
    { symbol: 'MBB', price: 34.20, change: 0.90 },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 0.1,
        change: stock.change + (Math.random() - 0.5) * 0.05
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-6 px-6 py-4 min-w-max">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center space-x-4">
            <div>
              <div className="font-bold text-gray-800">{stock.symbol}</div>
              <div className={`text-sm ${stock.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
              </div>
            </div>
            <div className="text-lg font-semibold">${stock.price.toFixed(2)}</div>
            <div className={`h-2 w-8 rounded-full ${stock.change > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;