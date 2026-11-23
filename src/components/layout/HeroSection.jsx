import { useState, useRef } from 'react'
import ClothCanvas from '@/components/hero/ClothCanvas'

const PROJECTS = [
  {
    title: 'SEOUL STREET',
    description:
      "A bold visual identity inspired by Seoul's underground street culture. The project explores expressive typography, vibrant colors, and graphic compositions across apparel and campaign posters.",
    tags: 'VISUAL IDENTITY · POSTER DESIGN · CAMPAIGN',
  },
  {
    title: 'KOREAN STREET MARKET',
    description:
      'An authentic culinary branding journey celebrating traditional night market culture with contemporary street typography, expressive signage, and bold packaging.',
    tags: 'BRAND IDENTITY · ART DIRECTION · PACKAGING',
  },
  {
    title: 'BRUTO SPECIALTY COFFEE',
    description:
      'A minimalist architectural identity crafted for modern coffee roasters, blending brutalist structure, raw geometric gridlines, and tactile editorial design.',
    tags: 'EDITORIAL · PACKAGING · VISUAL IDENTITY',
  },
]

/**
 * Splits heading text so that it wraps to the next line after every 2 words
 */
function splitWordsEvery2(text) {
  const words = text.trim().split(/\s+/)
  const lines = []
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(' '))
  }
  return lines
}

export default function HeroSection() {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const currentY = useRef(0)

  const project = PROJECTS[activeProjectIndex] || PROJECTS[0]

  return (
    <section
      data-lenis-prevent
      className="relative w-full h-screen overflow-hidden bg-[#F0F0F0] select-none"
    >
      {/* Top-Left Brand Name (Editorial Typography - aligned with left navbar px-5 sm:px-7 md:px-8) */}
      <div className="absolute top-24 sm:top-28 md:top-32 left-5 sm:left-7 md:left-8 z-10 pointer-events-none max-w-[80vw]">
        <h1
          key={project.title}
          className="text-[clamp(2.4rem,5.5vw,5.2rem)] font-thebold font-bold text-black uppercase leading-[0.82] tracking-tight m-0 p-0 transition-all duration-500 ease-out animate-fadeIn"
        >
          {splitWordsEvery2(project.title).map((line, idx) => (
            <span key={idx} className="block leading-[0.82]">
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* Bottom-Right Paragraph & Project Tags */}
      <div className="absolute bottom-16 sm:bottom-20 right-5 sm:right-7 md:right-8 z-10 pointer-events-none max-w-[360px] sm:max-w-[430px] text-left">
        <p
          key={project.description}
          className="font-neue text-[14px] sm:text-[15px] leading-[1.42] text-black font-normal mb-5 tracking-tight sm:tracking-normal transition-all duration-500 ease-out animate-fadeIn"
        >
          {project.description}
        </p>
        <p
          key={project.tags}
          className="font-neue text-[11px] sm:text-[12px] font-medium tracking-[0.06em] text-black uppercase transition-all duration-500 ease-out animate-fadeIn"
        >
          {project.tags}
        </p>
      </div>

      {/* Real XPBD Cloth Simulation Canvas (domgl-cloth exact interaction & physics) */}
      <ClothCanvas
        motionProgressRef={currentY}
        onActiveProjectChange={setActiveProjectIndex}
      />

      {/* Bottom Center Grid CTA (Shadow removed as requested) */}
      <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          type="button"
          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white text-black font-neue text-sm sm:text-base font-medium leading-none cursor-pointer tracking-normal transition-none"
        >
          Grid
        </button>
      </div>
    </section>
  )
}
