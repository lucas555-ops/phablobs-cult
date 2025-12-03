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

// Генерация фона (теперь это будет не градиент, а эффект ПОД картинкой)
function generateBackground(hash: number): { gradient: string; rotation: number } {
  const PHANTOM_COLORS = [
    ['#00C2FF', '#8B5CF6'],
    ['#8B5CF6', '#EC4899'],
    ['#F59E0B', '#EF4444'],
    ['#10B981', '#06B6D4'],
  ]
  
  const colorPair = PHANTOM_COLORS[hash % PHANTOM_COLORS.length]
  const rotation = (hash >> 8) % 360
  
  const gradient = `
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${colorPair[0]}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${colorPair[1]}" stop-opacity="0.2"/>
    </radialGradient>
  `
  
  return { gradient, rotation }
}

// Генерация водяного знака
function generateWatermark(hash: number): { style: string } {
  const fontSize = 42 + ((hash >> 8) % 12) // 42-54px
  const opacity = 0.08 + ((hash >> 12) % 7) / 100 // 0.08-0.15
  
  // Случайная позиция
  const positions = [
    { x: '50%', y: '50%', rotate: -15 },
    { x: '30%', y: '70%', rotate: 15 },
    { x: '70%', y: '30%', rotate: -10 },
    { x: '50%', y: '85%', rotate: 0 },
  ]
  
  const pos = positions[hash % positions.length]
  
  const style = `
    <text 
      x="${pos.x}" 
      y="${pos.y}" 
      text-anchor="middle" 
      font-family="Arial Black, Impact, sans-serif" 
      font-weight="900"
      font-size="${fontSize}"
      fill="white"
      fill-opacity="${opacity}"
      letter-spacing="3"
      transform="rotate(${pos.rotate} ${pos.x} ${pos.y})"
      style="user-select: none;"
    >
      PHABLOBS
    </text>
  `
  
  return { style }
}

// Генерация эффектов свечения для картинки
function generateGlowEffect(hash: number): { filter: string } {
  const glowColor = (hash >> 16) % 3
  
  const colors = [
    '#00C2FF', // синий
    '#8B5CF6', // фиолетовый
    '#EC4899', // розовый
  ]
  
  const color = colors[glowColor]
  const intensity = 15 + ((hash >> 4) % 10) // 15-25
  
  const filter = `
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${intensity}" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
      <feColorMatrix type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0 
                0 0 1 0 0 
                0 0 0 18 -7"/>
    </filter>
    
    <filter id="shadow">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${color}" flood-opacity="0.6"/>
    </filter>
  `
  
  return { filter }
}

// Генерация полного SVG
function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const bg = generateBackground(hash)
  const watermark = generateWatermark(hash)
  const glow = generateGlowEffect(hash)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Фоновый градиент (очень прозрачный, чтобы был под картинкой) -->
    ${bg.gradient}
    
    <!-- Эффекты свечения -->
    ${glow.filter}
    
    <!-- Тень для текста -->
    <filter id="textShadow">
      <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <!-- 1. ОЧЕНЬ ПРОЗРАЧНЫЙ фон (едва заметный) -->
  <rect width="600" height="600" fill="url(#bg)" opacity="0.3"/>
  
  <!-- 2. Картинка Phantom аватара (ГЛАВНЫЙ ЭЛЕМЕНТ) -->
  <g transform="translate(100, 100)" filter="url(#glow)">
    <!-- Белый фон для картинки (чтобы PNG с прозрачностью хорошо смотрелся) -->
    <rect x="0" y="0" width="400" height="400" fill="white" opacity="0"/>
    
    <!-- Сама картинка -->
    <image 
      href="/phantom-avatar.png" 
      x="0" 
      y="0" 
      width="400" 
      height="400"
      preserveAspectRatio="xMidYMid meet"
      style="image-rendering: optimizeQuality;"
    />
  </g>
  
  <!-- 3. Водяной знак (ПОВЕРХ картинки, но прозрачный) -->
  ${watermark.style}
  
  <!-- 4. Адрес кошелька (если нужно) -->
  <text 
    x="50%" 
    y="95%" 
    text-anchor="middle" 
    font-family="Arial, monospace" 
    font-size="16"
    fill="white"
    fill-opacity="0.4"
    filter="url(#textShadow)"
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
    
    // Fallback - простой вариант с картинкой
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <image href="/phantom-avatar.png" x="100" y="100" width="400" height="400"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="32" fill="white" opacity="0.3">PHABLOBS</text>
</svg>`
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
