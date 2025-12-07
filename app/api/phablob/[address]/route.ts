import { NextRequest, NextResponse } from 'next/server'

// Импортируем цветовую систему
import { 
  getAvailableColors, 
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

// Создание PNG из SVG
async function generateCompositePNG(svgContent: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  
  const pngBuffer = await sharp(Buffer.from(svgContent), {
    density: 300,
    unlimited: true
  })
  .png({
    quality: 100,
    compressionLevel: 6,
    adaptiveFiltering: true,
    progressive: false
  })
  .toBuffer();
  
  return pngBuffer;
}

// Генерация SVG
async function generateAvatarSVG(publicKey: string): Promise<string> {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  const useGradient = hash % 2 === 0
  
  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null
  
  // Всегда используем баланс 0 (нет проверки токенов)
  const tokenBalance = 0
  
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor1
    bgColor2 = result.bgColor2
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor
  }
  
  // ИСПОЛЬЗУЕМ ПРЯМОЙ URL
  const cleanColor = avatarColor.replace('#', '')
  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  
  console.log(`🎨 Generated Phablob #${phablobNumber}`)
  console.log(`🎨 Avatar color: ${avatarColor}`)
  console.log(`🖼️ Avatar URL: ${avatarUrl}`)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
    
    <filter id="avatarShadow">
      <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="black" flood-opacity="0.6"/>
    </filter>
  </defs>
  
  <!-- СЛОЙ 1: ФОН -->
  <rect width="800" height="800" fill="${bgColor2 ? 'url(#bgGrad)' : bgColor}"/>
  
  <!-- СЛОЙ 2: ВОДЯНЫЕ ЗНАКИ -->
  <text x="100" y="150" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="Arial, sans-serif" font-weight="900" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  
  <text x="200" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="120" y="380" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  
  <!-- СЛОЙ 3: АВАТАР (ПРЯМОЙ URL!) -->
  <image 
    href="${avatarUrl}" 
    x="220" 
    y="220" 
    width="360" 
    height="360"
    preserveAspectRatio="xMidYMid meet"
    filter="url(#avatarShadow)"
  />
  
  <!-- СЛОЙ 4: ТЕКСТ PHABLOBS -->
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
  
  <!-- СЛОЙ 5: НОМЕР -->
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
  
  <!-- СЛОЙ 6: URL -->
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

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'svg'

    // Поддержка HEAD запросов
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

    console.log(`🚀 Generating Phablob for address: ${address}`)
    
    const svgContent = await generateAvatarSVG(address)

    if (format === 'png') {
      try {
        console.log('🔄 Converting SVG to PNG...')
        
        const pngBuffer = await generateCompositePNG(svgContent)
        
        const fileSizeMB = pngBuffer.length / (1024 * 1024)
        console.log(`📊 PNG size: ${fileSizeMB.toFixed(2)} MB`)
        
        // Сжимаем если больше 5MB
        let finalBuffer = pngBuffer
        if (fileSizeMB > 5) {
          console.log('⚡ Compressing PNG...')
          const sharp = (await import('sharp')).default
          finalBuffer = await sharp(pngBuffer)
            .resize(600, 600, {
              fit: 'inside',
              withoutEnlargement: true
            })
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
        console.error('❌ PNG conversion failed:', error)
        
        // Fallback
        try {
          const sharp = (await import('sharp')).default
          const fallbackSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="800" fill="#8B5CF6"/>
            <text x="400" y="400" text-anchor="middle" fill="white" font-size="24" font-family="Arial">PNG Error</text>
          </svg>`
          
          const fallbackPng = await sharp(Buffer.from(fallbackSVG))
            .png()
            .toBuffer()
          
          return new NextResponse(new Uint8Array(fallbackPng), {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'no-cache',
            },
          })
        } catch (fallbackError) {
          console.error('❌ Fallback failed:', fallbackError)
          return new NextResponse('PNG generation error', { status: 500 })
        }
      }
    }

    // Возвращаем SVG
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('❌ Route handler error:', error)
    
    const format = new URL(request.url).searchParams.get('format') || 'svg'
    
    if (format === 'png') {
      try {
        const sharp = (await import('sharp')).default
        const errorSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="800" fill="#FF6B6B"/>
          <text x="400" y="400" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Error</text>
        </svg>`
        
        const errorPng = await sharp(Buffer.from(errorSVG))
          .png()
          .toBuffer()
        
        return new NextResponse(new Uint8Array(errorPng), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache',
          },
        })
      } catch (pngError) {
        return new NextResponse('Server Error', { status: 500 })
      }
    }
    
    const fallbackSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" fill="#ab0ff2"/>
      <text x="400" y="400" text-anchor="middle" fill="white" font-size="24">Error</text>
    </svg>`
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    })
  }
}
