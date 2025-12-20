import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_NEWS } from '../components/CryptoNews';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Regulation', 'Technology'];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setNews(MOCK_NEWS);
    setLoading(false);
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-3 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📰 Crypto News</h1>
            <p className="text-gray-400">Stay updated with the latest cryptocurrency news</p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {filteredNews.length > 0 && (
          <Link
            to={`/news/${filteredNews[0].id}`}
            className="block mb-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition group"
          >
            <div className="md:flex">
              <div className="md:w-1/2 h-48 md:h-auto bg-gradient-to-br from-purple-600/30 to-indigo-600/30">
                {filteredNews[0].imageUrl && (
                  <img
                    src={filteredNews[0].imageUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div className="md:w-1/2 p-6">
                <span className="inline-block px-3 py-1 bg-purple-500 text-white text-xs rounded-full mb-3">
                  Featured • {filteredNews[0].category}
                </span>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-300 transition">
                  {filteredNews[0].title}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {filteredNews[0].summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{filteredNews[0].author}</span>
                  <span>•</span>
                  <span>{formatTime(filteredNews[0].publishedAt)}</span>
                  <span>•</span>
                  <span>{filteredNews[0].readTime} min read</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.slice(1).map(article => (
            <Link
              key={article.id}
              to={`/news/${article.id}`}
              className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition group"
            >
              <div className="h-40 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 relative">
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-black/50 text-xs text-white rounded">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTime(article.publishedAt)}</span>
                  <span>{article.readTime} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-gray-400">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
