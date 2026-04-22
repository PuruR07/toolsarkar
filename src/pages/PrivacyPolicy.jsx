export default function PrivacyPolicy() {
  return (
    <div className="w-full max-w-[800px] mx-auto px-6 sm:px-10 py-16 sm:py-24 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-on-surface-variant font-medium leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">1. Introduction</h2>
          <p>
            Welcome to ToolSarkar. Your privacy is critically important to us. This Privacy Policy explains how we handle your data when you use our digital tools, including the Resume Builder, Passport Photo Maker, and PDF Tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">2. Zero-Server-Upload Architecture & Local Processing</h2>
          <p>
            ToolSarkar is built with a strict privacy-first architecture. <strong>We do not upload, store, or process your files on our servers.</strong> 
          </p>
          <p>
            When you use our tools to create a resume, upload a photo, or manipulate a PDF, all processing is performed <strong>locally within your web browser</strong> on your device. Your sensitive data, images, and documents never leave your computer or mobile device.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">3. Information We Collect</h2>
          <p>
            Because our core features operate entirely client-side, we do not collect personal information like your name, email address, or document contents. We intentionally do not use contact forms on our website to further minimize server-side data collection. If you explicitly choose to contact us via direct email, we only use that information to respond to your inquiry and never store it for marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">4. Google AdSense & Advertising Cookies</h2>
          <p>
            We use Google AdSense to display advertisements on ToolSarkar. Google, as a third-party vendor, uses cookies to serve ads on our site.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Ads Settings</a>. (Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">5. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party sites or advertisements. If you click on a third-party link, you will be directed to that site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-on-surface">6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>
      </div>
    </div>
  )
}
