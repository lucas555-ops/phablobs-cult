import { NextRequest, NextResponse } from 'next/server'

// Валидация Solana адреса
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Генерация детерминированного хэша
function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Генерация уникального фона на основе хэша
function generateBackground(hash: number): { gradient: string; rotation: number; pattern: string } {
  // Phantom цветовая палитра
  const PHANTOM_COLORS = [
    ['#00C2FF', '#8B5CF6'], // Голубой → Фиолетовый
    ['#8B5CF6', '#EC4899'], // Фиолетовый → Розовый
    ['#F59E0B', '#EF4444'], // Янтарный → Красный
    ['#10B981', '#06B6D4'], // Изумрудный → Бирюзовый
    ['#06B6D4', '#8B5CF6'], // Бирюзовый → Фиолетовый
    ['#EC4899', '#F97316'], // Розовый → Оранжевый
    ['#EF4444', '#8B5CF6'], // Красный → Фиолетовый
    ['#F97316', '#00C2FF'], // Оранжевый → Голубой
  ]
  
  // Выбор градиента на основе хэша
  const colorPair = PHANTOM_COLORS[hash % PHANTOM_COLORS.length]
  const rotation = (hash >> 8) % 360
  
  // Выбор паттерна (радиальный или линейный)
  const patternType = (hash >> 16) % 3
  
  let gradient = ''
  
  if (patternType === 0) {
    // Радиальный градиент
    gradient = `
      <radialGradient id="bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="${colorPair[1]}" stop-opacity="0.4"/>
      </radialGradient>
    `
  } else if (patternType === 1) {
    // Линейный градиент
    gradient = `
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${colorPair[1]}" stop-opacity="0.6"/>
      </linearGradient>
    `
  } else {
    // Диагональный с тремя точками
    gradient = `
      <linearGradient id="bg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.5"/>
        <stop offset="50%" stop-color="${colorPair[1]}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${colorPair[0]}" stop-opacity="0.5"/>
      </linearGradient>
    `
  }
  
  return {
    gradient,
    rotation,
    pattern: patternType === 0 ? 'radial' : 'linear'
  }
}

// Генерация водяного знака
function generateWatermark(hash: number): { text: string; position: string; style: string } {
  const positions = ['bottom-right', 'bottom-left', 'top-right', 'center']
  const position = positions[hash % positions.length]
  
  // Генерация уникального номера Phablob
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  const text = `PHABLOBS #${phablobNumber}`
  
  // Стиль текста
  const fontSize = 32 + ((hash >> 8) % 8) // 32-40px
  const opacity = 0.5 + ((hash >> 12) % 30) / 100 // 0.5-0.8
  
  let x = '50%'
  let y = '50%'
  let anchor = 'middle'
  
  switch(position) {
    case 'bottom-right':
      x = '85%'
      y = '92%'
      anchor = 'end'
      break
    case 'bottom-left':
      x = '15%'
      y = '92%'
      anchor = 'start'
      break
    case 'top-right':
      x = '85%'
      y = '8%'
      anchor = 'end'
      break
    case 'center':
      x = '50%'
      y = '50%'
      anchor = 'middle'
      break
  }
  
  const style = `
    <text 
      x="${x}" 
      y="${y}" 
      text-anchor="${anchor}" 
      font-family="Arial Black, sans-serif" 
      font-weight="900"
      font-size="${fontSize}"
      fill="white"
      fill-opacity="${opacity}"
      filter="url(#textShadow)"
      letter-spacing="2"
    >
      ${text}
    </text>
  `
  
  return { text, position, style }
}

// Генерация полного SVG - ИСПРАВЛЕННЫЙ ПОРЯДОК СЛОЁВ
function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const bg = generateBackground(hash)
  const watermark = generateWatermark(hash)
  
  // Проверяем путь к картинке
  const imagePath = '/phantom-avatar.png'
  
  // Уменьшаем непрозрачность фона, чтобы картинка была видна
  const bgOpacity = 0.3 // Фон будет полупрозрачным
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${bg.gradient}
    
    <!-- Фильтры для эффектов -->
    <filter id="blur">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    
    <filter id="textShadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.5"/>
    </filter>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Маска для круглой картинки -->
    <clipPath id="circleClip">
      <circle cx="300" cy="300" r="250"/>
    </clipPath>
  </defs>
  
  <!-- СЛОЙ 1: Полупрозрачный фон -->
  <rect width="600" height="600" fill="url(#bg)" opacity="${bgOpacity}" transform="rotate(${bg.rotation} 300 300)"/>
  
  <!-- СЛОЙ 2: Картинка Phantom аватара (ОСНОВНОЙ СЛОЙ) -->
  <g clip-path="url(#circleClip)">
    <image 
      href="${imagePath}" 
      x="50" 
      y="50" 
      width="500" 
      height="500" 
      preserveAspectRatio="xMidYMid meet"
    />
  </g>
  
  <!-- СЛОЙ 3: Декоративный градиентный оверлей поверх картинки -->
  <circle cx="300" cy="300" r="250" fill="url(#bg)" opacity="0.2" filter="url(#glow)"/>
  
  <!-- СЛОЙ 4: Водяной знак -->
  ${watermark.style}
  
  <!-- СЛОЙ 5: Декоративная обводка -->
  <circle cx="300" cy="300" r="252" fill="none" stroke="url(#bg)" stroke-width="4" opacity="0.5"/>
  
  <!-- Дополнительный текст внизу -->
  <text 
    x="50%" 
    y="96%" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="14"
    fill="white"
    fill-opacity="0.6"
  >
    phablobs.cult
  </text>
</svg>`
}

// Альтернативный вариант: проверяем наличие картинки и генерируем соответствующий SVG
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    // Валидация
    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    // Проверяем, есть ли картинка (просто генерируем SVG с reference)
    // Если картинки нет на сервере, браузер покажет fallback
    
    // Генерация SVG
    const svgContent = generateAvatarSVG(address)

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating avatar:', error)
    
    // Fallback без картинки
    const hash = generateHash(params.address || 'fallback')
    const bg = generateBackground(hash)
    
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${bg.gradient}
  </defs>
  
  <rect width="600" height="600" fill="url(#bg)"/>
  
  <circle cx="300" cy="300" r="250" fill="#000" opacity="0.3"/>
  
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="48" fill="white" opacity="0.7">
    PHABLOBS
  </text>
  
  <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="24" fill="white" opacity="0.5">
    ${params.address?.substring(0, 8) || 'Wallet'}...
  </text>
</svg>`
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
