// ЦВЕТОВАЯ СИСТЕМА - 69 УНИКАЛЬНЫХ ЦВЕТОВ
// Все цвета доступны сразу, TIERы используются для классификации

export const COLOR_TIERS = {
  TIER_1: [
    '#1c1c1c', '#5e5e5e', '#a1a1a1', '#e3e3e3',
    '#1e7d32', '#007d00', '#1c583a', '#00c38d',
    '#ab9ff2', '#7378e1', '#8764cd', '#7d5acd',
    '#1e87f0', '#009be1', '#3ca5f5', '#78c3f5',
    '#873c0a', '#5f1e00', '#9b3c00', '#c38c87'
  ],
  
  TIER_2: [
    '#1effff', '#e1780f', '#ff960f', '#ffd22d',
    '#e33c87', '#ff7887', '#ff9687', '#e182cd',
    '#b478ff', '#6982ff', '#7d96eb', '#e1aaff',
    '#3caf96', '#5aa57d', '#3c9b00', '#82b91e',
    '#d75a00', '#d61e04', '#ff3236', '#e12840'
  ],
  
  TIER_3: [
    '#ffff2d', '#ffff5f', '#ffff91', '#ffffc3',
    '#1ec3ff', '#0087f5', '#faffff', '#cdffe6',
    '#3a943a', '#00e115', '#3ad058', '#3aff76',
    '#720e2c', '#860018', '#e31eff', '#c50087',
    '#001900', '#003700', '#00003c', '#000514'
  ],
  
  TIER_4: [
    '#1ce100', '#230000', '#2e0840', 
    '#3e1462', '#2f1944', '#5f2869', 
    '#7d46e1', '#7d0ac3', '#3c7378'
  ]
}

// Все 69 цветов в одном массиве
export const ALL_COLORS = [
  ...COLOR_TIERS.TIER_1,
  ...COLOR_TIERS.TIER_2,
  ...COLOR_TIERS.TIER_3,
  ...COLOR_TIERS.TIER_4
]

// --- СИСТЕМА ТИЕРОВ ---

export const TIER_NAMES = {
  1: 'Common',
  2: 'Uncommon', 
  3: 'Rare',
  4: 'Legendary'
} as const

export const TIER_COLORS = {
  1: '#FFFFFF',      // Белый для Common
  2: '#1EFF00',      // Неоново-зеленый для Uncommon
  3: '#0070FF',      // Синий для Rare
  4: '#FF8000'       // Оранжевый для Legendary
} as const

export const TIER_EMOJIS = {
  1: '⚪',
  2: '🟢',
  3: '🔵',
  4: '🟠'
} as const

export const TIER_WEIGHTS = {
  1: 20,  // Common: 20 цветов
  2: 20,  // Uncommon: 20 цветов
  3: 20,  // Rare: 20 цветов
  4: 9    // Legendary: 9 цветов
} as const

export type TierNumber = 1 | 2 | 3 | 4

// Получить полную информацию о тиере
export function getTierInfoFull(tier: TierNumber) {
  return {
    tier,
    name: TIER_NAMES[tier],
    color: TIER_COLORS[tier],
    emoji: TIER_EMOJIS[tier],
    weight: TIER_WEIGHTS[tier],
    colors: COLOR_TIERS[`TIER_${tier}` as keyof typeof COLOR_TIERS]
  }
}

// Получить тиер цвета (1-4)
export function getColorTier(color: string): TierNumber {
  if (COLOR_TIERS.TIER_1.includes(color)) return 1
  if (COLOR_TIERS.TIER_2.includes(color)) return 2
  if (COLOR_TIERS.TIER_3.includes(color)) return 3
  if (COLOR_TIERS.TIER_4.includes(color)) return 4
  return 1 // fallback to Common
}

// Получить название тиера по номеру
export function getTierName(tier: number): string {
  return TIER_NAMES[tier as TierNumber] || 'Common'
}

// Получить цвет тиера для отображения
export function getTierColor(tier: number): string {
  return TIER_COLORS[tier as TierNumber] || '#FFFFFF'
}

// Получить эмодзи тиера
export function getTierEmoji(tier: number): string {
  return TIER_EMOJIS[tier as TierNumber] || '⚪'
}

// Получить распределение вероятностей тиеров
export function getTierDistribution() {
  const totalColors = ALL_COLORS.length
  const distribution: Record<string, { count: number; percentage: number }> = {}
  
  for (let tier = 1; tier <= 4; tier++) {
    const count = TIER_WEIGHTS[tier as TierNumber]
    const percentage = (count / totalColors) * 100
    distribution[TIER_NAMES[tier as TierNumber]] = {
      count,
      percentage: Math.round(percentage * 100) / 100
    }
  }
  
  return distribution
}

// --- ФУНКЦИИ ГЕНЕРАЦИИ ---

// Функция хэширования (для детерминированности)
export function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Генерация одноцветного фона
export function generateSolidBgFromBalance(
  publicKey: string, 
  tokenBalance: number = 0 // Оставляем параметр для совместимости
): { 
  avatarColor: string; 
  bgColor: string; 
  tier: TierNumber; 
  tierName: string;
  tierColor: string;
  tierEmoji: string;
} {
  const hash = generateHash(publicKey)
  
  // Цвет аватара из всех цветов
  const avatarColor = ALL_COLORS[hash % ALL_COLORS.length]
  const tier = getColorTier(avatarColor)
  const tierInfo = getTierInfoFull(tier)
  
  // Комплементарный цвет фона
  const bgColor = getComplementaryColor(avatarColor)
  
  return {
    avatarColor,
    bgColor,
    tier,
    tierName: tierInfo.name,
    tierColor: tierInfo.color,
    tierEmoji: tierInfo.emoji
  }
}

