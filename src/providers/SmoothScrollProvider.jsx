import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createLenis } from '@/lib/lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import 'lenis/dist/lenis.css'

const SmoothScrollContext = createContext(null)

export const useSmoothScroll = () => {
  return useContext(SmoothScrollContext)
}

export const SmoothScrollProvider = ({ children }) => {
  const [lenis, setLenis] = useState(null)
  const lenisRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis
    const instance = createLenis()
    lenisRef.current = instance
    setLenis(instance)

    // Synchronize Lenis with GSAP ScrollTrigger
    instance.on('scroll', ScrollTrigger.update)

    // Hook Lenis into GSAP ticker for synchronized animation loops
    const updateTicker = (time) => {
      instance.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateTicker)
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export default SmoothScrollProvider
