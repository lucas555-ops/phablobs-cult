import { NextRequest, NextResponse } from 'next/server'

// Импортируем цветовую систему
import { 
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

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

// Генерация ФОНОВОГО SVG (без аватара)
async function generateBackgroundSVG(publicKey: string): Promise<string> {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  const useGradient = hash % 2 === 0
  const tokenBalance = 0
  
  let bgColor: string
  let bgColor2: string | null = null
  
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    bgColor = result.bgColor1
    bgColor2 = result.bgColor2
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    bgColor = result.bgColor
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${bgColor2 ? `
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bgColor2}" stop-opacity="1"/>
    </linearGradient>
    ` : ''}
    
    <filter id="textShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- ФОН -->
  <rect width="800" height="800" fill="${bgColor2 ? 'url(#bgGrad)' : bgColor}"/>
  
  <!-- ВОДЯНЫЕ ЗНАКИ -->
  <text x="100" y="150" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="Arial, sans-serif" font-weight="900" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  
  <text x="200" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="120" y="380" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  
  <!-- ТЕКСТ PHABLOBS -->
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
  
  <!-- НОМЕР -->
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
  
  <!-- URL -->
  <text 
    x="400" 
    y="760" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="18" 
    fill="white" 
    opacity="0.9"
  >
    phablobs.xyz
  </text>
</svg>`
}

// Получить цвет аватара
function getAvatarColor(publicKey: string): string {
  const hash = generateHash(publicKey)
  const tokenBalance = 0
  
  const useGradient = hash % 2 === 0
  
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    return result.avatarColor
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    return result.avatarColor
  }
}

// Композитинг: Фон + Аватар
async function generateCompositePNG(publicKey: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  
  // 1. Генерируем фон
  const backgroundSVG = await generateBackgroundSVG(publicKey)
  const backgroundPNG = await sharp(Buffer.from(backgroundSVG))
    .png()
    .toBuffer()
  
  // 2. Скачиваем аватар
  const avatarColor = getAvatarColor(publicKey)
  const cleanColor = avatarColor.replace('#', '')
  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  
  console.log(`🖼️ Downloading avatar: ${avatarUrl}`)
  
  const avatarResponse = await fetch(avatarUrl)
  if (!avatarResponse.ok) {
    throw new Error(`Failed to fetch avatar: ${avatarResponse.status}`)
  }
  
  const avatarBuffer = Buffer.from(await avatarResponse.arrayBuffer())
  
  // 3. Ресайзим аватар до 360x360
  const resizedAvatar = await sharp(avatarBuffer)
    .resize(360, 360, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()
  
  // 4. Композитим: фон + аватар поверх
  const compositePNG = await sharp(backgroundPNG)
    .composite([
      {
        input: resizedAvatar,
        top: 220,
        left: 220,
        blend: 'over'
      }
    ])
    .png({
      quality: 100,
      compressionLevel: 6
    })
    .toBuffer()
  
  console.log(`✅ Composite PNG created!`)
  
  return compositePNG
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'svg'

    if (request.method === 'HEAD') {
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Content-Type': format === 'png' ? 'image/png' : 'image/svg+xml'
        }
      })
    }

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      )
    }

    console.log(`🚀 Generating Phablob for: ${address}`)

    if (format === 'png') {
      try {
        const pngBuffer = await generateCompositePNG(address)
        
        const fileSizeMB = pngBuffer.length / (1024 * 1024)
        console.log(`📊 PNG size: ${fileSizeMB.toFixed(2)} MB`)
        
        // Сжимаем если > 5MB
        let finalBuffer = pngBuffer
        if (fileSizeMB > 5) {
          console.log('⚡ Compressing...')
          const sharp = (await import('sharp')).default
          finalBuffer = await sharp(pngBuffer)
            .resize(600, 600, { fit: 'inside' })
            .png({ quality: 90 })
            .toBuffer()
        }
        
        return new NextResponse(new Uint8Array(finalBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="phablob-${address.substring(0, 8)}.png"`,
            'Content-Length': finalBuffer.length.toString()
          },
        })
        
      } catch (error) {
        console.error('❌ PNG generation failed:', error)
        
        // Fallback
        const sharp = (await import('sharp')).default
        const fallbackSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="800" fill="#8B5CF6"/>
          <text x="400" y="400" text-anchor="middle" fill="white" font-size="24">Error</text>
        </svg>`
        
        const fallbackPng = await sharp(Buffer.from(fallbackSVG)).png().toBuffer()
        
        return new NextResponse(new Uint8Array(fallbackPng), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache',
          },
        })
      }
    }

    // Возвращаем SVG (без аватара, просто фон)
    const svgContent = await generateBackgroundSVG(address)
    
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return new NextResponse('Server Error', { status: 500 })
  }
}
