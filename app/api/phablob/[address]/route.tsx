import { NextRequest } from 'next/server'
import { ImageResponse } from '@vercel/og'

// Импортируем цветовую систему
import { 
  generateGradientFromBalance,
  generateSolidBgFromBalance
} from '@/lib/color-tiers'

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

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const address = context.params.address

    if (!isValidSolanaAddress(address)) {
      return new Response('Invalid address', { status: 400 })
    }

    const hash = generateHash(address)
    const phablobNumber = (hash % 9999).toString().padStart(4, '0')
    
    const useGradient = hash % 2 === 0
    const tokenBalance = 0
    
    let avatarColor: string
    let bgColor: string
    let bgColor2: string | null = null
    
    if (useGradient) {
      const result = generateGradientFromBalance(address, tokenBalance)
      avatarColor = result.avatarColor
      bgColor = result.bgColor1
      bgColor2 = result.bgColor2
    } else {
      const result = generateSolidBgFromBalance(address, tokenBalance)
      avatarColor = result.avatarColor
      bgColor = result.bgColor
    }
    
    const cleanColor = avatarColor.replace('#', '')
    const avatarUrl = `https://phablobs-cult.vercel.app/avatars/blob-avatar-${cleanColor}.png`
    
    console.log(`🎨 Generating Phablob #${phablobNumber}`)

    return new ImageResponse(
      (
        <div
          style={{
            width: '800px',
            height: '800px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: bgColor2 
              ? `linear-gradient(135deg, ${bgColor} 0%, ${bgColor2} 100%)`
              : bgColor,
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex' }}>
            <div style={{ position: 'absolute', top: '150px', left: '100px', transform: 'rotate(-15deg)', fontSize: '48px', fontWeight: 900, color: 'white', opacity: 0.08 }}>
              PHANTOM
            </div>
            <div style={{ position: 'absolute', top: '200px', left: '600px', transform: 'rotate(12deg)', fontSize: '42px', fontWeight: 900, color: 'white', opacity: 0.06 }}>
              PHANTOM
            </div>
            <div style={{ position: 'absolute', top: '500px', left: '50px', transform: 'rotate(-8deg)', fontSize: '52px', fontWeight: 900, color: 'white', opacity: 0.07 }}>
              PHANTOM
            </div>
            <div style={{ position: 'absolute', top: '650px', left: '550px', transform: 'rotate(18deg)', fontSize: '45px', fontWeight: 900, color: 'white', opacity: 0.08 }}>
              PHANTOM
            </div>
            
            <div style={{ position: 'absolute', top: '80px', left: '200px', transform: 'rotate(8deg)', fontSize: '56px', fontWeight: 900, color: 'white', opacity: 0.09 }}>
              PHABLOBS
            </div>
            <div style={{ position: 'absolute', top: '380px', left: '120px', transform: 'rotate(15deg)', fontSize: '50px', fontWeight: 900, color: 'white', opacity: 0.07 }}>
              PHABLOBS
            </div>
            <div style={{ position: 'absolute', top: '480px', left: '580px', transform: 'rotate(-10deg)', fontSize: '44px', fontWeight: 900, color: 'white', opacity: 0.08 }}>
              PHABLOBS
            </div>
          </div>

          <div style={{ 
            position: 'absolute', 
            top: '220px', 
            left: '220px',
            display: 'flex',
            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))'
          }}>
            <img 
              src={avatarUrl}
              width="360"
              height="360"
              alt="avatar"
            />
          </div>

          <div style={{
            position: 'absolute',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '68px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '6px',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            PHABLOBS
          </div>

          <div style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '52px',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '4px',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            #{phablobNumber}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px',
            color: 'white',
            opacity: 0.9,
          }}>
            phablobs.xyz
          </div>
        </div>
      ),
      {
        width: 800,
        height: 800,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response('Error', { status: 500 })
  }
}
