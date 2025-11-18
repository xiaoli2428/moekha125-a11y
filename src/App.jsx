import React from 'react'
import { WalletProvider } from './contexts/WalletContext'
import { DatabaseProvider } from './contexts/DatabaseContext'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'

export default function App() {
  return (
    <WalletProvider>
      <DatabaseProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Hero />
            <Features />
          </main>
          <Footer />
        </div>
      </DatabaseProvider>
    </WalletProvider>
  )
}