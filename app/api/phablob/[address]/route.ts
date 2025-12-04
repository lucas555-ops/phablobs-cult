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

// Генерация цветового градиента на основе хэша
function generateGradient(hash: number): { color1: string; color2: string; angle: number } {
  const PHANTOM_COLORS = [
    ['#00C2FF', '#8B5CF6'], // Cyan → Purple (основной Phantom)
    ['#8B5CF6', '#EC4899'], // Purple → Pink
    ['#F59E0B', '#EF4444'], // Amber → Red
    ['#10B981', '#06B6D4'], // Emerald → Cyan
    ['#EC4899', '#F97316'], // Pink → Orange
    ['#6366F1', '#8B5CF6'], // Indigo → Purple
  ]
  
  const colorPair = PHANTOM_COLORS[hash % PHANTOM_COLORS.length]
  const angle = (hash >> 8) % 360
  
  return {
    color1: colorPair[0],
    color2: colorPair[1],
    angle
  }
}

// Генерация SVG с Phantom аватаром (INLINE!)
function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const gradient = generateGradient(hash)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Градиенты для фона -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient.color1}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${gradient.color2}" stop-opacity="0.9"/>
    </linearGradient>
    
    <!-- Градиент для текста -->
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#E0E0E0"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    
    <!-- Фильтры -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="black" flood-opacity="0.8"/>
    </filter>
    
    <filter id="textShadow">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="black" flood-opacity="0.9"/>
    </filter>
    
    <filter id="blobShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
    
    <!-- Паттерн для мемного фона -->
    <pattern id="memePattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="15" fill="${gradient.color1}" opacity="0.08"/>
      <circle cx="75" cy="75" r="20" fill="${gradient.color2}" opacity="0.08"/>
      <circle cx="50" cy="80" r="12" fill="${gradient.color1}" opacity="0.05"/>
    </pattern>
  </defs>
  
  <!-- СЛОЙ 1: Основной фон с градиентом -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- СЛОЙ 2: Паттерн мемов -->
  <rect width="800" height="800" fill="url(#memePattern)"/>
  
  <!-- СЛОЙ 3: Тень под аватаром -->
  <circle cx="400" cy="390" r="235" fill="black" opacity="0.3" filter="url(#glow)"/>
  
  <!-- СЛОЙ 4: Белый круг для аватара -->
  <circle cx="400" cy="380" r="230" fill="white" filter="url(#shadow)"/>
  
  <!-- СЛОЙ 5: PHANTOM BLOB INLINE (центрирован и масштабирован) -->
  <g transform="translate(400, 380)">
    <g transform="scale(0.52) translate(-400, -400)" filter="url(#blobShadow)">
      <!-- Тело привидения -->
      <path d="M 400 80 
               C 180 80, 80 180, 80 360
               L 80 620
               C 80 660, 110 680, 144 670
               L 170 656
               C 184 670, 216 670, 230 656
               L 256 644
               C 270 656, 304 656, 318 644
               L 344 636
               C 358 648, 392 648, 406 636
               L 432 644
               C 446 656, 480 656, 494 644
               L 520 656
               C 534 670, 566 670, 580 656
               L 606 670
               C 640 680, 670 660, 670 620
               L 670 360
               C 670 180, 570 80, 400 80 Z"
            fill="white" 
            opacity="0.95"/>
      
      <!-- Левый глаз -->
      <ellipse cx="300" cy="280" rx="44" ry="70" fill="#7C3AED"/>
      
      <!-- Правый глаз -->
      <ellipse cx="500" cy="280" rx="44" ry="70" fill="#7C3AED"/>
      
      <!-- Блик в левом глазу -->
      <ellipse cx="310" cy="260" rx="16" ry="24" fill="white" opacity="0.4"/>
      
      <!-- Блик в правом глазу -->
      <ellipse cx="510" cy="260" rx="16" ry="24" fill="white" opacity="0.4"/>
      
      <!-- Улыбка (опционально) -->
      <path d="M 300 400 Q 400 440 500 400" 
            stroke="#7C3AED" 
            stroke-width="6" 
            fill="none" 
            opacity="0.3"
            stroke-linecap="round"/>
    </g>
  </g>
  
  <!-- СЛОЙ 6: Тонкая обводка аватара -->
  <circle cx="400" cy="380" r="230" fill="none" stroke="white" stroke-width="3" opacity="0.5"/>
  
  <!-- СЛОЙ 7: Большая надпись PHABLOBS вверху -->
  <text 
    x="400" 
    y="120" 
    text-anchor="middle" 
    font-family="Arial Black, Impact, sans-serif" 
    font-weight="900"
    font-size="72"
    fill="url(#textGrad)"
    filter="url(#textShadow)"
    letter-spacing="8"
  >
    PHABLOBS
  </text>
  
  <!-- СЛОЙ 8: Номер Phablob внизу -->
  <text 
    x="400" 
    y="680" 
    text-anchor="middle" 
    font-family="Arial Black, sans-serif" 
    font-weight="900"
    font-size="56"
    fill="white"
    filter="url(#textShadow)"
    letter-spacing="4"
  >
    #${phablobNumber}
  </text>
  
  <!-- СЛОЙ 9: Маленький текст внизу -->
  <text 
    x="400" 
    y="740" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="20"
    fill="white"
    fill-opacity="0.8"
  >
    phablobs.cult
  </text>
  
  <!-- СЛОЙ 10: Декоративные элементы (звёздочки/блики) -->
  <circle cx="200" cy="200" r="4" fill="white" opacity="0.6">
    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="600" cy="250" r="3" fill="white" opacity="0.5">
    <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="150" cy="500" r="3" fill="white" opacity="0.4">
    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="650" cy="550" r="4" fill="white" opacity="0.5">
    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.8s" repeatCount="indefinite"/>
  </circle>
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
    
    // Fallback SVG с привидением
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="#8B5CF6"/>
  <circle cx="400" cy="400" r="230" fill="white" opacity="0.9"/>
  
  <!-- Простое привидение для fallback -->
  <g transform="translate(400, 400) scale(0.5) translate(-400, -400)">
    <path d="M 400 80 C 180 80, 80 180, 80 360 L 80 620 C 80 660, 110 680, 144 670 L 170 656 C 184 670, 216 670, 230 656 L 256 644 C 270 656, 304 656, 318 644 L 344 636 C 358 648, 392 648, 406 636 L 432 644 C 446 656, 480 656, 494 644 L 520 656 C 534 670, 566 670, 580 656 L 606 670 C 640 680, 670 660, 670 620 L 670 360 C 670 180, 570 80, 400 80 Z" fill="white" opacity="0.9"/>
    <ellipse cx="300" cy="280" rx="40" ry="65" fill="#7C3AED"/>
    <ellipse cx="500" cy="280" rx="40" ry="65" fill="#7C3AED"/>
  </g>
  
  <text x="400" y="120" text-anchor="middle" font-family="Arial Black" font-size="72" fill="white" letter-spacing="8">
    PHABLOBS
  </text>
  <text x="400" y="700" text-anchor="middle" font-family="Arial" font-size="24" fill="white">
    Error loading - showing fallback
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
