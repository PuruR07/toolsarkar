import { Link } from 'react-router-dom'

const TOOL_LINKS = [
  { to: '/resume-maker', label: 'Resume Builder' },
  { to: '/passport-maker', label: 'Passport Photo Maker' },
  { to: '/pdf-tools', label: 'PDF Tools' },
]

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant/15 transition-all duration-300" id="site-footer">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center px-6 sm:px-10 py-10 w-full gap-8">

        {/* Brand */}
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-on-primary" data-icon="handyman">handyman</span>
            </div>
            <span className="font-black text-[15px] text-on-surface tracking-tight">
              Tool<span className="text-primary">Sarkar</span>
            </span>
          </Link>
          <p className="text-[13px] text-on-surface-variant font-medium">
            {`© ${new Date().getFullYear()} ToolSarkar. All rights reserved.`}
          </p>
        </div>

        {/* Right Side Navigation */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Tool Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8" id="footer-nav">
            {TOOL_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[13px] font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 mt-2">
            <Link to="/privacy" className="text-[12px] font-medium text-on-surface-variant/80 hover:text-primary transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-[12px] font-medium text-on-surface-variant/80 hover:text-primary transition-colors duration-200">Terms of Service</Link>
            <Link to="/contact" className="text-[12px] font-medium text-on-surface-variant/80 hover:text-primary transition-colors duration-200">Contact Us</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
