// app/api/phablob/[address]/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Ваша цветовая система
import {
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Вспомогательные функции (одинаковые с основным роутом) ---
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

// --- Функция для генерации информации о водяных знаках ---
function generateWatermarksInfo(publicKey: string) {
  const hash = generateHash(publicKey)
  const seed = hash
  const texts = ['PHANTOM', 'PHABLOBS', 'SOLANA', 'NFT', 'WEB3', 'CRYPTO']
  const rotations = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30]
  const fontSizes = [32, 36, 40, 44, 48, 52, 56, 60]
  
  const watermarkCount = 8 + (hash % 5)
  let watermarksTexts: string[] = []
  let watermarksStats = {
    count: watermarkCount,
    rotations: new Set<number>(),
    sizes: new Set<number>()
  }
  
  for (let i = 0; i < watermarkCount; i++) {
    const textIndex = (seed + i * 137) % texts.length
    const rotationIndex = (seed + i * 257) % rotations.length
    const fontSizeIndex = (seed + i * 397) % fontSizes.length
    
    watermarksTexts.push(texts[textIndex])
    watermarksStats.rotations.add(rotations[rotationIndex])
    watermarksStats.sizes.add(fontSizes[fontSizeIndex])
  }
  
  const uniqueTexts = [...new Set(watermarksTexts)]
  const rotationTypes = watermarksStats.rotations.size
  const sizeTypes = watermarksStats.sizes.size
  
  return {
    count: watermarkCount,
    uniqueTexts,
    textVariety: uniqueTexts.length,
    rotationVariety: rotationTypes,
    sizeVariety: sizeTypes
  }
}

// --- Основная функция генерации метаданных ---
function generatePhablobMetadata(publicKey: string) {
  const hash = generateHash(publicKey)
  
  // Уникальный HEX номер (синхронизировано с основным роутом)
  const hexHash = hash.toString(16).toUpperCase().padStart(8, '0')
  const phablobNumber = `#${hexHash}`
  
  const useGradient = hash % 2 === 0
  const tokenBalance = 0

  // Информация о водяных знаках
  const watermarksInfo = generateWatermarksInfo(publicKey)
  
  let attributes = []
  let bgType = ""
  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null

  // Генерация цветов как в основном роуте
  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor1
    bgColor2 = result.bgColor2
    bgType = "Gradient"
    
    attributes = [
      { trait_type: "Background Type", value: bgType },
      { trait_type: "Primary Color", value: bgColor },
      { trait_type: "Secondary Color", value: bgColor2 || bgColor },
      { trait_type: "Avatar Color", value: avatarColor }
    ]
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor
    bgType = "Solid"
    
    attributes = [
      { trait_type: "Background Type", value: bgType },
      { trait_type: "Background Color", value: bgColor },
      { trait_type: "Avatar Color", value: avatarColor }
    ]
  }

  // Редкость на основе хэша
  const rarityTiers = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
  const rarityIndex = (hash % 100) < 50 ? 0 : 
                     (hash % 100) < 75 ? 1 : 
                     (hash % 100) < 90 ? 2 : 
                     (hash % 100) < 98 ? 3 : 4
  const rarity = rarityTiers[rarityIndex]
  
  // Сложность водяных знаков
  const watermarkComplexity = watermarksInfo.count > 10 ? "High" : 
                             watermarksInfo.count > 8 ? "Medium" : "Low"
  
  // Основные атрибуты
  attributes.push(
    { trait_type: "Rarity", value: rarity },
    { trait_type: "Serial Number", value: phablobNumber },
    { trait_type: "Generation", value: "1" },
    { trait_type: "Unique Hash", value: hexHash },
    { trait_type: "Watermarks Count", value: watermarksInfo.count.toString() },
    { trait_type: "Watermark Complexity", value: watermarkComplexity },
    { trait_type: "Background Style", value: bgType }
  )
  
  // Дополнительные атрибуты водяных знаков
  if (watermarksInfo.textVariety > 1) {
    attributes.push(
      { trait_type: "Watermark Variety", value: watermarksInfo.textVariety.toString() }
    )
  }

  // Расчет комбинаций
  const avatarColors = 69
  const backgroundTypes = 2 // Solid + Gradient
  const solidBackgrounds = avatarColors
  const gradientBackgrounds = avatarColors * avatarColors
  const totalBackgrounds = solidBackgrounds + gradientBackgrounds
  const watermarksVariations = Math.pow(6, watermarksInfo.count) // 6 возможных текстов
  
  const combinationsCount = avatarColors * totalBackgrounds * watermarksVariations

  // Формирование метаданных
  const metadata = {
    name: `Phablob ${phablobNumber}`,
    symbol: "PHBLB",
    description: `A unique Phantom-inspired avatar generated from Solana wallet address ${publicKey.substring(0, 8)}... Features ${bgType.toLowerCase()} background (${bgColor}${bgColor2 ? ' to ' + bgColor2 : ''}), ${rarity.toLowerCase()} rarity, and ${watermarksInfo.count} dynamic watermarks. One of over 3.3 billion possible combinations.`,
    image: `https://phablobs.xyz/api/phablob/${publicKey}?format=png`,
    external_url: `https://phablobs.xyz/phablob/${publicKey}`,
    seller_fee_basis_points: 500, // 5% royalty
    collection: {
      name: "Phablobs Collection",
      family: "Phablobs"
    },
    attributes: attributes,
    properties: {
      files: [
        {
          uri: `https://phablobs.xyz/api/phablob/${publicKey}?format=png`,
          type: "image/png"
        },
        {
          uri: `https://phablobs.xyz/api/phablob/${publicKey}?format=svg`,
          type: "image/svg+xml"
        }
      ],
      category: "image",
      creators: [
        {
          address: "phablobs.xyz",
          share: 100
        }
      ]
    },
    // Технические детали
    technical_details: {
      algorithm: "Deterministic hash-based generation",
      total_combinations: "3.3B+",
      avatar_colors: avatarColors,
      background_types: {
        solid: solidBackgrounds,
        gradient: gradientBackgrounds,
        total: totalBackgrounds
      },
      watermarks: {
        count: watermarksInfo.count,
        unique_texts: watermarksInfo.uniqueTexts,
        rotation_variety: watermarksInfo.rotationVariety,
        size_variety: watermarksInfo.sizeVariety
      },
      colors: {
        avatar: avatarColor,
        background: bgType === "Gradient" ? [bgColor, bgColor2] : [bgColor]
      }
    }
  }

  return metadata
}

// --- Основной обработчик GET запроса ---
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    if (request.method === 'HEAD') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      )
    }

    console.log(`📊 Generating metadata for Phablob: ${address}`)
    const metadata = generatePhablobMetadata(address)

    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    })

  } catch (error) {
    console.error('❌ Metadata route handler error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    )
  }
}

// --- Обработчик OPTIONS для CORS ---
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
