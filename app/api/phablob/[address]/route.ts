import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generateGradient(hash: number): { color1: string; color2: string; index: number; name: string } {
  // 12 УНИКАЛЬНЫХ ГРАДИЕНТОВ вместо 6!
  const PHANTOM_COLORS = [
    // Оригинальные 6:
    { colors: ['#00C2FF', '#8B5CF6'], name: 'Cyber Dream', angle: 135 },      // 0: Cyan → Purple
    { colors: ['#8B5CF6', '#EC4899'], name: 'Mystic Fusion', angle: 90 },     // 1: Purple → Pink
    { colors: ['#F59E0B', '#EF4444'], name: 'Phoenix Fire', angle: 45 },      // 2: Amber → Red
    { colors: ['#10B981', '#06B6D4'], name: 'Ocean Breeze', angle: 180 },     // 3: Emerald → Cyan
    { colors: ['#EC4899', '#F97316'], name: 'Sunset Glow', angle: 225 },      // 4: Pink → Orange
    { colors: ['#6366F1', '#8B5CF6'], name: 'Royal Phantom', angle: 270 },    // 5: Indigo → Purple
    
    // Новые 6 уникальных:
    { colors: ['#14F195', '#9945FF'], name: 'Solana Vibes', angle: 60 },      // 6: Solana Green → Purple
    { colors: ['#FF6B9D', '#C084FC'], name: 'Candy Dreams', angle: 120 },     // 7: Hot Pink → Light Purple
    { colors: ['#FFD700', '#FF1493'], name: 'Golden Sunset', angle: 150 },    // 8: Gold → Deep Pink
    { colors: ['#00FFF0', '#7B2FFF'], name: 'Neon Nights', angle: 200 },      // 9: Cyan → Deep Purple
    { colors: ['#FF4500', '#FFD700'], name: 'Fire Blaze', angle: 315 },       // 10: Orange Red → Gold
    { colors: ['#1E90FF', '#FF69B4'], name: 'Electric Rose', angle: 0 },      // 11: Dodger Blue → Hot Pink
  ]
  
  const index = hash % PHANTOM_COLORS.length
  const gradient = PHANTOM_COLORS[index]
  return { 
    color1: gradient.colors[0], 
    color2: gradient.colors[1], 
    index,
    name: gradient.name
  }
}

// Кэшируем Base64 аватаров
const cachedAvatars: Record<string, string> = {}

function getPhantomAvatarDataUrl(gradientIndex: number): string {
  // Для новых градиентов (6-11) используем маппинг на старые аватары (0-5)
  const avatarIndex = gradientIndex % 6
  
  const specificAvatarName = `phantom-avatar-${avatarIndex}.png`
  const specificAvatarPath = join(process.cwd(), 'public', specificAvatarName)
  
  if (existsSync(specificAvatarPath)) {
    if (cachedAvatars[specificAvatarName]) {
      console.log(`✅ Using cached avatar: ${specificAvatarName} for gradient ${gradientIndex}`)
      return cachedAvatars[specificAvatarName]
    }
    
    try {
      const avatarBuffer = readFileSync(specificAvatarPath)
      const base64 = avatarBuffer.toString('base64')
      cachedAvatars[specificAvatarName] = `data:image/png;base64,${base64}`
      
      console.log(`✅ Loaded specific avatar: ${specificAvatarName} for gradient ${gradientIndex}`)
      return cachedAvatars[specificAvatarName]
    } catch (error) {
      console.error(`❌ Error loading ${specificAvatarName}:`, error)
    }
  }
  
  const defaultAvatarName = 'phantom-avatar.png'
  const defaultAvatarPath = join(process.cwd(), 'public', defaultAvatarName)
  
  if (cachedAvatars[defaultAvatarName]) {
    console.log(`✅ Using default cached avatar: ${defaultAvatarName}`)
    return cachedAvatars[defaultAvatarName]
  }
  
  try {
    const avatarBuffer = readFileSync(defaultAvatarPath)
    const base64 = avatarBuffer.toString('base64')
    cachedAvatars[defaultAvatarName] = `data:image/png;base64,${base64}`
    
    console.log(`✅ Loaded default avatar: ${defaultAvatarName}`)
    return cachedAvatars[defaultAvatarName]
  } catch (error) {
    console.error('❌ Failed to load phantom-avatar.png:', error)
    throw new Error('No phantom avatar found in /public/')
  }
}

