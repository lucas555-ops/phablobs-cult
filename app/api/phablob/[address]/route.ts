// app/api/phablob/[address]/route.ts
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

// --- Инициализация WASM для рендеринга PNG (Один раз) ---
let wasmInitialized = false
async function initializeWasm() {
  if (!wasmInitialized) {
    const wasmUrl = 'https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
    console.log('⬇️ Initializing Resvg WASM engine...')
    try {
      const wasmBuffer = await fetch(wasmUrl).then(res => res.arrayBuffer())
      await initWasm(wasmBuffer)
      wasmInitialized = true
      console.log('✅ Resvg WASM engine ready.')
    } catch (error) {
      console.error('❌ Failed to initialize Resvg WASM:', error)
      throw error
    }
  }
}

// --- Вспомогательные функции (оставлены ваши оригинальные) ---
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
  const tokenBalance = 0 // Проверка баланса отключена
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

  // Приоритет: локальный файл (быстрее и надежнее)
  try {
    if (fs.existsSync(localPath)) {
      const buf = fs.readFileSync(localPath)
      return `data:image/png;base64,${buf.toString('base64')}`
    }
  } catch (e) {
    console.warn('⚠️ Could not read local avatar, trying remote:', e.message)
  }

  // Фолбэк: загрузка с Vercel (оригинальное поведение)
  const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
  console.log(`⬇️ Downloading remote avatar: ${avatarUrl}`)
  try {
    const resp = await fetch(avatarUrl)
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    }
    const arr = await resp.arrayBuffer()
    return `data:image/png;base64,${Buffer.from(arr).toString('base64')}`
  } catch (error) {
    console.error('❌ Failed to fetch avatar:', error)
    throw new Error(`Could not load avatar for color ${color}`)
  }
}

// --- Генерация полного SVG с текстом (основная логика сайта) ---
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

  const avatarBase64 = await getAvatarBase64(avatarColor)
  console.log(`🎨 Generating Phablob #${phablobNumber} (${useGradient ? 'gradient' : 'solid'})`)

  // Шрифт DejaVu Sans Bold в Base64 (необходим для корректного PNG)
  const DEJAVU_SANS_BOLD_BASE64 = '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'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Встроенный шрифт DejaVu Sans Bold (для PNG) -->
    <style type="text/css">
      @font-face {
        font-family: 'DejaVu Sans';
        font-weight: 900;
        src: url('data:application/font-woff2;charset=utf-8;base64,${DEJAVU_SANS_BOLD_BASE64}') format('woff2');
      }
    </style>
    
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
  <text font-family="DejaVu Sans, Roboto, sans-serif" font-weight="900" fill="white" opacity="0.07">
    <tspan x="100" y="150" font-size="48" transform="rotate(-15 100 150)">PHANTOM</tspan>
    <tspan x="600" y="200" font-size="42" transform="rotate(12 600 200)">PHANTOM</tspan>
    <tspan x="50" y="500" font-size="52" transform="rotate(-8 50 500)">PHANTOM</tspan>
    <tspan x="550" y="650" font-size="45" transform="rotate(18 550 650)">PHANTOM</tspan>
    <tspan x="200" y="80" font-size="56" transform="rotate(8 200 80)">PHABLOBS</tspan>
    <tspan x="120" y="380" font-size="50" transform="rotate(15 120 380)">PHABLOBS</tspan>
    <tspan x="580" y="480" font-size="44" transform="rotate(-10 580 480)">PHABLOBS</tspan>
  </text>
  
  <!-- АВАТАР -->
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
    font-family="DejaVu Sans, Roboto, sans-serif" 
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
    font-family="DejaVu Sans, Roboto, sans-serif" 
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
    font-family="DejaVu Sans, Roboto, sans-serif" 
    font-size="18" 
    fill="white" 
    opacity="0.9"
  >
    phablobs.xyz
  </text>
</svg>`
}

// --- Основной обработчик запроса ---
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
    const svgContent = await generateCompleteSVG(address)

    // Рендеринг PNG
    if (format === 'png') {
      try {
        await initializeWasm() // Убедимся, что WASM инициализирован

        const resvg = new Resvg(svgContent, {
          fitTo: { mode: 'width', value: 800 },
          font: {
            loadSystemFonts: false, // Используем встроенный шрифт
          },
        })

        const pngData = resvg.render()
        const pngBuffer = pngData.asPng()

        console.log(`✅ PNG rendered: ${pngBuffer.length} bytes`)
        return new NextResponse(new Uint8Array(pngBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': `inline; filename="phablob-${address.substring(0, 8)}.png"`,
            'Content-Length': pngBuffer.length.toString()
          }
        })
      } catch (err) {
        console.error('❌ PNG render failed:', err)
        return new NextResponse('PNG generation error', { status: 500 })
      }
    }

    // Возвращаем SVG
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })

  } catch (error) {
    console.error('❌ Route handler error:', error)
    return new NextResponse('Server Error', { status: 500 })
  }
}
