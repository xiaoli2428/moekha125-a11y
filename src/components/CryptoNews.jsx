import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock crypto news data - In production, this would come from a news API
const MOCK_NEWS = [
  {
    id: 1,
    title: 'Bitcoin Surges Past $100K as Institutional Adoption Accelerates',
    summary: 'Bitcoin has reached a new all-time high as major financial institutions continue to increase their cryptocurrency holdings. Analysts predict further growth in 2025.',
    content: `Bitcoin has reached a new all-time high, surging past the $100,000 mark for the first time in history. This milestone comes as major financial institutions continue to increase their cryptocurrency holdings.

The surge is attributed to several factors including increased institutional adoption, the approval of multiple Bitcoin ETFs, and growing concerns about inflation in traditional currencies.

Major banks like Goldman Sachs and Morgan Stanley have reported significant increases in their crypto trading desks, while companies like MicroStrategy continue to add Bitcoin to their balance sheets.

"This is a watershed moment for the cryptocurrency industry," said one analyst. "We're seeing Bitcoin being treated as a legitimate asset class by the world's largest financial institutions."

The rally has also lifted other cryptocurrencies, with Ethereum reaching new highs and the overall crypto market cap exceeding $4 trillion.

Market experts predict that Bitcoin could reach $150,000 by the end of 2025, driven by continued institutional adoption and the upcoming halving event.`,
    category: 'Bitcoin',
    author: 'Crypto News Team',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
    readTime: 3
  },
  {
    id: 2,
    title: 'Ethereum 2.0 Staking Rewards Hit Record High',
    summary: 'Ethereum staking rewards have reached their highest levels since the merge, attracting more validators to the network and strengthening its security.',
    content: `Ethereum staking rewards have reached their highest levels since the successful transition to proof-of-stake, commonly known as "The Merge."

The current annualized staking yield has climbed to approximately 6.2%, making it one of the most attractive staking options in the cryptocurrency space. This increase is attributed to higher network activity and increased transaction fees.

Since the merge, over 28 million ETH has been staked, representing approximately 23% of the total supply. This massive amount of locked ETH has created a supply squeeze, contributing to upward price pressure.

"The staking mechanism has proven to be incredibly successful," said Vitalik Buterin in a recent conference. "We're seeing organic growth in network security and user participation."

The rise in staking rewards has attracted both retail and institutional investors looking for yield in the current market environment. Several major exchanges have launched staking products to meet this demand.

Looking ahead, Ethereum developers are working on additional upgrades that could further increase network efficiency and potentially boost staking rewards even more.`,
    category: 'Ethereum',
    author: 'DeFi Watch',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400',
    readTime: 4
  },
  {
    id: 3,
    title: 'Major DeFi Protocol Announces Cross-Chain Expansion',
    summary: 'Leading DeFi platform expands to multiple blockchains, promising lower fees and faster transactions for users across different networks.',
    content: `A major decentralized finance (DeFi) protocol has announced plans to expand its services across multiple blockchain networks, marking a significant step towards a more interconnected crypto ecosystem.

The expansion will include support for Polygon, Arbitrum, Optimism, and several other Layer 2 solutions, promising users lower transaction fees and faster settlement times.

"Cross-chain interoperability is the future of DeFi," said the protocol's lead developer. "Our users shouldn't be limited to a single blockchain. They should be able to access the best opportunities across the entire ecosystem."

The move comes as competition in the DeFi space intensifies, with protocols racing to offer the best user experience and lowest fees. Gas costs on Ethereum mainnet have been a significant barrier for smaller investors.

The expansion will be rolled out in phases, with Polygon support launching first, followed by Arbitrum and Optimism in the coming months.

Industry analysts view this as a positive development for the broader DeFi ecosystem, as it demonstrates the maturation of cross-chain technology and bridges.`,
    category: 'DeFi',
    author: 'Blockchain Report',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    readTime: 3
  },
  {
    id: 4,
    title: 'Regulatory Clarity: New Crypto Guidelines Published',
    summary: 'Financial regulators release comprehensive guidelines for cryptocurrency businesses, providing much-needed clarity for the industry.',
    content: `Financial regulators have released new comprehensive guidelines for cryptocurrency businesses, providing much-needed clarity for an industry that has long operated in a regulatory grey zone.

The new framework covers key areas including custody requirements, consumer protection, anti-money laundering procedures, and reporting standards.

"This is a landmark moment for the crypto industry," said a spokesperson for the financial regulatory body. "These guidelines provide a clear path forward for legitimate businesses while protecting consumers from bad actors."

The guidelines distinguish between different types of digital assets, with separate provisions for cryptocurrencies, stablecoins, and security tokens.

Industry leaders have largely welcomed the new rules, noting that regulatory clarity is essential for mainstream adoption. Several major crypto exchanges have already announced plans to adapt their operations to meet the new standards.

The regulations will come into effect in phases over the next 12 months, giving businesses time to adjust their compliance procedures.`,
    category: 'Regulation',
    author: 'Legal Crypto',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    readTime: 4
  },
  {
    id: 5,
    title: 'NFT Market Shows Signs of Recovery',
    summary: 'After a prolonged downturn, the NFT market is showing renewed activity with new use cases emerging beyond digital art.',
    content: `The NFT (Non-Fungible Token) market is showing signs of recovery after a prolonged downturn, with trading volumes increasing and new use cases emerging beyond digital art.

Recent data shows a 45% increase in NFT trading volume over the past month, driven primarily by gaming NFTs and utility-focused projects rather than speculative art collections.

"We're seeing a shift in the NFT market from speculation to utility," said one industry analyst. "Projects that offer real value and use cases are thriving, while purely speculative collections continue to struggle."

Gaming has emerged as a major driver of NFT adoption, with several AAA game developers integrating NFT technology into their games for in-game items and achievements.

Additionally, brands are increasingly using NFTs for loyalty programs, event tickets, and exclusive access passes, demonstrating the technology's versatility beyond art and collectibles.

The recovery suggests that while the initial NFT hype may have been excessive, the underlying technology continues to find valuable applications across various industries.`,
    category: 'NFT',
    author: 'Digital Assets Daily',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1645731504001-c5b1d3cc8b36?w=400',
    readTime: 3
  },
  {
    id: 6,
    title: 'Layer 2 Solutions Process Record Transactions',
    summary: 'Ethereum Layer 2 scaling solutions have processed a record number of transactions, demonstrating the viability of blockchain scalability.',
    content: `Ethereum Layer 2 scaling solutions have collectively processed a record number of transactions, demonstrating significant progress in blockchain scalability.

Combined daily transactions across Arbitrum, Optimism, and other L2 networks exceeded 5 million, surpassing Ethereum mainnet for the first time.

"This milestone proves that blockchain can scale to meet mainstream demand," said the co-founder of a leading L2 solution. "We're no longer talking about theoretical scalability - it's happening right now."

The growth in L2 adoption has been driven by lower fees and faster transaction times compared to Ethereum mainnet. Average transaction costs on L2 networks are now less than $0.10, compared to several dollars on mainnet.

Major DeFi protocols and NFT marketplaces have accelerated their migration to Layer 2, bringing their user bases with them.

Looking ahead, developers are working on even more advanced scaling solutions, including zkEVM technology that promises to further reduce costs while maintaining Ethereum's security guarantees.`,
    category: 'Technology',
    author: 'Scaling Solutions',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400',
    readTime: 3
  }
];

export default function CryptoNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Regulation', 'Technology'];

  useEffect(() => {
    // Simulate API call
    const loadNews = async () => {
      setLoading(true);
      // In production, fetch from actual news API
      await new Promise(resolve => setTimeout(resolve, 500));
      setNews(MOCK_NEWS);
      setLoading(false);
    };
    loadNews();
  }, []);

  const filteredNews = selectedCategory === 'All' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

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
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">📰 Crypto News</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">📰 Daily Crypto News</h2>
        <Link 
          to="/news" 
          className="text-sm text-purple-400 hover:text-purple-300 transition"
        >
          View All →
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              selectedCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNews.slice(0, 6).map(article => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition group"
          >
            {/* Image */}
            <div className="h-32 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 relative overflow-hidden">
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-black/50 text-xs text-white rounded">
                  {article.category}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-3">
              <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-purple-300 transition">
                {article.title}
              </h3>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {article.summary}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{formatTime(article.publishedAt)}</span>
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Export the mock news for use in the NewsArticle page
export { MOCK_NEWS };
