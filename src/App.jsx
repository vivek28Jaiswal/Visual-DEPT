import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/layout/HeroSection'

export default function App() {
  const [isGridView, setIsGridView] = useState(false)

  return (
    <main className="min-h-screen bg-[#F0F0F0] text-black">
      <Navbar isGridView={isGridView} onToggleView={setIsGridView} />
      <HeroSection isGridView={isGridView} onToggleView={setIsGridView} />
    </main>
  )
}
