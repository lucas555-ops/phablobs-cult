// Reveal Modal Component
const RevealModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [walletState, setWalletState] = useState<WalletState>('idle');
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPhantom, setHasPhantom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasPhantom(!!window.solana?.isPhantom);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setWalletState('idle');
      setPubkey(null);
      setError(null);
      setCopied(false);
    }
  }, [open]);

  const handleConnect = async () => {
    if (!hasPhantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      setWalletState('connecting');
      setError(null);
      
      const { solana } = window;
      if (!solana) throw new Error('Phantom wallet not found');

      const response = await solana.connect();
      const key = response.publicKey.toString();
      
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key)) {
        throw new Error('Invalid public key');
      }

      setPubkey(key);
      setWalletState('connected');
    } catch (err) {
      setWalletState('error');
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleCopy = () => {
    if (pubkey) {
      navigator.clipboard.writeText(pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const text = `I revealed my Phablob! 👁️ Join the cult at #PhablobsCult\n\nMy wallet: ${pubkey?.substring(0, 8)}...`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://phablobs.cult`, '_blank');
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-md w-full border border-purple-600/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center space-y-6">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Reveal Your Phablob
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Your AI twin is waiting in your Phantom wallet
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {walletState === 'connected' && pubkey ? (
            <div className="space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400/10 to-purple-600/10 border border-purple-600/30 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 opacity-20 animate-pulse" />
                  <p className="text-sm text-gray-400 mt-4">
                    Your unique Phablob
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500">Connected Wallet:</p>
                <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg">
                  <p className="text-sm font-mono flex-1 truncate">
                    {pubkey.substring(0, 12)}...{pubkey.substring(pubkey.length - 8)}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  className="flex-1"
                  size="lg"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                🎉 You're now part of the Phablobs Cult
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-sm text-gray-500">
                    Connect to reveal
                  </p>
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
                  'Connect Phantom Wallet'
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install Phantom
                  </>
                )}
              </Button>

              {!hasPhantom && (
                <p className="text-xs text-gray-500 text-center">
                  Phantom wallet required to reveal your Phablob
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              We never store your private keys. Your Phablob is generated from your wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
