import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/layout/HeroSection'

export default function App() {
  const [isGridView, setIsGridView] = useState(false)

  return (
    <main className="min-h-screen h-[100dvh] bg-white text-black overflow-hidden">
      <Navbar isGridView={isGridView} onToggleView={setIsGridView} />
      <HeroSection isGridView={isGridView} onToggleView={setIsGridView} />
    </main>
  )
}
