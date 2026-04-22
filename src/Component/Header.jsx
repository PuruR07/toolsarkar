import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/resume-maker', label: 'Resume Builder', icon: 'description' },
  { to: '/passport-maker', label: 'Passport Photo', icon: 'badge' },
  { to: '/pdf-tools', label: 'PDF Tools', icon: 'picture_as_pdf' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="w-full bg-surface/80 backdrop-blur-lg sticky top-0 z-50 border-b border-outline-variant/15 shadow-sm transition-all duration-300">
      <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between px-6 sm:px-10 py-3.5">

        {/* Logo */}
        <Link
          to="/"
          id="header-logo"
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
            <span className="material-symbols-outlined text-[22px] text-on-primary" data-icon="handyman">handyman</span>
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-black text-lg tracking-tight text-on-surface">
              Tool<span className="text-primary">Sarkar</span>
            </span>
            <span className="text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase -mt-0.5">
              Free Digital Tools
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" id="header-nav-desktop">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              id={`nav-${link.to.slice(1)}`}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-semibold transition-all duration-200
                ${isActive(link.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]" data-icon={link.icon}>{link.icon}</span>
              {link.label}
              {isActive(link.to) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-on-surface hover:bg-primary/5 hover:text-primary transition-all duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          id="header-menu-toggle"
        >
          <span className="material-symbols-outlined text-[26px]" data-icon={isMenuOpen ? 'close' : 'menu'}>
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="flex flex-col gap-1 px-6 pb-5 pt-1 border-t border-outline-variant/10 bg-surface/95 backdrop-blur-lg" id="header-nav-mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-200
                ${isActive(link.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon={link.icon}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
