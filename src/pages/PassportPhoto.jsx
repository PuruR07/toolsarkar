import { useState } from 'react';
import PassportPhotoMaker from '../Component/PassportPhotoMaker';

export default function PassportPhoto({ language }) {
  const [generatedFile, setGeneratedFile] = useState(null);

  const t = {
    en: {
      title: 'Passport Photo Maker',
      subtitle: 'Professional passport photos in seconds',
      desc: 'Our AI-powered tool automatically removes backgrounds and formats your photos perfectly for printing. Choose from standard and small passport sizes, adjust lighting, and generate print-ready PDF sheets — all processed securely in your browser.',
      features: [
        { icon: 'auto_fix_high', text: 'AI Background Removal' },
        { icon: 'crop', text: 'Precision Cropping' },
        { icon: 'print', text: 'Print-Ready PDF' },
      ],
      ready: 'Your PDF is ready!',
      fileName: 'File:',
    },
    hi: {
      title: 'पासपोर्ट फोटो मेकर',
      subtitle: 'सेकंडों में प्रोफेशनल पासपोर्ट फोटो',
      desc: 'हमारा AI-संचालित टूल स्वचालित रूप से बैकग्राउंड हटाता है और आपकी फोटो को प्रिंटिंग के लिए परफेक्ट फॉर्मेट करता है। स्टैंडर्ड और स्मॉल पासपोर्ट साइज़ में से चुनें, लाइटिंग एडजस्ट करें, और प्रिंट-रेडी PDF शीट बनाएं — सब कुछ आपके ब्राउज़र में सुरक्षित रूप से प्रोसेस किया जाता है।',
      features: [
        { icon: 'auto_fix_high', text: 'AI बैकग्राउंड रिमूवल' },
        { icon: 'crop', text: 'प्रिसिज़न क्रॉपिंग' },
        { icon: 'print', text: 'प्रिंट-रेडी PDF' },
      ],
      ready: 'आपकी PDF तैयार है!',
      fileName: 'फ़ाइल:',
    },
  }[language] || {
    title: 'Passport Photo Maker',
    subtitle: 'Professional passport photos in seconds',
    desc: 'Our AI-powered tool automatically removes backgrounds and formats your photos perfectly for printing. Choose from standard and small passport sizes, adjust lighting, and generate print-ready PDF sheets — all processed securely in your browser.',
    features: [
      { icon: 'auto_fix_high', text: 'AI Background Removal' },
      { icon: 'crop', text: 'Precision Cropping' },
      { icon: 'print', text: 'Print-Ready PDF' },
    ],
    ready: 'Your PDF is ready!',
    fileName: 'File:',
  };

  return (
    <main className="w-full max-w-[900px] px-4 sm:px-10 py-10 flex flex-col gap-10 animate-fade-in">
      {/* Glassmorphism Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-lg p-8 sm:p-10">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-on-tertiary-container/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-2">
            <span className="material-symbols-outlined text-primary text-lg" data-icon="badge">badge</span>
            <span className="text-xs font-bold text-primary tracking-wide uppercase">{t.subtitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            {t.title}
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t.desc}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            {t.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl border border-outline-variant/15 shadow-sm">
                <span className="material-symbols-outlined text-primary text-lg" data-icon={feat.icon}>{feat.icon}</span>
                <span className="text-sm font-semibold text-on-surface">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Passport Photo Maker Component */}
      <PassportPhotoMaker
        language={language}
        onGenerateComplete={(file) => setGeneratedFile(file)}
      />

      {/* Generated file status */}
      {generatedFile && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-4 animate-fade-in mx-auto w-full max-w-xl">
          <span className="material-symbols-outlined text-3xl text-primary" data-icon="task">task</span>
          <div className="flex-1 min-w-0">
            <p className="text-primary font-bold text-sm">{t.ready}</p>
            <p className="text-on-surface-variant text-xs truncate">{t.fileName} {generatedFile.name}</p>
          </div>
          <span className="material-symbols-outlined text-primary/50 text-xl" data-icon="download_done">download_done</span>
        </div>
      )}
    </main>
  );
}
