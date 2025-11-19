import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useWallet } from './WalletContext'

const DatabaseContext = createContext()

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider')
  }
  return context
}

export function DatabaseProvider({ children }) {
  const { account, isConnected } = useWallet()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sync wallet connection with database user
  useEffect(() => {
    if (isConnected && account) {
      syncUserWithWallet(account)
    } else {
      setUser(null)
    }
  }, [isConnected, account])

  const syncUserWithWallet = async (walletAddress) => {
    try {
      setLoading(true)
      setError(null)

      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        throw fetchError
      }

      if (existingUser) {
        // Update last_seen timestamp
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('wallet_address', walletAddress.toLowerCase())
          .select()
          .single()

        if (updateError) throw updateError
        setUser(updatedUser)
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              wallet_address: walletAddress.toLowerCase(),
              created_at: new Date().toISOString(),
              last_seen: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        setUser(newUser)
      }
    } catch (err) {
      console.error('Error syncing user with wallet:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (updates) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('wallet_address', account.toLowerCase())
        .select()
        .single()

      if (updateError) throw updateError
      setUser(data)
      return data
    } catch (err) {
      console.error('Error updating user profile:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getUserTransactions = async () => {
    if (!user) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return []
    }
  }

  const addTransaction = async (transactionData) => {
    if (!user) return

    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            ...transactionData,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      console.error('Error adding transaction:', err)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    isUserSynced: !!user,
    updateUserProfile,
    getUserTransactions,
    addTransaction
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>
}
