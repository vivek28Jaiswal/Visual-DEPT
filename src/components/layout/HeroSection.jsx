import { useState, useRef, useEffect } from 'react'
import Lenis from 'lenis'
import ClothCanvas from '@/components/hero/ClothCanvas'
import post1 from '@/assets/images/post1.webp'
import post2 from '@/assets/images/post2.webp'
import post3 from '@/assets/images/post3.webp'
import post4 from '@/assets/images/post4.webp'
import post5 from '@/assets/images/post5.webp'
import post6 from '@/assets/images/post6.webp'
import post7 from '@/assets/images/post7.webp'
import post8 from '@/assets/images/post8.webp'
import post9 from '@/assets/images/post9.webp'
import post10 from '@/assets/images/post10.webp'

// The 10 real projects matching the artwork in assets/images
const PROJECTS = [
  {
    id: 'seoul-street',
    title: 'SEOUL STREET',
    description:
      "A bold visual identity inspired by Seoul's underground street culture. The project explores expressive typography, vibrant colors, and graphic compositions across apparel and campaign posters.",
    tags: 'VISUAL IDENTITY · POSTER DESIGN · CAMPAIGN',
    poster: post3,
  },
  {
    id: 'bruto-coffee',
    title: 'BRUTO SPECIALTY COFFEE',
    description:
      'A minimalist architectural identity crafted for modern coffee roasters, blending brutalist structure, raw geometric gridlines, and tactile editorial design.',
    tags: 'EDITORIAL · PACKAGING · VISUAL IDENTITY',
    poster: post1,
  },
  {
    id: 'korean-market',
    title: 'KOREAN STREET MARKET',
    description:
      'An authentic culinary branding journey celebrating traditional night market culture with contemporary street typography, expressive signage, and bold packaging.',
    tags: 'BRAND IDENTITY · ART DIRECTION · PACKAGING',
    poster: post2,
  },
  {
    id: 'made-for-more',
    title: 'MADE FOR MORE',
    description:
      'An expressive typographic poster exploration blending fluid cursive brushwork with heavy geometric letterforms for an uplifting lifestyle campaign.',
    tags: 'TYPOGRAPHY · ART DIRECTION · POSTER DESIGN',
    poster: post4,
  },
  {
    id: 'cuke-pickles',
    title: 'CUKE PICKLES',
    description:
      'Energetic and irreverent packaging system for an artisan Berlin pickle brand, driven by playful character design, bold color blocking, and sharp editorial typography.',
    tags: 'PACKAGING · BRAND IDENTITY · ILLUSTRATION',
    poster: post5,
  },
  {
    id: 'costra-burgers',
    title: 'COSTRA BURGERS',
    description:
      'A vibrant street food brand identity featuring dynamic vintage mascot illustrations, custom punchy lettering, and playful tactile packaging.',
    tags: 'RESTAURANT BRANDING · PACKAGING · MASCOT DESIGN',
    poster: post6,
  },
  {
    id: 'blueberry-crisp',
    title: 'BLUEBERRY CRISP',
    description:
      'A tactile lifestyle merchandise collection uniting contemporary streetwear silhouettes with nostalgic, bakery-inspired expressive typography.',
    tags: 'APPAREL · MERCHANDISE · BRAND IDENTITY',
    poster: post7,
  },
  {
    id: 'gastown-sunday',
    title: 'GASTOWN SUNDAY SET',
    description:
      'A warm community summer series identity celebrating car-free city life through playful European line drawings and breezy seasonal merchandise.',
    tags: 'CAMPAIGN · ILLUSTRATION · EDITORIAL MERCH',
    poster: post8,
  },
  {
    id: 'wild-grove',
    title: 'WILD GROVE',
    description:
      'Fresh, geometric packaging design for an organic wellness apothecary, balancing botanical clarity with bold, modernist type architecture.',
    tags: 'ORGANIC WELLNESS · PACKAGING · ART DIRECTION',
    poster: post9,
  },
  {
    id: 'lush-haircare',
    title: 'LUSH HAIRCARE',
    description:
      'A high-impact cosmetics packaging identity combining bold bubbly shapes, electric neon contrast, and high-contrast editorial storytelling.',
    tags: 'BEAUTY BRANDING · PACKAGING · CREATIVE DIRECTION',
    poster: post10,
  },
]

