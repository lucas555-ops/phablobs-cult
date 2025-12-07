import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'

// Импортируем цветовую систему
import { 
  getAvailableColors, 
  getTierInfo, 
  generateGradientFromBalance,
  generateSolidBgFromBalance,
  COLOR_TIERS 
} from '@/lib/color-tiers'

// НАСТРОЙКИ ТОКЕНА $BLOB
const TOKEN_MINT = process.env.BLOB_TOKEN_MINT || 'TBA_AFTER_PUMPFUN_LAUNCH'
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

// Кэш для base64 аватаров (чтобы не скачивать повторно)
const avatarCache: Record<string, string> = {}

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

// Получить баланс токена $BLOB
async function getTokenBalance(walletAddress: string): Promise<number> {
  if (TOKEN_MINT === 'TBA_AFTER_PUMPFUN_LAUNCH') {
    return 0
  }
  
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed')
    const walletPubkey = new PublicKey(walletAddress)
    const mintPubkey = new PublicKey(TOKEN_MINT)
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    )
    
    if (tokenAccounts.value.length === 0) {
      return 0
    }
    
    const balance = tokenAccounts.value.reduce((total, account) => {
      const amount = account.account.data.parsed.info.tokenAmount.uiAmount || 0
      return total + amount
    }, 0)
    
    return balance
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return 0
  }
}

// Функция для получения аватара как base64
async function getBlobAvatarBase64(color: string): Promise<string> {
  const cleanColor = color.replace('#', '')
  const cacheKey = `avatar-${cleanColor}`
  
  // Проверяем кэш
  if (avatarCache[cacheKey]) {
    return avatarCache[cacheKey]
  }
  
  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  
  try {
    console.log(`⬇️ Downloading avatar: ${cleanColor}`)
    const response = await fetch(avatarUrl)
    
    if (!response.ok) {
      console.error(`Failed to fetch avatar ${cleanColor}: ${response.status}`)
      throw new Error(`Avatar not found: ${cleanColor}`)
    }
    
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`
    
    // Сохраняем в кэш
    avatarCache[cacheKey] = dataUrl
    console.log(`✅ Avatar cached: ${cleanColor} (${base64.length} bytes)`)
    
    return dataUrl
  } catch (error) {
    console.error(`Error fetching avatar for color ${color}:`, error)
    
    // Fallback: создаём простой цветной круг
    const fallbackSvg = `<svg width="360" height="360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.4"/>
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="180" cy="180" r="150" fill="url(#grad)" filter="url(#shadow)"/>
      <circle cx="180" cy="180" r="80" fill="white" opacity="0.15"/>
    </svg>`
    
    const fallbackDataUrl = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`
    avatarCache[cacheKey] = fallbackDataUrl
    
    return fallbackDataUrl
  }
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

// Генерация SVG с встроенным base64 аватаром
async function generateAvatarSVG(publicKey: string, tokenBalance: number): Promise<string> {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  const useGradient = hash % 2 === 0
  
  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null
  let tier: number
  let tierName: string
  
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor1
    bgColor2 = result.bgColor2
    tier = result.tier
    tierName = result.tierName
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor
    tier = result.tier
    tierName = result.tierName
  }
  
  const tierInfo = getTierInfo(tokenBalance)
  
  // Получаем аватар как base64
  const blobAvatarDataUrl = await getBlobAvatarBase64(avatarColor)
  
  console.log(`🎨 Generated Phablob #${phablobNumber}`)
  console.log(`💰 Balance: ${tokenBalance.toLocaleString()} $BLOB`)
  console.log(`⭐ Tier ${tier}: ${tierName}`)
  console.log(`🎨 Using color: ${avatarColor}`)
  
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
  
  <!-- СЛОЙ 3: АВАТАР (встроенный как base64) -->
  <image 
    href="${blobAvatarDataUrl}" 
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
  
  <!-- СЛОЙ 6: TIER BADGE -->
  ${tier > 1 ? `
  <g transform="translate(650, 50)">
    <circle cx="0" cy="0" r="40" fill="rgba(0,0,0,0.5)"/>
    <text 
      x="0" 
      y="8" 
      text-anchor="middle" 
      font-family="Arial, sans-serif" 
      font-weight="900" 
      font-size="24" 
      fill="${tier === 4 ? '#FFD700' : tier === 3 ? '#FF69B4' : '#00FFFF'}"
    >
      T${tier}
    </text>
  </g>
  ` : ''}
  
  <!-- СЛОЙ 7: URL -->
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

    // Поддержка HEAD запросов для проверки доступности
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
    
    const tokenBalance = await getTokenBalance(address)
    const svgContent = await generateAvatarSVG(address, tokenBalance)

    if (format === 'png') {
      try {
        console.log('🔄 Converting SVG to PNG...')
        
        const pngBuffer = await generateCompositePNG(svgContent)
        
        const fileSizeMB = pngBuffer.length / (1024 * 1024)
        console.log(`📊 PNG size: ${fileSizeMB.toFixed(2)} MB`)
        
        // Если файл слишком большой для Telegram, сжимаем
        let finalBuffer = pngBuffer
        if (fileSizeMB > 5) {
          console.log('⚡ Compressing PNG for Telegram...')
          const sharp = (await import('sharp')).default
          finalBuffer = await sharp(pngBuffer)
            .resize(600, 600, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .png({ quality: 90 })
            .toBuffer()
        }
        
        // ✅ ВОЗВРАЩАЕМ БИНАРНЫЕ ДАННЫЕ (НЕ BASE64!)
        return new NextResponse(finalBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="phablob-${address.substring(0, 8)}.png"`,
            'Content-Length': finalBuffer.length.toString()
          },
        })
        
      } catch (error) {
        console.error('❌ PNG conversion failed:', error)
        
        // Fallback: создаем простую PNG
        try {
          const sharp = (await import('sharp')).default
          const fallbackSVG = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
            <rect width="800" height="800" fill="#8B5CF6"/>
            <text x="400" y="400" text-anchor="middle" fill="white" font-size="24" font-family="Arial">PNG Error</text>
          </svg>`
          
          const fallbackPng = await sharp(Buffer.from(fallbackSVG))
            .png()
            .toBuffer()
          
          return new NextResponse(fallbackPng, {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'no-cache',
            },
          })
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
          return new NextResponse('PNG generation error', { status: 500 })
        }
      }
    }

    // Возвращаем SVG по умолчанию
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
        
        return new NextResponse(errorPng, {
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
