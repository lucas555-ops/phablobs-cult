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

function generatePhablobMetadata(publicKey: string) {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  const useGradient = hash % 2 === 0
  const tokenBalance = 0

  let attributes = []
  
  // Генерируем цвета как у вас в основном коде
  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null

  if (useGradient) {
    const result = generateGradientFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor1
    bgColor2 = result.bgColor2
    
    attributes = [
      { trait_type: "Background Type", value: "Gradient" },
      { trait_type: "Primary Color", value: bgColor },
      { trait_type: "Secondary Color", value: bgColor2 },
      { trait_type: "Avatar Color", value: avatarColor }
    ]
  } else {
    const result = generateSolidBgFromBalance(publicKey, tokenBalance)
    avatarColor = result.avatarColor
    bgColor = result.bgColor
    
    attributes = [
      { trait_type: "Background Type", value: "Solid" },
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
  
  attributes.push(
    { trait_type: "Rarity", value: rarity },
    { trait_type: "Serial Number", value: phablobNumber },
    { trait_type: "Generation", value: "1" }
  )

  const metadata = {
    name: `Phablob #${phablobNumber}`,
    symbol: "PHBLB",
    description: `A unique Phablob NFT generated from Solana address. Rarity: ${rarity}`,
    image: `https://www.phablobs.xyz/api/phablob/${publicKey}?format=png`,
    external_url: `https://www.phablobs.xyz/phablob/${publicKey}`,
    attributes: attributes,
    properties: {
      files: [
        {
          uri: `https://www.phablobs.xyz/api/phablob/${publicKey}?format=png`,
          type: "image/png"
        }
      ],
      category: "image",
      creators: [
        {
          address: "phablobs.xyz",
          share: 100
        }
      ]
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
