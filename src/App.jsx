import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col text-white">
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
