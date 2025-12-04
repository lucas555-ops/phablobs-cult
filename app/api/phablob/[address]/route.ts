function generateAvatarSVG(publicKey: string): string {
  const hash = generateHash(publicKey)
  const gradient = generateGradient(hash)
  const phablobNumber = (hash % 9999).toString().padStart(4, '0')
  
  // URL к PNG аватару
  const phantomAvatarUrl = '/phantom-avatar.png'
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Градиент для фона -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient.color1}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${gradient.color2}" stop-opacity="1"/>
    </linearGradient>
    
    <!-- Фильтры -->
    <filter id="textShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.3"/>
    </filter>
    
    <!-- Фильтр тени для белого круга -->
    <filter id="circleShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="black" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <!-- СЛОЙ 1: БЕЛЫЙ АВАТАР PNG (самый верхний слой) -->
  <image 
    href="${phantomAvatarUrl}" 
    x="220" 
    y="220" 
    width="360" 
    height="360"
    preserveAspectRatio="xMidYMid meet"
  />
  
  <!-- СЛОЙ 2: БЕЛЫЙ КРУГ ПОД АВАТАРОМ -->
  <circle cx="400" cy="400" r="180" fill="white" filter="url(#circleShadow)" opacity="0.95"/>
  
  <!-- СЛОЙ 3: ГРАДИЕНТНЫЙ ФОН -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- СЛОЙ 4: ВОДЯНЫЕ ЗНАКИ -->
  <!-- PHANTOM водяные знаки -->
  <text x="100" y="150" font-family="Arial Black" font-size="48" fill="white" opacity="0.08" transform="rotate(-15 100 150)">PHANTOM</text>
  <text x="600" y="200" font-family="Arial Black" font-size="42" fill="white" opacity="0.06" transform="rotate(12 600 200)">PHANTOM</text>
  <text x="50" y="500" font-family="Arial Black" font-size="52" fill="white" opacity="0.07" transform="rotate(-8 50 500)">PHANTOM</text>
  <text x="550" y="650" font-family="Arial Black" font-size="45" fill="white" opacity="0.08" transform="rotate(18 550 650)">PHANTOM</text>
  
  <!-- PHABLOBS водяные знаки -->
  <text x="200" y="80" font-family="Arial Black" font-size="56" fill="white" opacity="0.09" transform="rotate(8 200 80)">PHABLOBS</text>
  <text x="450" y="120" font-family="Arial Black" font-size="38" fill="white" opacity="0.06" transform="rotate(-12 450 120)">PHABLOBS</text>
  <text x="120" y="380" font-family="Arial Black" font-size="50" fill="white" opacity="0.07" transform="rotate(15 120 380)">PHABLOBS</text>
  <text x="580" y="480" font-family="Arial Black" font-size="44" fill="white" opacity="0.08" transform="rotate(-10 580 480)">PHABLOBS</text>
  <text x="280" y="720" font-family="Arial Black" font-size="48" fill="white" opacity="0.07" transform="rotate(5 280 720)">PHABLOBS</text>
  
  <!-- Дополнительные маленькие водяные знаки -->
  <text x="350" y="280" font-family="Arial Black" font-size="32" fill="white" opacity="0.05" transform="rotate(-20 350 280)">PHANTOM</text>
  <text x="680" y="380" font-family="Arial Black" font-size="28" fill="white" opacity="0.04" transform="rotate(25 680 380)">PHABLOBS</text>
  <text x="40" y="680" font-family="Arial Black" font-size="35" fill="white" opacity="0.06" transform="rotate(-5 40 680)">PHANTOM</text>
  
  <!-- СЛОЙ 5: ТЕКСТ PHABLOBS ВВЕРХУ -->
  <text 
    x="400" 
    y="90" 
    text-anchor="middle" 
    font-family="Arial Black, Impact" 
    font-weight="900"
    font-size="68"
    fill="white"
    filter="url(#textShadow)"
    letter-spacing="6"
  >
    PHABLOBS
  </text>
  
  <!-- СЛОЙ 6: НОМЕР PHABLOB -->
  <text 
    x="400" 
    y="720" 
    text-anchor="middle" 
    font-family="Arial Black" 
    font-weight="900"
    font-size="52"
    fill="white"
    filter="url(#textShadow)"
    letter-spacing="4"
  >
    #${phablobNumber}
  </text>
  
  <!-- СЛОЙ 7: МАЛЕНЬКИЙ ТЕКСТ -->
  <text 
    x="400" 
    y="760" 
    text-anchor="middle" 
    font-family="Arial" 
    font-size="18"
    fill="white"
    opacity="0.9"
  >
    phablobs.cult
  </text>
</svg>`
}
