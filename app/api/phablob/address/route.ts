import { NextRequest, NextResponse } from 'next/server'

// Validate Solana address
function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Generate deterministic seed from address
function seedFromAddress(addr: string): number {
  let hash = 0
  for (let i = 0; i < addr.length; i++) {
    const char = addr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate colors based on seed
function generateColors(seed: number) {
  const hue = seed % 360
  const saturation = 70 + (seed % 30)
  const lightness = 50 + (seed % 20)

  return {
    c1: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    c2: `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness - 10}%)`
  }
}

// Generate unique blob pattern
function generateBlobPath(seed: number): string {
  const points: number[] = []
  const numPoints = 8
  const baseRadius = 150
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints
    const radiusVariation = (seed + i * 17) % 50
    const radius = baseRadius + radiusVariation
    
    const x = 200 + Math.cos(angle) * radius
    const y = 200 + Math.sin(angle) * radius
    points.push(x, y)
  }

  let pathData = `M ${points[0]} ${points[1]}`
  
  for (let i = 2; i < points.length; i += 2) {
    const nextIndex = (i + 2) % points.length
    const cpx1 = (points[i - 2] + points[i]) / 2
    const cpy1 = (points[i - 1] + points[i + 1]) / 2
    const cpx2 = (points[i] + points[nextIndex]) / 2
    const cpy2 = (points[i + 1] + points[nextIndex + 1]) / 2
    
    pathData += ` Q ${points[i]} ${points[i + 1]}, ${cpx2} ${cpy2}`
  }
  
  pathData += ' Z'
  return pathData
}

// Generate SVG
function generateSVG(seed: number): string {
  const { c1, c2 } = generateColors(seed)
  const blobPath = generateBlobPath(seed)
  
  // Add unique patterns based on seed
  const pattern1Opacity = (seed % 30) / 100 + 0.1
  const pattern2Rotation = seed % 360

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </radialGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${c2}" stop-opacity="0.8" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="400" height="400" fill="#000000"/>
  
  <g transform="translate(0, 0)">
    <path d="${blobPath}" fill="url(#grad1)" filter="url(#glow)" opacity="0.9"/>
    <circle cx="200" cy="200" r="${100 + (seed % 30)}" fill="url(#grad2)" opacity="${pattern1Opacity}"/>
    <circle cx="200" cy="200" r="${80 + (seed % 20)}" fill="none" stroke="${c1}" stroke-width="2" opacity="0.3" transform="rotate(${pattern2Rotation} 200 200)"/>
  </g>
</svg>`
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

    const seed = seedFromAddress(address)
    const svgContent = generateSVG(seed)

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating Phablob:', error)

    // Fallback SVG
    const fallbackSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#000"/>
  <circle cx="200" cy="200" r="100" fill="url(#grad)"/>
  <defs>
    <radialGradient id="grad">
      <stop offset="0%" stop-color="#00fff0"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </radialGradient>
  </defs>
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
