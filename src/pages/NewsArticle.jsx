import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_NEWS } from '../components/CryptoNews';

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundArticle = MOCK_NEWS.find(item => item.id === parseInt(id));
    setArticle(foundArticle || null);
    
    // Get related articles from same category
    if (foundArticle) {
      const related = MOCK_NEWS.filter(
        item => item.category === foundArticle.category && item.id !== foundArticle.id
      ).slice(0, 3);
      setRelatedNews(related);
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-3 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist.</p>
          <Link
            to="/news"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Image */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-purple-600/50 to-indigo-600/50 relative">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-60"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 rounded-lg text-sm transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full mb-4">
          {article.category}
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-8 pb-6 border-b border-white/10">
          <span className="flex items-center gap-1">
            ✍️ {article.author}
          </span>
          <span className="flex items-center gap-1">
            🕐 {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            📖 {article.readTime} min read
          </span>
        </div>

        {/* Summary */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-8">
          <p className="text-lg text-gray-300 italic">
            {article.summary}
          </p>
        </div>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-300 mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
          <span className="text-gray-400">Share:</span>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition" title="Copy link">
            🔗
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition" title="Share on Twitter">
            𝕏
          </button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition" title="Share on Telegram">
            ✈️
          </button>
        </div>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedNews.map(news => (
                <Link
                  key={news.id}
                  to={`/news/${news.id}`}
                  className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition group"
                >
                  <div className="h-24 bg-gradient-to-br from-purple-600/30 to-indigo-600/30">
                    {news.imageUrl && (
                      <img
                        src={news.imageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-purple-300 transition">
                      {news.title}
                    </h3>
                    <span className="text-xs text-gray-500 mt-1">{news.readTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center py-12">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90 rounded-lg font-semibold transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
