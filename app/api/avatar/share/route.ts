import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { publicKey, avatarUrl } = await request.json()
    
    if (!publicKey) {
      return NextResponse.json({ error: 'Public key required' }, { status: 400 })
    }
    
    // Генерация уникального номера
    let hash = 0
    for (let i = 0; i < publicKey.length; i++) {
      hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
      hash = hash & hash
    }
    const phablobNumber = (Math.abs(hash) % 9999).toString().padStart(4, '0')
    
    // Текст для Twitter
    const tweetText = `I just revealed my Phablobs avatar #${phablobNumber}! 🎭

Each Phantom wallet gets a unique official avatar with exclusive Phablobs background.

Reveal yours 👉 phablobs.cult

#PhablobsCult #Phantom #Solana`
    
    // URL для Twitter
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    
    return NextResponse.json({
      success: true,
      twitterUrl,
      phablobNumber,
      message: 'Ready to share!'
    })
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  }
}
