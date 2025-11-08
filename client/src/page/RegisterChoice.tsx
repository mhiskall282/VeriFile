import { useState, useEffect } from 'react'
import { Shield, Building, User, AlertCircle, CheckCircle, Download, ArrowRight } from 'lucide-react'
import { isMetaMaskInstalled, connectWallet, getCurrentAccount, authenticateWithMetaMask } from '../utils/metamask'
import type { AuthData } from '../utils/metamask'
import SelfComponent from '../components/auth/SelfComponent'
import Footer from '../components/Footer'

type UserType = 'organization' | 'employee'

function RegisterChoice() {
  const [selectedType, setSelectedType] = useState<UserType>('employee')
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>('')
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [orgWantsToJoin, setOrgWantsToJoin] = useState<boolean | null>(null)

  useEffect(() => {
    checkMetaMaskStatus()
  }, [])

  const checkMetaMaskStatus = async () => {
    const installed = isMetaMaskInstalled()
    setIsMetaMaskAvailable(installed)

    if (installed) {
      const currentAccount = await getCurrentAccount()
      if (currentAccount) {
        setAccount(currentAccount)
        setIsConnected(true)
      }
    }
  }

  const handleConnectWallet = async () => {
    if (!isMetaMaskAvailable) {
      setError('Please install MetaMask first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const connectedAccount = await connectWallet()
      setAccount(connectedAccount)
      setIsConnected(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthenticate = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const auth = await authenticateWithMetaMask(selectedType)
      setAuthData(auth)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderRegistrationContent = () => {
    if (selectedType === 'employee') {
      if (!authData) {
        return (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Employee Verification</h3>
            <p className="text-gray-600 mb-6">
              Complete your identity verification using Self.xyz to securely register as an employee.
            </p>
            <button
              onClick={handleAuthenticate}
              disabled={isLoading || !isConnected}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {isLoading ? 'Authenticating...' : 'Start Verification'}
            </button>
          </div>
        )
      }

      return (
        <div>
          <SelfComponent 
            account={authData.address} 
            authData={JSON.stringify(authData)} 
            userType="employee" 
          />
        </div>
      )
    } else {
      // Organization registration
      if (orgWantsToJoin === null) {
        return (
          <div className="text-center py-8">
            <Building className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Organization Registration</h3>
            <p className="text-gray-600 mb-8">
              Would you like to add your organization to our trusted partner list?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setOrgWantsToJoin(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Yes, Add Organization
              </button>
              <button
                onClick={() => setOrgWantsToJoin(false)}
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Not Now
              </button>
            </div>
          </div>
        )
      }

      if (orgWantsToJoin) {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Application Submitted</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your interest! Your organization application has been submitted for review. 
              Our team will contact you within 2-3 business days to proceed with the verification process.
            </p>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700">
                <strong>Connected Wallet:</strong> {account}
              </p>
            </div>
          </div>
        )
      } else {
        return (
          <div className="text-center py-8">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Registration Skipped</h3>
            <p className="text-gray-600 mb-6">
              You can always apply to add your organization later from your dashboard.
            </p>
            <button
              onClick={() => setOrgWantsToJoin(null)}
              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              ← Go Back
            </button>
          </div>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse float-animation"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-20 w-64 h-64 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative px-6 py-6 backdrop-blur-sm bg-white/80 border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                VeriFile
              </span>
              <span className="text-xs text-orange-600 font-medium -mt-1">Registration Portal</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-16">          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Choose Your
            <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent"> Registration Path</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join the blockchain revolution. Register as an <span className="font-semibold text-gray-800">employee</span> to verify your documents or as an <span className="font-semibold text-gray-800">organization</span> to issue verified credentials.
          </p>
        </div>

        {/* MetaMask Connection Status */}
        {!isMetaMaskAvailable && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">MetaMask Required</h3>
                <p className="text-red-700 mt-1">
                  Please install MetaMask to continue with registration.
                </p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Install MetaMask</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {!isConnected && isMetaMaskAvailable && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-orange-800">Connect Your Wallet</h3>
                  <p className="text-orange-700">Connect your MetaMask wallet to continue.</p>
                </div>
              </div>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-800">Wallet Connected</h3>
                <p className="text-green-700 text-sm">{account}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Registration Cards */}
        {isConnected && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Employee Card */}
            <div 
              onClick={() => {
                setSelectedType('employee')
                setOrgWantsToJoin(null)
                setAuthData(null)
              }}
              className={`group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 ${
                selectedType === 'employee' ? 'scale-105' : ''
              }`}
            >
              <div className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-300 ${
                selectedType === 'employee' 
                  ? 'border-orange-500 shadow-2xl' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-2xl'
              }`}>
                {selectedType === 'employee' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 ${
                  selectedType === 'employee'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 scale-110'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110'
                }`}>
                  <User className="w-10 h-10 text-white" />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 transition-colors ${
                  selectedType === 'employee' ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
                }`}>
                  I'm an Employee
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Verify your professional documents and work history on the blockchain. Create tamper-proof credentials that employers can trust.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Secure document verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Blockchain-backed credentials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Privacy-first verification</span>
                  </div>
                </div>

                <div className={`mt-6 flex items-center font-medium transition-all duration-300 ${
                  selectedType === 'employee' ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600 group-hover:translate-x-2'
                }`}>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Organization Card */}
            <div 
              onClick={() => {
                setSelectedType('organization')
                setOrgWantsToJoin(null)
                setAuthData(null)
              }}
              className={`group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 ${
                selectedType === 'organization' ? 'scale-105' : ''
              }`}
            >
              <div className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-300 ${
                selectedType === 'organization' 
                  ? 'border-orange-500 shadow-2xl' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-2xl'
              }`}>
                {selectedType === 'organization' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 ${
                  selectedType === 'organization'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 scale-110'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 group-hover:scale-110'
                }`}>
                  <Building className="w-10 h-10 text-white" />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 transition-colors ${
                  selectedType === 'organization' ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
                }`}>
                  I'm an Organization
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Issue verified credentials to your employees and partners. Join the trusted network of organizations using blockchain verification.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Issue verified credentials</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Manage employee records</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Trusted network access</span>
                  </div>
                </div>

                <div className={`mt-6 flex items-center font-medium transition-all duration-300 ${
                  selectedType === 'organization' ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-600 group-hover:translate-x-2'
                }`}>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Content */}
        {isConnected && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            {renderRegistrationContent()}
          </div>
        )}
      </main>
      <Footer />
    </div>
    
  )
}

export default RegisterChoice