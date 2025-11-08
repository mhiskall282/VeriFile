import {
  Shield,
  Globe,
  Lock,
  ArrowRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();
  const [isUserVerified, setIsUserVerified] = useState(false);

  // Check if user is verified (you can adapt this logic based on your auth system)
  useEffect(() => {
    // Example: Check localStorage, session, or make API call to verify user
    const userToken = localStorage.getItem('userToken');
    const walletConnected = localStorage.getItem('walletConnected');
    
    // Simple verification check - adapt this to your actual verification logic
    setIsUserVerified(Boolean(userToken && walletConnected));
  }, []);

  // Handle conditional navigation based on verification status
  const handleStartVerifying = () => {
    if (isUserVerified) {
      navigate("/upload");
    } else {
      navigate("/register-choice");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-2000"></div>
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
              <span className="text-xs text-orange-600 font-medium -mt-1">
                Blockchain Verified
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 font-medium relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#security"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 font-medium relative group"
            >
              Security
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-orange-500 transition-all duration-300 font-medium relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <button
              onClick={() => navigate("/register-choice")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            Secure Your
            <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent animate-pulse">
              {" "}
              Digital Files
            </span>
            <span className="block text-5xl md:text-6xl lg:text-7xl text-gray-700">
              On The Blockchain
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            VeriFile provides{" "}
            <span className="font-semibold text-gray-800">
              zero-knowledge, verifiable
            </span>{" "}
            document tracking through trusted global companies.
            <span className="block mt-2">
              Secure, private, and permanently accessible records powered by{" "}
              <span className="text-orange-600 font-semibold">
                blockchain technology
              </span>
              .
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={handleStartVerifying}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 rounded-2xl text-xl font-bold flex items-center space-x-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Start Verifying Files</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button className="group border-2 border-gray-300 hover:border-orange-500 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 px-10 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <span className="flex items-center space-x-2">
                <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>View Demo</span>
              </span>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
              Zero-Knowledge Privacy
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Your document data is cryptographically secured with{" "}
              <span className="font-semibold text-gray-800">
                zero-knowledge proofs
              </span>
              . Verify your files without exposing sensitive information.
            </p>
            <div className="mt-6 flex items-center text-orange-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
              Global Distribution
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Powered by a network of{" "}
              <span className="font-semibold text-gray-800">
                trusted companies worldwide
              </span>
              . Your documents are validated and stored across multiple nodes
              for maximum reliability.
            </p>
            <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm">Explore network</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          <div className="group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
              Immutable Records
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Once verified, your documents become part of an{" "}
              <span className="font-semibold text-gray-800">
                immutable blockchain ledger
              </span>
              . Tamper-proof and permanently accessible forever.
            </p>
            <div className="mt-6 flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm">View security</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          id="security"
          className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-16 text-center mb-20 overflow-hidden shadow-2xl"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-orange-600 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-orange-400 rounded-full animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by <span className="text-orange-400">Users Worldwide</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join the blockchain-powered document verification network
              securing digital files globally
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-2xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Simple, secure, and transparent document verification in three easy
            steps
          </p>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>

            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                1
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                  Upload Documents
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Upload your documents through our secure interface. We support{" "}
                  <span className="font-semibold">PDFs, images,</span> and
                  various file formats with drag & drop functionality.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                2
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  Blockchain Verification
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Your documents are converted into{" "}
                  <span className="font-semibold">cryptographic hashes</span>{" "}
                  and stored on the blockchain, creating an immutable proof of
                  authenticity.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                3
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  Share & Verify
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Share verifiable proofs with anyone while{" "}
                  <span className="font-semibold">
                    maintaining complete privacy.
                  </span>{" "}
                  Recipients can instantly verify authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          id="about"
          className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl p-16 text-center overflow-hidden shadow-2xl mb-20"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-64 h-64 bg-white rounded-full absolute -top-32 -left-32 animate-pulse"></div>
              <div className="w-48 h-48 bg-white rounded-full absolute -bottom-24 -right-24 animate-pulse delay-1000"></div>
              <div className="w-32 h-32 bg-white rounded-full absolute top-1/2 right-1/4 animate-pulse delay-2000"></div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Secure Your{" "}
              <span className="text-orange-200">Digital Future?</span>
            </h2>
            <p className="text-xl text-orange-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join{" "}
              <span className="font-bold text-white">thousands of users</span>{" "}
              who trust VeriFile to manage and verify their important documents
              on the blockchain. Start your verification journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button
                onClick={handleStartVerifying}
                className="group bg-white hover:bg-gray-50 text-orange-600 px-12 py-5 rounded-2xl text-xl font-bold flex items-center space-x-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>Start Verifying Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button className="group text-white hover:text-orange-200 px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 border-2 border-white/20 hover:border-white/40 backdrop-blur-sm">
                <span className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>View Demo</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
