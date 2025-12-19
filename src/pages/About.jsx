import { useState } from 'react';

export default function About() {
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-indigo-900/50"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              About OnchainWeb
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Pioneering the future of decentralized finance with cutting-edge technology, 
              institutional-grade security, and a commitment to financial empowerment for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Founded in 2021 by a team of blockchain veterans and former Wall Street technologists, 
                  OnchainWeb emerged from a simple vision: democratize access to advanced trading 
                  strategies that were once exclusive to institutional investors.
                </p>
                <p>
                  Our founding team brings over 50 years of combined experience from leading 
                  financial institutions including Goldman Sachs, Morgan Stanley, and pioneering 
                  cryptocurrency exchanges. We've processed over $2.8 billion in trading volume 
                  and serve clients in 142 countries worldwide.
                </p>
                <p>
                  Headquartered in Singapore with offices in London and New York, we operate 
                  under strict regulatory frameworks and maintain the highest standards of 
                  compliance and transparency in the industry.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
                <div className="text-4xl font-bold text-purple-400 mb-2">$2.8B+</div>
                <div className="text-gray-400">Trading Volume</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
                <div className="text-4xl font-bold text-blue-400 mb-2">142</div>
                <div className="text-gray-400">Countries Served</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
                <div className="text-4xl font-bold text-green-400 mb-2">500K+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-2xl p-6 border border-indigo-500/20">
                <div className="text-4xl font-bold text-indigo-400 mb-2">99.99%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Demo Video */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">See OnchainWeb in Action</h2>
            <p className="text-gray-400">Watch how easy it is to trade on our platform</p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gray-800 aspect-video">
            {!videoPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
                {/* Thumbnail Preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-3 gap-4 mb-8 opacity-50">
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <div className="h-2 bg-purple-500/50 rounded mb-2 w-3/4"></div>
                        <div className="h-8 bg-green-500/30 rounded"></div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <div className="h-2 bg-blue-500/50 rounded mb-2 w-1/2"></div>
                        <div className="h-8 bg-purple-500/30 rounded"></div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                        <div className="h-2 bg-green-500/50 rounded mb-2 w-2/3"></div>
                        <div className="h-8 bg-blue-500/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Play Button */}
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full p-6 shadow-2xl shadow-purple-500/30 transition-all hover:scale-110"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                
                <div className="absolute bottom-6 left-6 right-6 flex justify-between text-sm text-gray-400">
                  <span>Platform Overview</span>
                  <span>2:45</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                {/* Simulated Video Content */}
                <div className="w-full h-full p-8">
                  <div className="h-full flex flex-col">
                    {/* Simulated Dashboard View */}
                    <div className="bg-gray-900 rounded-lg p-6 flex-1 animate-pulse">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-8 bg-purple-500/30 rounded w-32"></div>
                        <div className="flex gap-4">
                          <div className="h-8 bg-white/10 rounded w-24"></div>
                          <div className="h-8 bg-white/10 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4">
                          <div className="h-3 bg-white/30 rounded w-1/2 mb-2"></div>
                          <div className="h-6 bg-white/50 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="h-3 bg-white/20 rounded w-1/2 mb-2"></div>
                          <div className="h-6 bg-green-500/50 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="h-3 bg-white/20 rounded w-1/2 mb-2"></div>
                          <div className="h-6 bg-blue-500/50 rounded w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 flex-1">
                        <div className="h-full flex items-end gap-2">
                          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t opacity-70"
                              style={{ height: `${h}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => setVideoPlaying(false)}
                        className="text-white hover:text-purple-400 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      </button>
                      <div className="flex-1 bg-white/20 rounded-full h-1">
                        <div className="bg-purple-500 h-full rounded-full w-1/3 animate-[progress_8s_linear_infinite]"></div>
                      </div>
                      <span className="text-sm text-gray-400">0:52 / 2:45</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">1</span>
              </div>
              <h4 className="font-semibold mb-2">Create Account</h4>
              <p className="text-sm text-gray-400">Sign up in 30 seconds with just your email</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">2</span>
              </div>
              <h4 className="font-semibold mb-2">Fund Your Wallet</h4>
              <p className="text-sm text-gray-400">Deposit using crypto or fiat currency</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">3</span>
              </div>
              <h4 className="font-semibold mb-2">Start Trading</h4>
              <p className="text-sm text-gray-400">Trade binary options or use AI arbitrage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your assets are protected by the same security infrastructure used by 
              Fortune 500 companies and leading financial institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Security Feature Cards */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition group">
              <div className="bg-green-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">256-bit AES Encryption</h3>
              <p className="text-gray-400 text-sm">
                All data is encrypted using military-grade AES-256 encryption, the same 
                standard used by the U.S. government for classified information.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition group">
              <div className="bg-blue-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cold Storage Custody</h3>
              <p className="text-gray-400 text-sm">
                98% of all digital assets are stored in air-gapped cold wallets, protected 
                by multi-signature authorization and geographic distribution.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition group">
              <div className="bg-purple-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-gray-400 text-sm">
                Protect your account with hardware security keys, authenticator apps, 
                or SMS verification for all sensitive operations.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition group">
              <div className="bg-yellow-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">SOC 2 Type II Certified</h3>
              <p className="text-gray-400 text-sm">
                Our infrastructure undergoes annual third-party audits to ensure 
                compliance with the highest security and operational standards.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition group">
              <div className="bg-red-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Fraud Monitoring</h3>
              <p className="text-gray-400 text-sm">
                Advanced AI systems monitor all transactions in real-time to detect 
                and prevent fraudulent activity before it affects your account.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition group">
              <div className="bg-indigo-500/20 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regulatory Compliance</h3>
              <p className="text-gray-400 text-sm">
                Licensed and regulated in multiple jurisdictions, we adhere to strict 
                AML/KYC requirements and international financial regulations.
              </p>
            </div>
          </div>

          {/* Insurance Banner */}
          <div className="mt-12 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 rounded-full p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">$100M Insurance Coverage</h3>
                  <p className="text-green-300/80">
                    All user funds are protected by comprehensive insurance from Lloyd's of London
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Lloyd%27s_of_London_logo.svg/200px-Lloyd%27s_of_London_logo.svg.png" alt="Lloyd's" className="h-10 opacity-70 invert" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-lg text-gray-400 mb-8">Trusted By Industry Leaders</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="text-2xl font-bold text-gray-400">CoinDesk</div>
              <div className="text-2xl font-bold text-gray-400">Bloomberg</div>
              <div className="text-2xl font-bold text-gray-400">Forbes</div>
              <div className="text-2xl font-bold text-gray-400">TechCrunch</div>
              <div className="text-2xl font-bold text-gray-400">Reuters</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐⭐⭐⭐⭐</div>
              <div className="text-sm text-gray-400">4.9/5 on Trustpilot</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm text-gray-400">Best DeFi Platform 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-sm text-gray-400">ISO 27001 Certified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <div className="text-sm text-gray-400">PCI DSS Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-gray-400">
              Backed by decades of experience in finance, technology, and blockchain innovation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                JC
              </div>
              <h4 className="text-xl font-semibold">James Chen</h4>
              <p className="text-purple-400 mb-2">CEO & Co-Founder</p>
              <p className="text-sm text-gray-400">
                Former VP at Goldman Sachs. 15 years in quantitative trading. 
                MIT Computer Science graduate.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                SK
              </div>
              <h4 className="text-xl font-semibold">Sarah Kim</h4>
              <p className="text-blue-400 mb-2">CTO & Co-Founder</p>
              <p className="text-sm text-gray-400">
                Ex-Google Staff Engineer. Built trading systems processing 
                $50B+ daily. Stanford PhD.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                MR
              </div>
              <h4 className="text-xl font-semibold">Michael Roberts</h4>
              <p className="text-green-400 mb-2">Chief Security Officer</p>
              <p className="text-sm text-gray-400">
                Former NSA cybersecurity specialist. Led security for 
                top-3 cryptocurrency exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join over 500,000 traders who trust OnchainWeb with their investments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-purple-500/30"
            >
              Create Free Account
            </a>
            <a
              href="#"
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition"
            >
              Contact Sales
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required • Start trading in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer Contact */}
      <section className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Headquarters</h4>
              <p className="text-sm text-gray-400">
                One Raffles Quay<br />
                North Tower, Level 35<br />
                Singapore 048583
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">London Office</h4>
              <p className="text-sm text-gray-400">
                25 Old Broad Street<br />
                London EC2N 1HN<br />
                United Kingdom
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">New York Office</h4>
              <p className="text-sm text-gray-400">
                One World Trade Center<br />
                Suite 8500<br />
                New York, NY 10007
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <p className="text-sm text-gray-400">
                Email: support@onchainweb.io<br />
                24/7 Live Chat Available<br />
                Response time: &lt; 2 hours
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
