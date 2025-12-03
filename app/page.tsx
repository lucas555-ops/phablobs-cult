'use client'

import React, { useState } from 'react'
import { Upload, Twitter, Download, Sparkles, Eye, Loader2 } from 'lucide-react'

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}> = ({ children, className, variant = 'default', size = 'md', isLoading = false, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: 'bg-gradient-to-r from-cyan-400 to-purple-600 text-black hover:shadow-[0_0_30px_rgba(0,255,240,0.3)] hover:scale-105',
    outline: 'border-2 border-purple-600 text-purple-400 hover:bg-purple-600/10',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : children}
    </button>
  )
}

export default function PhablobsCult() {
  const [walletAddress, setWalletAddress] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleGenerate = () => {
    // Проверка валидности Solana адреса
    if (!walletAddress || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      alert('Please enter a valid Solana wallet address\nExample: 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d')
      return
    }

    setIsGenerating(true)
    setImageLoaded(false)
    
    // Добавляем timestamp чтобы избежать кеширования при повторных запросах
    const url = `/api/phablob/${walletAddress}?t=${Date.now()}`
    setGeneratedUrl(url)
    
    // Сбрасываем состояние загрузки через 500мс (но реально сбросится когда картинка загрузится)
    setTimeout(() => {
      setIsGenerating(false)
    }, 500)
  }

  const handleDownload = () => {
    if (!generatedUrl || !walletAddress) return
    
    fetch(generatedUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `phablob-${walletAddress.substring(0, 8)}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
      .catch(err => {
        console.error('Download failed:', err)
        alert('Failed to download image. Please try again.')
      })
  }

  const handleShare = () => {
    const text = `I just revealed my Phablob! 🎭\n\n17M Phantom users, 17M unique AI blobs. This isn't just an avatar—it's a cult.\n\nReveal yours 👉 phablobs.cult\n\n#PhablobsCult #Phantom #Solana`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleExampleAddress = () => {
    // Пример валидного формата Solana адреса
    const exampleAddress = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'
    setWalletAddress(exampleAddress)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center gap-8 sm:gap-12 max-w-6xl mx-auto">
        <header className="text-center space-y-4 sm:space-y-6 w-full">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-600 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,240,0.3)]">
            PHABLOBS CULT
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            <span className="text-cyan-400 font-bold">17M Phantom users.</span>{' '}
            <span className="text-purple-400 font-bold">17M unique AI blobs.</span><br />
            These aren't just avatars—they're your identity in the Solana cult.<br />
            <span className="text-white font-semibold">Reveal yours. Join the movement.</span>
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto pt-4 px-4">
            {[
              { value: '17M+', label: 'Phantom MAU' },
              { value: 'AI-Gen', label: 'Unique Blobs' },
              { value: 'Cult', label: 'Growing' }
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/20 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        <section className="w-full max-w-2xl space-y-4 sm:space-y-6 px-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
              <Sparkles className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
              Reveal Your Phablob
              <Sparkles className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Enter Your Phantom Wallet Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
                    className="flex-1 px-4 py-3 bg-black border border-purple-600/30 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 font-mono text-sm"
                  />
                  <button
                    onClick={handleExampleAddress}
                    className="px-3 py-3 bg-purple-600/20 border border-purple-600/30 rounded-xl text-purple-400 hover:bg-purple-600/30 transition-colors text-sm"
                    title="Use example address"
                  >
                    Example
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter any valid Solana wallet address. Your Phablob is generated deterministically.
                </p>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !walletAddress}
                className="w-full"
                size="lg"
                isLoading={isGenerating}
              >
                {!isGenerating && <><Eye className="w-5 h-5 mr-2" />Generate My Phablob</>}
              </Button>
            </div>

            {generatedUrl && (
              <div className="mt-6 sm:mt-8 space-y-4">
                <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30 relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-12 h-12 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                  )}
                  <img 
                    src={generatedUrl} 
                    alt="Your Phablob" 
                    className="w-full h-full object-contain"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageLoaded(true)
                      alert('Failed to generate Phablob. Please try again.')
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleDownload} 
                    variant="outline" 
                    size="md"
                    disabled={!imageLoaded}
                  >
                    <Download className="w-4 h-4 mr-2" />Download SVG
                  </Button>
                  <Button 
                    onClick={handleShare} 
                    size="md" 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500"
                    disabled={!imageLoaded}
                  >
                    <Twitter className="w-4 h-4 mr-2" />Share
                  </Button>
                </div>

                <div className="p-3 sm:p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl text-center">
                  <p className="text-sm text-cyan-300">
                    <strong>Your Phablob is ready!</strong><br />
                    <span className="text-xs text-gray-400">Share it and join the cult 🎭</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="w-full max-w-3xl space-y-4 sm:space-y-6 text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            The Phablobs Manifesto
          </h2>
          
          <div className="space-y-3 sm:space-y-4 text-gray-300 leading-relaxed text-sm sm:text-base">
            <p>
              Phablobs are the <strong className="text-white">evolution of identity in web3</strong>: unique AI-generated blobs from Phantom that became the face for millions on Solana.
            </p>
            <p>
              These aren't just avatars—they're <strong className="text-cyan-400">Phablobs</strong>. A cult where everyone reveals their unique blob, builds community, and turns a default PFP into a global symbol.
            </p>
            <p>
              With <strong className="text-purple-400">17M+ MAU</strong>, this is a gem with real user base: from wallet generation to billion-dollar trend.
            </p>
            <p className="text-lg sm:text-xl font-bold text-white mt-4 sm:mt-6">
              Show your Phablob. Join the cult. Send it to the moon! 🚀
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={() => {
              document.querySelector('input')?.focus()
              if (!walletAddress) {
                handleExampleAddress()
              }
            }}
          >
            Reveal Your Phablob Now
          </Button>
        </section>

        <section className="w-full space-y-4 sm:space-y-6 px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">Phablob Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => {
              const hue = (i * 30) % 360
              return (
                <div 
                  key={i}
                  className="aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-purple-600/20 hover:border-purple-600/50 transition-all hover:scale-105 cursor-pointer group"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 80%, 40%))`,
                    boxShadow: '0 0 20px rgba(0,0,0,0.3)'
                  }}
                  onClick={() => {
                    // Генерируем тестовый адрес на основе индекса
                    const testAddress = `Test${i.toString().padStart(8, '0')}123456789012345678901234567890`
                    setWalletAddress(testAddress)
                    setTimeout(() => handleGenerate(), 100)
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="w-2/3 h-2/3 bg-white rounded-full blur-sm" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                      Try #{i + 1}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <footer className="text-center text-gray-500 text-xs sm:text-sm space-y-3 sm:space-y-4 pt-6 sm:pt-8 px-4">
          <p>Phablobs celebrates Phantom's AI-generated avatars. Not affiliated with Phantom Labs.</p>
          <p className="text-xs text-gray-600">Built by the community, for the cult. #PhablobsCult</p>
          <div className="flex gap-4 sm:gap-6 justify-center text-gray-400">
            <a 
              href="https://twitter.com/search?q=%23PhablobsCult" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Twitter className="w-4 h-4" /> Twitter
            </a>
          </div>
        </footer>
      </main>
    </div>
  )
}
