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

// --- СИСТЕМА ТИЕРОВ ДЛЯ ОТОБРАЖЕНИЯ ---

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

export type TierNumber = 1 | 2 | 3 | 4

// Получить информацию о тиере для отображения
export function getTierInfoForDisplay(tier: TierNumber) {
  return {
    name: TIER_NAMES[tier] || 'Common',
    color: TIER_COLORS[tier] || '#FFFFFF',
    emoji: TIER_EMOJIS[tier] || '⚪'
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

// Функция хэширования (для детерминированности)
function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Генерация одноцветного фона (упрощенная - не использует баланс)
export function generateSolidBgFromBalance(
  publicKey: string, 
  tokenBalance: number = 0 // Игнорируем баланс
): { 
  avatarColor: string; 
  bgColor: string; 
  // Для обратной совместимости возвращаем старые поля
  tier: number;
  tierName: string;
} {
  const hash = generateHash(publicKey)
  
  // Цвет аватара из всех цветов
  const avatarColor = ALL_COLORS[hash % ALL_COLORS.length]
  const tier = getColorTier(avatarColor)
  
  // Комплементарный цвет фона
  const bgColor = getComplementaryColor(avatarColor)
  
  return {
    avatarColor,
    bgColor,
    tier,
    tierName: TIER_NAMES[tier] || 'Common'
  }
}

// Генерация градиентного фона (упрощенная - не использует баланс)
export function generateGradientFromBalance(
  publicKey: string,
  tokenBalance: number = 0 // Игнорируем баланс
): { 
  avatarColor: string; 
  bgColor1: string; 
  bgColor2: string; 
  // Для обратной совместимости возвращаем старые поля
  tier: number;
  tierName: string;
} {
  const hash = generateHash(publicKey)
  
  // Цвет аватара
  const avatarColor = ALL_COLORS[hash % ALL_COLORS.length]
  const tier = getColorTier(avatarColor)
  
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
  
  return {
    avatarColor,
    bgColor1,
    bgColor2,
    tier,
    tierName: TIER_NAMES[tier] || 'Common'
  }
}

// Комплементарный цвет - выбирает из списка 69 цветов
function getComplementaryColor(avatarColor: string): string {
  const currentIndex = ALL_COLORS.indexOf(avatarColor)
  if (currentIndex === -1) return ALL_COLORS[0]
  
  // Берём цвет с противоположной стороны списка
  const oppositeIndex = (currentIndex + Math.floor(ALL_COLORS.length / 2)) % ALL_COLORS.length
  return ALL_COLORS[oppositeIndex]
}
