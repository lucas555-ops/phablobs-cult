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

// Генерация уникального фона (как на картинке - простой градиент)
function generateBackground(hash: number): string {
  // Phantom цветовая палитра (фиолетовые оттенки как на картинке)
  const PHANTOM_COLORS = [
    ['#5b21b6', '#7c3aed'], // Темно-фиолетовый → Фиолетовый
    ['#6d28d9', '#8b5cf6'], // Фиолетовый → Светло-фиолетовый
    ['#7c3aed', '#a78bfa'], // Фиолетовый → Лавандовый
    ['#4c1d95', '#6d28d9'], // Очень темный → Фиолетовый
    ['#5b21b6', '#9333ea'], // Фиолетовый спектр
  ]
  
  const colorPair = PHANTOM_COLORS[hash % PHANTOM_COLORS.length]
  
  return `
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorPair[0]}"/>
      <stop offset="100%" stop-color="${colorPair[1]}"/>
    </linearGradient>
  `
}

// Генерация декоративных элементов (мелкие иконки как на картинке)
function generateDecorations(hash: number): string {
  // Позиции для декоративных элементов
  const positions = [
    { x: 50, y: 50 }, { x: 550, y: 50 },
    { x: 50, y: 550 }, { x: 550, y: 550 },
    { x: 100, y: 300 }, { x: 500, y: 300 },
    { x: 300, y: 100 }, { x: 300, y: 500 },
  ]
  
  let decorations = ''
  
  positions.forEach((pos, i) => {
    const size = 30 + ((hash + i * 17) % 20)
    const opacity = 0.1 + ((hash + i * 23) % 15) / 100
    
    // Простые круги (можно заменить на лого из папки)
    decorations += `
      <circle 
        cx="${pos.x}" 
        cy="${pos.y}" 
        r="${size}" 
        fill="white" 
        opacity="${opacity}"
      />
    `
  })
  
  return decorations
}

// Генерация полного SVG (НОВЫЙ СТИЛЬ)
function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const bgGradient = generateBackground(hash)
  const decorations = generateDecorations(hash)
  
  // Генерация уникального номера
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${bgGradient}
    
    <!-- Фильтры -->
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="black" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- СЛОЙ 1: Фиолетовый фон -->
  <rect width="800" height="800" fill="url(#bg)"/>
  
  <!-- СЛОЙ 2: Декоративные элементы (мелкие иконки) -->
  <g opacity="0.6" filter="url(#shadow)">
    ${decorations}
  </g>
  
  <!-- СЛОЙ 3: Главный Phantom аватар (БОЛЬШОЙ, по центру) -->
  <g transform="translate(200, 200)">
    <image 
      href="/phantom-avatar.png" 
      x="0" 
      y="0" 
      width="400" 
      height="400" 
      preserveAspectRatio="xMidYMid meet"
      filter="url(#shadow)"
    />
  </g>
  
  <!-- СЛОЙ 4: БОЛЬШАЯ НАДПИСЬ PHABLOBS (как на картинке) -->
  <text 
    x="50%" 
    y="12%" 
    text-anchor="middle" 
    font-family="Impact, Arial Black, sans-serif" 
    font-weight="900"
    font-size="72"
    fill="white"
    filter="url(#textGlow)"
    letter-spacing="4"
  >
    PHABLOBS
  </text>
  
  <!-- СЛОЙ 5: Номер (маленький, сверху) -->
  <text 
    x="50%" 
    y="18%" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-weight="700"
    font-size="28"
    fill="white"
    opacity="0.8"
  >
    #${phablobNumber}
  </text>
  
  <!-- СЛОЙ 6: Нижний текст -->
  <text 
    x="50%" 
    y="94%" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="20"
    fill="white"
    opacity="0.6"
  >
    phablobs.cult
  </text>
  
  <!-- СЛОЙ 7: Декоративная рамка -->
  <rect 
    x="20" 
    y="20" 
    width="760" 
    height="760" 
    fill="none" 
    stroke="white" 
    stroke-width="3" 
    opacity="0.2"
    rx="20"
  />
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
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5b21b6"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  
  <rect width="800" height="800" fill="url(#fallbackBg)"/>
  
  <text x="50%" y="50%" text-anchor="middle" font-family="Impact" font-size="80" fill="white">
    PHABLOBS
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
