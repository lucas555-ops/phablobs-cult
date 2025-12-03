import { NextRequest, NextResponse } from 'next/server'

// Валидация Solana адреса
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Функция для создания детерминированного хэша
function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Генерация водяного знака SVG
function createWatermarkSvg(hash: number): string {
  // Параметры на основе хэша
  const rotation = (hash % 45) - 22.5 // от -22.5 до 22.5 градусов
  const opacity = 0.15 + ((hash >> 4) % 30) / 100 // 0.15-0.45
  const fontSize = 24 + ((hash >> 8) % 16) // 24-40px
  const colorIndex = (hash >> 12) % 4 // 0-3
  
  const colors = [
    'rgba(0, 194, 255, 0.8)', // Phantom blue
    'rgba(139, 92, 246, 0.8)', // Purple
    'rgba(255, 107, 107, 0.8)', // Red
    'rgba(255, 209, 102, 0.8)', // Yellow
  ]
  
  // Выбор текста водяного знака
  const watermarkText = (hash % 20 === 0) 
    ? `PHABLOBS #${(hash % 1000).toString().padStart(3, '0')}`
    : 'PHABLOBS'

  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="black" flood-opacity="0.4"/>
        </filter>
      </defs>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold"
        font-size="${fontSize}"
        fill="${colors[colorIndex]}"
        fill-opacity="${opacity}"
        filter="url(#shadow)"
        transform="rotate(${rotation}, 200, 200) translate(0, ${fontSize/2})"
      >
        ${watermarkText}
      </text>
    </svg>
  `.trim()
}

// Основной генератор аватара
function generatePhantomAvatarWithWatermark(publicKey: string): string {
  const hash = generateHash(publicKey)
  
  // Phantom цвета
  const colors = [
    '#00C2FF', '#8B5CF6', '#F59E0B', '#10B981',
    '#EF4444', '#F97316', '#EC4899', '#06B6D4'
  ]
  
  const color1 = colors[hash % colors.length]
  const color2 = colors[(hash >> 8) % colors.length]
  const rotation = (hash >> 16) % 360
  
  // Если есть шаблонная картинка
  const hasTemplate = false // Поменяй на true если положишь картинку в public/images/phantom-avatar-template.png
  
  if (hasTemplate) {
    // Вариант с использованием шаблона
    return `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="phantomPattern" patternUnits="userSpaceOnUse" width="400" height="400">
            <image href="/images/phantom-avatar-template.png" width="400" height="400"/>
          </pattern>
        </defs>
        
        <!-- Фон с Phantom аватаром -->
        <rect width="400" height="400" fill="url(#phantomPattern)"/>
        
        <!-- Водяной знак -->
        ${createWatermarkSvg(hash).split('<svg')[1].split('</svg>')[0]}
      </svg>
    `.trim()
  } else {
    // Fallback: генерируем красивый градиентный аватар
    return `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stop-color="${color1}"/>
            <stop offset="100%" stop-color="${color2}"/>
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        
        <!-- Градиентный фон -->
        <rect width="400" height="400" fill="#000000"/>
        <g transform="rotate(${rotation} 200 200)">
          <circle cx="200" cy="200" r="160" fill="url(#grad)" filter="url(#blur)" opacity="0.9"/>
          <circle cx="200" cy="200" r="120" fill="url(#grad)" opacity="0.6"/>
        </g>
        
        <!-- Водяной знак -->
        ${createWatermarkSvg(hash).split('<svg')[1].split('</svg>')[0]}
      </svg>
    `.trim()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    // Валидация входа
    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    // Генерируем аватар с водяным знаком
    const svgContent = generatePhantomAvatarWithWatermark(address)

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating Phantom avatar:', error)
    
    // Fallback простой аватар
    const fallbackSVG = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="#8b5cf6" opacity="0.7"/>
        <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="28" fill="white" opacity="0.5">PHABLOBS</text>
      </svg>
    `
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
