// src/api/stockService.js - CẬP NHẬT ĐẦY ĐỦ
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
            name: stock.name || stock.symbol, // Thêm name nếu có
            price: price,  // Đây là 'close' price
            open: stock.open,
            high: stock.high,
            low: stock.low,
            close: price,
            prevClose: stock.prevClose,
            change: change,
            changePercent: changePercent,
            trend: stock.trend || (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'),
            volume: volume,
            marketCap: stock.marketCap || null, // Thêm marketCap
            sector: stock.sector || 'General', // Thêm sector
            exchange: stock.exchange || 'HNX', // Thêm exchange
            timestamp: stock.timestamp,
            created_at: stock.created_at
          };
        });
      } else {
        console.warn('⚠️ Unexpected response structure');
        return [];
      }
    } catch (error) {
      console.error('❌ Stock API Error:', error.message);
      return [];
    }
  },

  // Thêm các API functions mới cho Market page
  getMarketIndices: async () => {
    try {
      console.log('📊 Fetching market indices...');
      
      // Nếu backend có API riêng cho indices, dùng:
      // const response = await axios.get(`${API_BASE_URL}/api/indices`);
      
      // Fallback: tính toán từ stocks data
      const stocks = await stockService.getAllStocks();
      
      // Tính VN-Index giả lập từ stocks
      const vnIndexValue = stocks.length > 0 
        ? stocks.reduce((sum, stock) => sum + (stock.price || 0), 0) / stocks.length * 1000
        : 1250.75;
      
      // Tính percent change trung bình
      const avgChangePercent = stocks.length > 0 
        ? stocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / stocks.length
        : 1.23;
      
      const vnIndexChange = vnIndexValue * avgChangePercent / 100;
      
      return [
        {
          symbol: 'VNINDEX',
          name: 'VN-Index',
          value: vnIndexValue.toFixed(2),
          change: vnIndexChange.toFixed(2),
          changePercent: avgChangePercent.toFixed(2),
          volume: '1.2B',
          lastUpdated: new Date().toISOString()
        },
        {
          symbol: 'HNXINDEX',
          name: 'HNX-Index',
          value: (vnIndexValue * 0.26).toFixed(2), // ~26% của VN-Index
          change: (vnIndexChange * 0.26).toFixed(2),
          changePercent: avgChangePercent.toFixed(2),
          volume: '450M',
          lastUpdated: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('❌ Market Indices API Error:', error.message);
      return [];
    }
  },

  getSectors: async () => {
    try {
      console.log('🏢 Fetching sectors...');
      
      // Nếu backend có API cho sectors, dùng:
      // const response = await axios.get(`${API_BASE_URL}/api/sectors`);
      
      // Fallback: lấy từ stocks data
      const stocks = await stockService.getAllStocks();
      
      // Extract unique sectors từ stocks
      const sectorsSet = new Set();
      stocks.forEach(stock => {
        if (stock.sector && stock.sector !== 'General') {
          sectorsSet.add(stock.sector);
        }
      });
      
      // Thêm các sectors mặc định
      const defaultSectors = [
        'Banking',
        'Real Estate', 
        'Construction',
        'Technology',
        'Manufacturing',
        'Energy',
        'Consumer Goods',
        'Healthcare',
        'Finance',
        'Insurance'
      ];
      
      defaultSectors.forEach(sector => sectorsSet.add(sector));
      
      return Array.from(sectorsSet).sort();
    } catch (error) {
      console.error('❌ Sectors API Error:', error.message);
      return [
        'Banking',
        'Real Estate',
        'Construction',
        'Technology',
        'Manufacturing'
      ];
    }
  },

  searchStocks: async (query) => {
    try {
      const allStocks = await stockService.getAllStocks();
      
      return allStocks.filter(stock => 
        stock.symbol?.toLowerCase().includes(query.toLowerCase()) ||
        stock.name?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Search API Error:', error.message);
      return [];
    }
  },

  getStockDetail: async (symbol) => {
    try {
      console.log(`📈 Fetching detail for ${symbol}...`);
      
      // First try to get from specific endpoint
      const response = await axios.get(`${API_BASE_URL}/api/stocks/${symbol}`);
      
      if (response.data && response.data.success && response.data.data) {
        const stock = response.data.data;
        return {
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: parseFloat(stock.close) || 0,
          open: parseFloat(stock.open) || 0,
          high: parseFloat(stock.high) || 0,
          low: parseFloat(stock.low) || 0,
          close: parseFloat(stock.close) || 0,
          prevClose: parseFloat(stock.prevClose) || 0,
          change: parseFloat(stock.change) || 0,
          changePercent: parseFloat(stock.changePercent) || 0,
          volume: parseInt(stock.volume) || 0,
          marketCap: stock.marketCap || null,
          sector: stock.sector || 'General',
          industry: stock.industry || null,
          exchange: stock.exchange || 'HNX',
          description: stock.description || null,
          timestamp: stock.timestamp,
          created_at: stock.created_at
        };
      }
      
      throw new Error('Stock not found');
    } catch (error) {
      console.log('Trying fallback method...');
      
      // Fallback: get all stocks and find the one we need
      const allStocks = await stockService.getAllStocks();
      const stock = allStocks.find(s => s.symbol === symbol);
      
      if (!stock) {
        throw new Error(`Stock ${symbol} not found`);
      }
      
      // Enhance with additional data
      return {
        ...stock,
        yearHigh: stock.price * 1.2,
        yearLow: stock.price * 0.8,
        avgVolume: Math.round(stock.volume * 0.8),
        peRatio: Math.random() * 30 + 5,
        dividendYield: (Math.random() * 5).toFixed(2),
        beta: (Math.random() * 2).toFixed(2),
        eps: (stock.price / (Math.random() * 30 + 5)).toFixed(2),
        sharesOutstanding: Math.round(1000000000 / stock.price)
      };
    }
  },

  getHistoricalData: async (symbol, range = '1D') => {
    try {
      console.log(`📊 Fetching historical data for ${symbol} (${range})...`);
      
      // Mock data for now - in production this would come from backend
      const periods = {
        '1D': 24,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365,
        '5Y': 1825
      };
      
      const period = periods[range] || 30;
      const basePrice = 50 + Math.random() * 100;
      
      return Array.from({ length: period }, (_, i) => {
        const date = new Date(Date.now() - (period - i - 1) * 24 * 60 * 60 * 1000);
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.1 * Math.sqrt(i / period));
        const volume = 1000000 + Math.random() * 5000000;
        
        return {
          date: date.toISOString().split('T')[0],
          price: price,
          volume: volume
        };
      });
    } catch (error) {
      console.error('❌ Historical Data API Error:', error.message);
      return [];
    }
  }
};