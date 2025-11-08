import { ethers } from 'ethers'

// Types for MetaMask authentication
export interface AuthData {
  address: string
  message: string
  signature: string
}

export interface MetaMaskError extends Error {
  code?: number
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask wallet.')
    }

    return accounts[0]
  } catch (error) {
    const metamaskError = error as MetaMaskError
    
    if (metamaskError.code === 4001) {
      throw new Error('Connection rejected by user')
    } else if (metamaskError.code === -32002) {
      throw new Error('Connection request already pending. Please check MetaMask.')
    }
    
    throw new Error(`Failed to connect wallet: ${metamaskError.message}`)
  }
}

// Get current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })
    
    return accounts && accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error('Error getting current account:', error)
    return null
  }
}

// Generate authentication message
export const generateAuthMessage = (address: string, userType: 'organization' | 'employee'): string => {
  const timestamp = new Date().toISOString()
  const nonce = Math.random().toString(36).substring(2, 15)
  
  return `Welcome to VeriFile`
}

// Sign message with MetaMask
export const signMessage = async (message: string): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed')
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    
    const signature = await signer.signMessage(message)
    return signature
  } catch (error) {
    const metamaskError = error as MetaMaskError
    
    if (metamaskError.code === 4001) {
      throw new Error('Signature rejected by user')
    }
    
    throw new Error(`Failed to sign message: ${metamaskError.message}`)
  }
}

// Complete authentication process
export const authenticateWithMetaMask = async (userType: 'organization' | 'employee'): Promise<AuthData> => {
  try {
    // Step 1: Connect wallet and get address
    const address = await connectWallet()
    
    // Step 2: Generate authentication message
    const message = generateAuthMessage(address, userType)
    
    // Step 3: Sign the message
    const signature = await signMessage(message)
    
    // Return the three essential pieces of data
    return {
      address,
      message,
      signature
    }
  } catch (error) {
    throw error
  }
}

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback)
  }
}

// Listen for chain changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback)
  }
}

// Remove event listeners
export const removeAllListeners = (): void => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
  }
}

// Verify signature (client-side verification)
export const verifySignature = async (address: string, message: string, signature: string): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

// Format address for display
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}