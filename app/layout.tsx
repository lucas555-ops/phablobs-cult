import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Phablobs Cult | 17M AI Faces. One Cult.',
  description: 'Your Phantom twin already exists. Reveal your unique AI-generated Phablob and join the cult.',
  keywords: ['Phablobs', 'Phantom', 'Solana', 'AI', 'NFT', 'Web3', 'Cult', 'Meme'],
  authors: [{ name: 'Phablobs Cult' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://phablobs.cult',
    title: 'Phablobs Cult',
    description: '17M AI faces. One cult. Your Phantom twin already exists.',
    siteName: 'Phablobs Cult',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phablobs Cult',
    description: '17M AI faces. One cult.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
