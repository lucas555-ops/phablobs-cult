'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, ExternalLink, AlertCircle, Twitter, Users, Zap, Eye, Share2, Copy, Check, Sparkles } from 'lucide-react'

// Types
interface WindowWithSolana extends Window {
  solana?: {
    isPhantom?: boolean
    connect: () => Promise<{ publicKey: { toString: () => string } }>
    disconnect: () => Promise<void>
  }
}

declare const window: WindowWithSolana

type WalletState = 'idle' | 'connecting' | 'connected' | 'error'

// Utility
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

// Button Component
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}> = ({ children, className, variant = 'default', size = 'md', isLoading = false, disabled, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: 'bg-gradient-to-r from-cyan-400 to-purple-600 text-black hover:shadow-[0_0_30px_rgba(0,255,240,0.3)] hover:scale-105',
    outline: 'border-2 border-purple-600 text-purple-400 hover:bg-purple-600/10',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800/50'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled || isLoading} {...props}>
      {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</> : children}
    </button>
  )
}

// Phablob Card Component
const PhablobCard: React.FC<{ id: number; onClick?: () => void }> = ({ id, onClick }) => {
  const [isLoading, setIsLoading] = useState(true)
  
  const getGradient = (id: number) => {
    const hue = (id * 137) % 360
    return { from: `hsl(${hue}, 70%, 50%)`, to: `hsl(${(hue + 60) % 360}, 80%, 40%)` }
  }

  const gradient = getGradient(id)

  return (
    <button onClick={onClick} className="group relative w-full aspect-square rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 hover:scale-105">
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`, opacity: 0.3 }} />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}
        <div className="w-3/4 h-3/4 rounded-full" style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`, filter: 'blur(2px)' }} onLoad={() => setIsLoading(false)} />
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `0 0 40px ${gradient.from}` }} />
    </button>
  )
}

