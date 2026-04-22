import { useState, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Setup PDF.js worker via Vite's url import to avoid CDN/bundling errors
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export default function PDFTools({ language }) {
  const [activeTab, setActiveTab] = useState('invert'); // 'invert' or 'merge'

  // INVERT STATE
  const [invertFiles, setInvertFiles] = useState([]);
  const [invertDragging, setInvertDragging] = useState(false);
  const [invertStatus, setInvertStatus] = useState({ state: 'idle', currentFileIdx: 0, currentFilePages: 0, totalFilePages: 0 });
  const [invertWarning, setInvertWarning] = useState('');
  const invertInputRef = useRef(null);

  // MERGE STATE
  const [mergeFiles, setMergeFiles] = useState([]);
  const [mergeDragging, setMergeDragging] = useState(false);
  const [mergeStatus, setMergeStatus] = useState({ state: 'idle', message: '' });
  const [mergeWarning, setMergeWarning] = useState('');
  const mergeInputRef = useRef(null);

  const translations = {
    en: {
      title: "PDF Tools",
      description: "Fast, private, client-side PDF utilities. Everything is processed directly in your browser.",
      tabInvert: "Batch Invert",
      tabMerge: "Merge PDFs",
      dragDrop: "Drag and drop PDFs here, or click to browse",
      supported: "Supports .pdf files only",
      processing: "Processing",
      of: "of",
      page: "Page",
      done: "Complete!",
      error: "Error processing PDF. Please try again.",
      selectedFiles: "Selected files:",
      maxWarning: "Maximum 10 files allowed per batch to ensure browser stability.",
      // Invert specific
      invertBtn: "Invert & Download All",
      invertDesc: "Upload dark-mode PDFs to invert their colors and save printer ink.",
      // Merge specific
      mergeBtn: "Merge & Download",
      mergeDesc: "Combine multiple PDF documents into a single file quickly.",
      merging: "Merging PDFs...",
    },
    hi: {
      title: "पीडीएफ टूल्स",
      description: "तेज़, निजी, क्लाइंट-साइड पीडीएफ उपयोगिताएँ। सब कुछ सीधे आपके ब्राउज़र में प्रोसेस किया जाता है।",
      tabInvert: "बैच इन्वर्ट",
      tabMerge: "पीडीएफ मिलाएं",
      dragDrop: "अपनी पीडीएफ यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
      supported: "केवल .pdf फ़ाइलें समर्थित हैं",
      processing: "प्रोसेसिंग",
      of: "-",
      page: "पेज",
      done: "पूरा हुआ!",
      error: "पीडीएफ प्रोसेस करने में त्रुटि। कृपया पुनः प्रयास करें।",
      selectedFiles: "चयनित फ़ाइलें:",
      maxWarning: "ब्राउज़र स्थिरता के लिए एक बार में अधिकतम 10 फ़ाइलें।",
      // Invert specific
      invertBtn: "इन्वर्ट और सभी डाउनलोड करें",
      invertDesc: "रंगों को उलटने और प्रिंटर इंक बचाने के लिए डार्क-मोड पीडीएफ अपलोड करें।",
      // Merge specific
      mergeBtn: "मर्ज और डाउनलोड करें",
      mergeDesc: "कई पीडीएफ दस्तावेज़ों को जल्दी से एक फ़ाइल में मिलाएं।",
      merging: "पीडीएफ मिलाए जा रहे हैं...",
    }
  };
  const t = translations[language] || translations['en'];

  // --- BATCH INVERT LOGIC ---
  const handleInvertDrop = (e) => {
    e.preventDefault();
    setInvertDragging(false);
    handleInvertFiles(e.dataTransfer.files);
  };

  const handleInvertChange = (e) => {
    handleInvertFiles(e.target.files);
  };

  const handleInvertFiles = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type === 'application/pdf');
    if (files.length > 10) {
      setInvertWarning(t.maxWarning);
      setInvertFiles(files.slice(0, 10));
    } else {
      setInvertWarning('');
      setInvertFiles(files);
    }
    setInvertStatus({ state: 'idle', currentFileIdx: 0, currentFilePages: 0, totalFilePages: 0 });
  };

  const processBatchInvert = async () => {
    if (invertFiles.length === 0) return;
    setInvertStatus({ state: 'processing', currentFileIdx: 0, currentFilePages: 0, totalFilePages: 0 });

    for (let fIdx = 0; fIdx < invertFiles.length; fIdx++) {
      const file = invertFiles[fIdx];
      setInvertStatus(prev => ({ ...prev, currentFileIdx: fIdx, currentFilePages: 0, totalFilePages: '...' }));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        setInvertStatus(prev => ({ ...prev, totalFilePages: numPages }));

        // Let JS initialize jsPDF here, keep it minimal
        let doc = null;

        for (let i = 1; i <= numPages; i++) {
          setInvertStatus(prev => ({ ...prev, currentFilePages: i }));
          const page = await pdf.getPage(i);

          // Use a scale > 1 (e.g., 2) to maintain high visual fidelity when Canvas -> JPEG
          const renderScale = 2;
          const renderViewport = page.getViewport({ scale: renderScale });
          const originalViewport = page.getViewport({ scale: 1 });

          // Canvas 1: Render the original PDF page
          const canvas1 = document.createElement('canvas');
          canvas1.width = renderViewport.width;
          canvas1.height = renderViewport.height;
          const ctx1 = canvas1.getContext('2d', { willReadFrequently: true });

          await page.render({ canvasContext: ctx1, viewport: renderViewport }).promise;

          // Canvas 2: Hardware-accelerated inversion using filter
          const canvas2 = document.createElement('canvas');
          canvas2.width = renderViewport.width;
          canvas2.height = renderViewport.height;
          const ctx2 = canvas2.getContext('2d');

          ctx2.filter = 'invert(100%)';
          ctx2.drawImage(canvas1, 0, 0);

          // Convert to high-quality JPEG to reduce uncompressed PDF bloat compared to PNG
          const imgData = canvas2.toDataURL('image/jpeg', 0.95);
          const orientation = originalViewport.width > originalViewport.height ? 'landscape' : 'portrait';

          if (i === 1) {
            doc = new jsPDF({
              orientation,
              unit: 'pt',
              format: [originalViewport.width, originalViewport.height]
            });
          } else {
            doc.addPage([originalViewport.width, originalViewport.height], orientation);
          }

          // Add the scaled image into the jsPDF document mapped precisely to its original dimensions
          doc.addImage(imgData, 'JPEG', 0, 0, originalViewport.width, originalViewport.height);

          // Cleanup variables to aggressively garbage collect large page buffers
          page.cleanup();
          canvas1.width = 0; canvas1.height = 0;
          canvas2.width = 0; canvas2.height = 0;
        }

        const originalName = file.name.replace(/\.pdf$/i, '');
        // Trigger download for this one PDF
        doc.save(`invert_${originalName}.pdf`);

        // Manual cleanup for GC
        doc = null;
        await pdf.destroy();

      } catch (error) {
        console.error(`Error processing PDF at index ${fIdx}:`, error);
        setInvertStatus({ state: 'error', currentFileIdx: fIdx, currentFilePages: 0, totalFilePages: 0 });
        return; // Break out
      }
    }

    setInvertStatus({ state: 'done', currentFileIdx: invertFiles.length - 1, currentFilePages: 0, totalFilePages: 0 });
  };


  // --- BATCH MERGE LOGIC ---
  const handleMergeDrop = (e) => {
    e.preventDefault();
    setMergeDragging(false);
    handleMergeFiles(e.dataTransfer.files);
  };

  const handleMergeChange = (e) => {
    handleMergeFiles(e.target.files);
  };

  const handleMergeFiles = (fileList) => {
    const files = Array.from(fileList).filter(f => f.type === 'application/pdf');
    if (files.length > 10) {
      setMergeWarning(t.maxWarning);
      setMergeFiles(files.slice(0, 10));
    } else {
      setMergeWarning('');
      setMergeFiles(files);
    }
    setMergeStatus({ state: 'idle', message: '' });
  };

  const processMerge = async () => {
    if (mergeFiles.length === 0) return;
    setMergeStatus({ state: 'processing', message: t.merging });

    try {
      const mergedPdf = await PDFDocument.create();

      for (let fIdx = 0; fIdx < mergeFiles.length; fIdx++) {
        const file = mergeFiles[fIdx];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        // Copy all pages
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();

      // Download merged bytes
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = 'merged_document.pdf';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);

      setMergeStatus({ state: 'done', message: t.done });
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setMergeStatus({ state: 'error', message: t.error });
    }
  };


  return (
    <div className="w-full max-w-[800px] mt-12 mb-20 px-6 sm:px-10 flex flex-col gap-8 animate-fade-in relative">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
          {t.title}
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-base sm:text-lg">
          {t.description}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low rounded-2xl p-1 shadow-sm mx-auto w-full max-w-md">
        <button
          onClick={() => setActiveTab('invert')}
          className={`flex-1 py-3 px-4 rounded-xl cursor-pointer font-bold text-sm sm:text-base transition-all duration-200 ${activeTab === 'invert' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined align-middle mr-2 text-[20px]" data-icon="contrast">contrast</span>
          {t.tabInvert}
        </button>
        <button
          onClick={() => setActiveTab('merge')}
          className={`flex-1 py-3 cursor-pointer px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${activeTab === 'merge' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
        >
          <span className="material-symbols-outlined align-middle mr-2 text-[20px]" data-icon="merge">merge</span>
          {t.tabMerge}
        </button>
      </div>

      {/* INVERT UI */}
      {activeTab === 'invert' && (
        <div className="bg-surface-container-lowest p-6 sm:p-8 border border-outline-variant/30 rounded-3xl shadow-lg transition-all fade-in">
          <div className="mb-6 text-center">
            <p className="text-on-surface-variant font-medium">{t.invertDesc}</p>
          </div>

          <div
            className={`w-full p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[250px]
              ${invertDragging ? 'bg-primary-container/20 border-primary scale-[1.02]' : 'bg-surface-container border-outline-variant/30 hover:border-primary/50'}`}
            onDragOver={(e) => { e.preventDefault(); setInvertDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setInvertDragging(false); }}
            onDrop={handleInvertDrop}
            onClick={() => invertInputRef.current?.click()}
          >
            <span className={`material-symbols-outlined text-5xl transition-colors duration-300 ${invertDragging ? 'text-primary' : 'text-primary/70'}`} data-icon="upload_file">
              upload_file
            </span>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg text-on-surface">{t.dragDrop}</p>
              <p className="text-on-surface-variant text-sm">{t.supported}</p>
            </div>
            <input type="file" ref={invertInputRef} className="hidden" accept="application/pdf" multiple onChange={handleInvertChange} />
          </div>

          {invertWarning && (
            <div className="mt-4 p-3 bg-secondary-container text-on-secondary-container rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in shadow-sm">
              <span className="material-symbols-outlined text-xl" data-icon="warning">warning</span>
              {invertWarning}
            </div>
          )}

          {invertFiles.length > 0 && (
            <div className="mt-6 flex flex-col gap-5 animate-fade-in">
              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20 shadow-inner">
                <p className="text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
                  <span>{t.selectedFiles}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{invertFiles.length} / 10</span>
                </p>
                <ul className="space-y-2 text-sm max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                  {invertFiles.map((f, i) => (
                    <li key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${invertStatus.state === 'processing' && invertStatus.currentFileIdx === i ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-on-surface/5'}`}>
                      <span className="material-symbols-outlined text-base" data-icon="picture_as_pdf">picture_as_pdf</span>
                      <span className="truncate flex-1">{f.name}</span>
                      {invertStatus.state === 'done' && <span className="material-symbols-outlined text-sm text-green-500" data-icon="check_circle">check_circle</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={processBatchInvert}
                  disabled={invertStatus.state === 'processing'}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                >
                  {invertStatus.state === 'processing' ? (
                    <><span className="material-symbols-outlined animate-spin" data-icon="progress_activity">progress_activity</span>{t.processing} ({invertStatus.currentFileIdx + 1}/{invertFiles.length})</>
                  ) : invertStatus.state === 'done' ? (
                    <><span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>{t.done}</>
                  ) : (
                    <><span className="material-symbols-outlined" data-icon="contrast">contrast</span>{t.invertBtn}</>
                  )}
                </button>

                {invertStatus.state === 'error' && <p className="text-error font-medium fade-in">{t.error}</p>}

                {/* Progress display for current file inner iteration */}
                {invertStatus.state === 'processing' && invertStatus.totalFilePages > 0 && (
                  <div className="w-full max-w-[400px] animate-fade-in text-center">
                    <p className="text-xs text-on-surface-variant mb-2 font-medium">{t.page} {invertStatus.currentFilePages} {t.of} {invertStatus.totalFilePages}</p>
                    <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(invertStatus.currentFilePages / invertStatus.totalFilePages) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* MERGE UI */}
      {activeTab === 'merge' && (
        <div className="bg-surface-container-lowest p-6 sm:p-8 border border-outline-variant/30 rounded-3xl shadow-lg transition-all fade-in">
          <div className="mb-6 text-center">
            <p className="text-on-surface-variant font-medium">{t.mergeDesc}</p>
          </div>

          <div
            className={`w-full p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[250px]
              ${mergeDragging ? 'bg-primary-container/20 border-primary scale-[1.02]' : 'bg-surface-container border-outline-variant/30 hover:border-primary/50'}`}
            onDragOver={(e) => { e.preventDefault(); setMergeDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setMergeDragging(false); }}
            onDrop={handleMergeDrop}
            onClick={() => mergeInputRef.current?.click()}
          >
            <span className={`material-symbols-outlined text-5xl transition-colors duration-300 ${mergeDragging ? 'text-primary' : 'text-primary/70'}`} data-icon="queue_play_next">
              queue_play_next
            </span>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg text-on-surface">{t.dragDrop}</p>
              <p className="text-on-surface-variant text-sm">{t.supported}</p>
            </div>
            <input type="file" ref={mergeInputRef} className="hidden" accept="application/pdf" multiple onChange={handleMergeChange} />
          </div>

          {mergeWarning && (
            <div className="mt-4 p-3 bg-secondary-container text-on-secondary-container rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in shadow-sm">
              <span className="material-symbols-outlined text-xl" data-icon="warning">warning</span>
              {mergeWarning}
            </div>
          )}

          {mergeFiles.length > 0 && (
            <div className="mt-6 flex flex-col gap-5 animate-fade-in">
              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/20 shadow-inner overflow-hidden">
                <p className="text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
                  <span>{t.selectedFiles}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{mergeFiles.length} / 10</span>
                </p>
                <ul className="space-y-2 text-sm max-h-[160px] overflow-y-auto custom-scrollbar pr-2 block">
                  {mergeFiles.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-lg text-on-surface-variant hover:bg-on-surface/5 transition-colors group">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">{i + 1}</span>
                      <span className="truncate flex-1 font-medium">{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={processMerge}
                  disabled={mergeStatus.state === 'processing'}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
                >
                  {mergeStatus.state === 'processing' ? (
                    <><span className="material-symbols-outlined animate-spin" data-icon="progress_activity">progress_activity</span>{mergeStatus.message}</>
                  ) : mergeStatus.state === 'done' ? (
                    <><span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>{mergeStatus.message}</>
                  ) : (
                    <><span className="material-symbols-outlined" data-icon="merge">merge</span>{t.mergeBtn}</>
                  )}
                </button>

                {mergeStatus.state === 'error' && <p className="text-error font-medium fade-in">{mergeStatus.message}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
