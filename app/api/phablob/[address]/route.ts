// app/api/avatar/phantom/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generatePhantomStyleAvatar } from '@/lib/phantom-fallback'

// Валидация Solana адреса
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
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

    // Используем твой существующий генератор
    const svgContent = generatePhantomStyleAvatar(address)

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating Phantom avatar:', error)
    
    // Fallback простой аватар
    const fallbackSVG = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="180" fill="#8b5cf6" opacity="0.7" />
      </svg>
    `
    
    return new NextResponse(fallbackSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
