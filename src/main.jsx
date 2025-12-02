import React from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import App from './App'
import './index.css'

// Initialize Vercel Analytics
inject()

createRoot(document.getElementById('root')).render(<App />)
