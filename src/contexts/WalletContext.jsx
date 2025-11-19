import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext()

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
      getBalance(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16))
    window.location.reload()
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        getBalance(accounts[0])
        getChainId()
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      setAccount(accounts[0])
      await getBalance(accounts[0])
      await getChainId()
    } catch (err) {
      if (err.code === 4001) {
        setError('Please connect to MetaMask.')
      } else {
        setError('An error occurred while connecting to MetaMask.')
      }
      console.error('Error connecting wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
    setChainId(null)
    setError(null)
  }

  const getBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error('Error getting balance:', err)
    }
  }

  const getChainId = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(parseInt(chainId, 16))
    } catch (err) {
      console.error('Error getting chain ID:', err)
    }
  }

  const getShortAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      56: 'BSC',
      97: 'BSC Testnet'
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const value = {
    account,
    balance,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    getChainName,
    isConnected: !!account
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
