import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Импортируем цветовую систему
import { 
  getAvailableColors, 
  getTierInfo, 
  generateGradientFromBalance,
  COLOR_TIERS 
} from '@/lib/color-tiers'

// НАСТРОЙКИ ТОКЕНА $BLOB
const TOKEN_MINT = process.env.BLOB_TOKEN_MINT || 'TBA_AFTER_PUMPFUN_LAUNCH'
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'

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
  // Если токен еще не создан, возвращаем 0
  if (TOKEN_MINT === 'TBA_AFTER_PUMPFUN_LAUNCH') {
    return 0
  }
  
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed')
    const walletPubkey = new PublicKey(walletAddress)
    const mintPubkey = new PublicKey(TOKEN_MINT)
    
    // Получаем токен аккаунты кошелька
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    )
    
    if (tokenAccounts.value.length === 0) {
      return 0
    }
    
    // Суммируем баланс по всем аккаунтам
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

// Кэш аватаров
const cachedAvatars: Record<string, string> = {}

function getBlobAvatarDataUrl(color: string): string {
  // Убираем # из цвета
  const cleanColor = color.replace('#', '')
  const avatarName = `blob-avatar-${cleanColor}.png`
  const avatarPath = join(process.cwd(), 'public', 'avatars', avatarName)
  
  // Проверяем кэш
  if (cachedAvatars[avatarName]) {
    return cachedAvatars[avatarName]
  }
  
  // Пытаемся загрузить конкретный аватар
  if (existsSync(avatarPath)) {
    try {
      const avatarBuffer = readFileSync(avatarPath)
      const base64 = avatarBuffer.toString('base64')
      cachedAvatars[avatarName] = `data:image/png;base64,${base64}`
      return cachedAvatars[avatarName]
    } catch (error) {
      console.error(`Error loading ${avatarName}:`, error)
    }
  }
  
  // Fallback: пытаемся найти любой аватар в папке
  const avatarsDir = join(process.cwd(), 'public', 'avatars')
  if (existsSync(avatarsDir)) {
    try {
      const files = require('fs').readdirSync(avatarsDir)
      const pngFiles = files.filter((f: string) => f.endsWith('.png'))
      
      if (pngFiles.length > 0) {
        // Берем первый найденный файл как fallback
        const fallbackName = pngFiles[0]
        const fallbackPath = join(avatarsDir, fallbackName)
        const avatarBuffer = readFileSync(fallbackPath)
        const base64 = avatarBuffer.toString('base64')
        return `data:image/png;base64,${base64}`
      }
    } catch (error) {
      console.error('Error loading fallback avatar:', error)
    }
  }
  
  throw new Error(`No avatar found for color ${color}. Make sure files are in /public/avatars/`)
}

function generateAvatarSVG(publicKey: string, tokenBalance: number): string {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  // Получаем 3 цвета: аватар + 2 для фона
  const { avatarColor, bgColor1, bgColor2, tier, tierName } = generateGradientFromBalance(publicKey, tokenBalance)
  const tierInfo = getTierInfo(tokenBalance)
  
  // Выбираем аватар по цвету аватара
  const blobAvatarDataUrl = getBlobAvatarDataUrl(avatarColor)
  
  console.log(`🎨 Phablob #${phablobNumber}`)
  console.log(`💰 Balance: ${tokenBalance.toLocaleString()} $BLOB`)
  console.log(`⭐ Tier ${tier}: ${tierName}`)
  console.log(`🎨 Colors unlocked: ${tierInfo.unlockedColors}/69`)
  console.log(`👻 Avatar: ${avatarColor}`)
  console.log(`🌈 Background: ${bgColor1} → ${bgColor2}`)
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor1}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bgColor2}" stop-opacity="1"/>
    </linearGradient>
    
    <!-- Градиент для рамки (зависит от tier) -->
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${tier === 4 ? '#FFD700' : tier === 3 ? '#FF69B4' : tier === 2 ? '#00FFFF' : '#a1a1a1'}" />
      <stop offset="100%" stop-color="${tier === 4 ? '#ff7f00' : tier === 3 ? '#e31eff' : tier === 2 ? '#0087f5' : '#5e5e5e'}" />
    </linearGradient>
    
    <filter id="textShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.3"/>
    </filter>
    
    <filter id="avatarShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="black" flood-opacity="0.5"/>
    </filter>
    
    <filter id="frameGlow">
      <feGaussianBlur stdDeviation="8"/>
      <feColorMatrix type="saturate" values="1.5"/>
    </filter>
    
    <!-- Круглая маска для аватара -->
    <clipPath id="avatarClip">
      <circle cx="400" cy="400" r="180"/>
    </clipPath>
  </defs>
  
  <!-- СЛОЙ 1: ГРАДИЕНТНЫЙ ФОН -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- СЛОЙ 2: ВОДЯНЫЕ ЗНАКИ -->
  <text x="100" y="150" font-family="Arial, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="Arial, sans-serif" font-weight="900" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  
  <text x="200" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="120" y="380" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  
  <!-- СЛОЙ 2.5: ПРЕМИАЛЬНАЯ РАМКА -->
  
  <!-- Внешнее свечение -->
  <circle 
    cx="400" 
    cy="400" 
    r="215" 
    fill="url(#frameGrad)"
    opacity="${tier > 1 ? '0.3' : '0.2'}"
    filter="url(#frameGlow)"
  />
  
  <!-- Градиентное кольцо (основная рамка) -->
  <circle 
    cx="400" 
    cy="400" 
    r="210" 
    fill="none"
    stroke="url(#frameGrad)"
    stroke-width="${tier === 4 ? '14' : tier === 3 ? '12' : tier === 2 ? '10' : '8'}"
    opacity="${tier > 1 ? '0.9' : '0.7'}"
  />
  
  <!-- Белое разделительное кольцо -->
  <circle 
    cx="400" 
    cy="400" 
    r="198" 
    fill="none"
    stroke="rgba(255,255,255,0.6)"
    stroke-width="2"
  />
  
  <!-- Темная круглая подложка -->
  <circle 
    cx="400" 
    cy="400" 
    r="195" 
    fill="rgba(0,0,0,0.4)"
  />
  
  <!-- СЛОЙ 3: АВАТАР (обрезан в круг) -->
  <image 
    href="${blobAvatarDataUrl}" 
    x="220" 
    y="220" 
    width="360" 
    height="360"
    preserveAspectRatio="xMidYMid meet"
    clip-path="url(#avatarClip)"
    filter="url(#avatarShadow)"
  />
  
  <!-- Внутренняя светлая обводка аватара -->
  <circle 
    cx="400" 
    cy="400" 
    r="180" 
    fill="none" 
    stroke="rgba(255,255,255,0.3)" 
    stroke-width="3"
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
  
  <!-- СЛОЙ 6: TIER BADGE (если tier 2+) -->
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

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      )
    }

    // Получаем баланс токена
    const tokenBalance = await getTokenBalance(address)
    
    // Генерируем SVG с учетом баланса
    const svgContent = generateAvatarSVG(address, tokenBalance)

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
  <rect width="800" height="800" fill="#ab0ff2"/>
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
