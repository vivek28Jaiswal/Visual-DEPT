export default function Navbar() {
  const navItems = ['Home', 'Works', 'Contact', 'Blog']

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-5 sm:px-7 md:px-8 py-5">
      {/* Left Navigation Pills: back to original left place, gap-0, no extra wrapper background */}
      <nav className="flex items-center gap-0">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className="px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#DCDCDC] text-black font-neue text-sm sm:text-base font-normal leading-none cursor-pointer tracking-normal transition-none"
          >
            {item}
          </button>
        ))}
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
