import React, { useState, useRef, useCallback } from 'react';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Trash2,
  Wallet,
  Loader2,
  ArrowLeft,
  Globe,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

interface FileData {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  hash?: string;
  blockchainTx?: string;
}

function VerifyDocuments() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const verifyFile = async (id: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, status: 'verifying' } : file
    ));

    // Simulate verification process
    setTimeout(() => {
      setFiles(prev => prev.map(file => 
        file.id === id ? { 
          ...file, 
          status: 'verified',
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          blockchainTx: '0x' + Math.random().toString(16).substr(2, 64)
        } : file
      ));
    }, 3000);
  };

  const connectWallet = () => {
    // Simulate wallet connection
    setWalletAddress('0x742d35Cc6634C0532925a3b8D7389C842ce42342');
    setIsWalletConnected(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FileText className="w-5 h-5 text-gray-400" />;
      case 'verifying': return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />;
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-gray-200 bg-gray-50';
      case 'verifying': return 'border-orange-200 bg-orange-50';
      case 'verified': return 'border-green-200 bg-green-50';
      case 'failed': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative px-6 py-6 backdrop-blur-sm bg-white/80 border-b border-gray-200/50 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                VeriFile
              </span>
              <span className="text-xs text-orange-600 font-medium -mt-1">
                Document Verification
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isWalletConnected ? (
              <div className="flex items-center space-x-3 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verify Your <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Documents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your documents to verify their authenticity on the blockchain. 
            Secure, fast, and permanently verifiable.
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-12">
          <div
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-orange-400 bg-orange-50 scale-105 shadow-lg' 
                : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  dragActive ? 'bg-orange-200 scale-110' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-10 h-10 transition-colors duration-300 ${
                    dragActive ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {dragActive ? 'Drop your files here' : 'Upload Documents'}
                </h3>
                <p className="text-gray-500 mb-6">
                  Drag & drop files here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-orange-500 hover:text-orange-600 font-semibold underline"
                  >
                    browse files
                  </button>
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400">
                  <span className="px-3 py-1 bg-gray-100 rounded-full">PDF</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">DOC</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">DOCX</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">JPG</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full">PNG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-orange-500" />
              <span>Uploaded Documents ({files.length})</span>
            </h2>
            
            <div className="grid gap-4">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${getStatusColor(fileData.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(fileData.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{fileData.file.name}</h3>
                        <p className="text-sm text-gray-500">
                          {(fileData.file.size / 1024 / 1024).toFixed(2)} MB • {fileData.file.type}
                        </p>
                        {fileData.status === 'verified' && fileData.hash && (
                          <p className="text-xs text-green-600 font-mono mt-1">
                            Hash: {fileData.hash.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {fileData.status === 'pending' && (
                        <button
                          onClick={() => verifyFile(fileData.id)}
                          disabled={!isWalletConnected}
                          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Verify</span>
                        </button>
                      )}
                      
                      {fileData.status === 'verified' && (
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Certificate</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {fileData.status === 'verifying' && (
                    <div className="mt-4 bg-orange-100 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-orange-800">Verifying document...</div>
                          <div className="text-xs text-orange-600">Processing on blockchain network</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {fileData.status === 'verified' && (
                    <div className="mt-4 bg-green-100 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="text-sm font-medium text-green-800">Verification Complete</div>
                            <div className="text-xs text-green-600">Document authenticated on blockchain</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-green-600">
                          <Globe className="w-4 h-4" />
                          <span>Publicly Verifiable</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Blockchain Security</h3>
            <p className="text-gray-600">Your documents are secured with cryptographic hashes on the blockchain.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Global Verification</h3>
            <p className="text-gray-600">Anyone can verify your documents anywhere in the world instantly.</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy Protected</h3>
            <p className="text-gray-600">Your document content remains private while proof is publicly verifiable.</p>
          </div>
        </div>

        {/* Wallet Connection Notice */}
        {!isWalletConnected && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-center mb-8">
            <div className="text-white">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="mb-4 opacity-90">
                To verify documents on the blockchain, please connect your MetaMask wallet.
              </p>
              <button
                onClick={connectWallet}
                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet Now</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default VerifyDocuments;