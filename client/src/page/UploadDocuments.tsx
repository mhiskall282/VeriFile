import React, { useState, useRef } from 'react';
import { 
  Shield, 
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

interface FileData {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

const UploadDocuments = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const processedFiles: FileData[] = newFiles.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      let preview = undefined;
      
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      return {
        id,
        file,
        preview,
        status: 'pending' as const
      };
    });
    
    setFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('document')) return '📝';
    if (fileType.includes('video')) return '🎥';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidWalletAddress = (address: string) => {
    return address.startsWith('0x') && address.length === 42;
  };

  const handleVerifyDocuments = () => {
    if (!isValidWalletAddress(walletAddress)) {
      alert('Please enter a valid wallet address before verifying documents.');
      return;
    }
    if (files.length === 0) {
      alert('Please upload at least one document to verify.');
      return;
    }
    
    // TODO: Implement document verification logic
    console.log('Verifying documents for wallet:', walletAddress);
    console.log('Files to verify:', files);
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
                Upload Documents
              </span>
            </div>
          </div>

          <div className="w-24"></div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload Your <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Documents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Securely upload and verify your documents on the blockchain. Fast, reliable, and permanently accessible.
          </p>
        </div>

        {/* Wallet Address Field */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-800 mb-2">
              Employee Wallet Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x742d35Cc6322C1D1C02F5eb8A"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter your Ethereum wallet address (must start with 0x)
            </p>
          </div>
          
          {walletAddress && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                walletAddress.startsWith('0x') && walletAddress.length === 42 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></div>
              <span className={`${
                walletAddress.startsWith('0x') && walletAddress.length === 42 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {walletAddress.startsWith('0x') && walletAddress.length === 42 
                  ? 'Valid wallet address format' 
                  : 'Invalid wallet address format'}
              </span>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 ${
            dragActive 
              ? 'border-orange-500 bg-orange-50 scale-105 shadow-lg' 
              : 'border-gray-300 bg-white hover:border-orange-400 hover:bg-gray-50'
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
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Drop your files here, or click to browse
            </h3>
            <p className="text-gray-500 mb-4">
              Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB each
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Select Files
            </button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Uploaded Files ({files.length})
              </h3>
              <button 
                onClick={() => setFiles([])}
                className="text-gray-500 hover:text-red-500 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-4">
              {files.map((fileData) => (
                <div 
                  key={fileData.id}
                  className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 mr-4 shadow-sm">
                    {fileData.preview ? (
                      <img 
                        src={fileData.preview} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">
                        {getFileIcon(fileData.file.type)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileData.file.size)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      fileData.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      fileData.status === 'uploading' ? 'bg-orange-200 text-orange-900' :
                      fileData.status === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fileData.status.charAt(0).toUpperCase() + fileData.status.slice(1)}
                    </div>
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleVerifyDocuments}
              disabled={!isValidWalletAddress(walletAddress)}
              className={`px-8 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center ${
                isValidWalletAddress(walletAddress)
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Documents
            </button>
            
            <button className="px-8 py-4 border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-500 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center bg-white">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Save Draft
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UploadDocuments;