function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const gradient = generateGradient(hash)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  const phantomAvatarDataUrl = getPhantomAvatarDataUrl(gradient.index)
  
  console.log(`🎨 Gradient ${gradient.index}: ${gradient.name} (${gradient.color1} → ${gradient.color2})`)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient.color1}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${gradient.color2}" stop-opacity="1"/>
    </linearGradient>
    
    <filter id="textShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- СЛОЙ 1: ГРАДИЕНТНЫЙ ФОН (800x800) -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- СЛОЙ 2: ВОДЯНЫЕ ЗНАКИ -->
  <!-- PHANTOM водяные знаки -->
  <text x="100" y="150" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="Arial, sans-serif" font-weight="900" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  <text x="350" y="280" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="white" opacity="0.05" transform="rotate(-20 350 280)">PHANTOM</text>
  <text x="40" y="680" font-family="Arial, sans-serif" font-weight="900" font-size="35" fill="white" opacity="0.06" transform="rotate(-5 40 680)">PHANTOM</text>
  
  <!-- PHABLOBS водяные знаки -->
  <text x="200" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="450" y="120" font-family="Arial, sans-serif" font-weight="900" font-size="38" fill="white" opacity="0.06" transform="rotate(-12 450 120)">PHABLOBS</text>
  <text x="120" y="380" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  <text x="280" y="720" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.07" transform="rotate(5 280 720)">PHABLOBS</text>
  <text x="680" y="380" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="white" opacity="0.04" transform="rotate(25 680 380)">PHABLOBS</text>
  
  <!-- СЛОЙ 3: ВАША КАРТИНКА (360x360, по центру) -->
  <image 
    href="${phantomAvatarDataUrl}" 
    x="220" 
    y="220" 
    width="360" 
    height="360"
    preserveAspectRatio="xMidYMid meet"
  />
  
  <!-- СЛОЙ 4: ТЕКСТ PHABLOBS (вверху) -->
  <text 
    x="400" 
    y="90" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-weight="900" 
    font-size="68" 
    fill="white" 
    filter="url(#textShadow)" 
    letter-spacing="6"
  >
    PHABLOBS
  </text>
  
  <!-- СЛОЙ 5: НОМЕР (внизу) -->
  <text 
    x="400" 
    y="720" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-weight="900" 
    font-size="52" 
    fill="white" 
    filter="url(#textShadow)" 
    letter-spacing="4"
  >
    #${phablobNumber}
  </text>
  
  <!-- СЛОЙ 6: URL (самый низ) -->
  <text 
    x="400" 
    y="760" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="18" 
    fill="white" 
    opacity="0.9"
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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'svg'

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      )
    }

    const svgContent = generateAvatarSVG(address)

    if (format === 'png') {
      try {
        const sharp = require('sharp')
        const pngBuffer = await sharp(Buffer.from(svgContent), {
          density: 300
        })
          .png({
            quality: 100,
            compressionLevel: 6
          })
          .toBuffer()
        
        return new NextResponse(pngBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="phablob-${address.substring(0, 8)}.png"`
          },
        })
      } catch (error) {
        console.error('Sharp error:', error)
        return new NextResponse(svgContent, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    
    const fallbackSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="800" fill="#8B5CF6"/>
  <text x="400" y="400" text-anchor="middle" fill="white" font-size="24">Error: ${error instanceof Error ? error.message : 'Unknown error'}</text>
</svg>`
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    })
  }
}
