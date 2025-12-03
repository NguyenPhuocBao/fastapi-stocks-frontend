import { useState, useEffect } from 'react';
import { stockService } from '../api/stockService';

export const useMarketData = () => {
  const [marketData, setMarketData] = useState({
    indices: [],
    topGainers: [],
    topLosers: [],
    mostActive: [],
    overview: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      const [indices, gainers, losers, active, overview] = await Promise.all([
        stockService.getMarketIndices(),
        stockService.getTopGainers(),
        stockService.getTopLosers(),
        stockService.getMostActive(),
        stockService.getMarketOverview()
      ]);

      setMarketData({
        indices,
        topGainers: gainers,
        topLosers: losers,
        mostActive: active,
        overview
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error('Market data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { marketData, loading, error, refresh: fetchMarketData };
};