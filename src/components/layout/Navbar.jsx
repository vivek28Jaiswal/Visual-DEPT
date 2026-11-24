export default function Navbar({ isGridView = false, onToggleView }) {
  const navItems = ['Home', 'Works', 'Contact', 'Blog']

  const handleNavClick = (item) => {
    if (item === 'Works' && onToggleView) {
      onToggleView(true)
    } else if (item === 'Home' && onToggleView) {
      onToggleView(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-5 sm:px-7 md:px-8 py-5">
      {/* Left Navigation Pills */}
      <nav className="flex items-center gap-0">
        {navItems.map((item) => {
          const isActive = (item === 'Works' && isGridView) || (item === 'Home' && !isGridView)
          return (
            <button
              key={item}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-full text-black font-neue text-sm sm:text-base leading-none cursor-pointer tracking-normal transition-colors ${
                isActive ? 'bg-[#CCCCCC] font-medium' : 'bg-[#DCDCDC] font-normal hover:bg-[#D4D4D4]'
              }`}
            >
              {item}
            </button>
          )
        })}
      </nav>

      {/* Right Resume CTA */}
      <div>
        <button
          type="button"
          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-black text-white font-neue text-sm sm:text-base font-medium leading-none cursor-pointer tracking-normal transition-none"
        >
          Resume
        </button>
      </div>
    </header>
  )
}
