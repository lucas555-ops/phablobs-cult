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
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#ab0ff2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#4da7f2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2ec08b] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header with Logo */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <img 
            src="/phantom-logo.png" 
            alt="Phablobs Logo" 
            className="w-10 h-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.className = 'w-10 h-10 flex items-center justify-center text-2xl'
              fallback.textContent = '👻'
              e.currentTarget.parentElement?.appendChild(fallback)
            }}
          />
          <span className="text-2xl font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">PHABLOBS</span>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 
            className="text-6xl md:text-8xl font-black mb-2 leading-tight"
            style={{
              fontFamily: "'Baloo 2', 'Fredoka', 'Poppins', sans-serif",
              color: '#1c1c1c',
              WebkitTextStroke: '8px #ab0ff2',
              paintOrder: 'stroke fill',
              textShadow: '0 4px 20px rgba(171,15,242,0.4)',
              letterSpacing: '-0.02em'
            }}
          >
            PHABLOBS
          </h1>
          <p 
            className="text-3xl md:text-5xl font-black"
            style={{
              fontFamily: "'Baloo 2', 'Fredoka', 'Poppins', sans-serif",
              color: '#1c1c1c',
              WebkitTextStroke: '6px #ab0ff2',
              paintOrder: 'stroke fill',
              textShadow: '0 2px 15px rgba(171,15,242,0.3)',
              letterSpacing: '-0.01em'
            }}
          >
            masterpiece
          </p>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mt-4">
            Generate your unique Phantom-inspired avatar from any Solana wallet address
          </p>
        </div>

        {/* Token Contract Card */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(171,15,242,0.15)]">
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#ab0ff2] via-[#4da7f2] to-[#2ec08b] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(171,15,242,0.5)]">
                PHABLOB TOKEN
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Official Phablobs Cult token on Solana
              </p>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 border border-[#ab0ff2]/20 backdrop-blur-sm">
              <label className="block text-gray-300 text-xs md:text-sm font-bold mb-3 text-center">
                Contract Address
              </label>
              
              <div className="flex flex-col gap-3">
                <div className="bg-gray-900/60 rounded-xl px-4 py-4 border border-[#ab0ff2]/20">
                  <code className="text-[#ab0ff2] font-mono text-xs md:text-sm break-all block text-center">
                    {TOKEN_CONTRACT}
                  </code>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToken}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] hover:from-[#9b0ed9] hover:to-[#3d96e0] rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(171,15,242,0.4)]"
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
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#4da7f2] to-[#2ec08b] hover:from-[#3d96e0] hover:to-[#26a879] rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(77,167,242,0.4)]"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-white font-bold text-sm md:text-base">Share</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[#ab0ff2]/80 text-xs md:text-sm">
                  💡 Available on pump.fun and Jupiter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generator Card */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(171,15,242,0.15)]">
            <h2 className="text-3xl font-black text-white mb-6 text-center">
              Generate Your Phablob
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Solana Wallet Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter your Solana address..."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-[#ab0ff2]/30 text-white placeholder-gray-600 focus:outline-none focus:border-[#ab0ff2] focus:ring-2 focus:ring-[#ab0ff2]/20 text-sm md:text-base"
                />
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] hover:from-[#9b0ed9] hover:to-[#3d96e0] text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base md:text-lg hover:shadow-[0_0_30px_rgba(171,15,242,0.4)]"
              >
                {isLoading ? 'Generating...' : '✨ Generate Phablob'}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Phablob Card */}
        {svgUrl && (
          <div className="max-w-2xl mx-auto mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(171,15,242,0.15)]">
              <div className="bg-gradient-to-br from-[#ab0ff2]/10 to-[#4da7f2]/10 rounded-2xl p-4 mb-6 border border-[#ab0ff2]/30">
                <img 
                  src={svgUrl} 
                  alt="Generated Phablob" 
                  className="w-full h-auto rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadMetadata}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] hover:from-[#9b0ed9] hover:to-[#3d96e0] text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm md:text-base hover:shadow-[0_0_30px_rgba(171,15,242,0.4)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  NFT Metadata
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4da7f2] to-[#2ec08b] hover:from-[#3d96e0] hover:to-[#26a879] text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm md:text-base hover:shadow-[0_0_30px_rgba(77,167,242,0.4)]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on X
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[#ab0ff2]/80 text-xs md:text-sm">
                  💡 Right-click image to save, or download metadata to mint as NFT
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            Phablob Gallery
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              '/gallery/phablob-1.png',
              '/gallery/phablob-2.png',
              '/gallery/phablob-3.png',
              '/gallery/phablob-4.png'
            ].map((src, i) => (
              <div key={i} className="group">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-3 hover:border-[#ab0ff2]/50 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(171,15,242,0.2)]">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#ab0ff2]/10 to-[#4da7f2]/10">
                    <img 
                      src={src} 
                      alt={`Phablob ${i + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-600 text-sm">Example #${i + 1}</div>`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Phablobs Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            Why Phablobs?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8 hover:border-[#ab0ff2]/50 transition-all hover:scale-105 h-full hover:shadow-[0_0_30px_rgba(171,15,242,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ab0ff2] to-[#4da7f2] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Truly Unique</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every Phablob is generated from your wallet address - completely unique to you with dynamic gradients and watermarks
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8 hover:border-[#4da7f2]/50 transition-all hover:scale-105 h-full hover:shadow-[0_0_30px_rgba(77,167,242,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4da7f2] to-[#2ec08b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">NFT-Ready</h3>
                <p className="text-gray-400 leading-relaxed">
                  Download metadata in Metaplex format - ready to mint on Solana marketplaces like Magic Eden and Tensor
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8 hover:border-[#ff7243]/50 transition-all hover:scale-105 h-full hover:shadow-[0_0_30px_rgba(255,114,67,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ff7243] to-[#fffd13] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Instantly Free</h3>
                <p className="text-gray-400 leading-relaxed">
                  Generate unlimited Phablobs at no cost - just enter any Solana wallet address and create your masterpiece
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Math Behind Phablobs Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            The Math Behind Phablobs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Combinations */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8">
              <div className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
                596,000+
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Unique Combinations
              </h3>
              <p className="text-gray-400 text-sm text-center">
                69 avatar colors × 2 background styles (gradient/solid) × wallet addresses = infinite possibilities
              </p>
            </div>

            {/* Tiers */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8">
              <div className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-[#FFD700] to-[#ff7f00] bg-clip-text text-transparent">
                4 Tiers
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Tier-Based Rarity
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Hold more $BLOB to unlock legendary colors: 20 → 40 → 60 → 69 colors
              </p>
            </div>

            {/* Holders */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8">
              <div className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-[#2ec08b] to-[#4da7f2] bg-clip-text text-transparent">
                FREE
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Generate Unlimited
              </h3>
              <p className="text-gray-400 text-sm text-center">
                No cost to create. Enter any Solana address and generate your unique Phablob instantly
              </p>
            </div>

            {/* Future NFT */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-8">
              <div className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-[#ff7243] to-[#fffd13] bg-clip-text text-transparent">
                10,000
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                NFT Collection Coming
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Future full collection mint. Holders get free NFTs based on $BLOB balance
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            Roadmap
          </h2>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#ab0ff2] via-[#4da7f2] to-[#2ec08b]" />
            
            {/* Phase 1 */}
            <div className="relative mb-12">
              <div className="flex items-center justify-between">
                <div className="w-5/12" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#ab0ff2] to-[#4da7f2] rounded-full flex items-center justify-center z-10 border-4 border-black">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="w-5/12 bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">Phase 1: LAUNCH</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">LIVE</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>✅ Token on pump.fun</li>
                    <li>✅ Website live</li>
                    <li>✅ Free generator</li>
                    <li>✅ 69 unique avatars</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative mb-12">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="w-5/12" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#4da7f2] to-[#2ec08b] rounded-full flex items-center justify-center z-10 border-4 border-black">
                  <span className="text-2xl">👻</span>
                </div>
                <div className="w-5/12 bg-gradient-to-br from-gray-900 to-black border border-[#4da7f2]/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">Phase 2: GROW</h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">IN PROGRESS</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>🔄 Tier system active</li>
                    <li>🎯 1,000+ holders</li>
                    <li>📱 Viral campaigns</li>
                    <li>🤝 Partnerships</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative mb-12">
              <div className="flex items-center justify-between">
                <div className="w-5/12" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#2ec08b] to-[#fffd13] rounded-full flex items-center justify-center z-10 border-4 border-black">
                  <span className="text-2xl">🌊</span>
                </div>
                <div className="w-5/12 bg-gradient-to-br from-gray-900 to-black border border-[#2ec08b]/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Phase 3: EXPAND</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>💱 DEX listings</li>
                    <li>🎯 10,000+ holders</li>
                    <li>💰 $1M+ market cap</li>
                    <li>🏆 Competitions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="w-5/12" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#ff7f00] rounded-full flex items-center justify-center z-10 border-4 border-black">
                  <span className="text-2xl">💎</span>
                </div>
                <div className="w-5/12 bg-gradient-to-br from-gray-900 to-black border border-[#FFD700]/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Phase 4: NFT DROP</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>🎨 10K NFT collection</li>
                    <li>🎁 1M+ $BLOB = 3 free NFTs</li>
                    <li>🎁 100K+ $BLOB = 2 free NFTs</li>
                    <li>🎁 10K+ $BLOB = 1 free NFT</li>
                    <li>💰 Public: 0.5 SOL</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Holder Rewards */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-[#FFD700] to-[#ff7f00] bg-clip-text text-transparent">
            Phase 4: Holder Rewards 🎁
          </h2>
          
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#FFD700]/30 rounded-2xl p-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-white">$BLOB Balance</th>
                  <th className="text-left py-3 px-4 text-white">Tier</th>
                  <th className="text-left py-3 px-4 text-white">Free NFTs</th>
                  <th className="text-left py-3 px-4 text-white">Total Value*</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">1,000,000+</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                      👑 Legendary
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">3 NFTs</td>
                  <td className="py-3 px-4 text-green-400">~1.5 SOL</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">100,000 - 999,999</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs font-bold">
                      💎 Rare
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">2 NFTs</td>
                  <td className="py-3 px-4 text-green-400">~1.0 SOL</td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">10,000 - 99,999</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                      🔵 Uncommon
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">1 NFT</td>
                  <td className="py-3 px-4 text-green-400">~0.5 SOL</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">0 - 9,999</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-bold">
                      ⚪ Common
                    </span>
                  </td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4 text-gray-500">Buy at mint</td>
                </tr>
              </tbody>
            </table>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              * Based on 0.5 SOL public mint price. Snapshot taken 24h before mint.
            </p>
          </div>
        </div>

      </div> 
      
      {/* Footer и завершающие секции */}
      <div className="space-y-12 mt-20">
        {/* CTA Section - Final Call to Action */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#ab0ff2]/20 to-[#4da7f2]/20 border border-[#ab0ff2]/30 rounded-3xl p-8 md:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#ab0ff2] to-[#4da7f2] rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Join the <span className="bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">Cult?</span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Generate your unique Phablob today and be part of the fastest growing community on Solana
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#generate"
                className="px-8 py-4 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] hover:from-[#9b0ed9] hover:to-[#3d96e0] text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg hover:shadow-[0_0_40px_rgba(171,15,242,0.5)]"
              >
                🎨 Generate Your Phablob
              </a>
              
              <a
                href="https://pump.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-[#2ec08b] to-[#4da7f2] hover:from-[#26a879] hover:to-[#3d96e0] text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg hover:shadow-[0_0_40px_rgba(46,192,139,0.5)]"
              >
                💰 Buy $BLOB Token
              </a>
            </div>
          </div>
        </div>

        {/* Community & Social Links */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-3xl p-8">
            <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
              Join Our Community
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  name: 'X (Twitter)',
                  icon: '🐦',
                  color: 'from-[#1DA1F2] to-[#1DA1F2]/70',
                  url: 'https://twitter.com/phablobs',
                  followers: 'Follow @phablobs'
                },
                {
                  name: 'Telegram',
                  icon: '📢',
                  color: 'from-[#0088cc] to-[#0088cc]/70',
                  url: 'https://t.me/phablobs',
                  followers: 'Join Group'
                },
                {
                  name: 'Discord',
                  icon: '🎮',
                  color: 'from-[#7289da] to-[#7289da]/70',
                  url: 'https://discord.gg/phablobs',
                  followers: 'Join Server'
                },
                {
                  name: 'Dextools',
                  icon: '📊',
                  color: 'from-[#ff7f00] to-[#ff7f00]/70',
                  url: 'https://www.dextools.io',
                  followers: 'Track Chart'
                }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/20 rounded-2xl p-6 hover:border-[#ab0ff2]/50 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(171,15,242,0.2)] h-full">
                    <div className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform text-3xl`}>
                      {social.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">{social.name}</h3>
                    <p className="text-gray-400 text-sm text-center">{social.followers}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-3xl p-8">
            <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: 'What is Phablobs?',
                  a: 'Phablobs is a unique avatar generator that creates Phantom-inspired art from any Solana wallet address. Each Phablob is completely unique and can be downloaded as NFT-ready metadata.'
                },
                {
                  q: 'Is it really free?',
                  a: 'Yes! Generating Phablobs is 100% free. Just enter any Solana wallet address and generate unlimited avatars. The $BLOB token is separate and optional.'
                },
                {
                  q: 'How do I get free NFTs in Phase 4?',
                  a: 'Hold $BLOB tokens before the snapshot (24h before mint): 1M+ = 3 NFTs, 100K+ = 2 NFTs, 10K+ = 1 NFT. Snapshot details will be announced.'
                },
                {
                  q: 'Where can I buy $BLOB token?',
                  a: '$BLOB is available on pump.fun and will be listed on Jupiter. Always verify the contract address from our official channels.'
                },
                {
                  q: 'Can I mint my Phablob as an NFT?',
                  a: 'Yes! Click "NFT Metadata" after generation to download Metaplex-compatible metadata ready for minting on any Solana marketplace.'
                }
              ].map((faq, index) => (
                <div key={index} className="border border-[#ab0ff2]/20 rounded-2xl p-6 hover:border-[#ab0ff2]/40 transition-all">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-[#ab0ff2]">Q{index + 1}.</span> {faq.q}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partners & Integrations */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            Powered By
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Solana', logo: '🟣', color: 'from-[#9945FF] to-[#14F195]' },
              { name: 'Phantom', logo: '👻', color: 'from-[#ab0ff2] to-[#4da7f2]' },
              { name: 'pump.fun', logo: '🚀', color: 'from-[#FF6B6B] to-[#FFD93D]' },
              { name: 'Jupiter', logo: '🪐', color: 'from-[#10B981] to-[#3B82F6]' }
            ].map((partner, index) => (
              <div
                key={index}
                className="group"
              >
                <div className={`bg-gradient-to-br ${partner.color} rounded-2xl p-6 transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(171,15,242,0.3)]`}>
                  <div className="text-4xl text-center mb-4">{partner.logo}</div>
                  <h3 className="text-xl font-bold text-white text-center">{partner.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Footer */}
        <footer className="max-w-6xl mx-auto pt-8 border-t border-[#ab0ff2]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/phantom-logo.png" 
                alt="Phablobs Logo" 
                className="w-10 h-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.className = 'w-10 h-10 flex items-center justify-center text-2xl'
                  fallback.textContent = '👻'
                  e.currentTarget.parentElement?.appendChild(fallback)
                }}
              />
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">PHABLOBS</span>
                <p className="text-xs text-gray-500 mt-1">Phantom-inspired avatar generator</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">
                Built with 💜 for the Solana community
              </p>
              <p className="text-gray-600 text-xs">
                © {new Date().getFullYear()} phablobs.xyz | All rights reserved
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Not affiliated with Phantom Wallet. For entertainment purposes only.
              </p>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-6">
              <a 
                href="https://twitter.com/phablobs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#1DA1F2] transition-colors text-sm group"
              >
                <div className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center group-hover:bg-[#1DA1F2]/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span>X / Twitter</span>
              </a>
              
              <a 
                href="https://t.me/phablobs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-[#0088cc] transition-colors text-sm group"
              >
                <div className="w-8 h-8 bg-gray-800/50 rounded-full flex items-center justify-center group-hover:bg-[#0088cc]/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.242-.213-.054-.333-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </div>
                <span>Telegram</span>
              </a>
            </div>
          </div>
          
          {/* Easter Egg / Fun Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-700">
              Every wallet tells a story. What's yours? 👻
              <br />
              <span className="text-[#ab0ff2]/50">Tip: Try generating Phablobs for famous Solana wallets!</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
