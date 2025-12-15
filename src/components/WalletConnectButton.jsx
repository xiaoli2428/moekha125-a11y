import React, { useEffect, useState } from 'react'

function shortenAddress(address) {
  if (!address || typeof address !== 'string') return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function WalletConnectButton() {
  const [account, setAccount] = useState('')
  const [hasProvider, setHasProvider] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const updateProviderAvailability = () => {
      const providerDetected = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
      setHasProvider(providerDetected)
      return providerDetected
    }

    const providerAvailable = updateProviderAvailability()
    if (!providerAvailable) {
      const onEthereumInitialized = () => updateProviderAvailability()
      window?.addEventListener('ethereum#initialized', onEthereumInitialized, { once: true })
      return () => window?.removeEventListener('ethereum#initialized', onEthereumInitialized)
    }

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0])
        setError('')
      } else {
        setAccount('')
      }
    }

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch(() => {})

    window.ethereum.on('accountsChanged', handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [])

  const connectWallet = async () => {
    setError('')

    if (!hasProvider) {
      setError('No Ethereum wallet detected. Please install MetaMask or a compatible wallet.')
      return
    }

    try {
      setIsConnecting(true)
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        setError('No accounts returned from wallet.')
        return
      }
      setAccount(accounts[0])
    } catch (err) {
      if (err?.code === 4001) {
        setError('Connection request was rejected.')
      } else {
        setError(err?.message || 'Failed to connect wallet.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 text-sm" aria-live="polite">
      <button
        type="button"
        onClick={connectWallet}
        className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-60"
        aria-label={account ? `Connected wallet ${shortenAddress(account)}` : isConnecting ? 'Connecting to wallet' : 'Connect wallet'}
        disabled={isConnecting}
      >
        {account ? (
          <>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true"></span>
            {shortenAddress(account)}
          </>
        ) : isConnecting ? (
          'Connecting…'
        ) : (
          'Connect'
        )}
      </button>

      {error && (
        <p className="text-xs text-rose-200 max-w-xs text-right" role="alert">
          {error}
        </p>
      )}

      {!hasProvider && !account && !error && (
        <p className="text-xs text-amber-200 max-w-xs text-right" role="status">
          Install a browser wallet like MetaMask to connect.
        </p>
      )}
    </div>
  )
}