// Reveal Modal Component
const RevealModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [walletState, setWalletState] = useState<WalletState>('idle')
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasPhantom, setHasPhantom] = useState(false)
  const [copied, setCopied] = useState(false)
  const [phantomAvatarUrl, setPhantomAvatarUrl] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasPhantom(!!window.solana?.isPhantom)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setWalletState('idle')
      setPubkey(null)
      setError(null)
      setCopied(false)
      setPhantomAvatarUrl(null)
      setIsDrawing(false)
      setImageLoaded(false)
    }
  }, [open])

  const handleConnect = async () => {
    if (!hasPhantom) {
      window.open('https://phantom.app/', '_blank')
      return
    }

    try {
      setWalletState('connecting')
      setError(null)
      setImageLoaded(false)
      
      const { solana } = window
      if (!solana) throw new Error('Phantom wallet not found')

      const response = await solana.connect()
      const key = response.publicKey.toString()
      
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key)) {
        throw new Error('Invalid public key')
      }

      setPubkey(key)
      // Используем API с водяным знаком - добавляем timestamp для предотвращения кеширования
      const url = `/api/avatar/phantom/${key}?t=${Date.now()}`
      setPhantomAvatarUrl(url)
      
      setWalletState('connected')
      setIsDrawing(true)
      setTimeout(() => setIsDrawing(false), 1500)
    } catch (err) {
      setWalletState('error')
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  const handleCopy = () => {
    if (pubkey) {
      navigator.clipboard.writeText(pubkey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    const text = `I revealed my official Phantom avatar with Phablobs watermark! 🔮 #Phantom #PhablobsCult\n\nReveal yours at phablobs.cult`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-md w-full border border-purple-600/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl">✕</button>

        <div className="text-center space-y-6">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Official Phantom Avatar
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Your unique Phantom wallet avatar with exclusive Phablobs watermark
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {walletState === 'connected' && pubkey ? (
            <div className="space-y-6">
              {/* Основной аватар с API */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30 flex items-center justify-center relative">
                {isDrawing && (
                  <div className="absolute inset-0 animate-draw" style={{
                    background: `linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.3) 50%)`,
                    backgroundSize: '200% 100%',
                  }} />
                )}
                
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
                  </div>
                )}
                
                {phantomAvatarUrl ? (
                  <img 
                    src={phantomAvatarUrl} 
                    alt="Your Official Phantom Avatar" 
                    className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => {
                      setImageLoaded(true)
                      setIsDrawing(false)
                    }}
                    onError={() => {
                      // Fallback если API не работает
                      setImageLoaded(true)
                      setError('Failed to load avatar. Please try again.')
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 animate-pulse" />
                )}
              </div>

              {/* Описание */}
              <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl">
                <p className="text-sm text-cyan-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <strong>Official Phantom Avatar + Phablobs Watermark</strong>
                  <Sparkles className="w-4 h-4" />
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This is your unique Phantom wallet avatar with exclusive Phablobs branding.
                  Generated deterministically from your wallet address.
                </p>
              </div>

              {/* Информация о кошельке */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Connected Wallet:</p>
                <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg">
                  <p className="text-sm font-mono flex-1 truncate">
                    {pubkey.substring(0, 12)}...{pubkey.substring(pubkey.length - 8)}
                  </p>
                  <button 
                    onClick={handleCopy} 
                    className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

            // В RevealModal компоненте, замени секцию с кнопками:

const handleDownload = () => {
  if (!phantomAvatarUrl) return
  
  // Создаем временную ссылку для скачивания
  const link = document.createElement('a')
  link.href = phantomAvatarUrl
  link.download = `phablobs-${pubkey?.substring(0, 8)}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleShareToTwitter = async () => {
  if (!pubkey) return
  
  try {
    const response = await fetch('/api/avatar/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: pubkey, avatarUrl: phantomAvatarUrl })
    })
    
    const data = await response.json()
    if (data.twitterUrl) {
      window.open(data.twitterUrl, '_blank')
    }
  } catch (error) {
    console.error('Share failed:', error)
    // Fallback
    const text = `I revealed my Phablobs avatar! 🎭 #PhablobsCult\n\nReveal yours at phablobs.cult`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }
}

// Замени кнопки на:
<div className="flex flex-col gap-3">
  <Button 
    onClick={handleShareToTwitter} 
    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-[0_0_20px_rgba(0,255,240,0.3)]"
    size="lg"
  >
    <Twitter className="w-5 h-5 mr-2" /> 
    Share on Twitter
  </Button>
  
  <div className="grid grid-cols-2 gap-3">
    <Button 
      onClick={handleDownload}
      variant="outline"
      className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
    >
      Download SVG
    </Button>
    
    <Button 
      onClick={onClose}
      variant="ghost"
      className="text-gray-400 hover:bg-gray-800"
    >
      Close
    </Button>
  </div>
</div>

              <p className="text-xs text-cyan-400/70">
                🔮 Your Phantom avatar is now part of the Phablobs Cult
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Превью аватара */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-600/20 animate-pulse" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-30 blur-md" />
                  <Eye className="w-12 h-12 mx-auto text-gray-600 mb-4 mt-4" />
                  <p className="text-sm text-gray-500">Connect Phantom to reveal</p>
                </div>
              </div>

              {/* Кнопка подключения */}
              <Button 
                onClick={handleConnect} 
                disabled={walletState === 'connecting'} 
                className="w-full" 
                size="lg" 
                isLoading={walletState === 'connecting'}
              >
                {hasPhantom ? (
                  <>
                    <div className="w-5 h-5 mr-2 bg-gradient-to-r from-cyan-400 to-purple-600 rounded" />
                    Connect Phantom Wallet
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Install Phantom Wallet
                  </>
                )}
              </Button>

              {/* Инструкция */}
              {!hasPhantom && (
                <div className="p-4 bg-purple-600/5 border border-purple-600/20 rounded-xl">
                  <p className="text-xs text-gray-400 text-center">
                    Phantom wallet is required to see your official avatar with Phablobs watermark.
                    Every Phantom user gets a unique avatar.
                  </p>
                </div>
              )}

              {/* Интересный факт */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  <span className="text-cyan-400">Did you know:</span> Phantom generates a unique avatar for every wallet.
                  We add an exclusive Phablobs watermark to yours.
                </p>
              </div>
            </div>
          )}

          {/* Футер модала */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              We never store your private keys. Your avatar is generated from your public wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats Component
const Stats = () => {
  const stats = [
    { label: 'Unique Avatars', value: '17M+', icon: Eye },
    { label: 'Phantom Users', value: '17M', icon: Users },
    { label: 'Cult Members', value: 'Growing', icon: Zap }
  ]

  return (
    <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/20 rounded-2xl p-6 text-center hover:border-purple-600/40 transition-all">
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
          <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Main App
export default function PhablobsCult() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative z-10 px-6 py-12 flex flex-col items-center gap-16">
        <header className="text-center max-w-4xl space-y-8">
          <h1 className="text-6xl md:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-600 to-cyan-400 animate-gradient drop-shadow-[0_0_30px_rgba(0,255,240,0.3)]">
            PHABLOBS CULT
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Every Phantom wallet has a unique avatar.<br />
            <span className="text-cyan-400">Reveal yours with exclusive Phablobs watermark.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => setModalOpen(true)} className="group">
              <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />Reveal Your Avatar
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('https://twitter.com/search?q=%23PhablobsCult', '_blank')}>
              <Twitter className="w-5 h-5 mr-2" />Join the Cult
            </Button>
          </div>
        </header>

        <Stats />

        <section className="w-full max-w-6xl space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Avatar Gallery</h2>
            <p className="text-gray-400">Unique Phantom avatars with Phablobs watermark</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <PhablobCard key={i} id={i + 1} onClick={() => setModalOpen(true)} />
            ))}
          </div>
        </section>

        <section className="max-w-2xl text-center space-y-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">The Cult Code</h2>
          
          <div className="space-y-6">
            {[
              { icon: Eye, title: 'REVEAL YOUR AVATAR', desc: 'Connect Phantom to reveal your unique avatar with Phablobs watermark.' },
              { icon: Share2, title: 'SHARE TO TIMELINE', desc: 'Post your watermarked avatar on X with #PhablobsCult.' },
              { icon: Users, title: 'JOIN THE COMMUNITY', desc: 'Discord → Telegram → Twitter Spaces. Connect with other cult members.' }
            ].map((step, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-purple-600/20 rounded-2xl p-6 text-left flex gap-4 hover:border-purple-600/40 transition-all">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center text-black font-bold text-xl">{i + 1}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <step.icon className="w-5 h-5 text-cyan-400" />{step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" variant="outline" onClick={() => setModalOpen(true)}>Reveal Your Avatar</Button>
        </section>

        <footer className="text-center text-gray-500 text-sm max-w-2xl space-y-4">
          <p>Phablobs adds exclusive watermark to your Phantom wallet avatar. This is a community-driven cult celebrating web3 identity.</p>
          <p>Not affiliated with Phantom Labs. Built by the community, for the community.</p>
          <div className="flex gap-6 justify-center text-gray-400">
            <a href="https://twitter.com/search?q=%23PhablobsCult" target="_blank" rel="noopener" className="hover:text-cyan-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Telegram</a>
          </div>
        </footer>
      </main>

      <RevealModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes draw {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
        .animate-draw {
          animation: draw 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
