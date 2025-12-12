'use client'

import Link from 'next/link'

interface StickyNavbarProps {
  pageTitle?: string
}

export function StickyNavbar({ pageTitle = 'Your Wallet. Your Masterpiece.' }: StickyNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-[#ab0ff2]/20 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT: Logo + Name */}
          <Link 
            href="/" 
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-gradient-to-br from-[#ab0ff2] to-[#4da7f2] flex items-center justify-center text-white font-black text-sm md:text-lg flex-shrink-0">
              👻
            </div>
            <span className="text-sm md:text-xl font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent hidden sm:block whitespace-nowrap">
              PHABLOBS
            </span>
          </Link>

          {/* CENTER: Page Title (responsive) */}
          <div className="flex-1 text-center hidden md:block px-4">
            <h2 className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent truncate">
              {pageTitle}
            </h2>
          </div>

          {/* RIGHT: Navigation Buttons */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <a
              href="/#generator"
              className="hidden sm:block px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
            >
              Generate
            </a>
            <Link
              href="/how-it-works"
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] text-white rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Export for easy usage
export default StickyNavbar
