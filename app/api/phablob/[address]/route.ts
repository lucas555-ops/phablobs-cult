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
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${colorPair[1]}" stop-opacity="0.7"/>
      </radialGradient>
    `
  } else if (patternType === 1) {
    // Линейный градиент
    gradient = `
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${colorPair[1]}" stop-opacity="0.85"/>
      </linearGradient>
    `
  } else {
    // Диагональный с тремя точками
    gradient = `
      <linearGradient id="bg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="${colorPair[1]}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${colorPair[0]}" stop-opacity="0.8"/>
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
  const opacity = 0.6 + ((hash >> 12) % 20) / 100 // 0.6-0.8
  
  let x = '50%'
  let y = '50%'
  let anchor = 'middle'
  
  switch(position) {
    case 'bottom-right':
      x = '90%'
      y = '92%'
      anchor = 'end'
      break
    case 'bottom-left':
      x = '10%'
      y = '92%'
      anchor = 'start'
      break
    case 'top-right':
      x = '90%'
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

// Генерация полного SVG
function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const bg = generateBackground(hash)
  const watermark = generateWatermark(hash)
  
  // Добавляем декоративные элементы
  const hasCircles = (hash >> 20) % 2 === 0
  const circleOpacity = 0.1 + ((hash >> 22) % 15) / 100
  
  const decorativeElements = hasCircles ? `
    <circle cx="100" cy="100" r="150" fill="white" opacity="${circleOpacity}"/>
    <circle cx="500" cy="500" r="200" fill="white" opacity="${circleOpacity * 0.7}"/>
  ` : ''
  
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
  </defs>
  
  <!-- Фон с градиентом -->
  <rect width="600" height="600" fill="url(#bg)" transform="rotate(${bg.rotation} 300 300)"/>
  
  <!-- Декоративные элементы -->
  <g filter="url(#blur)">
    ${decorativeElements}
  </g>
  
  <!-- Phantom аватар (будет заменен на реальный PNG) -->
  <g transform="translate(150, 150)">
    <image href="/phantom-avatar.png" width="300" height="300" filter="url(#glow)"/>
  </g>
  
  <!-- Водяной знак -->
  ${watermark.style}
  
  <!-- Дополнительный текст внизу -->
  <text 
    x="50%" 
    y="96%" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="14"
    fill="white"
    fill-opacity="0.4"
  >
    phablobs.cult
  </text>
</svg>`
}

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
    
    // Fallback
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#8b5cf6"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="32" fill="white">PHABLOBS</text>
</svg>`
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
