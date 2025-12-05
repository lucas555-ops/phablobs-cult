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
          {/* PNG Logo вместо эмодзи */}
          <img 
            src="/phantom-logo.png" 
            alt="Phablobs Logo" 
            className="w-10 h-10"
            onError={(e) => {
              // Fallback на эмодзи если картинка не загрузилась
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
        {/* Hero Section с обводкой как на картинке */}
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

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-2">
            Built with 💜 for the Solana community
          </p>
          <p className="text-gray-600 text-xs">
            phablobs.xyz © 2024 | Powered by Phantom & pump.fun
          </p>
        </div>
      </div>
    </div>
  )
}
