import { useState } from 'react'

export default function Navbar({ isGridView = false, onToggleView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navItems = ['Home', 'Works', 'Contact', 'Blog']

  const handleNavClick = (item) => {
    if (item === 'Works' && onToggleView) {
      onToggleView(true)
    } else if (item === 'Home' && onToggleView) {
      onToggleView(false)
    }
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-[20px] pt-[32px] md:px-8 md:py-5 pointer-events-none">
        {/* Mobile Header: Left Index / Gallery button */}
        <div className="flex md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => onToggleView && onToggleView(!isGridView)}
            className="px-5 py-2.5 rounded-full bg-black text-white font-neue text-sm font-medium leading-none cursor-pointer tracking-normal transition-transform active:scale-95 select-none"
          >
            {isGridView ? 'Gallery' : 'Index'}
          </button>
        </div>

        {/* Desktop Header: Left Navigation Pills */}
        <nav className="hidden md:flex items-center gap-0 pointer-events-auto">
          {navItems.map((item) => {
            const isActive = (item === 'Works' && isGridView) || (item === 'Home' && !isGridView)
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`px-5 py-3 rounded-full text-black font-neue text-base leading-none cursor-pointer tracking-normal transition-colors ${
                  isActive ? 'bg-[#CCCCCC] font-medium' : 'bg-[#DCDCDC] font-normal hover:bg-[#D4D4D4]'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        {/* Mobile Header: Right Resume + Menu buttons */}
        <div className="flex md:hidden items-center gap-2 pointer-events-auto">
          <button
            type="button"
            className="px-5 py-2.5 rounded-full bg-black text-white font-neue text-sm font-medium leading-none cursor-pointer tracking-normal transition-transform active:scale-95 select-none"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-4.5 py-2.5 rounded-full bg-[#E5E5E5] text-black font-neue text-sm font-normal leading-none cursor-pointer tracking-normal transition-colors hover:bg-[#DCDCDC] active:scale-95 select-none"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Desktop Header: Right Resume CTA */}
        <div className="hidden md:block pointer-events-auto">
          <button
            type="button"
            className="px-7 py-3 rounded-full bg-black text-white font-neue text-base font-medium leading-none cursor-pointer tracking-normal transition-none"
          >
            Resume
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown Modal */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs md:hidden flex justify-end p-[20px] pt-[84px]"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-3 shadow-2xl min-w-[190px] h-fit flex flex-col gap-1 border border-neutral-200 pointer-events-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const isActive = (item === 'Works' && isGridView) || (item === 'Home' && !isGridView)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-neue text-sm transition-colors cursor-pointer ${
                    isActive ? 'bg-[#EAEAEA] font-medium text-black' : 'text-neutral-700 hover:bg-[#F5F5F5]'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
