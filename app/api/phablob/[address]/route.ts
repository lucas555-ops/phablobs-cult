// app/api/phablob/[address]/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Ваша цветовая система
import {
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Вспомогательные функции ---
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

// --- НОВАЯ ФУНКЦИЯ: Генерация водяных знаков на основе хэша ---
function generateWatermarksInfo(publicKey: string) {
  const hash = generateHash(publicKey)
  
  // Используем хэш как seed для генерации
  const seed = hash
  const texts = ['PHANTOM', 'PHABLOBS', 'SOLANA', 'NFT', 'WEB3', 'CRYPTO']
  const rotations = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30]
  const fontSizes = [32, 36, 40, 44, 48, 52, 56, 60]
  
  // Генерируем 8-12 водяных знаков
  const watermarkCount = 8 + (hash % 5)
  let watermarksTexts: string[] = []
  let watermarksStats = {
    count: watermarkCount,
    rotations: new Set<number>(),
    sizes: new Set<number>()
  }
  
  for (let i = 0; i < watermarkCount; i++) {
    // Используем разные части хэша для разных параметров
    const textIndex = (seed + i * 137) % texts.length
    const rotationIndex = (seed + i * 257) % rotations.length
    const fontSizeIndex = (seed + i * 397) % fontSizes.length
    
    watermarksTexts.push(texts[textIndex])
    watermarksStats.rotations.add(rotations[rotationIndex])
    watermarksStats.sizes.add(fontSizes[fontSizeIndex])
  }
  
  // Уникальные значения
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

function generatePhablobMetadata(publicKey: string) {
  const hash = generateHash(publicKey)
  
  // УНИКАЛЬНЫЙ HEX номер (синхронизировано с основным файлом)
  const hexHash = hash.toString(16).toUpperCase().padStart(8, '0')
  const phablobNumber = `#${hexHash}` // Пример: #1A3F5C7E
  
  const useGradient = hash % 2 === 0
  const tokenBalance = 0

  // Получаем информацию о водяных знаках
  const watermarksInfo = generateWatermarksInfo(publicKey)
  
  let attributes = []
  let bgType = ""
  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null

  // Генерируем цвета как в основном файле
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

  // Дополнительные атрибуты на основе хэша
  const rarityTiers = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
  const rarityIndex = (hash % 100) < 50 ? 0 : 
                     (hash % 100) < 75 ? 1 : 
                     (hash % 100) < 90 ? 2 : 
                     (hash % 100) < 98 ? 3 : 4
  const rarity = rarityTiers[rarityIndex]
  
  // Атрибут "Watermark Complexity"
  const watermarkComplexity = watermarksInfo.count > 10 ? "High" : 
                             watermarksInfo.count > 8 ? "Medium" : "Low"
  
  attributes.push(
    { trait_type: "Rarity", value: rarity },
    { trait_type: "Serial Number", value: phablobNumber },
    { trait_type: "Generation", value: "1" },
    { trait_type: "Unique Hash", value: hexHash },
    { trait_type: "Watermarks Count", value: watermarksInfo.count.toString() },
    { trait_type: "Watermark Complexity", value: watermarkComplexity },
    { trait_type: "Background Style", value: bgType }
  )
  
  // Добавляем атрибуты для водяных знаков (если нужно больше деталей)
  if (watermarksInfo.textVariety > 1) {
    attributes.push(
      { trait_type: "Watermark Variety", value: watermarksInfo.textVariety.toString() }
    )
  }

  // Статистика комбинаций для описания
  const combinationsCount = Math.floor(hash % 1000000000) + 1000000000
  
  const metadata = {
    name: `Phablob ${phablobNumber}`,
    symbol: "PHBLB",
    description: `A unique Phantom-inspired avatar generated from Solana wallet address. ` +
                `Features ${bgType.toLowerCase()} background, ${rarity.toLowerCase()} rarity, ` +
                `and ${watermarksInfo.count} dynamic watermarks. ` +
                `One of ${combinationsCount.toLocaleString()} possible combinations.`,
    image: `https://www.phablobs.xyz/api/phablob/${publicKey}?format=png`,
    external_url: `https://www.phablobs.xyz/phablob/${publicKey}`,
    seller_fee_basis_points: 500, // 5% royalty
    collection: {
      name: "Phablobs Collection",
      family: "Phablobs"
    },
    attributes: attributes,
    properties: {
      files: [
        {
          uri: `https://www.phablobs.xyz/api/phablob/${publicKey}?format=png`,
          type: "image/png"
        },
        {
          uri: `https://www.phablobs.xyz/api/phablob/${publicKey}?format=svg`,
          type: "image/svg+xml"
        }
      ],
      category: "image",
      creators: [
        {
          address: publicKey, // Original wallet owner
          share: 0
        },
        {
          address: "phablobs.xyz", // Platform
          share: 100
        }
      ]
    },
    // Дополнительная информация для совместимости с рынками
    marketplace_info: {
      marketplace: "phablobs.xyz",
      collection_url: "https://www.phablobs.xyz",
      token_standard: "Metaplex",
      blockchain: "Solana"
    },
    // Технические детали
    technical_details: {
      algorithm: "Deterministic hash-based generation",
      watermarks: {
        count: watermarksInfo.count,
        unique_texts: watermarksInfo.uniqueTexts,
        rotation_variety: watermarksInfo.rotationVariety,
        size_variety: watermarksInfo.sizeVariety
      },
      colors: {
        avatar: avatarColor,
        background: bgType === "Gradient" ? [bgColor, bgColor2] : [bgColor],
        total_variants: 69
      }
    }
  }

  return metadata
}

// --- Основной обработчик запроса для метаданных ---
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Для лучшей поддержки NFT маркетплейсов
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    })

  } catch (error) {
    console.error('❌ Metadata route handler error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { 
        error: 'Failed to generate metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

// --- Обработчик POST для тестирования (опционально) ---
export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address
    
    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const testMode = body.testMode || false
    
    console.log(`🧪 Test metadata generation for: ${address}`)
    const metadata = generatePhablobMetadata(address)
    
    // В тестовом режиме добавляем дополнительную информацию
    if (testMode) {
      const hash = generateHash(address)
      const hexHash = hash.toString(16).toUpperCase().padStart(8, '0')
      
      return NextResponse.json({
        ...metadata,
        debug_info: {
          address_hash: hash,
          hex_hash: hexHash,
          background_type: hash % 2 === 0 ? "Gradient" : "Solid",
          watermarks: generateWatermarksInfo(address),
          combinations_possible: "3.3B+"
        }
      })
    }
    
    return NextResponse.json(metadata)
    
  } catch (error) {
    console.error('❌ POST metadata error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
