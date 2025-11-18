import React, { useState } from 'react'
import CustomerService from './CustomerService'

const items = [
  {
    title: 'AI arbitrage',
    desc: 'Automated cross-pair arbitrage strategies.',
    action: null
  },
  {
    title: 'Binary options',
    desc: 'Options trading with clear payouts.',
    action: null
  },
  {
    title: 'Trade',
    desc: 'Spot swaps and limit orders.',
    action: null
  },
  {
    title: 'C2C',
    desc: 'Peer-to-peer trading tools.',
    action: null
  },
  {
    title: 'Understand Onchainweb',
    desc: 'Guides and walkthroughs.',
    action: null
  },
  {
    title: 'Credit score',
    desc: 'On-chain reputation & scoring.',
    action: null
  },
  {
    title: 'Simulated Trading',
    desc: 'Paper trading sandbox.',
    action: null
  },
  {
    title: 'Customer service',
    desc: 'Support & helpdesk.',
    action: 'customerService'
  }
]

export default function Features() {
  const [showCustomerService, setShowCustomerService] = useState(false)

  const handleItemClick = (action) => {
    if (action === 'customerService') {
      setShowCustomerService(true)
    }
  }

  return (
    <>
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
                  <button 
                    onClick={() => handleItemClick(it.action)}
                    className="text-sm px-3 py-2 bg-white/6 rounded hover:bg-white/10 transition"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showCustomerService && (
        <CustomerService onClose={() => setShowCustomerService(false)} />
      )}
    </>
  )
}