// 4-Column responsive poster grid showcasing all 10 real projects in the Index view
const INDEX_POSTERS = [
  // Row 1
  { src: post3, alt: 'Seoul Street', projectIdx: 0 },
  { src: post1, alt: 'Bruto Specialty Coffee', projectIdx: 1 },
  { src: post2, alt: 'Korean Street Market', projectIdx: 2 },
  { src: post4, alt: 'Made For More', projectIdx: 3 },
  // Row 2
  { src: post5, alt: 'Cuke Pickles', projectIdx: 4 },
  { src: post6, alt: 'Costra Burgers', projectIdx: 5 },
  { src: post7, alt: 'Blueberry Crisp', projectIdx: 6 },
  { src: post8, alt: 'Gastown Sunday Set', projectIdx: 7 },
  // Row 3
  { src: post9, alt: 'Wild Grove', projectIdx: 8 },
  { src: post10, alt: 'Lush Haircare', projectIdx: 9 },
  { src: post3, alt: 'Seoul Street', projectIdx: 0 },
  { src: post1, alt: 'Bruto Specialty Coffee', projectIdx: 1 },
  // Row 4
  { src: post2, alt: 'Korean Street Market', projectIdx: 2 },
  { src: post4, alt: 'Made For More', projectIdx: 3 },
  { src: post5, alt: 'Cuke Pickles', projectIdx: 4 },
  { src: post6, alt: 'Costra Burgers', projectIdx: 5 },
  // Row 5
  { src: post7, alt: 'Blueberry Crisp', projectIdx: 6 },
  { src: post8, alt: 'Gastown Sunday Set', projectIdx: 7 },
  { src: post9, alt: 'Wild Grove', projectIdx: 8 },
  { src: post10, alt: 'Lush Haircare', projectIdx: 9 },
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

export default function HeroSection({ isGridView = false, onToggleView }) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const currentY = useRef(0)
  const gridScrollRef = useRef(null)
  const gridContentRef = useRef(null)
  const lenisRef = useRef(null)
  const isScrollingRef = useRef(false)

  const project = PROJECTS[activeProjectIndex] || PROJECTS[0]

  // Initialize Lenis smooth-scrolling for the index grid with the iconic inertia deceleration ("after-smoothness")
  useEffect(() => {
    if (!isGridView || !gridScrollRef.current) return

    const wrapper = gridScrollRef.current
    const content = gridContentRef.current || wrapper.firstElementChild

    const lenis = new Lenis({
      wrapper,
      content,
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Iconic Lenis exponential momentum
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis

    lenis.on('scroll', (e) => {
      // While actively gliding, prevent cards passing under cursor from altering project text
      isScrollingRef.current = Math.abs(e.velocity) > 0.08
    })

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
      isScrollingRef.current = false
    }
  }, [isGridView])

  const handlePosterClick = (projectIdx) => {
    setActiveProjectIndex(projectIdx)
    if (onToggleView) onToggleView(false)
  }

  // Active project change callback from 3D cloth canvas (strictly disabled during index view)
  const handleClothProjectChange = (idx) => {
    if (!isGridView) {
      setActiveProjectIndex(idx)
    }
  }

  // Allow scrolling anywhere in the index view (even over fixed side text) to drive Lenis smoothly
  const handleSideWheel = (e) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(lenisRef.current.scroll + e.deltaY * 1.1, {
        immediate: false,
        duration: 1.1,
      })
    }
  }

  // Only update project on intentional hover / cursor movement over a poster (ignored while scrolling)
  const handlePosterHover = (projectIdx) => {
    if (isScrollingRef.current) return
    setActiveProjectIndex(projectIdx)
  }

  return (
    <section
      data-lenis-prevent
      className="relative w-full h-screen overflow-hidden bg-[#F0F0F0] select-none"
    >
      {/* 1. 3D Floating Cloth View Mode (Gallery View) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isGridView ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {/* Top-Left Brand Name (Editorial Typography) */}
        <div className="absolute top-[92px] sm:top-28 md:top-32 left-[20px] sm:left-7 md:left-8 z-10 pointer-events-none max-w-[calc(100vw-40px)] md:max-w-[80vw]">
          <h1
            key={project.title}
            className="text-[34px] sm:text-[44px] md:text-[clamp(2.4rem,5.5vw,5.2rem)] font-thebold font-bold text-black uppercase leading-[0.88] tracking-tight m-0 p-0 transition-all duration-500 ease-out animate-fadeIn"
          >
            {splitWordsEvery2(project.title).map((line, idx) => (
              <span key={idx} className="block leading-[0.88]">
                {line}
              </span>
            ))}
          </h1>
        </div>

        {/* Bottom Paragraph & Project Tags */}
        <div className="absolute bottom-[32px] left-[20px] right-[20px] md:left-auto md:right-8 md:bottom-20 z-10 pointer-events-none max-w-[calc(100vw-40px)] md:max-w-[430px] text-left">
          <p
            key={project.description}
            className="font-neue text-[14px] sm:text-[15px] leading-[1.38] md:leading-[1.42] text-black font-normal mb-3 sm:mb-4 md:mb-5 tracking-tight sm:tracking-normal transition-all duration-500 ease-out animate-fadeIn"
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

        {/* Real XPBD Cloth Simulation Canvas */}
        <ClothCanvas
          motionProgressRef={currentY}
          activeProjectIndex={activeProjectIndex}
          onActiveProjectChange={handleClothProjectChange}
        />
      </div>

      {/* 2. Index View Mode (matching user reference screenshot media_1795447331044_178c8656.jpg) */}
      <div
        className={`absolute inset-0 z-30 flex bg-[#F0F0F0] transition-opacity duration-500 pt-[88px] sm:pt-32 md:pt-36 pb-[32px] px-[20px] sm:px-7 md:px-8 ${
          isGridView ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
          {/* Left Side: 4-Column Poster Grid (Silky Lenis Inertia Scroll, without any visible scrollbar) */}
          <div
            ref={gridScrollRef}
            className="w-full lg:w-[68%] xl:w-[70%] h-full overflow-y-auto no-scrollbar pt-2 pr-1 sm:pr-2 pb-20 lg:pb-28 select-none"
          >
            <div
              ref={gridContentRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-4.5"
            >
              {INDEX_POSTERS.map((poster, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePosterClick(poster.projectIdx)}
                  onMouseEnter={() => handlePosterHover(poster.projectIdx)}
                  onMouseMove={() => handlePosterHover(poster.projectIdx)}
                  className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img
                    src={poster.src}
                    alt={poster.alt}
                    className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Editorial Project Info (100% Fixed and stationary alongside scrolling posters) */}
          <div
            onWheel={handleSideWheel}
            className="w-full lg:w-[32%] xl:w-[30%] lg:pl-6 xl:pl-8 text-left shrink-0 select-none pointer-events-auto pt-2 pb-4 lg:pb-0"
          >
            <h1 className="text-[clamp(2.4rem,4.5vw,5rem)] font-thebold font-bold text-black uppercase leading-[0.85] tracking-tight m-0 p-0 transition-all duration-300">
              {splitWordsEvery2(project.title).map((line, idx) => (
                <span key={idx} className="block leading-[0.85]">
                  {line}
                </span>
              ))}
            </h1>

            <p className="font-neue text-[14px] sm:text-[15px] leading-[1.38] md:leading-[1.42] text-black font-normal mt-4 sm:mt-6 max-w-[380px] tracking-tight sm:tracking-normal transition-all duration-300">
              {project.description}
            </p>

            <p className="font-neue text-[11px] sm:text-[12px] font-medium tracking-[0.06em] text-black uppercase mt-4 sm:mt-5 transition-all duration-300">
              {project.tags}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Center Toggle CTA: Gallery <-> Index (Desktop only, as mobile has toggle in top bar) */}
      <div className="hidden md:block fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => onToggleView && onToggleView(!isGridView)}
          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white text-black font-neue text-sm sm:text-base font-medium leading-none cursor-pointer tracking-normal transition-transform duration-200 active:scale-95 select-none"
        >
          {isGridView ? 'Gallery' : 'Index'}
        </button>
      </div>
    </section>
  )
}
