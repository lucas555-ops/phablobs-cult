// app/api/phablob/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Resvg } from '@resvg/resvg-js'

// Ваша цветовая система (оставлена как есть)
import { 
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

/**
 * Try local /public/avatars first, then fallback to existing external URL.
 * Returns data URI `data:image/png;base64,...`
 */
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

  // fallback to external hosting (preserve original behavior)
  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  console.log(`⬇️ Downloading avatar (fallback): ${avatarUrl}`)
  const resp = await fetch(avatarUrl)
  if (!resp.ok) {
    throw new Error(`Failed to fetch avatar: ${resp.status}`)
  }
  const arr = await resp.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(arr).toString('base64')}`
}

async function generateCompleteSVG(publicKey: string): Promise<string> {
  const hash = generateHash(publicKey)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')

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

  // Получаем base64 аватар (локально или внешне)
  const avatarBase64 = await getAvatarBase64(avatarColor)

  console.log(`🎨 Generating Phablob #${phablobNumber}`)

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
    
    <filter id="avatarShadow">
      <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="black" flood-opacity="0.6"/>
    </filter>
  </defs>
  
  <!-- ФОН -->
  <rect width="800" height="800" fill="${bgColor2 ? 'url(#bgGrad)' : bgColor}"/>
  
  <!-- ВОДЯНЫЕ ЗНАКИ -->
  <text x="100" y="150" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  
  <text x="200" y="80" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="120" y="380" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="DejaVu Sans, sans-serif" font-weight="900" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  
  <!-- АВАТАР (BASE64!) -->
  <image 
    href="${avatarBase64}" 
    x="220" 
    y="220" 
    width="360" 
    height="360"
    preserveAspectRatio="xMidYMid meet"
    filter="url(#avatarShadow)"
  />
  
  <!-- ТЕКСТ PHABLOBS -->
  <text 
    x="400" 
    y="90" 
    text-anchor="middle" 
    font-family="DejaVu Sans, sans-serif" 
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
    font-family="DejaVu Sans, sans-serif" 
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
    font-family="DejaVu Sans, sans-serif" 
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
    // format: svg | png
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
    
    // Генерируем полный SVG с base64 аватаром
    const svgContent = await generateCompleteSVG(address)

    if (format === 'png') {
      try {
        // Render SVG -> PNG with resvg
        const resvg = new Resvg(svgContent, {
          fitTo: { mode: 'width', value: 800 }
        })

        const pngData = resvg.render()
        const pngBuffer = pngData.asPng()

        // Return PNG buffer
        return new NextResponse(new Uint8Array(pngBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="phablob-${address.substring(0,8)}.png"`,
            'Content-Length': pngBuffer.length.toString()
          }
        })
      } catch (err) {
        console.error('❌ PNG render failed:', err)
        return new NextResponse('PNG generation error', { status: 500 })
      }
    }

    // Возвращаем SVG (для сайта)
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return new NextResponse('Server Error', { status: 500 })
  }
}
