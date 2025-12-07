// ЦВЕТОВАЯ СИСТЕМА - 69 УНИКАЛЬНЫХ ЦВЕТОВ
// Распределены по 4 тиерам на основе баланса $BLOB

export const COLOR_TIERS = {
  // TIER 1 - COMMONS (доступны всем, 0+ $BLOB) - 20 цветов
  TIER_1: [
    '#1c1c1c', '#5e5e5e', '#a1a1a1', '#e3e3e3',
    '#1e7d32', '#007d00', '#1c583a', '#00c38d',
    '#ab9ff2', '#7378e1', '#8764cd', '#7d5acd',
    '#1e87f0', '#009be1', '#3ca5f5', '#78c3f5',
    '#873c0a', '#5f1e00', '#9b3c00', '#c38c87'
  ],
  
  // TIER 2 - UNCOMMONS (10,000+ $BLOB) - 20 цветов
  TIER_2: [
    '#1effff', '#e1780f', '#ff960f', '#ffd22d',
    '#e33c87', '#ff7887', '#ff9687', '#e182cd',
    '#b478ff', '#6982ff', '#7d96eb', '#e1aaff',
    '#3caf96', '#5aa57d', '#3c9b00', '#82b91e',
    '#d75a00', '#d61e04', '#ff3236', '#e12840'
  ],
  
  // TIER 3 - RARES (100,000+ $BLOB) - 20 цветов
  TIER_3: [
    '#ffff2d', '#ffff5f', '#ffff91', '#ffffc3',
    '#1ec3ff', '#0087f5', '#faffff', '#cdffe6',
    '#3a943a', '#00e115', '#3ad058', '#3aff76',
    '#720e2c', '#860018', '#e31eff', '#c50087',
    '#001900', '#003700', '#00003c', '#000514'
  ],
  
  // TIER 4 - LEGENDARIES (1,000,000+ $BLOB) - 9 цветов
  TIER_4: [
    '#1ce100', '#230000', '#2e0840', 
    '#3e1462', '#2f1944', '#5f2869', 
    '#7d46e1', '#7d0ac3', '#3c7378'
  ]
}

// ПОРОГИ БАЛАНСА
export const BALANCE_TIERS = {
  TIER_1: 0,           // Commons - доступны всем
  TIER_2: 10000,       // Uncommons - 10k+ $BLOB
  TIER_3: 100000,      // Rares - 100k+ $BLOB
  TIER_4: 1000000      // Legendaries - 1M+ $BLOB
}

// Получить доступные цвета на основе баланса
export function getAvailableColors(tokenBalance: number): string[] {
  let availableColors = [...COLOR_TIERS.TIER_1]
  
  if (tokenBalance >= BALANCE_TIERS.TIER_2) {
    availableColors = [...availableColors, ...COLOR_TIERS.TIER_2]
  }
  
  if (tokenBalance >= BALANCE_TIERS.TIER_3) {
    availableColors = [...availableColors, ...COLOR_TIERS.TIER_3]
  }
  
  if (tokenBalance >= BALANCE_TIERS.TIER_4) {
    availableColors = [...availableColors, ...COLOR_TIERS.TIER_4]
  }
  
  return availableColors
}

// Получить информацию о тиере
export function getTierInfo(tokenBalance: number) {
  let tier = 1
  let tierName = 'Commons'
  let unlockedColors = 20
  let nextTier: number | null = 10000
  
  if (tokenBalance >= BALANCE_TIERS.TIER_4) {
    tier = 4
    tierName = 'Legendaries'
    unlockedColors = 69
    nextTier = null
  } else if (tokenBalance >= BALANCE_TIERS.TIER_3) {
    tier = 3
    tierName = 'Rares'
    unlockedColors = 60
    nextTier = 1000000
  } else if (tokenBalance >= BALANCE_TIERS.TIER_2) {
    tier = 2
    tierName = 'Uncommons'
    unlockedColors = 40
    nextTier = 100000
  } else {
    tier = 1
    tierName = 'Commons'
    unlockedColors = 20
    nextTier = 10000
  }
  
  return {
    tier,
    tierName,
    unlockedColors,
    totalColors: 69,
    nextTier,
    needsMore: nextTier ? nextTier - tokenBalance : 0
  }
}

