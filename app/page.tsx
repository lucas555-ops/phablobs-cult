// Reveal Modal Component - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
      // Проверка мобильного устройства
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // Открыть Phantom App Store / Google Play
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        const url = isIOS 
          ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
          : 'https://play.google.com/store/apps/details?id=app.phantom'
        window.open(url, '_blank')
      } else {
        // Десктоп - открыть сайт Phantom
        window.open('https://phantom.app/', '_blank')
      }
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
      const url = `/api/phablob/${key}?t=${Date.now()}`
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

  const handleDownload = () => {
    if (!phantomAvatarUrl) return
    
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
      const text = `I revealed my Phablobs avatar! 🎭 #PhablobsCult\n\nReveal yours at phablobs.cult`
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full my-8 max-h-[95vh] overflow-y-auto border border-purple-600/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors text-xl sm:text-2xl z-10"
        >
          ✕
        </button>

        <div className="text-center space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Official Phantom Avatar
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Your unique Phantom wallet avatar with exclusive Phablobs watermark
            </p>
          </div>

          {error && (
            <div className="p-3 sm:p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {walletState === 'connected' && pubkey ? (
            <div className="space-y-4 sm:space-y-6">
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
                      setImageLoaded(true)
                      setError('Failed to load avatar. Please try again.')
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 animate-pulse" />
                )}
              </div>

              <div className="p-3 sm:p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-xl">
                <p className="text-xs sm:text-sm text-cyan-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <strong>Official Phantom Avatar + Phablobs Watermark</strong>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This is your unique Phantom wallet avatar with exclusive Phablobs branding.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">Connected Wallet:</p>
                <div className="flex items-center gap-2 bg-gray-900 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs sm:text-sm font-mono flex-1 truncate">
                    {pubkey.substring(0, 12)}...{pubkey.substring(pubkey.length - 8)}
                  </p>
                  <button 
                    onClick={handleCopy} 
                    className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleShareToTwitter} 
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-[0_0_20px_rgba(0,255,240,0.3)]"
                  size="lg"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                  Share on Twitter
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                    size="md"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Download</span>
                  </Button>
                  
                  <Button 
                    onClick={onClose}
                    variant="ghost"
                    size="md"
                    className="text-gray-400 hover:bg-gray-800"
                  >
                    <span className="text-xs sm:text-sm">Close</span>
                  </Button>
                </div>
              </div>

              <p className="text-xs text-cyan-400/70">
                🔮 Your Phantom avatar is now part of the Phablobs Cult
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-600/20 animate-pulse" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-30 blur-md" />
                  <Eye className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-600 mb-4 mt-4" />
                  <p className="text-xs sm:text-sm text-gray-500">Connect Phantom to reveal</p>
                </div>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={walletState === 'connecting'} 
                className="w-full" 
                size="lg" 
                isLoading={walletState === 'connecting'}
              >
                {hasPhantom ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 bg-gradient-to-r from-cyan-400 to-purple-600 rounded" />
                    <span className="text-sm sm:text-base">Connect Phantom Wallet</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Install Phantom Wallet</span>
                  </>
                )}
              </Button>

              {!hasPhantom && (
                <div className="p-3 sm:p-4 bg-purple-600/5 border border-purple-600/20 rounded-xl">
                  <p className="text-xs text-gray-400 text-center">
                    Phantom wallet is required to see your official avatar with Phablobs watermark.
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  <span className="text-cyan-400">Did you know:</span> Every Phantom wallet has a unique avatar.
                  We add exclusive Phablobs branding to yours.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 sm:pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              We never store your private keys. Your avatar is generated from your public wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
