import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// =========================================================================
// METADATA - ПОЛНЫЙ SEO SETUP
// =========================================================================
export const metadata: Metadata = {
  // ==========================================
  // ОСНОВНЫЕ META TAGS
  // ==========================================
  title: "PHABLOBS | Your Wallet. Your Masterpiece.",
  description: "Generate unique Solana avatar from any wallet address. 3.3B+ combinations, NFT-ready metadata, 100% free. Create your visual identity on Solana.",
  
  keywords: [
    "Phablobs",
    "Solana avatar generator",
    "NFT avatar",
    "Phantom wallet",
    "Web3 identity",
    "Solana NFT",
    "Avatar creator",
    "Wallet identity",
    "Crypto avatar",
    "Solana generator",
    "pump.fun",
    "SOL token"
  ],

  // ==========================================
  // VIEWPORT & MOBILE
  // ==========================================
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },

  // ==========================================
  // OPEN GRAPH (Facebook, LinkedIn, Discord)
  // ==========================================
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://phablobs.xyz",
    siteName: "PHABLOBS",
    title: "PHABLOBS | Your Wallet. Your Masterpiece.",
    description: "Generate unique Solana avatar from any wallet address. 3.3B+ combinations, NFT-ready metadata, 100% free.",
    images: [
      {
        url: "https://phablobs.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "PHABLOBS - Your Wallet Your Masterpiece",
        type: "image/png",
      },
      {
        url: "https://phablobs.xyz/og-image-square.png",
        width: 800,
        height: 800,
        alt: "PHABLOBS Avatar Generator",
        type: "image/png",
      }
    ],
  },

  // ==========================================
  // TWITTER CARD
  // ==========================================
  twitter: {
    card: "summary_large_image",
    site: "@phablobs",
    creator: "@phablobs",
    title: "PHABLOBS | Your Wallet. Your Masterpiece.",
    description: "Generate unique Solana avatar from any wallet. Free, NFT-ready, 3.3B+ combinations.",
    images: ["https://phablobs.xyz/og-image.png"],
  },

  // ==========================================
  // CANONICAL & LINKS
  // ==========================================
  alternates: {
    canonical: "https://phablobs.xyz",
  },

  // ==========================================
  // ROBOTS & INDEXING
  // ==========================================
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // ==========================================
  // VERIFICATION & TRACKING
  // ==========================================
    verification: {
    google: "-Kmpe_TcPpfGUjNe7R6ubCdzMtquS-pe-0VrIn5C3Fg",
  },

  // ==========================================
  // ICONS & FAVICONS
  // ==========================================
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },

  // ==========================================
  // MANIFEST & THEME
  // ==========================================
  manifest: "/site.webmanifest",
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PHABLOBS",
  },

  // ==========================================
  // CATEGORY & RATING
  // ==========================================
  category: "technology",
  referrer: "strict-origin-when-cross-origin",

  // ==========================================
  // ADDITIONAL META TAGS
  // ==========================================
  other: {
    "og:locale": "en_US",
    "theme-color": "#000000",
    "color-scheme": "dark",
  },
}

// =========================================================================
// ROOT LAYOUT
// =========================================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* =========== PRECONNECT & FONTS =========== */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Fredoka:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />

        {/* =========== FAVICON =========== */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/favicon-512x512.png" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* =========== THEME & COLOR =========== */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />

        {/* =========== BROWSER ENHANCEMENTS =========== */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PHABLOBS" />

        {/* =========== ADDITIONAL SEO =========== */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="email=no" />
      </head>

      <body className={inter.className}>
        {children}

        {/* =========== JSON-LD SCHEMAS =========== */}
        
        {/* 1. WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "@id": "https://phablobs.xyz",
              "name": "PHABLOBS",
              "alternateName": "Phablobs Avatar Generator",
              "description": "Generate unique Solana avatars with NFT-ready metadata. 3.3B+ combinations, 100% free.",
              "url": "https://phablobs.xyz",
              "image": "https://phablobs.xyz/og-image.png",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "creator": {
                "@type": "Person",
                "name": "Blobmaster",
                "sameAs": "https://www.linkedin.com/in/rustamlukman/"
              },
              "author": {
                "@type": "Organization",
                "name": "PHABLOBS",
                "url": "https://phablobs.xyz",
                "logo": "https://phablobs.xyz/logos/phantom-logo.svg",
                "sameAs": [
                  "https://twitter.com/phablobs",
                  "https://t.me/phablobs"
                ]
              },
              "inLanguage": ["en", "ru"],
              "isAccessibleForFree": true,
              "featureList": [
                "Free NFT-ready avatar generation",
                "3.3B+ unique combinations",
                "Deterministic cryptographic generation",
                "Solana wallet-based identity",
                "Metaplex NFT metadata",
                "No transaction fees",
                "Instant generation"
              ],
              "browserRequirements": "Requires JavaScript"
            })
          }}
        />

        {/* 2. Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://phablobs.xyz",
              "name": "PHABLOBS",
              "alternateName": "Phablobs Cult",
              "url": "https://phablobs.xyz",
              "logo": "https://phablobs.xyz/logos/phantom-logo.svg",
              "description": "Revolutionary Solana avatar generator with NFT integration",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "url": "https://t.me/phablobs"
              },
              "sameAs": [
                "https://twitter.com/phablobs",
                "https://t.me/phablobs",
                "https://x.com/i/communities/1998716348944302467"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "World"
              }
            })
          }}
        />

        {/* 3. WebPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": "https://phablobs.xyz",
              "name": "PHABLOBS | Your Wallet. Your Masterpiece.",
              "description": "Generate unique Solana avatars with NFT-ready metadata",
              "url": "https://phablobs.xyz",
              "image": "https://phablobs.xyz/og-image.png",
              "primaryImageOfPage": "https://phablobs.xyz/og-image.png",
              "isPartOf": {
                "@type": "WebSite",
                "@id": "https://phablobs.xyz/",
                "name": "PHABLOBS",
                "url": "https://phablobs.xyz"
              },
              "datePublished": "2025-01-01T00:00:00Z",
              "dateModified": new Date().toISOString(),
              "inLanguage": "en-US"
            })
          }}
        />

        {/* 4. BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://phablobs.xyz"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "How It Works",
                  "item": "https://phablobs.xyz/how-it-works"
                }
              ]
            })
          }}
        />
      </body>
    </html>
  )
}
