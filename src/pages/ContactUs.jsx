export default function ContactUs() {
  return (
    <div className="w-full max-w-[600px] mx-auto px-6 sm:px-10 py-16 sm:py-24 animate-fade-in text-center space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-4">Contact Us</h1>
        <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
          Have a question, feedback, or need support? We'd love to hear from you.
        </p>
      </div>

      <div className="bg-surface rounded-3xl border border-outline-variant/20 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2 text-primary">
          <span className="material-symbols-outlined text-3xl" data-icon="mail">mail</span>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Why no contact form?</h2>
          <p className="text-on-surface-variant leading-relaxed">
            As a strict privacy-first platform, we avoid deploying any server-side data collection mechanisms—including contact forms. To reach out, please send us an email directly from your preferred email client.
          </p>
        </div>

        <div className="pt-4 border-t border-outline-variant/15">
          <a 
            href="mailto:support@toolsarkar.com" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-lg sm:text-xl transition-colors"
          >
            support@toolsarkar.com
          </a>
        </div>
      </div>
    </div>
  )
}
