// Генерация аватара в стиле Phantom (fallback)
export function generatePhantomStyleAvatar(publicKey: string): string {
  // Phantom цвета
  const COLORS = [
    '#00C2FF', '#8B5CF6', '#F59E0B', '#10B981',
    '#EF4444', '#F97316', '#EC4899', '#06B6D4'
  ]
  
  // Детерминированный хэш
  let hash = 0
  for (let i = 0; i < publicKey.length; i++) {
    hash = ((hash << 5) - hash) + publicKey.charCodeAt(i)
    hash = hash & hash
  }
  
  const color1 = COLORS[Math.abs(hash) % COLORS.length]
  const color2 = COLORS[Math.abs(hash >> 8) % COLORS.length]
  const rotation = Math.abs(hash >> 16) % 360
  
  return `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="#000000"/>
      <g transform="rotate(${rotation} 200 200)">
        <circle cx="200" cy="200" r="150" fill="url(#grad)" opacity="0.9"/>
        <circle cx="200" cy="200" r="100" fill="url(#grad)" opacity="0.5"/>
      </g>
    </svg>
  `.trim()
}
```

---

## 📝 ОБНОВЛЕННЫЙ MESSAGING

### Twitter Posts:

**Launch Tweet:**
```
🎭 PHABLOBS CULT IS LIVE

Your Phantom wallet already has a unique avatar.
17 million users. 17 million blobs.

Time to reveal yours and join the cult.

👁️ phablobs.cult

#PhablobsCult #Phantom #Solana
```

**Explainer Tweet:**
```
What are Phablobs?

Every Phantom wallet generates a unique, deterministic avatar.
Same wallet = same blob. Always.

We didn't create them.
Phantom did.

We just made them a cult.

Reveal yours 👉 phablobs.cult
```

**Call to Action:**
```
You've seen them.
The colorful blobs in Phantom wallets.

But have YOU revealed yours yet?

Connect wallet → See your blob → Share with #PhablobsCult

Join the movement 👇
phablobs.cult
