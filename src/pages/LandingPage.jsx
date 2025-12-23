import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LandingPage() {
    const [hoveredFeature, setHoveredFeature] = useState(null);

    const features = [
        {
            icon: '💰',
            title: 'Binary Options Trading',
            description: 'Trade on price movements with fixed payouts and controlled risk'
        },
        {
            icon: '🤖',
            title: 'AI Arbitrage',
            description: 'Automated trading strategies powered by artificial intelligence'
        },
        {
            icon: '🔐',
            title: 'Secure Wallet',
            description: 'Full control over your crypto assets with advanced security'
        },
        {
            icon: '📊',
            title: 'Live Market Data',
            description: 'Real-time prices and market analysis for informed decisions'
        },
        {
            icon: '🌍',
            title: 'Global Access',
            description: 'Trade from anywhere in the world 24/7'
        },
        {
            icon: '⚡',
            title: 'Fast Execution',
            description: 'Lightning-fast order execution and settlements'
        },
    ];

    const stats = [
        { label: 'Active Traders', value: '10K+' },
        { label: 'Trading Volume', value: '$50M+' },
        { label: 'Markets', value: '100+' },
        { label: 'Uptime', value: '99.9%' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        OnchainWeb
                    </h1>
                    <Link
                        to="/app"
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
                    >
                        Enter App
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="mb-8">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6">
                        Next-Gen DeFi Trading Platform
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Trade binary options, leverage AI arbitrage, and manage your crypto portfolio on a secure,
                        user-friendly platform. Access global markets 24/7 with lightning-fast execution.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link
                        to="/app"
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold text-lg"
                    >
                        Launch App →
                    </Link>
                    <a
                        href="#features"
                        className="px-8 py-4 border border-purple-500 rounded-lg hover:border-purple-400 transition font-semibold text-lg"
                    >
                        Learn More
                    </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                                {stat.value}
                            </div>
                            <div className="text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-20">
                <h3 className="text-4xl font-bold text-center mb-16">Why Choose OnchainWeb?</h3>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            onMouseEnter={() => setHoveredFeature(idx)}
                            onMouseLeave={() => setHoveredFeature(null)}
                            className={`p-8 rounded-lg border transition-all duration-300 cursor-pointer ${hoveredFeature === idx
                                    ? 'bg-purple-600/20 border-purple-500 scale-105'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trading Info Section */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-bold mb-6">Binary Options Trading</h3>
                        <p className="text-gray-300 mb-4">
                            Predict market direction with fixed payouts and controlled risk. Trade crypto, forex, commodities, and indices.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span>Fixed payout structure - Know your risk/reward upfront</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span>Multiple expiration times - From 1 minute to 1 month</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span>Real-time market data - Always stay informed</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg p-8 border border-purple-500/30">
                        <div className="text-6xl font-bold text-purple-400 mb-4">85%</div>
                        <p className="text-gray-300">Average payout on winning trades</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-12 border border-purple-500/30">
                    <h3 className="text-4xl font-bold mb-6">Ready to Start Trading?</h3>
                    <p className="text-gray-300 mb-8 text-lg">
                        Join thousands of traders already using OnchainWeb. No credit card required.
                    </p>
                    <Link
                        to="/app"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold text-lg"
                    >
                        Launch App Now →
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/50 border-t border-white/10 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold mb-4">OnchainWeb</h4>
                            <p className="text-gray-400 text-sm">Next-gen DeFi trading platform</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Products</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="/app" className="hover:text-white transition">Trading</a></li>
                                <li><a href="/app" className="hover:text-white transition">AI Arbitrage</a></li>
                                <li><a href="/app" className="hover:text-white transition">Wallet</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="/app" className="hover:text-white transition">Help Center</a></li>
                                <li><a href="/app" className="hover:text-white transition">Contact Us</a></li>
                                <li><a href="/app" className="hover:text-white transition">Feedback</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="/app" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="/app" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="/app" className="hover:text-white transition">Risk Disclosure</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2025 OnchainWeb. All rights reserved. Powered by DeFi Technology.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
