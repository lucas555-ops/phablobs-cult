'use client'

import { useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'

export default function Home() {
  const [address, setAddress] = useState('')
  const [svgUrl, setSvgUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const TOKEN_CONTRACT = "TBA_AFTER_PUMPFUN_LAUNCH"
  
  const isValidSolanaAddress = (addr: string): boolean => {
    try {
      new PublicKey(addr)
      return true
    } catch {
      return false
    }
  }

  const handleGenerate = async () => {
    setError('')
    setSvgUrl('')

    if (!address.trim()) {
      setError('Please enter a Solana address')
      return
    }

    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana address format')
      return
    }

    setIsLoading(true)
    const url = `/api/phablob/${address}`
    setSvgUrl(url)
    setIsLoading(false)
  }

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN_CONTRACT)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadMetadata = () => {
    if (!address) return
    window.open(`/api/phablob/${address}/metadata`, '_blank')
  }

  const handleShareTwitter = async () => {
    if (!svgUrl) return
    
    const shareUrl = `${window.location.origin}${svgUrl}`
    const twitterText = encodeURIComponent(
      `Check out my unique Phablob! 🎨👻\n\n` +
      `Generated on phablobs.xyz\n\n` +
      `Token: ${TOKEN_CONTRACT}\n\n` +
      `#Phablobs #SolanaNFT #PumpFun`
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`
    
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const handleShareToken = () => {
    const twitterText = encodeURIComponent(
      `🚀 Join the Phablobs Cult! 👻\n\n` +
      `Generate your unique Phantom-inspired avatar on phablobs.xyz\n\n` +
      `Token: ${TOKEN_CONTRACT}\n\n` +
      `#Phablobs #SolanaNFT #PumpFun`
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-black">👻</span>
          </div>
          <span className="text-2xl font-black text-gray-900">PHABLOBS</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section - Стиль Phantom */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-6 leading-tight">
            PHABLOBS
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-gray-700 mb-8">
            masterpiece
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Generate your unique Phantom-inspired avatar from any Solana wallet address
          </p>
        </div>

        {/* Token Contract Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50">
            
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                PHABLOB TOKEN
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Official Phablobs Cult token on Solana
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
              <label className="block text-gray-700 text-xs md:text-sm font-bold mb-3 text-center">
                Contract Address
              </label>
              
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-xl px-4 py-4 border border-gray-200">
                  <code className="text-gray-900 font-mono text-xs md:text-sm break-all block text-center">
                    {TOKEN_CONTRACT}
                  </code>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToken}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white font-bold text-sm md:text-base">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white font-bold text-sm md:text-base">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShareToken}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-white font-bold text-sm md:text-base">Share</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-xs md:text-sm">
                  💡 Available on pump.fun and Jupiter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generator Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50">
            <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
              Generate Your Phablob
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Solana Wallet Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter your Solana address..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                />
                {error && (
                  <p className="mt-2 text-red-500 text-sm">{error}</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base md:text-lg"
              >
                {isLoading ? 'Generating...' : '✨ Generate Phablob'}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Phablob Card */}
        {svgUrl && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border border-purple-200/50">
                <img 
                  src={svgUrl} 
                  alt="Generated Phablob" 
                  className="w-full h-auto rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadMetadata}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  NFT Metadata
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm md:text-base"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on X
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-xs md:text-sm">
                  💡 Right-click image to save, or download metadata to mint as NFT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why Phablobs Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">
            Why Phablobs?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 hover:border-purple-300 hover:shadow-xl transition-all hover:scale-105 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Truly Unique</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every Phablob is generated from your wallet address - completely unique to you with dynamic gradients and watermarks
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 hover:border-indigo-300 hover:shadow-xl transition-all hover:scale-105 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">NFT-Ready</h3>
                <p className="text-gray-600 leading-relaxed">
                  Download metadata in Metaplex format - ready to mint on Solana marketplaces like Magic Eden and Tensor
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 hover:border-pink-300 hover:shadow-xl transition-all hover:scale-105 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instantly Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate unlimited Phablobs at no cost - just enter any Solana wallet address and create your masterpiece
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            Built with 💜 for the Solana community
          </p>
          <p className="text-gray-500 text-xs">
            phablobs.xyz © 2024 | Powered by Phantom & pump.fun
          </p>
        </div>
      </div>
    </div>
  )
}
