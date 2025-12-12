'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'what' | 'how' | 'rarity' | 'faq'>('what')

  return (
    <>
      {/* STICKY NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-[#ab0ff2]/20 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT: Logo + Name */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              <img 
                src="/logos/phantom-logo.svg" 
                alt="Phablobs Logo" 
                className="w-8 md:w-10 h-8 md:h-10"
              />
              <span className="text-sm md:text-xl font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent hidden sm:block whitespace-nowrap">
                PHABLOBS
              </span>
            </Link>

            {/* CENTER: Page Title */}
            <div className="flex-1 text-center hidden md:block px-4">
              <h2 className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent whitespace-nowrap">
                How It Works
              </h2>
            </div>

            {/* RIGHT: Navigation */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <a
                href="/#generator"
                className="hidden sm:block px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Generate
              </a>
              <Link
                href="/"
                className="px-3 md:px-4 py-2 text-xs md:text-sm font-bold bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] text-white rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#ab0ff2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#4da7f2] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* HEADER */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-[#ab0ff2] via-[#4da7f2] to-[#2ec08b] bg-clip-text text-transparent">
              How Phablobs Work
            </h1>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto">
              Every Solana wallet has its own unique visual fingerprint. Learn how your address becomes your identity.
            </p>
          </div>

          {/* TABS */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
              {[
                { id: 'what', label: '🎨 What?' },
                { id: 'how', label: '⚙️ How?' },
                { id: 'rarity', label: '🌟 Rarity' },
                { id: 'faq', label: '❓ FAQ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] text-white shadow-lg'
                      : 'bg-gray-900 border border-[#ab0ff2]/30 text-gray-300 hover:border-[#ab0ff2]/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT SECTIONS */}
            <div className="space-y-8">
              {/* WHAT IS IT */}
              {activeTab === 'what' && (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
                    <h2 className="text-2xl md:text-4xl font-black mb-6 text-white">🎨 What is Phablobs?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      {/* Description */}
                      <div className="space-y-4">
                        <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                          <span className="font-bold text-[#ab0ff2]">Phablobs</span> are unique visual avatars generated cryptographically from your Solana address. Your wallet has its own identity—colors, patterns, and signature.
                        </p>
                        
                        <div className="bg-black/40 rounded-xl p-4 border border-[#4da7f2]/20">
                          <h3 className="font-bold text-[#4da7f2] mb-3">🔑 Key Features:</h3>
                          <ul className="space-y-2 text-xs md:text-sm text-gray-300">
                            <li>✅ <span className="font-bold">Deterministic</span> — one address = one Phablob always</li>
                            <li>✅ <span className="font-bold">Cryptographically secure</span> — unhackable</li>
                            <li>✅ <span className="font-bold">NFT-ready</span> — Metaplex metadata included</li>
                            <li>✅ <span className="font-bold">3.3B+ combinations</span> — virtually infinite</li>
                            <li>✅ <span className="font-bold">100% free</span> — costs 0 SOL</li>
                          </ul>
                        </div>
                      </div>

                      {/* Visual Section */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#ab0ff2]/10 to-[#4da7f2]/10 rounded-2xl p-6 md:p-8 border border-[#ab0ff2]/30 flex flex-col items-center justify-center min-h-[280px]">
                          <div className="text-center">
                            <img 
                              src="/logos/phantom-logo.svg" 
                              alt="Phablobs Logo" 
                              className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4"
                            />
                            <p className="text-xs md:text-sm text-gray-300 mb-2">Example Phablob</p>
                            <code className="text-[10px] md:text-xs text-[#00FF00] block bg-black/40 p-2 rounded-lg my-3">
                              So11111...11112
                            </code>
                            <p className="text-xs text-gray-400">HEX ID:</p>
                            <p className="text-lg md:text-2xl font-black text-[#ab0ff2] mt-2">#A1F3B7E2</p>
                          </div>
                        </div>

                        <div className="bg-black/40 rounded-xl p-4 border border-[#2ec08b]/20">
                          <h3 className="font-bold text-[#2ec08b] mb-2 text-sm">📊 Components:</h3>
                          <ul className="space-y-1 text-xs md:text-sm text-gray-300">
                            <li>🎨 Unique color (1 of 69)</li>
                            <li>🌈 Solid or gradient background</li>
                            <li>💧 8–13 watermarks</li>
                            <li>#️⃣ Unique HEX signature</li>
                            <li>📄 NFT metadata (JSON)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HOW IT WORKS */}
              {activeTab === 'how' && (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-[#4da7f2]/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
                    <h2 className="text-2xl md:text-4xl font-black mb-8 text-white">⚙️ The Algorithm</h2>

                    {/* Step-by-step process */}
                    <div className="space-y-3 md:space-y-4">
                      {[
                        {
                          num: 1,
                          title: 'Wallet → Hash',
                          desc: 'Your address is converted to cryptographic hash',
                          example: 'So111... → 0xA7F3B2E1'
                        },
                        {
                          num: 2,
                          title: 'Hash → Color',
                          desc: 'Hash selects one of 69 unique colors',
                          example: '0xA7F3B2E1 % 69 = 42 → #7d46e1'
                        },
                        {
                          num: 3,
                          title: 'Color → Rarity Tier',
                          desc: 'Each color has assigned rarity level',
                          example: '#7d46e1 → TIER_4 (Legendary, 13%)'
                        },
                        {
                          num: 4,
                          title: 'Background Type',
                          desc: '50% solid, 50% gradient (4,761 combos)',
                          example: 'Gradient: #7d46e1 → #ab9ff2'
                        },
                        {
                          num: 5,
                          title: 'Add Watermarks',
                          desc: '8–13 dynamic watermarks with angles',
                          example: 'PHANTOM, SOLANA, PHABLOBS...'
                        },
                        {
                          num: 6,
                          title: 'Generate HEX ID',
                          desc: 'Final unique 8-character signature',
                          example: '#A7F3B2E1'
                        }
                      ].map((step, idx) => (
                        <div key={idx} className="flex gap-3 md:gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 md:h-10 w-8 md:w-10 rounded-full bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] text-white font-bold text-xs md:text-sm">
                              {step.num}
                            </div>
                          </div>
                          <div className="flex-grow bg-black/40 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#ab0ff2]/20">
                            <h3 className="font-bold text-white text-sm md:text-base mb-1">{step.title}</h3>
                            <p className="text-xs md:text-sm text-gray-300 mb-2">{step.desc}</p>
                            <code className="text-[10px] md:text-xs text-[#00FF00] block bg-black/60 p-2 rounded">
                              {step.example}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key insight */}
                    <div className="mt-8 bg-gradient-to-r from-[#ab0ff2]/20 to-[#4da7f2]/20 rounded-xl p-4 md:p-6 border border-[#ab0ff2]/30">
                      <p className="text-center text-white font-bold text-sm md:text-base">
                        🎯 <span className="text-[#ab0ff2]">100% deterministic</span> — same address always = same Phablob
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RARITY SYSTEM */}
              {activeTab === 'rarity' && (
                <div className="space-y-6 md:space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-[#FFD700]/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
                    <h2 className="text-2xl md:text-4xl font-black mb-8 text-white">🌟 Rarity System</h2>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto mb-8">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-white">TIER</th>
                            <th className="text-left py-3 px-4 text-white">Colors</th>
                            <th className="text-left py-3 px-4 text-white">Chance</th>
                            <th className="text-left py-3 px-4 text-white">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-bold">🟠 Legendary</td>
                            <td className="py-3 px-4 text-[#FF8000]">8</td>
                            <td className="py-3 px-4 text-[#FF8000]">13%</td>
                            <td className="py-3 px-4 text-gray-300">Rarest & most desired</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-bold">🔵 Rare</td>
                            <td className="py-3 px-4 text-[#0070FF]">21</td>
                            <td className="py-3 px-4 text-[#0070FF]">30%</td>
                            <td className="py-3 px-4 text-gray-300">Deep, bright, powerful</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-bold">🟢 Uncommon</td>
                            <td className="py-3 px-4 text-[#1EFF00]">20</td>
                            <td className="py-3 px-4 text-[#1EFF00]">29%</td>
                            <td className="py-3 px-4 text-gray-300">Saturated shades</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 font-bold">⚪ Common</td>
                            <td className="py-3 px-4 text-gray-400">20</td>
                            <td className="py-3 px-4 text-gray-400">28%</td>
                            <td className="py-3 px-4 text-gray-300">Classic colors</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3 mb-8">
                      {[
                        { emoji: '🟠', tier: 'Legendary', colors: 8, percent: '13%' },
                        { emoji: '🔵', tier: 'Rare', colors: 21, percent: '30%' },
                        { emoji: '🟢', tier: 'Uncommon', colors: 20, percent: '29%' },
                        { emoji: '⚪', tier: 'Common', colors: 20, percent: '28%' }
                      ].map((row, idx) => (
                        <div key={idx} className="bg-black/40 rounded-lg p-3 border border-[#FFD700]/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white text-sm">{row.emoji} {row.tier}</p>
                              <p className="text-xs text-gray-400">{row.colors} colors</p>
                            </div>
                            <p className="text-lg font-black text-[#FFD700]">{row.percent}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fair distribution note */}
                    <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#ff7f00]/20 rounded-xl p-4 md:p-6 border border-[#FFD700]/30 mb-8">
                      <p className="text-white font-bold text-sm md:text-base mb-2">
                        ⚖️ Distribution is mathematically fair
                      </p>
                      <p className="text-xs md:text-sm text-gray-300">
                        Each color has equal probability. Rarity depends only on tier assignment. No manipulation possible.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {[
                        { label: 'Colors', value: '69' },
                        { label: 'Solid BGs', value: '69' },
                        { label: 'Gradient BGs', value: '4,761' },
                        { label: 'Watermarks', value: '6^(8-13)' },
                        { label: 'Total', value: '3.3B+' }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-black/40 rounded-lg md:rounded-xl p-3 md:p-4 border border-[#ab0ff2]/20 text-center">
                          <p className="text-[10px] md:text-xs text-gray-400 mb-1">{stat.label}</p>
                          <p className="text-base md:text-lg font-black bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] bg-clip-text text-transparent">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeTab === 'faq' && (
                <div className="space-y-3 md:space-y-4 animate-fade-in">
                  {[
                    {
                      q: '🔒 Can I fake a Phablob?',
                      a: 'No. Cryptographically impossible. You would need to break SHA-256 — unbreakable.'
                    },
                    {
                      q: '🔄 If I enter the address again — will it change?',
                      a: 'No. Always the same. Deterministic generation means consistency.'
                    },
                    {
                      q: '📊 Why this rarity distribution?',
                      a: '13% Legendary, 30% Rare, 29% Uncommon, 28% Common. Mathematically fair, creates healthy FOMO.'
                    },
                    {
                      q: '⬆️ Can I increase rarity?',
                      a: 'Yes! $BLOB holders get rarity boosts in Phase 4. Details coming soon.'
                    },
                    {
                      q: '🖼️ Is Phablob an NFT?',
                      a: 'Not by default, but includes full Metaplex NFT metadata. Mint it on Magic Eden or Tensor anytime.'
                    },
                    {
                      q: '💰 How much does it cost?',
                      a: '100% FREE. Zero SOL, zero transactions, zero fees.'
                    },
                    {
                      q: '🎯 Where can I use it?',
                      a: 'PFP, Web3 ID, NFT collections, DAO profiles, gaming, app integrations.'
                    },
                    {
                      q: '⚡ Is there an API?',
                      a: 'Yes! /api/phablob/{SOLANA_ADDRESS} returns PNG, SVG, or JSON.'
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-[#ab0ff2]/30 rounded-xl md:rounded-2xl p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-bold text-white mb-2">{faq.q}</h3>
                      <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="max-w-4xl mx-auto mt-12 md:mt-16 bg-gradient-to-br from-[#ab0ff2]/20 to-[#4da7f2]/20 border border-[#ab0ff2]/30 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4">Ready to Generate?</h2>
            <p className="text-sm md:text-base text-gray-300 mb-6">
              Enter your Solana address and get your unique Phablob instantly.
            </p>
            <Link
              href="/#generator"
              className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#ab0ff2] to-[#4da7f2] hover:from-[#9b0ed9] hover:to-[#3d96e0] text-white font-bold text-sm md:text-base rounded-lg md:rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-[0_0_40px_rgba(171,15,242,0.5)]"
            >
              ✨ Generate Your Phablob
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
