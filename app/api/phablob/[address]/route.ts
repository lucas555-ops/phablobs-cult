// app/api/avatar/phantom/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

// Валидация Solana адреса
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Функция для создания детерминированного хэша
function generateHash(publicKey: string): number {
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

// Функция для создания водяного знака SVG
function createWatermarkSvg(text: string, hash: number): string {
  // Параметры на основе хэша
  const rotation = (hash % 60) - 30 // от -30 до 30 градусов
  const opacity = 0.2 + ((hash >> 4) % 40) / 100 // 0.2-0.6
  const fontSize = 28 + ((hash >> 8) % 12) // 28-40px
  const color = (hash >> 12) % 3 // 0-2
  
  const colors = [
    'rgba(0, 194, 255, 0.7)', // Phantom blue
    'rgba(139, 92, 246, 0.7)', // Purple
    'rgba(255, 255, 255, 0.6)', // White
  ]
  
  return `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold"
        font-size="${fontSize}"
        fill="${colors[color]}"
        fill-opacity="${opacity}"
        filter="url(#shadow)"
        transform="rotate(${rotation}, 200, 200) translate(0, ${fontSize/2})"
      >
        ${text}
      </text>
    </svg>
  `.trim()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    // Валидация входа
    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    // Генерируем хэш для детерминированных параметров
    const hash = generateHash(address)
    
    // Определяем текст водяного знака (может быть на основе адреса)
    const watermarkText = (hash % 10 === 0) 
      ? `PHABLOBS #${(hash % 1000).toString().padStart(3, '0')}`
      : 'PHABLOBS'

    // Путь к шаблону
    const templatePath = path.join(process.cwd(), 'public', 'images', 'phantom-avatar-template.png')
    
    // Проверяем существование шаблона
    try {
      await fs.access(templatePath)
    } catch {
      throw new Error('Template image not found')
    }

    // Читаем шаблон
    const templateBuffer = await fs.readFile(templatePath)
    
    // Создаём водяной знак
    const watermarkSvg = createWatermarkSvg(watermarkText, hash)
    
    // Используем sharp для наложения водяного знака
    const compositeImage = await sharp(templateBuffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          blend: 'over',
        }
      ])
      .png()
      .toBuffer()

    return new NextResponse(compositeImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating Phantom avatar:', error)
    
    // Fallback: генерируем простой SVG с водяным знаком
    const hash = generateHash(params.address || 'fallback')
    const watermarkSvg = createWatermarkSvg('PHABLOBS', hash)
    
    const fallbackSvg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#00C2FF"/>
            <stop offset="100%" stop-color="#8B5CF6"/>
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#grad)" opacity="0.8"/>
        ${watermarkSvg.split('<svg')[1].split('</svg>')[0]}
      </svg>
    `.trim()
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}

// Если не хочешь устанавливать sharp, можно использовать pure SVG версию:
export async function GET_SVG_ONLY(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    const hash = generateHash(address)
    const watermarkText = (hash % 10 === 0) 
      ? `PHABLOBS #${(hash % 1000).toString().padStart(3, '0')}`
      : 'PHABLOBS'
    
    // SVG с использованием шаблона как background image
    const svgContent = `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="phantomPattern" patternUnits="userSpaceOnUse" width="400" height="400">
            <image href="/images/phantom-avatar-template.png" width="400" height="400"/>
          </pattern>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
          </filter>
        </defs>
        
        <!-- Фон с Phantom аватаром -->
        <rect width="400" height="400" fill="url(#phantomPattern)"/>
        
        <!-- Водяной знак -->
        <text 
          x="200" 
          y="200" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-weight="bold"
          font-size="${28 + ((hash >> 8) % 12)}"
          fill="${(hash >> 12) % 3 === 0 ? '#00C2FF' : (hash >> 12) % 3 === 1 ? '#8B5CF6' : 'white'}"
          fill-opacity="${0.2 + ((hash >> 4) % 40) / 100}"
          filter="url(#shadow)"
          transform="rotate(${(hash % 60) - 30}, 200, 200)"
        >
          ${watermarkText}
        </text>
      </svg>
    `.trim()

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generating SVG avatar:', error)
    
    const fallbackSvg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="#8b5cf6" opacity="0.7"/>
        <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="32" fill="white" opacity="0.5">PHABLOBS</text>
      </svg>
    `
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
