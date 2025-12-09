// src/api/newsService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export const newsService = {
  getAllNews: async (limit = 5) => {
    try {
      console.log('📰 Fetching news from backend...');
      const response = await axios.get(`${API_BASE_URL}/api/news?limit=${limit}`);
      
      if (response.data && response.data.success && response.data.data) {
        // Kiểm tra cấu trúc news data
        let newsArray = [];
        
        if (response.data.data.news && Array.isArray(response.data.data.news)) {
          newsArray = response.data.data.news;
        } else if (Array.isArray(response.data.data)) {
          newsArray = response.data.data;
        }
        
        console.log(`✅ Found ${newsArray.length} news articles`);
        
        return newsArray.slice(0, limit).map((item, index) => ({
          id: item.id || index + 1,
          title: item.title || item.headline || 'No title',
          source: item.source || item.publisher || item.author || 'Unknown',
          timeAgo: item.time_ago || item.published_at || item.date || 'Recently',
          sentiment: item.sentiment || 'neutral',
          description: item.description || item.summary || '',
          url: item.url || item.link || '#'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ News API Error:', error.message);
      return [];
    }
  },

  getMarketSentiment: async () => {
    try {
      console.log('😊 Fetching market sentiment...');
      const response = await axios.get(`${API_BASE_URL}/api/sentiment`);
      
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        return {
          sentiment: data.sentiment || 'Neutral',
          positive: data.positive_percentage || data.positive || 50,
          negative: data.negative_percentage || data.negative || 30,
          neutral: data.neutral_percentage || data.neutral || 20
        };
      }
      
      return { sentiment: 'Neutral', positive: 50, negative: 30, neutral: 20 };
    } catch (error) {
      console.error('❌ Sentiment API Error:', error.message);
      return { sentiment: 'Neutral', positive: 50, negative: 30, neutral: 20 };
    }
  },
  getStockNews: async (symbol, limit = 5) => {
    try {
      console.log(`📰 Fetching news for ${symbol}...`);
      
      // Mock data for now
      const mockNews = [
        {
          id: 1,
          title: `${symbol} reports strong quarterly earnings`,
          source: 'Financial Times',
          timeAgo: '2 hours ago',
          sentiment: 'positive'
        },
        {
          id: 2,
          title: `Analysts raise price target for ${symbol}`,
          source: 'Bloomberg',
          timeAgo: '5 hours ago',
          sentiment: 'positive'
        },
        {
          id: 3,
          title: `${symbol} expands operations in new markets`,
          source: 'Reuters',
          timeAgo: '1 day ago',
          sentiment: 'positive'
        }
      ];
      
      return mockNews.slice(0, limit);
    } catch (error) {
      console.error('❌ Stock News API Error:', error.message);
      return [];
    }
  }
};