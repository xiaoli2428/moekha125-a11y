import React from 'react'

const items = [
  {
    title: 'AI arbitrage',
    desc: 'Automated cross-pair arbitrage strategies.'
  },
  {
    title: 'Binary options',
    desc: 'Options trading with clear payouts.'
  },
  {
    title: 'Trade',
    desc: 'Spot swaps and limit orders.'
  },
  {
    title: 'C2C',
    desc: 'Peer-to-peer trading tools.'
  },
  {
    title: 'Understand Onchainweb',
    desc: 'Guides and walkthroughs.'
  },
  {
    title: 'Credit score',
    desc: 'On-chain reputation & scoring.'
  },
  {
    title: 'Simulated Trading',
    desc: 'Paper trading sandbox.'
  },
  {
    title: 'Customer service',
    desc: 'Support & helpdesk.'
  }
]

export default function Features() {
  return (
    <section id="markets" className="py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">What you can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.title} className="p-5 bg-white/3 rounded-xl hover:scale-[1.02] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5"/></svg>
                </div>
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-gray-300 text-sm">{it.desc}</div>
                </div>
              </div>
              <div className="mt-4">
                <button className="text-sm px-3 py-2 bg-white/6 rounded">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}