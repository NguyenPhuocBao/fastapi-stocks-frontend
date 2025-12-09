// src/api/aiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const aiService = {
  // Lấy dự đoán từ AI
  getPredictions: async () => {
    try {
      console.log('🤖 Fetching AI predictions...');
      
      // Nếu backend có API, dùng:
      // const response = await axios.get(`${API_BASE_URL}/api/ai/predictions`);
      
      // Mock data từ workflow n8n
      const mockPredictions = [
        {
          symbol: 'VNM',
          current_price: 75.50,
          predicted_price: 76.80,
          prediction_change: 1.72,
          prediction_trend: 'up',
          confidence: 88,
          model: 'lstm',
          timestamp: new Date().toISOString(),
          features: {
            open: 74.80,
            high: 76.20,
            low: 74.50,
            close: 75.50,
            volume: 1500000,
            rsi: 58.2,
            macd: 0.45
          }
        },
        {
          symbol: 'FPT',
          current_price: 120.25,
          predicted_price: 122.80,
          prediction_change: 2.12,
          prediction_trend: 'up',
          confidence: 85,
          model: 'xgboost',
          timestamp: new Date().toISOString(),
          features: {
            open: 119.50,
            high: 121.80,
            low: 118.90,
            close: 120.25,
            volume: 850000,
            rsi: 62.4,
            macd: 0.82
          }
        },
        {
          symbol: 'HPG',
          current_price: 62.40,
          predicted_price: 61.20,
          prediction_change: -1.92,
          prediction_trend: 'down',
          confidence: 79,
          model: 'lstm',
          timestamp: new Date().toISOString(),
          features: {
            open: 63.10,
            high: 63.80,
            low: 62.00,
            close: 62.40,
            volume: 1200000,
            rsi: 42.8,
            macd: -0.31
          }
        },
        {
          symbol: 'VCB',
          current_price: 95.80,
          predicted_price: 96.50,
          prediction_change: 0.73,
          prediction_trend: 'up',
          confidence: 82,
          model: 'regression',
          timestamp: new Date().toISOString(),
          features: {
            open: 95.20,
            high: 96.80,
            low: 94.90,
            close: 95.80,
            volume: 950000,
            rsi: 56.3,
            macd: 0.28
          }
        },
        {
          symbol: 'SSI',
          current_price: 45.30,
          predicted_price: 44.80,
          prediction_change: -1.10,
          prediction_trend: 'down',
          confidence: 76,
          model: 'random_forest',
          timestamp: new Date().toISOString(),
          features: {
            open: 45.60,
            high: 46.20,
            low: 45.10,
            close: 45.30,
            volume: 2100000,
            rsi: 38.5,
            macd: -0.42
          }
        },
        {
          symbol: 'MWG',
          current_price: 68.90,
          predicted_price: 70.20,
          prediction_change: 1.89,
          prediction_trend: 'up',
          confidence: 84,
          model: 'lstm',
          timestamp: new Date().toISOString(),
          features: {
            open: 67.80,
            high: 69.50,
            low: 67.20,
            close: 68.90,
            volume: 980000,
            rsi: 61.7,
            macd: 0.65
          }
        }
      ];
      
      return mockPredictions;
    } catch (error) {
      console.error('❌ AI Predictions Error:', error.message);
      return [];
    }
  },

  // Lấy metrics của model
  getModelMetrics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/metrics`);
      return response.data;
    } catch (error) {
      // Mock data
      return {
        accuracy: 87.5,
        rmse: 2.34,
        auc_roc: 0.89,
        mae: 1.87,
        last_training: '2024-01-15',
        training_samples: 12500,
        validation_score: 0.862
      };
    }
  },

  // Lấy cảnh báo từ workflow n8n
  getAlerts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/alerts`);
      return response.data;
    } catch (error) {
      // Mock alerts
      const mockAlerts = [
        {
          id: 1,
          symbol: 'VNM',
          type: 'price_surge',
          title: 'Giá tăng mạnh dự đoán',
          message: 'AI dự đoán VNM tăng 1.7% trong 24h tới với độ tin cậy 88%',
          severity: 'medium',
          confidence: 88,
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          predicted_change: 1.72,
          actual_change: null
        },
        {
          id: 2,
          symbol: 'SSI',
          type: 'high_volatility',
          title: 'Biến động cao',
          message: 'Phát hiện biến động bất thường, chênh lệch dự đoán >2.5%',
          severity: 'high',
          confidence: 91,
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          predicted_change: -1.10,
          actual_change: -2.80
        },
        {
          id: 3,
          symbol: 'HPG',
          type: 'trend_reversal',
          title: 'Đảo chiều xu hướng',
          message: 'Dấu hiệu đảo chiều từ giảm sang ổn định',
          severity: 'low',
          confidence: 76,
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          predicted_change: -1.92,
          actual_change: -0.85
        }
      ];
      
      return Math.random() > 0.5 ? mockAlerts : []; // Random hiển thị alerts
    }
  },

  // Gửi câu hỏi đến AI chat
  askAI: async (question, symbol = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        question,
        symbol,
        context: 'prediction_analysis'
      });
      
      return response.data;
    } catch (error) {
      // Mock response
      return {
        answer: `Đang phân tích ${symbol || 'thị trường'}... Dữ liệu sẽ được xử lý qua workflow n8n.`,
        confidence: 75,
        sources: ['AI Model Analysis', 'Market Data'],
        timestamp: new Date().toISOString()
      };
    }
  },

  // Trigger manual prediction
  triggerPrediction: async (symbol) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/predict`, {
        symbol,
        timeframe: '1D'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Trigger Prediction Error:', error.message);
      return { success: false, message: 'Failed to trigger prediction' };
    }
  }
};