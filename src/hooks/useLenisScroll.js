import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

/**
 * Hook to access Lenis instance across components
 */
export const useLenisScroll = () => {
  const context = useSmoothScroll()
  return context?.lenis ?? null
}

export default useLenisScroll
