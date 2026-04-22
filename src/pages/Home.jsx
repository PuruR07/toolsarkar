import { Link } from 'react-router-dom'

const TOOLS = [
  {
    to: '/resume-maker',
    icon: 'description',
    title: 'Resume Builder',
    description: 'Craft a professional, ATS-friendly resume in minutes with our beautifully designed templates and live editor.',
    cta: 'Build Your Resume',
    accent: 'primary',
  },
  {
    to: '/passport-maker',
    icon: 'badge',
    title: 'Passport Photo Maker',
    description: 'AI-powered background removal, precision cropping, and instant print-ready PDF sheets for passport photos.',
    cta: 'Create Photo',
    accent: 'on-tertiary-container',
  },
  {
    to: '/pdf-tools',
    icon: 'picture_as_pdf',
    title: 'PDF Tools',
    description: 'Batch-invert dark-mode PDFs to save ink, or merge multiple documents into one — all processed in your browser.',
    cta: 'Open PDF Tools',
    accent: 'secondary',
  },
]

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">

      {/* ─── Hero Section ─── */}
      <section className="relative w-full overflow-hidden bg-surface" id="hero-section">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-on-tertiary-container/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 sm:px-10 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/8 border border-primary/15 rounded-full animate-fade-in">
            <span className="material-symbols-outlined text-primary text-[18px]" data-icon="bolt">bolt</span>
            <span className="text-xs font-bold text-primary tracking-wider uppercase">100% Free &amp; Private</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-[1.1] max-w-3xl">
            Free Digital Tools{' '}
            <span className="bg-gradient-to-r from-primary to-[#224489] bg-clip-text text-transparent">
              for Everyone
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-on-surface-variant text-lg sm:text-xl max-w-2xl leading-relaxed font-medium">
            Build stunning resumes, create passport photos, and process PDFs — all instantly in your browser. No sign-up, no uploads to servers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Link
              to="/resume-maker"
              id="hero-cta-primary"
              className="flex items-center gap-2.5 px-8 py-3.5 bg-primary text-on-primary rounded-xl font-bold text-[15px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
              Get Started — It's Free
            </Link>
            <a
              href="#tools-section"
              id="hero-cta-secondary"
              className="flex items-center gap-2 px-8 py-3.5 bg-surface-variant/30 text-on-surface border border-outline-variant/20 rounded-xl font-bold text-[15px] hover:bg-surface-variant/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explore Tools
              <span className="material-symbols-outlined text-[18px]" data-icon="expand_more">expand_more</span>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-on-surface-variant">
            {[
              { icon: 'shield', text: 'Browser-only processing' },
              { icon: 'speed', text: 'Instant results' },
              { icon: 'lock', text: 'No data leaves your device' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-primary/70 text-[18px]" data-icon={item.icon}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tools Grid ─── */}
      <section className="w-full bg-surface-container-lowest py-20 sm:py-24" id="tools-section">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/8 rounded-full mb-5">
              <span className="material-symbols-outlined text-primary text-[16px]" data-icon="apps">apps</span>
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Our Tools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto font-medium">
              Professional-grade digital tools, completely free. Pick a tool and get started in seconds.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TOOLS.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                id={`tool-card-${tool.to.slice(1)}`}
                className="group relative bg-surface rounded-2xl border border-outline-variant/20 p-8 flex flex-col gap-5 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md bg-${tool.accent}/10`}>
                  <span className={`material-symbols-outlined text-[28px] text-${tool.accent}`} data-icon={tool.icon}>{tool.icon}</span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors duration-200">
                    {tool.title}
                  </h3>
                  <p className="text-on-surface-variant text-[15px] leading-relaxed font-medium flex-1">
                    {tool.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-bold text-[14px] mt-auto">
                  {tool.cta}
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-200" data-icon="arrow_forward">arrow_forward</span>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO / About Section ─── */}
      <section className="w-full bg-surface py-16 sm:py-20 border-b border-outline-variant/10" id="seo-section">
        <div className="max-w-[800px] mx-auto px-6 sm:px-10 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            How ToolSarkar Works
          </h2>
          <div className="text-on-surface-variant text-[15px] sm:text-base leading-relaxed font-medium space-y-4 text-left">
            <p>
              ToolSarkar is designed from the ground up to be a privacy-first, powerful suite of digital utilities. Whether you are generating a professional ATS-friendly resume, creating precise passport photos with AI background removal, or batch-editing PDFs, everything happens directly within your browser. By leveraging advanced web technologies, we provide you with seamless tools that match desktop software performance.
            </p>
            <p>
              Security and privacy are our core priorities. We utilize a strict zero-server-upload architecture, meaning your personal documents, photos, and PDFs never leave your device. All processing—from image cropping and color inversion to PDF merging—is handled locally. This guarantees that your sensitive information remains completely confidential.
            </p>
            <p>
              Because ToolSarkar operates entirely client-side, you benefit from instant results without the frustrating loading screens associated with cloud-based services. Say goodbye to mandatory sign-ups, hidden paywalls, and slow uploads. Experience lightning-fast, secure, and professional-grade digital tools built for the modern web.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="w-full bg-surface py-16 sm:py-20" id="bottom-cta">
        <div className="max-w-[800px] mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-on-surface-variant text-lg font-medium mb-8 max-w-lg mx-auto">
            No sign-up required. Pick a tool and start creating in seconds — completely free.
          </p>
          <Link
            to="/resume-maker"
            id="bottom-cta-btn"
            className="inline-flex items-center gap-2.5 px-10 py-4 bg-primary text-on-primary rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
            Start Building Your Resume
          </Link>
        </div>
      </section>
    </div>
  )
}
