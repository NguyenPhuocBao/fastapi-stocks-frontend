// src/api/stockService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const stockService = {
  getAllStocks: async () => {
    try {
      console.log('📡 Fetching stocks from backend...');
      const response = await axios.get(`${API_BASE_URL}/api/stocks`);
      
      if (response.data && response.data.success && response.data.data && response.data.data.stocks) {
        const stocksArray = response.data.data.stocks;
        console.log(`✅ Found ${stocksArray.length} stocks`);
        
        // Transform data để phù hợp với frontend
        return stocksArray.map(stock => {
          // Sử dụng 'close' thay vì 'price' (vì backend dùng 'close')
          const price = parseFloat(stock.close) || 0;
          const change = parseFloat(stock.change) || 0;
          const changePercent = parseFloat(stock.changePercent) || 0;
          const volume = parseInt(stock.volume) || 0;
          
          return {
            id: stock.id,
            symbol: stock.symbol,
            price: price,  // Đây là 'close' price
            open: stock.open,
            high: stock.high,
            low: stock.low,
            close: price,  // Đổi tên từ 'close' sang 'price' cho phù hợp frontend
            prevClose: stock.prevClose,
            change: change,
            changePercent: changePercent,
            trend: stock.trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'),
            volume: volume,
            timestamp: stock.timestamp,
            created_at: stock.created_at
          };
        });
      } else {
        console.warn('⚠️ Unexpected response structure');
        return []; // Trả về mảng rỗng thay vì fallback
      }
    } catch (error) {
      console.error('❌ Stock API Error:', error.message);
      return []; // Trả về mảng rỗng để UI xử lý loading state
    }
  }
};