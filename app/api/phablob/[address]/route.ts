// app/api/bot-phablob/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Resvg, initWasm } from '@resvg/resvg-wasm'

// Ваша цветовая система (оставлена как есть)
import { 
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Инициализируем WASM один раз
let wasmInitialized = false

async function initializeResvg() {
  if (!wasmInitialized) {
    // Динамически загружаем WASM-файл по его URL на CDN
    const wasmUrl = 'https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
    console.log(`⬇️ Loading WASM for bot...`)
    const wasmBuffer = await fetch(wasmUrl).then(res => res.arrayBuffer())
    await initWasm(wasmBuffer)
    wasmInitialized = true
  }
}

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

async function getAvatarBase64(color: string): Promise<string> {
  const cleanColor = color.replace('#', '').toLowerCase()
  const localPath = path.join(process.cwd(), 'public', 'avatars', `blob-avatar-${cleanColor}.png`)
  try {
    if (fs.existsSync(localPath)) {
      const buf = fs.readFileSync(localPath)
      return `data:image/png;base64,${buf.toString('base64')}`
    }
  } catch (e) {
    console.warn('Local avatar read failed:', e)
  }

  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  console.log(`⬇️ Downloading avatar (fallback): ${avatarUrl}`)
  const resp = await fetch(avatarUrl)
  if (!resp.ok) {
    throw new Error(`Failed to fetch avatar: ${resp.status}`)
  }
  const arr = await resp.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(arr).toString('base64')}`
}

async function generateSimpleSVG(publicKey: string): Promise<string> {
  const hash = generateHash(publicKey)

  const useGradient = hash % 2 === 0
  const tokenBalance = 0

  let avatarColor: string
  let bgColor: string
  let bgColor2: string | null = null

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

  const avatarBase64 = await getAvatarBase64(avatarColor)

  console.log(`🤖 Generating bot Phablob (simple version)`)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${bgColor2 ? `
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${bgColor2}" stop-opacity="1"/>
    </linearGradient>
    ` : ''}
    
    <filter id="avatarShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="black" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <!-- ФОН -->
  <rect width="512" height="512" fill="${bgColor2 ? 'url(#bgGrad)' : bgColor}"/>
  
  <!-- АВАТАР -->
  <image 
    href="${avatarBase64}" 
    x="140" 
    y="140" 
    width="232" 
    height="232"
    preserveAspectRatio="xMidYMid meet"
    filter="url(#avatarShadow)"
  />
</svg>`
}

export async function GET(
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

    console.log(`🤖 Generating bot Phablob for: ${address}`)
    
    const svgContent = await generateSimpleSVG(address)

    try {
      // Инициализируем WASM перед использованием
      await initializeResvg()
      
      // Render SVG -> PNG с WASM версией
      const resvg = new Resvg(svgContent, {
        fitTo: { mode: 'width', value: 512 },
        font: {
          loadSystemFonts: false,
        },
      })

      const pngData = resvg.render()
      const pngBuffer = pngData.asPng()

      console.log(`✅ Bot PNG generated: ${pngBuffer.length} bytes`)

      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Disposition': `inline; filename="bot-phablob-${address.substring(0,8)}.png"`,
          'Content-Length': pngBuffer.length.toString()
        }
      })
    } catch (err) {
      console.error('❌ Bot PNG render failed:', err)
      return new NextResponse('PNG generation error', { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Error in bot endpoint:', error)
    return new NextResponse('Server Error', { status: 500 })
  }
}
