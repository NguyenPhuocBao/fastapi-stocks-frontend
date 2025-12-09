// src/pages/News.jsx - SỬA LỖI IMPORTS
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { newsService } from '../api/newsService';
import { 
  NewspaperIcon,
  ClockIcon,
  FunnelIcon, // ĐÃ THÊM
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FireIcon,
  ShareIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChartBarIcon,
  GlobeAltIcon,
  BellAlertIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [savedArticles, setSavedArticles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all news
  const { 
    data: news = [], 
    isLoading: newsLoading, 
    error: newsError,
    refetch: refetchNews 
  } = useQuery({
    queryKey: ['news-page'],
    queryFn: () => newsService.getAllNews(50),
    refetchInterval: 60000,
  });

  // Fetch market sentiment
  const {
    data: sentiment = {},
  } = useQuery({
    queryKey: ['market-sentiment'],
    queryFn: newsService.getMarketSentiment,
  });

  // Load saved articles
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved-articles') || '[]');
    setSavedArticles(saved);
  }, []);

  // Categories
  const categories = [
    { id: 'all', name: 'All News' },
    { id: 'market', name: 'Market News', icon: ChartBarIcon },
    { id: 'stocks', name: 'Stocks', icon: ArrowTrendingUpIcon },
    { id: 'economy', name: 'Economy', icon: GlobeAltIcon },
    { id: 'technology', name: 'Technology', icon: FireIcon },
    { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon },
  ];

  // Sentiment options
  const sentimentOptions = [
    { id: 'all', name: 'All', color: 'gray' },
    { id: 'positive', name: 'Positive', color: 'green' },
    { id: 'negative', name: 'Negative', color: 'red' },
    { id: 'neutral', name: 'Neutral', color: 'blue' },
  ];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Toggle save article
  const toggleSaveArticle = (articleId) => {
    let updatedSavedArticles;
    if (savedArticles.includes(articleId)) {
      updatedSavedArticles = savedArticles.filter(id => id !== articleId);
    } else {
      updatedSavedArticles = [...savedArticles, articleId];
    }
    
    localStorage.setItem('saved-articles', JSON.stringify(updatedSavedArticles));
    setSavedArticles(updatedSavedArticles);
  };

  // Filter news
  const filteredNews = news.filter(article => {
    // Filter by category
    if (activeCategory !== 'all' && article.category !== activeCategory) {
      return false;
    }

    // Filter by sentiment
    if (filterSentiment !== 'all' && article.sentiment !== filterSentiment) {
      return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title?.toLowerCase().includes(query) ||
        article.content?.toLowerCase().includes(query) ||
        article.source?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get sentiment icon
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <ArrowTrendingUpIcon className="h-4 w-4" />;
      case 'negative': return <ArrowTrendingDownIcon className="h-4 w-4" />;
      default: return <ChartBarIcon className="h-4 w-4" />;
    }
  };

  // Loading state
  if (newsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <NewspaperIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="mt-6 text-xl font-medium text-gray-700">Loading financial news...</p>
        <p className="mt-2 text-gray-500">Fetching latest market updates</p>
      </div>
    );
  }

  // Error state
  if (newsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-4xl mx-auto mt-8">
        <div className="flex items-start">
          <div className="p-3 bg-red-100 rounded-xl mr-4">
            <BellAlertIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Failed to Load News</h3>
            <p className="text-red-600 mt-2">
              Unable to fetch news articles. Please check your connection and try again.
            </p>
            <button 
              onClick={() => refetchNews()}
              className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Retry Loading News
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <NewspaperIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial News</h1>
              <p className="text-gray-600">Latest market updates and financial insights</p>
            </div>
          </div>
          
          {/* Market Sentiment Banner */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center mr-4">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                sentiment.sentiment === 'Bullish' ? 'bg-green-500' :
                sentiment.sentiment === 'Bearish' ? 'bg-red-500' :
                'bg-yellow-500'
              }`} />
              <span className="font-medium text-gray-900">
                Market Sentiment: {sentiment.sentiment || 'Loading...'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {sentiment.positive ? `${sentiment.positive}% positive` : 'Loading sentiment...'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button 
            onClick={() => refetchNews()}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center"
          >
            <ClockIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Section */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'} mt-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sentiment</h3>
              <div className="flex flex-wrap gap-2">
                {sentimentOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setFilterSentiment(option.id)}
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                      filterSentiment === option.id
                        ? option.id === 'all' 
                          ? 'bg-gray-600 text-white border-gray-600'
                          : option.id === 'positive'
                          ? 'bg-green-600 text-white border-green-600'
                          : option.id === 'negative'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-blue-600 text-white border-blue-600'
                        : option.id === 'all'
                        ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                        : option.id === 'positive'
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                        : option.id === 'negative'
                        ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredNews.length} of {news.length} articles
              {searchQuery && ` for "${searchQuery}"`}
              {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.name}`}
            </div>
            <div className="text-sm text-gray-500">
              {savedArticles.length} saved articles
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <NewspaperIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No news articles found</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {searchQuery 
              ? `No articles match "${searchQuery}". Try a different search term.`
              : 'No articles available in this category.'
            }
          </p>
          {(searchQuery || activeCategory !== 'all' || filterSentiment !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilterSentiment('all');
              }}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          {filteredNews.length > 0 && (
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <NewspaperIcon className="h-16 w-16 text-white opacity-50" />
                </div>
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      Featured
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveArticle(filteredNews[0].id)}
                        className="p-2 hover:bg-white/10 rounded-full"
                      >
                        <BookmarkIcon className={`h-5 w-5 ${
                          savedArticles.includes(filteredNews[0].id) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-white'
                        }`} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-full">
                        <ShareIcon className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {filteredNews[0].title}
                  </h2>
                  
                  <p className="text-gray-300 mb-6 line-clamp-3">
                    {filteredNews[0].content || filteredNews[0].description || 'Read the full article for more details...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-300 mr-2">Source:</span>
                        <span className="font-medium text-white">{filteredNews[0].source}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-300">
                          {formatDate(filteredNews[0].publishedAt || filteredNews[0].timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to={filteredNews[0].url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-white hover:text-blue-200 font-medium"
                    >
                      Read Full Article
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Market Updates Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Market Updates</h3>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="font-medium text-green-800">Market Opens Higher</div>
                      <div className="text-sm text-green-600">VN-Index up 1.5% in early trading</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-blue-800">Trading Volume</div>
                      <div className="text-sm text-blue-600">Volume up 20% compared to yesterday</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <div className="font-medium text-yellow-800">Hot Stocks</div>
                      <div className="text-sm text-yellow-600">FPT, VNM, HPG leading gains</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                News Sentiment
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Positive News</span>
                    <span>{filteredNews.filter(n => n.sentiment === 'positive').length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ 
                        width: `${filteredNews.length > 0 ? (filteredNews.filter(n => n.sentiment === 'positive').length / filteredNews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Negative News</span>
                    <span>{filteredNews.filter(n => n.sentiment === 'negative').length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ 
                        width: `${filteredNews.length > 0 ? (filteredNews.filter(n => n.sentiment === 'negative').length / filteredNews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Neutral News</span>
                    <span>{filteredNews.filter(n => n.sentiment === 'neutral').length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ 
                        width: `${filteredNews.length > 0 ? (filteredNews.filter(n => n.sentiment === 'neutral').length / filteredNews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News List */}
      {filteredNews.length > 1 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.slice(1).map((article) => (
              <div key={article.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{article.source}</span>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {formatDate(article.publishedAt || article.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSaveArticle(article.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={savedArticles.includes(article.id) ? 'Remove from saved' : 'Save article'}
                      >
                        <BookmarkIcon className={`h-4 w-4 ${
                          savedArticles.includes(article.id) 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-400'
                        }`} />
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Share article"
                      >
                        <ShareIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.content || article.description || 'Read more for details...'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(article.sentiment)}`}>
                      {getSentimentIcon(article.sentiment)}
                      <span className="ml-1 capitalize">{article.sentiment}</span>
                    </span>
                    
                    <Link
                      to={article.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      Read
                      <ChevronRightIcon className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <div className="mt-12 bg-white rounded-xl shadow border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white border-blue-600 transform scale-105'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                {category.icon && (
                  <category.icon className={`h-6 w-6 mb-2 ${
                    activeCategory === category.id ? 'text-white' : 'text-gray-500'
                  }`} />
                )}
                <span className="text-sm font-medium text-center">{category.name}</span>
                <span className="text-xs mt-1 opacity-75">
                  {news.filter(n => n.category === category.id).length} articles
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;