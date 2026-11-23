import Lenis from 'lenis'

/**
 * Modern factory for Lenis smooth scrolling instance
 */
export const createLenis = (options = {}) => {
  return new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    ...options,
  })
}

export default createLenis
