import { useState, useEffect } from 'react';
import { stockService } from '../api/stockService';

export const useStocks = (symbol = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let result;
        
        if (symbol) {
          result = await stockService.getStockBySymbol(symbol);
        } else {
          result = await stockService.getAllStocks();
        }
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch stock data');
        console.error('useStocks error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const refresh = async () => {
    setLoading(true);
    try {
      let result;
      if (symbol) {
        result = await stockService.getStockBySymbol(symbol);
      } else {
        result = await stockService.getAllStocks();
      }
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
};