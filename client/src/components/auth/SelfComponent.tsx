import { useEffect, useState } from 'react'

// This component dynamically imports the Self.xyz QR package at runtime to
// avoid bundler/interop issues that can cause "Element type is invalid" when
// the package export shape differs. It also reads the Self endpoint and
// scope from Vite environment variables (VITE_SELF_ENDPOINT, VITE_APP_SCOPE).


//import { useWallet } from '../contexts/WalletContext'

interface VerifyProps {
  account: string
  authData: string
  userType: string
}

export default function Verify({ account, authData, userType }: VerifyProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selfApp, setSelfApp] = useState<any | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ResolvedSelfQRComp, setResolvedSelfQRComp] = useState<any | null>(null)

  useEffect(() => {
  // Use the authenticated wallet address or fallback to default
  const userId = account || '0x00000000219ab540356cBB839Cbe05303d7705Fa'
    
    // Parse authData if provided
    let userDefinedData = null
    if (authData) {
      try {
        userDefinedData = JSON.parse(authData)
      } catch (error) {
        console.error('Failed to parse authData:', error)
      }
    }
    
    // Resolve Self endpoint and scope from Vite env (falls back to same
    // defaults used previously).
  // Access Vite env safely (TS typing) and allow fallback defaults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env: any = (import.meta as any).env || {}
  const SELF_ENDPOINT = env.VITE_SELF_ENDPOINT || 'https://crystallographic-unpendulously-teri.ngrok-free.dev/api/self'
  const SELF_SCOPE = env.VITE_APP_SCOPE || 'verifile-app'

    // Dynamically import the library to avoid runtime/bundler export mismatches
    import('@selfxyz/qrcode')
      .then((mod) => {
        // Try a few common export shapes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Builder = (mod as any).SelfAppBuilder || (mod as any).default?.SelfAppBuilder || (mod as any).default || null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const QRComp = (mod as any).SelfQRcodeWrapper || (mod as any).SelfQRcode || (mod as any).default?.SelfQRcodeWrapper || (mod as any).default?.SelfQRcode || null

        if (!Builder) {
          console.error('SelfAppBuilder not found on @selfxyz/qrcode package. QR flow disabled.')
          setResolvedSelfQRComp(null)
          setSelfApp(null)
          return
        }

        setResolvedSelfQRComp(() => QRComp)

        const app = new Builder({
          version: 2,
          appName: 'VeriFile',
          scope: SELF_SCOPE,
          endpoint: SELF_ENDPOINT,
      logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
      userId,
      endpointType: 'staging_https',
      userIdType: 'hex', // 'hex' for EVM address or 'uuid' for uuidv4
      disclosures: {
        minimumAge: 18,
        excludedCountries: [],
        ofac:false,
        // What you want users to
        nationality: true,
        gender: true,
      },
      //userDefinedData: "test",
          userDefinedData: userDefinedData && userDefinedData.address ? `${userDefinedData.address}:${userDefinedData.signature}:${userDefinedData.message}` : ''
        }).build()

        setSelfApp(app)
      })
      .catch((err) => {
        console.error('Failed to import @selfxyz/qrcode:', err)
        setResolvedSelfQRComp(null)
        setSelfApp(null)
      })
  }, [account, authData, userType])

  const handleSuccessfulVerification = () => {
    // Persist the attestation / session result to your backend, then gate content
    console.log('Verified!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VeriFile</h1>
          <p className="text-gray-600">Secure Identity Verification</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {selfApp ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scan to Verify Your Identity
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Use your Self.xyz app to scan the QR code and verify your identity securely
              </p>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                {ResolvedSelfQRComp ? (
                  <ResolvedSelfQRComp
                    selfApp={selfApp}
                    onSuccess={handleSuccessfulVerification}
                    onError={() => console.log('Error! Try Again')}
                  />
                ) : (
                  <div className="p-4 text-sm text-orange-700">
                    Self QR component not available. Ensure `@selfxyz/qrcode` is installed and exports `SelfQRcodeWrapper` or `SelfQRcode`.
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-center text-orange-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Minimum age: 18 years</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preparing Verification</h3>
              <p className="text-gray-600 text-sm">Setting up secure QR code...</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <span className="font-semibold text-orange-600">Self.xyz</span>
            {' '}• Secure • Private • Decentralized
          </p>
        </div>
      </div>
    </div>
  )
}