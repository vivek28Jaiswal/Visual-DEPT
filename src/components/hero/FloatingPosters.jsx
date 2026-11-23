import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import post1 from '@/assets/images/post1.jpg'
import post2 from '@/assets/images/post2.jfif'
import post3 from '@/assets/images/post3.jfif'

export default function FloatingPosters({ motionProgressRef }) {
  const stageRef = useRef(null)
  const cardRefs = useRef([])

  // Repeating sequence of 9 posters (3 cycles of 3 images) for continuous seamless looping
  const posterItems = [
    { id: 'p0', src: post1, alt: 'Poster 1', floatAnim: 'animate-float-a' },
    { id: 'p1', src: post2, alt: 'Poster 2', floatAnim: 'animate-float-b' },
    { id: 'p2', src: post3, alt: 'Poster 3', floatAnim: 'animate-float-c' },
    { id: 'p3', src: post1, alt: 'Poster 4', floatAnim: 'animate-float-d' },
    { id: 'p4', src: post2, alt: 'Poster 5', floatAnim: 'animate-float-a' },
    { id: 'p5', src: post3, alt: 'Poster 6', floatAnim: 'animate-float-b' },
    { id: 'p6', src: post1, alt: 'Poster 7', floatAnim: 'animate-float-c' },
    { id: 'p7', src: post2, alt: 'Poster 8', floatAnim: 'animate-float-d' },
    { id: 'p8', src: post3, alt: 'Poster 9', floatAnim: 'animate-float-a' },
  ]

  const N = posterItems.length
  // Spacing: 22vw between card centers guarantees consistent 15-30% overlap with zero gaps
  const dx = 22 // vw spacing between card centers
  const totalDist = N * dx // 198vw
  const minX = -32 // vw (offscreen bottom-left)
  const maxX = minX + totalDist // 166vw (offscreen top-right)

  useEffect(() => {
    const wrapX = gsap.utils.wrap(minX, maxX)

    // GSAP 60/120fps physics loop directly manipulating 3D transforms
    const tick = () => {
      // Scroll offset driven by smooth motion physics
      const rawOffset = motionProgressRef?.current ? -motionProgressRef.current * 0.08 : 0

      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i]
        if (!el) continue

        const rawX = i * dx + rawOffset
        const x = wrapX(rawX)
        // Normalized progress t: 0 (bottom-left) to 1 (top-right)
        const t = (x - minX) / totalDist

        // Centered vertical curve:
        // Lowered from previous high position so the cards sit nicely in the vertical center of the screen
        // Left side starts at ~63vh, middle is at ~51vh, right side reaches ~38vh
        const y = 67 - Math.pow(Math.max(0, t), 1.1) * 44

        // Smooth size progression from small (0.72) at bottom-left to large (1.45) at top-right
        const scale = 0.72 + t * 0.73

        // Natural, distinct 3D rotations matching the reference composition
        const rotZ = -18 + t * 40 // -18deg counter-clockwise to +22deg clockwise
        const rotY = 18 - t * 38 // 18deg to -20deg planar tilt
        const rotX = 8 - t * 16 // 8deg to -8deg pitch

        // Strict z-index hierarchy ensuring each card sits cleanly on top of the one behind it
        const zIndex = Math.round(t * 100) + 10

        // Per-card perspective projection WITHOUT preserve-3d on parent to completely eliminate GPU 3D polygon cutout / slicing artifacts
        el.style.transform = `translate3d(${x}vw, ${y}vh, 0px) translate(-50%, -50%) perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`
        el.style.zIndex = zIndex
      }
    }

    gsap.ticker.add(tick)

    // Subtle 3D mouse parallax tilt across the whole diagonal constellation
    const handleMouseMove = (e) => {
      if (!stageRef.current) return
      const { innerWidth, innerHeight } = window
      const normX = (e.clientX / innerWidth - 0.5) * 2
      const normY = (e.clientY / innerHeight - 0.5) * 2

      gsap.to(stageRef.current, {
        rotateX: -normY * 2.5,
        rotateY: normX * 4,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [motionProgressRef, N, dx, totalDist, minX, maxX])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* 2.5D Stage (Clean stacking context to eliminate 3D polygon intersection clipping) */}
      <div ref={stageRef} className="relative w-full h-full will-change-transform">
        {posterItems.map((poster, index) => (
          <div
            key={poster.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className="absolute top-0 left-0 w-[26vw] min-w-[270px] max-w-[400px] will-change-transform"
            style={{ borderRadius: '0px' }}
          >
            {/* Subtle organic floating motion wrapper */}
            <div className={`${poster.floatAnim} w-full h-full will-change-transform`}>
              {/* Poster Card Surface (Clean intact rectangle, NO cutout, NO black border) */}
              <div
                className="group relative aspect-[3/4] w-full rounded-none overflow-hidden shadow-[0_24px_55px_-12px_rgba(0,0,0,0.45)] bg-neutral-900 transition-transform duration-300 ease-out pointer-events-auto hover:scale-[1.03] cursor-pointer"
                style={{
                  borderRadius: '0px',
                  border: 'none',
                  outline: 'none',
                }}
              >
                {/* Poster Artwork (Preserved proportions, sharp corners, no border) */}
                <img
                  src={poster.src}
                  alt={poster.alt}
                  className="w-full h-full object-cover select-none pointer-events-none rounded-none"
                  draggable={false}
                  style={{
                    borderRadius: '0px',
                    border: 'none',
                  }}
                />

                {/* Subtle specular sheen overlay (without any stroke/outline) */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 pointer-events-none opacity-60 group-hover:opacity-85 transition-opacity duration-300 rounded-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