// Генерация одноцветного фона (вместо градиента)
export function generateSolidBgFromBalance(
  publicKey: string, 
  tokenBalance: number
): { avatarColor: string; bgColor: string; tier: number; tierName: string } {
  const availableColors = getAvailableColors(tokenBalance)
  const tierInfo = getTierInfo(tokenBalance)
  
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  hash = Math.abs(hash)
  
  // Цвет аватара
  const avatarColor = availableColors[hash % availableColors.length]
  
  // Получаем комплементарный цвет фона с корректировкой яркости
  const bgColor = getComplementaryBgColor(avatarColor)
  
  return {
    avatarColor,
    bgColor,
    tier: tierInfo.tier,
    tierName: tierInfo.tierName
  }
}

// Комплементарный цвет с автоматической корректировкой яркости
function getComplementaryBgColor(avatarColor: string): string {
  const r = parseInt(avatarColor.slice(1, 3), 16)
  const g = parseInt(avatarColor.slice(3, 5), 16)
  const b = parseInt(avatarColor.slice(5, 7), 16)
  
  // Инвертируем (комплементарный цвет)
  let bgR = 255 - r
  let bgG = 255 - g
  let bgB = 255 - b
  
  // Проверяем контраст яркости
  const avatarBrightness = (r + g + b) / 3
  const bgBrightness = (bgR + bgG + bgB) / 3
  
  // Корректируем если контраст недостаточный
  if (Math.abs(avatarBrightness - bgBrightness) < 80) {
    if (avatarBrightness > 127) {
      // Аватар светлый → делаем фон темнее
      bgR = Math.floor(bgR * 0.4)
      bgG = Math.floor(bgG * 0.4)
      bgB = Math.floor(bgB * 0.4)
    } else {
      // Аватар темный → делаем фон светлее
      bgR = Math.min(255, Math.floor(bgR * 1.6))
      bgG = Math.min(255, Math.floor(bgG * 1.6))
      bgB = Math.min(255, Math.floor(bgB * 1.6))
    }
  }
  
  return `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`
}

// Генерация градиента из доступных цветов
export function generateGradientFromBalance(
  publicKey: string, 
  tokenBalance: number
): { avatarColor: string; bgColor1: string; bgColor2: string; tier: number; tierName: string } {
  const availableColors = getAvailableColors(tokenBalance)
  const tierInfo = getTierInfo(tokenBalance)
  
  // Генерируем хэш из публичного ключа
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  hash = Math.abs(hash)
  
  // Цвет аватара (первый цвет)
  const avatarColor = availableColors[hash % availableColors.length]
  
  // Цвета фона (РАЗНЫЕ от аватара для контраста!)
  let bgColor1 = availableColors[(hash * 3) % availableColors.length]
  let bgColor2 = availableColors[(hash * 5) % availableColors.length]
  
  // Убеждаемся что цвета фона не совпадают с аватаром
  let attempts = 0
  while (bgColor1 === avatarColor && attempts < 10) {
    hash++
    bgColor1 = availableColors[hash % availableColors.length]
    attempts++
  }
  
  attempts = 0
  while ((bgColor2 === avatarColor || bgColor2 === bgColor1) && attempts < 10) {
    hash++
    bgColor2 = availableColors[hash % availableColors.length]
    attempts++
  }
  
  return {
    avatarColor,
    bgColor1,
    bgColor2,
    tier: tierInfo.tier,
    tierName: tierInfo.tierName
  }
}

// Все 69 цветов для справки
export const ALL_COLORS = [
  ...COLOR_TIERS.TIER_1,
  ...COLOR_TIERS.TIER_2,
  ...COLOR_TIERS.TIER_3,
  ...COLOR_TIERS.TIER_4
]

// Проверка: убеждаемся что всего 69 цветов и нет дубликатов
const uniqueColors = [...new Set(ALL_COLORS)]
console.log(`Total colors: ${ALL_COLORS.length}`) // Должно быть 69
console.log(`Unique colors: ${uniqueColors.length}`) // Должно быть 69
if (ALL_COLORS.length !== uniqueColors.length) {
  console.error('⚠️ WARNING: Duplicate colors found!')
}

