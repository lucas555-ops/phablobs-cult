import { NextRequest, NextResponse } from 'next/server'

// Validate Solana address
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    // Validate input
    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    // Fetch from Phantom API
    const phantomUrl = `https://avatar.phantom.app/${address}`
    
    const response = await fetch(phantomUrl, {
      headers: {
        'User-Agent': 'Phablobs-Cult/1.0',
      },
      // Cache на 1 год - аватары не меняются
      next: { revalidate: 31536000 }
    })

    if (!response.ok) {
      throw new Error('Phantom API failed')
    }

    const svgContent = await response.text()

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error fetching Phantom avatar:', error)

    // Fallback: простой градиент если Phantom API недоступен
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad">
      <stop offset="0%" stop-color="#00fff0"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#000"/>
  <circle cx="200" cy="200" r="150" fill="url(#grad)" opacity="0.8"/>
</svg>`

    return new NextResponse(fallbackSVG, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
}
