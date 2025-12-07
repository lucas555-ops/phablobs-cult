import React from 'react'

interface TierBadgeProps {
  balance: number
  tier: number
  tierName: string
  unlockedColors: number
  totalColors: number
  nextTier: number | null
  needsMore: number
}

export function TierBadge({
  balance,
  tier,
  tierName,
  unlockedColors,
  totalColors,
  nextTier,
  needsMore
}: TierBadgeProps) {
  // Цвета для каждого тиера
  const tierColors = {
    1: { gradient: 'from-gray-500 to-gray-700', text: 'Commons', emoji: '⚪' },
    2: { gradient: 'from-cyan-500 to-blue-500', text: 'Uncommons', emoji: '🔵' },
    3: { gradient: 'from-pink-500 to-purple-500', text: 'Rares', emoji: '💎' },
    4: { gradient: 'from-yellow-400 to-orange-500', text: 'Legendaries', emoji: '👑' }
  }

  const currentTier = tierColors[tier as keyof typeof tierColors]
  const progress = (unlockedColors / totalColors) * 100

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl p-6 mb-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentTier.gradient} flex items-center justify-center text-2xl`}>
            {currentTier.emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Tier {tier}: {currentTier.text}
            </h3>
            <p className="text-sm text-gray-400">
              {balance.toLocaleString()} $BLOB
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
            {unlockedColors}/{totalColors}
          </div>
          <div className="text-xs text-gray-400">colors unlocked</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${currentTier.gradient} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Next tier info */}
      {nextTier && (
        <div className="bg-black/40 rounded-xl p-4 border border-[#ab0ff2]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-1">
                🎯 Next unlock: <span className="font-bold text-white">Tier {tier + 1}</span>
              </p>
              <p className="text-xs text-gray-500">
                Need {needsMore.toLocaleString()} more $BLOB
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-sm font-bold text-[#ab0ff2]">
                {nextTier.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Max tier message */}
      {!nextTier && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
          <p className="text-center text-yellow-200 font-bold">
            👑 Maximum Tier Achieved! All 60 colors unlocked! 👑
          </p>
        </div>
      )}

      {/* Tier benefits */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          {tier === 1 && "💡 Hold 10k+ $BLOB to unlock Uncommon colors"}
          {tier === 2 && "💎 Hold 100k+ $BLOB to unlock Rare colors"}
          {tier === 3 && "👑 Hold 1M+ $BLOB to unlock Legendary colors"}
          {tier === 4 && "⚡ You have access to the entire color spectrum!"}
        </p>
      </div>
    </div>
  )
}

// Компактная версия для показа до генерации
export function TierBadgeCompact({ balance }: { balance: number }) {
  const getTier = (bal: number) => {
    if (bal >= 1000000) return { tier: 4, name: 'Legendaries', colors: 60, emoji: '👑' }
    if (bal >= 100000) return { tier: 3, name: 'Rares', colors: 50, emoji: '💎' }
    if (bal >= 10000) return { tier: 2, name: 'Uncommons', colors: 40, emoji: '🔵' }
    return { tier: 1, name: 'Commons', colors: 20, emoji: '⚪' }
  }

  const tier = getTier(balance)

  return (
    <div className="inline-flex items-center gap-2 bg-black/40 rounded-lg px-4 py-2 border border-[#ab0ff2]/20">
      <span className="text-xl">{tier.emoji}</span>
      <div>
        <p className="text-xs text-gray-400">Your Tier</p>
        <p className="text-sm font-bold text-white">
          T{tier.tier}: {tier.colors} colors
        </p>
      </div>
    </div>
  )
}