// Генерация градиентного фона
export function generateGradientFromBalance(
  publicKey: string,
  tokenBalance: number = 0 // Оставляем параметр для совместимости
): { 
  avatarColor: string; 
  bgColor1: string; 
  bgColor2: string; 
  tier: TierNumber;
  tierName: string;
  tierColor: string;
  tierEmoji: string;
} {
  const hash = generateHash(publicKey)
  
  // Цвет аватара
  const avatarColor = ALL_COLORS[hash % ALL_COLORS.length]
  const tier = getColorTier(avatarColor)
  const tierInfo = getTierInfoFull(tier)
  
  // Два разных цвета для градиента
  let bgColor1 = ALL_COLORS[(hash * 3) % ALL_COLORS.length]
  let bgColor2 = ALL_COLORS[(hash * 5) % ALL_COLORS.length]
  
  // Убеждаемся, что цвета фона не совпадают с аватаром
  let attempts = 0
  while (bgColor1 === avatarColor && attempts < 10) {
    bgColor1 = ALL_COLORS[(hash + attempts) % ALL_COLORS.length]
    attempts++
  }
  
  attempts = 0
  while ((bgColor2 === avatarColor || bgColor2 === bgColor1) && attempts < 10) {
    bgColor2 = ALL_COLORS[(hash * 7 + attempts) % ALL_COLORS.length]
    attempts++
  }
  
  // Улучшение: убедимся, что цвета для градиента контрастные
  if (!areColorsContrasty(bgColor1, bgColor2)) {
    // Если цвета слишком похожи, выбираем противоположные
    const bg1Tier = getColorTier(bgColor1)
    const oppositeTier = bg1Tier === 1 ? 3 : bg1Tier === 2 ? 4 : 1
    const oppositeColors = COLOR_TIERS[`TIER_${oppositeTier}` as keyof typeof COLOR_TIERS]
    bgColor2 = oppositeColors[hash % oppositeColors.length]
  }
  
  return {
    avatarColor,
    bgColor1,
    bgColor2,
    tier,
    tierName: tierInfo.name,
    tierColor: tierInfo.color,
    tierEmoji: tierInfo.emoji
  }
}

// Комплементарный цвет с коррекцией яркости
function getComplementaryColor(avatarColor: string): string {
  const r = parseInt(avatarColor.slice(1, 3), 16)
  const g = parseInt(avatarColor.slice(3, 5), 16)
  const b = parseInt(avatarColor.slice(5, 7), 16)
  
  // Инвертируем цвет
  let bgR = 255 - r
  let bgG = 255 - g
  let bgB = 255 - b
  
  // Корректируем контраст
  const avatarBrightness = (r + g + b) / 3
  const bgBrightness = (bgR + bgG + bgB) / 3
  
  if (Math.abs(avatarBrightness - bgBrightness) < 80) {
    if (avatarBrightness > 127) {
      bgR = Math.floor(bgR * 0.4)
      bgG = Math.floor(bgG * 0.4)
      bgB = Math.floor(bgB * 0.4)
    } else {
      bgR = Math.min(255, Math.floor(bgR * 1.6))
      bgG = Math.min(255, Math.floor(bgG * 1.6))
      bgB = Math.min(255, Math.floor(bgB * 1.6))
    }
  }
  
  return `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`
}

// Проверка контрастности двух цветов
function areColorsContrasty(color1: string, color2: string, threshold: number = 100): boolean {
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)
  
  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)
  
  // Вычисляем евклидово расстояние в RGB пространстве
  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) + 
    Math.pow(g1 - g2, 2) + 
    Math.pow(b1 - b2, 2)
  )
  
  return distance > threshold
}

// Получить цвет аватара (для совместимости с текущим кодом)
export function getAvatarColor(publicKey: string): string {
  const hash = generateHash(publicKey)
  const useGradient = hash % 2 === 0
  
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey)
    return result.avatarColor
  } else {
    const result = generateSolidBgFromBalance(publicKey)
    return result.avatarColor
  }
}

// Получить информацию о тиере по публичному ключу
export function getTierInfoFromPublicKey(publicKey: string) {
  const hash = generateHash(publicKey)
  const avatarColor = ALL_COLORS[hash % ALL_COLORS.length]
  const tier = getColorTier(avatarColor)
  return getTierInfoFull(tier)
}

// Проверка уникальности цветов (только на сервере)
if (typeof window === 'undefined') {
  const uniqueColors = new Set(ALL_COLORS)
  console.log(`🎨 Total colors: ${ALL_COLORS.length}`)
  console.log(`🎨 Unique colors: ${uniqueColors.size}`)
  
  if (ALL_COLORS.length !== uniqueColors.size) {
    console.error('⚠️ WARNING: Duplicate colors found!')
  }
  
  // Выводим распределение тиеров
  const distribution = getTierDistribution()
  console.log('🎯 Tier Distribution:')
  Object.entries(distribution).forEach(([tier, stats]) => {
    console.log(`   ${tier}: ${stats.count} colors (${stats.percentage}%)`)
  })
}
