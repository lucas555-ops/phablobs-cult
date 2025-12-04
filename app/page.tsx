'use client'

import React, { useState } from 'react'
import { Twitter, Download, Sparkles, Eye } from 'lucide-react'

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}> = ({ children, className = '', variant = 'default', size = 'md', ...props }) => {
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

  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
}

export default function PhablobsCult() {
  const [walletAddress, setWalletAddress] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!walletAddress || walletAddress.length < 32) {
      alert('Please enter a valid Solana wallet address')
      return
    }

    setIsGenerating(true)
    const url = `/api/phablob/${walletAddress}`
    setGeneratedUrl(url)
    setTimeout(() => setIsGenerating(false), 500)
  }

  const handleDownloadPNG = async () => {
    if (!generatedUrl || !walletAddress) return
    
    try {
      // Скачиваем PNG версию
      const response = await fetch(`${generatedUrl}?format=png`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `phablob-${walletAddress.substring(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleShare = async () => {
    if (!walletAddress) return
    
    const text = `I just revealed my Phablob! 🎭\n\n17M Phantom users, 17M unique AI blobs.\n\nReveal yours 👉 phablobs.cult\n\n#PhablobsCult #Phantom #Solana`
    
    // Открываем Twitter с текстом
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative z-10 px-6 py-12 flex flex-col items-center gap-12 max-w-6xl mx-auto">
        {/* Hero */}
        <header className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-600 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,240,0.3)]">
            PHABLOBS CULT
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            <span className="text-cyan-400 font-bold">17M Phantom users.</span>{' '}
            <span className="text-purple-400 font-bold">17M unique AI blobs.</span><br />
            These aren't just avatars—they're your identity in the Solana cult.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
            {[
              { value: '17M+', label: 'Phantom MAU' },
              { value: 'AI-Gen', label: 'Unique Blobs' },
              { value: 'Cult', label: 'Growing' }
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/20 rounded-xl p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Generator */}
        <section className="w-full max-w-2xl space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/30 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3">
              <Sparkles className="text-cyan-400" />
              Reveal Your Phablob
              <Sparkles className="text-cyan-400" />
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Enter Your Phantom Wallet Address:
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
                  className="w-full px-4 py-3 bg-black border border-purple-600/30 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !walletAddress}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Generating...' : <><Eye className="w-5 h-5 mr-2" />Generate My Phablob</>}
              </Button>
            </div>

            {generatedUrl && (
              <div className="mt-8 space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30">
                  <img src={generatedUrl} alt="Your Phablob" className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleDownloadPNG} variant="outline" size="md">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button onClick={handleShare} size="md" className="bg-gradient-to-r from-cyan-400 to-blue-500">
                    <Twitter className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl text-center">
                  <p className="text-sm text-cyan-300">
                    <strong>Your Phablob is ready!</strong><br />
                    <span className="text-xs text-gray-400">Download as PNG and share on Twitter 🎭</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Manifesto */}
        <section className="w-full max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            The Phablobs Manifesto
          </h2>
          
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Phablobs are the <strong className="text-white">evolution of identity in web3</strong>: unique AI-generated blobs from Phantom that became the face for millions on Solana.
            </p>
            <p>
              These aren't just avatars—they're <strong className="text-cyan-400">Phablobs</strong>. A cult where everyone reveals their unique blob, builds community, and turns a default PFP into a global symbol.
            </p>
            <p>
              With <strong className="text-purple-400">17M+ MAU</strong>, this is a gem with real user base.
            </p>
            <p className="text-xl font-bold text-white mt-6">
              Show your Phablob. Join the cult. 🚀
            </p>
          </div>
        </section>

        {/* Gallery Placeholder */}
        <section className="w-full space-y-6">
          <h2 className="text-3xl font-bold text-center">Phablob Gallery</h2>
          <p className="text-center text-gray-400 text-sm">Coming soon: Real examples of generated Phablobs</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => {
              const hue = (i * 60) % 360
              return (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-purple-600/20 hover:border-purple-600/50 transition-all" style={{ background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 80%, 40%))` }}>
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <div className="text-white font-bold text-xs">Example #{i + 1}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm space-y-4 pt-8">
          <p>Phablobs celebrates Phantom's AI-generated avatars. Not affiliated with Phantom Labs.</p>
          <p className="text-xs text-gray-600">Built by the community, for the cult. #PhablobsCult</p>
        </footer>
      </main>
    </div>
  )
}
