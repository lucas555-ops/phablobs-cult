'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, ExternalLink, AlertCircle, Twitter, Users, Zap, Eye, Share2, Copy, Check, Sparkles } from 'lucide-react'

// Мемный генератор аватаров в стиле "нарисовано от руки"
function generateMemeAvatar(publicKey: string): string {
  // Детерминированный хэш
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }

  // Варианты деталей
  const EYE_TYPES = ['dot', 'circle', 'line', 'ellipse', 'star', 'heart']
  const MOUTH_TYPES = ['smile', 'frown', 'neutral', 'open', 'teeth', 'tongue']
  const NOSE_TYPES = ['dot', 'line', 'triangle', 'circle', 'none']
  const HAIR_TYPES = ['spiky', 'curly', 'bald', 'mohawk', 'afro', 'long']
  const ACCESSORIES = ['glasses', 'sunglasses', 'eyePatch', 'mask', 'none', 'none', 'none']

  // Выбор на основе хэша
  const eyeType = EYE_TYPES[Math.abs(hash) % EYE_TYPES.length]
  const mouthType = MOUTH_TYPES[Math.abs(hash >> 4) % MOUTH_TYPES.length]
  const noseType = NOSE_TYPES[Math.abs(hash >> 8) % NOSE_TYPES.length]
  const hairType = HAIR_TYPES[Math.abs(hash >> 12) % HAIR_TYPES.length]
  const accessory = ACCESSORIES[Math.abs(hash >> 16) % ACCESSORIES.length]

  // Цвета - черно-белый стиль с редкими цветными акцентами
  const colors = [
    '#000000', // черный
    '#333333', // темно-серый
    '#666666', // серый
    '#FF6B6B', // красный (редко)
    '#4ECDC4', // бирюзовый (редко)
    '#FFD166', // желтый (редко)
  ]
  const lineColor = colors[Math.abs(hash >> 20) % 3] // обычно черный/серый
  const accentColor = Math.abs(hash) % 10 === 0 ? colors[3 + Math.abs(hash >> 24) % 3] : lineColor

  // Размеры и позиции на основе хэша
  const faceX = 200
  const faceY = 200
  const faceSize = 120 + (Math.abs(hash >> 2) % 40)
  const eyeY = faceY - 30
  const mouthY = faceY + 40
  const eyeSpacing = 40 + (Math.abs(hash >> 6) % 20)

  // Вспомогательные функции генерации деталей
  const generateFacePath = () => {
    const points = []
    const irregularity = 10 + (hash % 15)
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      const radius = faceSize + (hash >> (i * 2)) % irregularity
      const px = faceX + Math.cos(angle) * radius
      const py = faceY + Math.sin(angle) * radius * 1.2 // Овал
      points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`)
    }
    
    return points.join(' ') + ' Z'
  }

  const generateEyes = () => {
    const leftX = faceX - eyeSpacing
    const rightX = faceX + eyeSpacing
    
    switch(eyeType) {
      case 'dot':
        return `
          <circle cx="${leftX}" cy="${eyeY}" r="6" fill="${lineColor}"/>
          <circle cx="${rightX}" cy="${eyeY}" r="6" fill="${lineColor}"/>
        `
      case 'circle':
        return `
          <circle cx="${leftX}" cy="${eyeY}" r="8" fill="none" stroke="${lineColor}" stroke-width="3"/>
          <circle cx="${rightX}" cy="${eyeY}" r="8" fill="none" stroke="${lineColor}" stroke-width="3"/>
        `
      case 'line':
        return `
          <line x1="${leftX - 8}" y1="${eyeY}" x2="${leftX + 8}" y2="${eyeY}" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
          <line x1="${rightX - 8}" y1="${eyeY}" x2="${rightX + 8}" y2="${eyeY}" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
        `
      case 'ellipse':
        return `
          <ellipse cx="${leftX}" cy="${eyeY}" rx="10" ry="6" fill="none" stroke="${lineColor}" stroke-width="3"/>
          <ellipse cx="${rightX}" cy="${eyeY}" rx="10" ry="6" fill="none" stroke="${lineColor}" stroke-width="3"/>
        `
      case 'star':
        const generateStar = (cx: number, cy: number, size: number) => {
          let points = ''
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
            const radius = size * (i % 2 === 0 ? 2 : 1)
            const px = cx + Math.cos(angle) * radius
            const py = cy + Math.sin(angle) * radius
            points += `${px},${py} `
          }
          return points
        }
        return `
          <polygon points="${generateStar(leftX, eyeY, 6)}" fill="${accentColor}" stroke="${lineColor}" stroke-width="2"/>
          <polygon points="${generateStar(rightX, eyeY, 6)}" fill="${accentColor}" stroke="${lineColor}" stroke-width="2"/>
        `
      case 'heart':
        return `
          <path d="M ${leftX} ${eyeY} q -5 -8, -10 0 t -10 0" fill="${accentColor}" stroke="${lineColor}" stroke-width="2"/>
          <path d="M ${rightX} ${eyeY} q -5 -8, -10 0 t -10 0" fill="${accentColor}" stroke="${lineColor}" stroke-width="2"/>
        `
      default:
        return ''
    }
  }

  const generateMouth = () => {
    const width = 30 + (hash % 20)
    const height = 10 + ((hash >> 4) % 15)
    
    switch(mouthType) {
      case 'smile':
        return `
          <path d="M ${faceX - width} ${mouthY} 
                  Q ${faceX} ${mouthY + height}, ${faceX + width} ${mouthY}"
                fill="none" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
        `
      case 'frown':
        return `
          <path d="M ${faceX - width} ${mouthY} 
                  Q ${faceX} ${mouthY - height}, ${faceX + width} ${mouthY}"
                fill="none" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
        `
      case 'neutral':
        return `
          <line x1="${faceX - width}" y1="${mouthY}" x2="${faceX + width}" y2="${mouthY}" 
                stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
        `
      case 'open':
        return `
          <ellipse cx="${faceX}" cy="${mouthY}" rx="${width}" ry="${height}" 
                  fill="${accentColor}" stroke="${lineColor}" stroke-width="3"/>
          <line x1="${faceX}" y1="${mouthY - height/2}" x2="${faceX}" y2="${mouthY + height/2}" 
                stroke="${lineColor}" stroke-width="2"/>
        `
      case 'teeth':
        const generateTeeth = () => {
          let teeth = ''
          const toothCount = 6 + (hash % 6)
          const toothWidth = (width * 2) / toothCount
          
          for (let i = 0; i < toothCount; i++) {
            const toothX = faceX - width + i * toothWidth
            teeth += `
              <rect x="${toothX}" y="${mouthY}" width="${toothWidth - 2}" height="6" 
                    fill="white" stroke="${lineColor}" stroke-width="1"/>
            `
          }
          return teeth
        }
        return `
          <path d="M ${faceX - width} ${mouthY} 
                  Q ${faceX} ${mouthY + height}, ${faceX + width} ${mouthY}"
                fill="none" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
          ${generateTeeth()}
        `
      case 'tongue':
        return `
          <path d="M ${faceX - width} ${mouthY} 
                  Q ${faceX} ${mouthY + height}, ${faceX + width} ${mouthY}"
                fill="none" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="${faceX}" cy="${mouthY + height/2}" rx="${width/2}" ry="${height}" 
                  fill="${accentColor}" stroke="${lineColor}" stroke-width="2"/>
        `
      default:
        return ''
    }
  }

  const generateNose = () => {
    switch(noseType) {
      case 'dot':
        return `<circle cx="${faceX}" cy="${faceY}" r="4" fill="${lineColor}"/>`
      case 'line':
        return `<line x1="${faceX}" y1="${faceY - 10}" x2="${faceX}" y2="${faceY + 5}" 
                      stroke="${lineColor}" stroke-width="3" stroke-linecap="round"/>`
      case 'triangle':
        return `<polygon points="${faceX},${faceY - 8} ${faceX - 6},${faceY + 4} ${faceX + 6},${faceY + 4}" 
                         fill="none" stroke="${lineColor}" stroke-width="3"/>`
      case 'circle':
        return `<circle cx="${faceX}" cy="${faceY}" r="6" fill="none" stroke="${lineColor}" stroke-width="3"/>`
      default:
        return ''
    }
  }

  const generateHair = () => {
    const topY = faceY - faceSize
    const spikes = 5 + (hash % 8)
    const curlRadius = 15 + (hash % 10)
    
    switch(hairType) {
      case 'spiky':
        let spikesPath = ''
        for (let i = 0; i < spikes; i++) {
          const angle = (i * Math.PI * 2) / spikes
          const px = faceX + Math.cos(angle) * 40
          const py = topY + Math.sin(angle) * 20
          spikesPath += `L ${px} ${py} `
        }
        return `<path d="M ${faceX} ${topY} ${spikesPath} Z" fill="${lineColor}"/>`
      
      case 'curly':
        let curls = ''
        for (let i = 0; i < 3; i++) {
          const offset = (i - 1) * 25
          curls += `<circle cx="${faceX + offset}" cy="${topY + 15}" r="${curlRadius}" 
                           fill="none" stroke="${lineColor}" stroke-width="4"/>`
        }
        return curls
      
      case 'mohawk':
        return `
          <rect x="${faceX - 20}" y="${topY}" width="40" height="30" fill="${lineColor}"/>
          <polygon points="${faceX - 20},${topY} ${faceX},${topY - 30} ${faceX + 20},${topY}" fill="${lineColor}"/>
        `
      
      case 'afro':
        return `<circle cx="${faceX}" cy="${topY + 15}" r="45" fill="${lineColor}"/>`
      
      case 'long':
        return `
          <rect x="${faceX - 30}" y="${topY}" width="60" height="60" fill="${lineColor}"/>
          <path d="M ${faceX - 30} ${topY + 60} 
                  Q ${faceX} ${topY + 90}, ${faceX + 30} ${topY + 60}" 
                fill="${lineColor}"/>
        `
      
      default: // bald
        return ''
    }
  }

  const generateAccessory = () => {
    switch(accessory) {
      case 'glasses':
        return `
          <rect x="${faceX - 45}" y="${faceY - 40}" width="30" height="15" rx="5" 
                fill="none" stroke="${lineColor}" stroke-width="3"/>
          <rect x="${faceX + 15}" y="${faceY - 40}" width="30" height="15" rx="5" 
                fill="none" stroke="${lineColor}" stroke-width="3"/>
          <line x1="${faceX - 15}" y1="${faceY - 32}" x2="${faceX + 15}" y2="${faceY - 32}" 
                stroke="${lineColor}" stroke-width="3"/>
        `
      case 'sunglasses':
        return `
          <rect x="${faceX - 50}" y="${faceY - 35}" width="35" height="20" rx="3" 
                fill="#333" stroke="${lineColor}" stroke-width="3"/>
          <rect x="${faceX + 15}" y="${faceY - 35}" width="35" height="20" rx="3" 
                fill="#333" stroke="${lineColor}" stroke-width="3"/>
          <line x1="${faceX - 15}" y1="${faceY - 25}" x2="${faceX + 15}" y2="${faceY - 25}" 
                stroke="${lineColor}" stroke-width="3"/>
        `
      case 'eyePatch':
        return `
          <circle cx="${faceX - 30}" cy="${faceY - 25}" r="15" fill="black"/>
          <path d="M ${faceX - 45} ${faceY - 25} 
                  Q ${faceX - 30} ${faceY - 10}, ${faceX - 15} ${faceY - 25}" 
                fill="black"/>
          <line x1="${faceX - 45}" y1="${faceY - 25}" x2="${faceX - 55}" y2="${faceY - 15}" 
                stroke="${lineColor}" stroke-width="2"/>
        `
      case 'mask':
        return `
          <path d="M ${faceX - 40} ${faceY} 
                  Q ${faceX} ${faceY + 30}, ${faceX + 40} ${faceY}" 
                fill="#4ECDC4" stroke="${lineColor}" stroke-width="2"/>
          <line x1="${faceX - 40}" y1="${faceY}" x2="${faceX - 45}" y2="${faceY - 15}" 
                stroke="${lineColor}" stroke-width="2"/>
          <line x1="${faceX + 40}" y1="${faceY}" x2="${faceX + 45}" y2="${faceY - 15}" 
                stroke="${lineColor}" stroke-width="2"/>
        `
      default:
        return ''
    }
  }

  // Генерация SVG
  return `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Белый фон -->
      <rect width="400" height="400" fill="white"/>
      
      <!-- "Грязный" фон для эффекта бумаги -->
      <rect width="400" height="400" fill="url(#paper)" opacity="0.1"/>
      
      <!-- Лицо (овал с неровными краями) -->
      <path d="${generateFacePath()}" 
            fill="none" 
            stroke="${lineColor}" 
            stroke-width="4" 
            stroke-linecap="round"
            stroke-linejoin="round"/>
      
      <!-- Волосы -->
      ${generateHair()}
      
      <!-- Глаза -->
      ${generateEyes()}
      
      <!-- Нос -->
      ${generateNose()}
      
      <!-- Рот -->
      ${generateMouth()}
      
      <!-- Аксессуары -->
      ${generateAccessory()}
      
      <!-- Текстура бумаги -->
      <defs>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" result="noise"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
      </defs>
    </svg>
  `.trim()
}

// Функция для создания Data URL
function createMemeAvatarDataURL(publicKey: string): string {
  const svg = generateMemeAvatar(publicKey)
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

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
    
    const { solana } = window
    if (!solana) throw new Error('Phantom wallet not found')

    const response = await solana.connect()
    const key = response.publicKey.toString()
    
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key)) {
      throw new Error('Invalid public key')
    }

    setPubkey(key)
    // Используем API с водяным знаком
    setPhantomAvatarUrl(`/api/avatar/phantom/${key}`)
    
    setWalletState('connected')
    setIsDrawing(true)
    setTimeout(() => setIsDrawing(false), 2000)
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
    const text = `I revealed my unique Phantom meme face! 🎭 #PhantomFaces #PhablobsCult\n\nGenerate yours at phablobs.cult`
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
              Your Meme Phantom Face
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Every Phantom wallet gets a unique, hand-drawn meme face. 
              <br/>This is yours. Own it. Share it. Meme it.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {walletState === 'connected' && pubkey ? (
            <div className="space-y-6">
              {/* Основной аватар (мемный) */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border-2 border-purple-600/30 flex items-center justify-center relative">
                {isDrawing && (
                  <div className="absolute inset-0 animate-draw" style={{
                    background: `linear-gradient(90deg, transparent 50%, white 50%)`,
                    backgroundSize: '200% 100%',
                  }} />
                )}
                {phantomAvatarUrl ? (
                  <img 
                    src={phantomAvatarUrl} 
                    alt="Your Meme Face" 
                    className="w-full h-full object-contain relative z-10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 animate-pulse" />
                )}
              </div>

              {/* Описание */}
              <div className="p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl">
                <p className="text-sm text-cyan-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <strong>This is your unique meme face</strong>
                  <Sparkles className="w-4 h-4" />
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Generated deterministically from your wallet address. 
                  This exact same face can be regenerated anytime.
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

              {/* Кнопки действий */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleShare} 
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-[0_0_20px_rgba(0,255,240,0.3)]"
                  size="lg"
                >
                  <Twitter className="w-5 h-5 mr-2" /> 
                  Share my Meme Face
                </Button>
                
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/10"
                >
                  Explore Other Faces
                </Button>
              </div>

              <p className="text-xs text-cyan-400/70">
                💫 Welcome to the Phablobs Cult. Your meme face is now part of the memeverse.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Превью аватара */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border-2 border-gray-700 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gray-300 opacity-30 blur-md" />
                  <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4 mt-4" />
                  <p className="text-sm text-gray-600 font-medium">Connect Phantom to reveal</p>
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
                    Phantom wallet is required to generate your unique meme face.
                    Every Phantom user gets their own hand-drawn character.
                  </p>
                </div>
              )}

              {/* Интересный факт */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  <span className="text-cyan-400">Meme fact:</span> There are 17M+ unique meme faces waiting to be revealed.
                  Each one is as unique as your wallet.
                </p>
              </div>
            </div>
          )}

          {/* Футер модала */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              We never store your private keys. Your meme face is generated locally from your public wallet address.
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
    { label: 'Meme Faces', value: '17M+', icon: Eye },
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
            Every Phantom wallet has a unique, hand-drawn meme face.<br />
            <span className="text-cyan-400">Your meme face already exists. Reveal and meme it.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => setModalOpen(true)} className="group">
              <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />Reveal Your Meme Face
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('https://twitter.com/search?q=%23PhablobsCult', '_blank')}>
              <Twitter className="w-5 h-5 mr-2" />Join the Cult
            </Button>
          </div>
        </header>

        <Stats />

        <section className="w-full max-w-6xl space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">The Meme Gallery</h2>
            <p className="text-gray-400">Random meme faces from the cult</p>
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
              { icon: Eye, title: 'REVEAL YOUR MEME FACE', desc: 'Connect Phantom. Generate your unique hand-drawn character.' },
              { icon: Share2, title: 'SHARE TO TIMELINE', desc: 'Post your meme face on X with #PhantomFaces #PhablobsCult.' },
              { icon: Users, title: 'JOIN THE MEMEVERSE', desc: 'Discord → Telegram → Twitter Spaces. Find your face-buddies.' }
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

          <Button size="lg" variant="outline" onClick={() => setModalOpen(true)}>Start the Ritual</Button>
        </section>

        <footer className="text-center text-gray-500 text-sm max-w-2xl space-y-4">
          <p>Phablobs are unique meme faces generated from Phantom wallet addresses. This is a community-driven cult celebrating web3 identity through memes.</p>
          <p>Not affiliated with Phantom Labs. Built by the community, for the memes.</p>
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
          animation: draw 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
