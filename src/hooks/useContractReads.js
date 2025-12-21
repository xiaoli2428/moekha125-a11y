import { useState, useEffect } from 'react'

/**
 * Hook for reading data from smart contracts
 * @param {Object} config - Contract read configuration
 * @param {string} config.address - Contract address
 * @param {Array} config.abi - Contract ABI
 * @param {string} config.functionName - Function to call
 * @param {Array} config.args - Function arguments
 * @returns {Object} { data, isLoading, isError, error, refetch }
 */
export function useContractRead({ address, abi, functionName, args = [] }) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      // TODO: Implement actual contract read when web3 provider is added
      // For now, return mock data
      console.log(`Reading ${functionName} from ${address}`)
      setData(null)
    } catch (err) {
      setIsError(true)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address && functionName) {
      fetchData()
    }
  }, [address, functionName, JSON.stringify(args)])

  return { data, isLoading, isError, error, refetch: fetchData }
}

/**
 * Hook for reading multiple contract calls
 * @param {Array} contracts - Array of contract read configs
 * @returns {Object} { data, isLoading, isError, error, refetch }
 */
export function useContractReads(contracts = []) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllData = async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      // TODO: Implement actual multicall when web3 provider is added
      // For now, return mock data array
      const results = contracts.map((contract) => ({
        address: contract.address,
        functionName: contract.functionName,
        result: null,
      }))
      setData(results)
    } catch (err) {
      setIsError(true)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contracts.length > 0) {
      fetchAllData()
    }
  }, [JSON.stringify(contracts)])

  return { data, isLoading, isError, error, refetch: fetchAllData }
}

export default useContractReads