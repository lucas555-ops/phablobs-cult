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
      // ИСПРАВЛЕНО: безопасная обработка ошибки
      console.error('❌ Failed to initialize Resvg WASM:', error instanceof Error ? error.message : String(error))
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

// --- НОВАЯ ФУНКЦИЯ: Генерация водяных знаков на основе хэша ---
function generateWatermarks(publicKey: string) {
  const hash = generateHash(publicKey)
  const watermarks = []
  
  // Используем хэш как seed для генерации
  const seed = hash
  const texts = ['PHANTOM', 'PHABLOBS', 'SOLANA', 'NFT', 'WEB3', 'CRYPTO']
  const rotations = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30]
  const fontSizes = [32, 36, 40, 44, 48, 52, 56, 60]
  const opacities = [0.03, 0.04, 0.05, 0.06, 0.07, 0.08]
  
  // Генерируем 8-12 водяных знаков
  const watermarkCount = 8 + (hash % 5)
  
  for (let i = 0; i < watermarkCount; i++) {
    // Используем разные части хэша для разных параметров
    const textIndex = (seed + i * 137) % texts.length
    const rotationIndex = (seed + i * 257) % rotations.length
    const fontSizeIndex = (seed + i * 397) % fontSizes.length
    const opacityIndex = (seed + i * 521) % opacities.length
    
    // Позиции тоже на основе хэша
    const x = 50 + ((seed + i * 619) % 700) // 50-750
    const y = 50 + ((seed + i * 733) % 700) // 50-750
    
    watermarks.push({
      text: texts[textIndex],
      x,
      y,
      rotation: rotations[rotationIndex],
      fontSize: fontSizes[fontSizeIndex],
      opacity: opacities[opacityIndex]
    })
  }
  
  return watermarks
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
  } catch (error) {
    // ИСПРАВЛЕНО: безопасная обработка ошибки
    console.warn('⚠️ Could not read local avatar, trying remote:', error instanceof Error ? error.message : String(error))
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
    // ИСПРАВЛЕНО: безопасная обработка ошибки
    console.error('❌ Failed to fetch avatar:', error instanceof Error ? error.message : String(error))
    throw new Error(`Could not load avatar for color ${color}`)
  }
}

// --- Генерация полного SVG с текстом (основная логика сайта) ---
async function generateCompleteSVG(publicKey: string): Promise<string> {
  const hash = generateHash(publicKey)
  
  // УНИКАЛЬНЫЙ HEX номер (4.3 миллиарда комбинаций)
  const hexHash = hash.toString(16).toUpperCase().padStart(8, '0')
  const phablobNumber = `#${hexHash}` // Пример: #1A3F5C7E
  
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
  console.log(`🎨 Generating Phablob ${phablobNumber} (${useGradient ? 'gradient' : 'solid'})`)

  // Генерируем динамические водяные знаки
  const watermarks = generateWatermarks(publicKey)

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
  
  <!-- ДИНАМИЧЕСКИЕ ВОДЯНЫЕ ЗНАКИ -->
  ${watermarks.map(w => `
    <text 
      x="${w.x}" 
      y="${w.y}" 
      font-family="DejaVu Sans, Roboto, sans-serif" 
      font-weight="900" 
      font-size="${w.fontSize}" 
      fill="white" 
      opacity="${w.opacity}"
      transform="rotate(${w.rotation} ${w.x} ${w.y})"
    >
      ${w.text}
    </text>
  `).join('')}
  
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
  
  <!-- УНИКАЛЬНЫЙ HEX НОМЕР -->
  <text 
    x="400" 
    y="720" 
    text-anchor="middle" 
    font-family="DejaVu Sans, Roboto, sans-serif" 
    font-weight="900" 
    font-size="46" 
    fill="white" 
    filter="url(#textShadow)" 
    letter-spacing="3"
  >
    ${phablobNumber}
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
      } catch (error) {
        // ИСПРАВЛЕНО: безопасная обработка ошибки
        console.error('❌ PNG render failed:', error instanceof Error ? error.message : String(error))
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
    // ИСПРАВЛЕНО: безопасная обработка ошибки
    console.error('❌ Route handler error:', error instanceof Error ? error.message : String(error))
    return new NextResponse('Server Error', { status: 500 })
  }
}
