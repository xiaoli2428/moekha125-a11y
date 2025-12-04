import React from 'react'

const items = [
  {
    id: 'ai-arbitrage',
    title: 'AI arbitrage',
    desc: 'Automated cross-pair arbitrage strategies.'
  },
  {
    id: 'binary-options',
    title: 'Binary options',
    desc: 'Options trading with clear payouts.'
  },
  {
    id: 'trade',
    title: 'Trade',
    desc: 'Spot swaps and limit orders.'
  },
  {
    id: 'c2c',
    title: 'C2C',
    desc: 'Peer-to-peer trading tools.'
  },
  {
    id: 'understand',
    title: 'Understand Onchainweb',
    desc: 'Guides and walkthroughs.'
  },
  {
    id: 'credit-score',
    title: 'Credit score',
    desc: 'On-chain reputation & scoring.'
  },
  {
    id: 'simulated-trading',
    title: 'Simulated Trading',
    desc: 'Paper trading sandbox.'
  },
  {
    id: 'customer-service',
    title: 'Customer service',
    desc: 'Support & helpdesk.'
  }
]

export default function Features() {
  return (
    <section id="markets" className="py-12 px-6 md:px-12" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto">
        <h2 id="features-heading" className="text-2xl font-bold mb-6">What you can do</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list" aria-label="Available features">
          {items.map((it) => (
            <li key={it.id} className="p-5 bg-white/3 rounded-xl hover:scale-[1.02] transition focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900">
              <article aria-labelledby={`${it.id}-title`} aria-describedby={`${it.id}-desc`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center text-white" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5"></path></svg>
                  </div>
                  <div>
                    <h3 id={`${it.id}-title`} className="font-semibold">{it.title}</h3>
                    <p id={`${it.id}-desc`} className="text-gray-300 text-sm">{it.desc}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm px-3 py-2 bg-white/6 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label={`Open ${it.title}`}
                  >
                    Open
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
