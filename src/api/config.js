// src/api/config.js
export const API_CONFIG = {
  STOCK_API: 'http://localhost:8000',  // Your stock backend
  NEWS_API: 'http://localhost:8001',   // Your news backend
};

// ⚠️ QUAN TRỌNG: Đổi thành false để dùng data thực
export const USE_DEMO_DATA = false;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const TIMEOUT = 15000;