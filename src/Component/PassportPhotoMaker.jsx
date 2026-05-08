import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { jsPDF } from 'jspdf';

const FORMATS = {
  normal: { label: 'Normal (3.15 × 4.05 cm)', ratio: 3.5 / 4.5, widthMm: 31.5, heightMm: 40.5 },
  small: { label: 'Small (2.0 × 2.0 in - US Visa)', ratio: 1, widthMm: 51, heightMm: 51 },
};

export default function PassportPhotoMaker({ onGenerateComplete, language }) {
  // Core Array State
  const [photos, setPhotos] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Global States
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeName, setIncludeName] = useState(false);
  const [includeDate, setIncludeDate] = useState(false);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDateText, setCustomDateText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Refs & Worker
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);

  // Translations
  const t = {
    en: {
      uploadTitle: 'Upload Your Photo',
      uploadDesc: 'Drag & drop or click to upload a photo. Supports JPG, PNG, WEBP.',
      processing: 'Processing AI Background Removal...',
      bgDone: 'Background removed successfully!',
      bgError: 'Background removal failed. Please try a different image.',
      formatLabel: 'Photo Format',
      cropTitle: 'Crop Your Photo',
      cropDesc: 'Adjust the crop area. The aspect ratio is locked to the selected format.',
      brightnessLabel: 'Brightness',
      contrastLabel: 'Contrast',
      resetFilters: 'Reset',
      printConfig: 'Print Configuration',
      copies: 'Number of Copies',
      includeName: 'Include Name',
      namePlaceholder: 'Enter Name...',
      includeDate: 'Include Date',
      customDate: 'Use Custom Date Override',
      customDatePlaceholder: 'DD/MM/YYYY',
      bgColorLabel: 'Background Color',
      generate: 'Generate Final Sheet',
      generating: 'Generating PDF...',
      done: 'PDF Generated!',
      reupload: 'Upload New Photo',
    },
    hi: {
      uploadTitle: 'अपनी फोटो अपलोड करें',
      uploadDesc: 'ड्रैग और ड्रॉप करें या फोटो अपलोड करने के लिए क्लिक करें। JPG, PNG, WEBP समर्थित हैं।',
      processing: 'AI बैकग्राउंड हटाया जा रहा है...',
      bgDone: 'बैकग्राउंड सफलतापूर्वक हटा दिया गया!',
      bgError: 'बैकग्राउंड हटाने में विफल। कृपया दूसरी छवि आज़माएं।',
      formatLabel: 'फोटो फॉर्मेट',
      cropTitle: 'अपनी फोटो क्रॉप करें',
      cropDesc: 'क्रॉप क्षेत्र समायोजित करें। आस्पेक्ट रेशियो चयनित फॉर्मेट पर लॉक है।',
      brightnessLabel: 'चमक',
      contrastLabel: 'कंट्रास्ट',
      resetFilters: 'रीसेट',
      printConfig: 'प्रिंट कॉन्फ़िगरेशन',
      copies: 'प्रतियों की संख्या',
      includeName: 'नाम शामिल करें',
      namePlaceholder: 'नाम दर्ज करें...',
      includeDate: 'तारीख शामिल करें',
      customDate: 'कस्टम तारीख का उपयोग करें',
      customDatePlaceholder: 'DD/MM/YYYY',
      bgColorLabel: 'बैकग्राउंड कलर',
      generate: 'फाइनल शीट बनाएं',
      generating: 'PDF बनाया जा रहा है...',
      done: 'PDF तैयार!',
      reupload: 'नई फोटो अपलोड करें',
    },
  }[language] || {
    uploadTitle: 'Upload Your Photo',
    uploadDesc: 'Drag & drop or click to upload a photo. Supports JPG, PNG, WEBP.',
    processing: 'Processing AI Background Removal...',
    bgDone: 'Background removed successfully!',
    bgError: 'Background removal failed. Please try a different image.',
    formatLabel: 'Photo Format',
    cropTitle: 'Crop Your Photo',
    cropDesc: 'Adjust the crop area. The aspect ratio is locked to the selected format.',
    brightnessLabel: 'Brightness',
    contrastLabel: 'Contrast',
    resetFilters: 'Reset',
    printConfig: 'Print Configuration',
    copies: 'Number of Copies',
    includeName: 'Include Name',
    namePlaceholder: 'Enter Name...',
    includeDate: 'Include Date',
    customDate: 'Use Custom Date Override',
    customDatePlaceholder: 'DD/MM/YYYY',
    bgColorLabel: 'Background Color',
    generate: 'Generate Final Sheet',
    generating: 'Generating PDF...',
    done: 'PDF Generated!',
    reupload: 'Upload New Photo',
  };

  const updateActivePhoto = useCallback((key, value) => {
    setPhotos((prev) =>
      prev.map((photo, index) =>
        index === activeIndex ? { ...photo, [key]: value } : photo
      )
    );
  }, [activeIndex]);

  const activePhoto = photos[activeIndex] || null;

  // --- File Upload Logic ---
  const handleFiles = useCallback((filesList) => {
    const validFiles = Array.from(filesList).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const newPhotos = validFiles.map(file => {
      const id = crypto.randomUUID();
      return {
        id,
        originalFile: file,
        originalPreview: URL.createObjectURL(file),
        bgRemovedUrl: null,
        bgRemovalStatus: 'queued',
        modelProgress: 0,
        brightness: 100,
        contrast: 100,
        format: 'normal',
        numCopies: 6,
        nameText: '',
        crop: undefined,
        completedCrop: null,
      };
    });

    setPhotos(prev => {
      const next = [...prev, ...newPhotos];
      if (prev.length === 0) setActiveIndex(0);
      return next;
    });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = null;
  };

  const handleRemovePhoto = () => {
    setPhotos(prev => {
      const next = [...prev];
      next.splice(activeIndex, 1);
      return next;
    });
    if (activeIndex > 0) setActiveIndex(prev => prev - 1);
  };

  // --- Background Worker Queue Logic ---
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    const isProcessing = photos.some(p => p.bgRemovalStatus === 'processing');
    if (isProcessing) return;

    const nextIndex = photos.findIndex(p => p.bgRemovalStatus === 'queued');
    if (nextIndex === -1) return;

    const photoToProcess = photos[nextIndex];

    setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovalStatus: 'processing', modelProgress: 0 } : p));

    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/bgRemovalWorker.js', import.meta.url),
        { type: 'module' }
      );
    }

    const worker = workerRef.current;

    worker.onmessage = (e) => {
      const { type, progress, maskData, maskWidth, maskHeight, maskChannels, message } = e.data;

      if (type === 'progress') {
        setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, modelProgress: progress || 0 } : p));
      } else if (type === 'segmenting') {
        setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, modelProgress: 100 } : p));
      } else if (type === 'done') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          const mW = maskWidth, mH = maskHeight, iW = canvas.width, iH = canvas.height;

          for (let y = 0; y < iH; y++) {
            for (let x = 0; x < iW; x++) {
              const iIdx = (y * iW + x) * 4;
              const mX = Math.floor((x / iW) * mW);
              const mY = Math.floor((y / iH) * mH);
              const mIdx = (mY * mW + mX) * (maskChannels || 1);
              pixels[iIdx + 3] = maskData[mIdx];
            }
          }
          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovedUrl: url, bgRemovalStatus: 'done' } : p));
            } else {
              setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovalStatus: 'error' } : p));
            }
          }, 'image/png');
        };
        img.onerror = () => {
          setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovalStatus: 'error' } : p));
        };
        img.src = photoToProcess.originalPreview;
      } else if (type === 'error') {
        console.error('Background removal worker error:', message);
        setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovalStatus: 'error' } : p));
      }
    };

    worker.onerror = (err) => {
      console.error('Worker error:', err);
      setPhotos(prev => prev.map((p, i) => i === nextIndex ? { ...p, bgRemovalStatus: 'error' } : p));
    };

    worker.postMessage({ imageBlob: photoToProcess.originalFile });
  }, [photos]);

  // --- Auto-set initial crop when image loads or format changes ---
  const onImageLoad = (e) => {
    const activePhoto = photos[activeIndex];
    if (!activePhoto) return;

    const { width, height } = e.currentTarget;
    const aspect = FORMATS[activePhoto.format || 'normal'].ratio;

    // Calculate a default crop box covering 80% of the image
    let cropWidth = width * 0.8;
    let cropHeight = cropWidth / aspect;

    if (cropHeight > height * 0.8) {
      cropHeight = height * 0.8;
      cropWidth = cropHeight * aspect;
    }

    const percentCrop = {
      unit: '%',
      x: ((width - cropWidth) / 2 / width) * 100,
      y: ((height - cropHeight) / 2 / height) * 100,
      width: (cropWidth / width) * 100,
      height: (cropHeight / height) * 100
    };

    // Update both states to unlock the Generate button immediately
    updateActivePhoto('crop', percentCrop);
    updateActivePhoto('completedCrop', percentCrop);
  };

  useEffect(() => {
    if (imgRef.current && activePhoto?.bgRemovedUrl && activePhoto?.format) {
      const { width, height } = imgRef.current;
      if (!width || !height) return;
      const aspect = FORMATS[activePhoto.format].ratio;
      let cropW, cropH;
      if (width / height > aspect) {
        cropH = height * 0.9;
        cropW = cropH * aspect;
      } else {
        cropW = width * 0.9;
        cropH = cropW / aspect;
      }
      const percentCrop = {
        unit: '%',
        x: ((width - cropW) / 2 / width) * 100,
        y: ((height - cropH) / 2 / height) * 100,
        width: (cropW / width) * 100,
        height: (cropH / height) * 100
      };
      updateActivePhoto('crop', percentCrop);
      updateActivePhoto('completedCrop', percentCrop);
    }
  }, [activePhoto?.format, activePhoto?.bgRemovedUrl, updateActivePhoto]);

  // --- PDF Generation ---
  const generatePDF = useCallback(async () => {
    const validPhotos = photos.filter(p => p.completedCrop);
    if (validPhotos.length === 0) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 5;
      const gap = 2;
      const A4_WIDTH = 210;
      const A4_HEIGHT = 297;
      let currentX = margin;
      let currentY = margin;

      for (const photo of validPhotos) {
        const { dataUrl, finalDateStr } = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const { completedCrop, brightness, contrast } = photo;

            let srcX, srcY, srcW, srcH;
            if (completedCrop.unit === '%') {
              srcX = (completedCrop.x / 100) * img.naturalWidth;
              srcY = (completedCrop.y / 100) * img.naturalHeight;
              srcW = (completedCrop.width / 100) * img.naturalWidth;
              srcH = (completedCrop.height / 100) * img.naturalHeight;
            } else {
              const renderedHeight = Math.min(img.naturalHeight, 350);
              const renderedWidth = img.naturalWidth * (renderedHeight / img.naturalHeight);
              const scaleX = img.naturalWidth / renderedWidth;
              const scaleY = img.naturalHeight / renderedHeight;
              srcX = completedCrop.x * scaleX;
              srcY = completedCrop.y * scaleY;
              srcW = completedCrop.width * scaleX;
              srcH = completedCrop.height * scaleY;
            }

            const canvas = document.createElement('canvas');
            canvas.width = srcW;
            canvas.height = srcH;
            const ctx = canvas.getContext('2d');

            ctx.filter = `brightness(${brightness || 100}%) contrast(${contrast || 100}%)`;
            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
            ctx.filter = 'none';

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] > 215) data[i] = 255;
            }
            ctx.putImageData(imageData, 0, 0);

            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            let dateStr = '';
            if (includeDate) {
              const now = new Date();
              let ds = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
              dateStr = (useCustomDate && customDateText.trim() !== '') ? customDateText.trim() : ds;
            }

            if (!includeName && !includeDate) {
              resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.95), finalDateStr: dateStr });
              return;
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(canvas, 0, 0);

            const stripH = Math.max(canvas.height * 0.18, 50);
            const sidePadding = 15;
            const nameFontSize = Math.max(stripH * 0.50, 30);
            const maxLetterSpacing = 5;

            tCtx.fillStyle = '#ffffff';
            tCtx.fillRect(0, canvas.height - stripH, canvas.width, stripH);
            tCtx.fillStyle = '#000000';
            tCtx.textBaseline = 'middle';

            const drawJustifiedText = (text, y, initialFontSize, maxGap) => {
              let fontSize = initialFontSize;
              tCtx.font = `600 ${fontSize}px Arial, "Courier New", sans-serif`;
              const textStr = text.trim().toUpperCase();
              const availableWidth = canvas.width - (sidePadding * 2);

              let fullTextWidth = tCtx.measureText(textStr).width;
              const scaleFactor = availableWidth / fullTextWidth;
              fontSize = Math.floor(fontSize * scaleFactor);

              const maxAllowedSize = initialFontSize * 1.35;
              if (fontSize > maxAllowedSize) fontSize = maxAllowedSize;

              tCtx.font = `600 ${fontSize}px sans-serif, "Courier New", Arial`;

              const chars = textStr.split('');
              let totalCharWidth = 0;
              chars.forEach(char => { totalCharWidth += tCtx.measureText(char).width; });

              let gap = (availableWidth - totalCharWidth) / (chars.length - 1);

              if (totalCharWidth >= availableWidth || chars.length <= 1) {
                tCtx.textAlign = 'center';
                tCtx.fillText(textStr, canvas.width / 2, y);
                return;
              }

              gap = Math.min(gap, maxGap);
              tCtx.textAlign = 'left';
              const blockWidth = totalCharWidth + (gap * (chars.length - 1));
              let cX = (canvas.width - blockWidth) / 2;

              chars.forEach(char => {
                tCtx.fillText(char, cX, y);
                cX += tCtx.measureText(char).width + gap;
              });
            };

            const nameText = photo.nameText || '';
            const hasName = includeName && nameText.trim() !== '';

            if (hasName && includeDate) {
              const line1Y = canvas.height - stripH * 0.75;
              drawJustifiedText(nameText, line1Y, nameFontSize, maxLetterSpacing);
            } else if (hasName) {
              drawJustifiedText(nameText, canvas.height - stripH / 2, nameFontSize, maxLetterSpacing);
            }

            resolve({ dataUrl: tempCanvas.toDataURL('image/jpeg', 0.95), finalDateStr: dateStr });
          };
          img.onerror = reject;
          img.src = photo.bgRemovedUrl || photo.originalPreview;
        });

        const formatConfig = FORMATS[photo.format || 'normal'];
        const printWidth = formatConfig.widthMm;
        const printHeight = formatConfig.heightMm;

        for (let i = 0; i < photo.numCopies; i++) {
          if (currentX + printWidth > A4_WIDTH - margin) {
            currentX = margin;
            currentY += printHeight + gap;
          }

          if (currentY + printHeight > A4_HEIGHT - margin) {
            pdf.addPage();
            currentX = margin;
            currentY = margin;
          }

          pdf.addImage(dataUrl, 'JPEG', currentX, currentY, printWidth, printHeight);
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.1);
          pdf.rect(currentX, currentY, printWidth, printHeight, 'S');

          if (includeDate && finalDateStr) {
            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0);
            pdf.text(finalDateStr, currentX + printWidth / 2, currentY + printHeight - 1, { align: 'center' });
          }

          currentX += printWidth + gap;
        }
      }

      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], 'passport_photos.pdf', { type: 'application/pdf' });

      if (onGenerateComplete) {
        onGenerateComplete(pdfFile);
      }

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passport_photos.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  }, [photos, includeName, includeDate, useCustomDate, customDateText, bgColor, onGenerateComplete]);

  // =========== RENDER ===========

  // Step 1: Upload (if no photos at all)
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
        <div
          className={`w-full max-w-xl p-12 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-5 cursor-pointer min-h-[300px]
            ${dragging ? 'bg-primary-container/20 border-primary scale-[1.02]' : 'bg-surface-container border-outline-variant/30 hover:border-primary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className={`material-symbols-outlined text-6xl transition-colors duration-300 ${dragging ? 'text-primary' : 'text-primary/60'}`} data-icon="add_a_photo">
            add_a_photo
          </span>
          <div className="text-center space-y-2">
            <p className="font-semibold text-xl text-on-surface">{t.uploadTitle}</p>
            <p className="text-on-surface-variant text-sm">{t.uploadDesc}</p>
          </div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
          />
        </div>
      </div>
    );
  }

  // Common wrapper for Steps 2 and 3 so the thumbnail strip is always visible when photos exist
  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Hidden file input for adding more photos */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
      />

      {/* Thumbnail Strip (Rendered as soon as we have photos) */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-4 bg-surface-container-lowest rounded-lg mb-4 border border-outline-variant/20 shadow-sm">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 cursor-pointer border-4 rounded-md overflow-hidden transition-all ${activeIndex === index ? 'border-primary shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img src={photo.bgRemovedUrl || photo.originalPreview} className="w-full h-full object-cover" alt="thumbnail" style={photo.bgRemovedUrl ? { backgroundColor: bgColor } : {}} />
              {photo.bgRemovalStatus === 'processing' && (
                <div className="absolute inset-0 bg-surface/60 flex items-center justify-center text-on-surface text-[10px] font-bold text-center p-1 leading-tight backdrop-blur-sm">
                  {language === 'hi' ? 'प्रक्रिया...' : 'Processing...'}
                </div>
              )}
              {photo.bgRemovalStatus === 'queued' && (
                <div className="absolute inset-0 bg-surface/40 flex items-center justify-center text-on-surface text-[10px] font-bold text-center p-1 leading-tight backdrop-blur-sm">
                  {language === 'hi' ? 'कतारबद्ध' : 'Queued'}
                </div>
              )}
              {photo.bgRemovalStatus === 'error' && (
                <div className="absolute inset-0 bg-error/40 flex items-center justify-center text-on-error text-[10px] font-bold text-center p-1 leading-tight backdrop-blur-sm">
                  Error
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-20 h-20 rounded-md border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all cursor-pointer bg-surface-container"
          >
            <span className="material-symbols-outlined text-2xl" data-icon="add">add</span>
            <span className="text-[10px] font-semibold">{language === 'hi' ? 'और जोड़ें' : 'Add More'}</span>
          </button>
        </div>
      )}

      {/* Step 2: Processing background removal for Active Photo */}
      {activePhoto?.bgRemovalStatus === 'processing' && (
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
          <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-3xl border border-outline-variant/20 shadow-lg w-full max-w-xl flex flex-col items-center gap-6">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/20 shadow-inner">
              <img src={activePhoto.originalPreview} alt="Original" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative">
                <span className="material-symbols-outlined text-5xl text-primary animate-spin" data-icon="progress_activity">
                  progress_activity
                </span>
              </div>
              <p className="text-primary font-bold text-lg text-center">
                {activePhoto.modelProgress < 100
                  ? (language === 'hi' ? `AI मॉडल डाउनलोड हो रहा है: ${activePhoto.modelProgress}%...` : `Downloading AI Model: ${activePhoto.modelProgress}%...`)
                  : t.processing}
              </p>
              <div className="w-full max-w-xs h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activePhoto.modelProgress < 100 ? activePhoto.modelProgress : 100}%` }}
                />
              </div>
              {activePhoto.modelProgress < 100 && (
                <p className="text-xs text-on-surface-variant">
                  {language === 'hi' ? 'पहली बार डाउनलोड होगा, उसके बाद कैश हो जाएगा' : 'First download only — cached for future use'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2b: Background removal error for Active Photo */}
      {activePhoto?.bgRemovalStatus === 'error' && (
        <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-error/30 shadow-lg w-full max-w-xl flex flex-col items-center gap-5">
            <span className="material-symbols-outlined text-5xl text-error" data-icon="error">error</span>
            <p className="text-error font-bold text-lg text-center">{t.bgError}</p>
            <button
              onClick={handleRemovePhoto}
              className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {language === 'hi' ? 'हटाएं' : 'Remove Photo'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Crop + Adjust + Generate for Active Photo */}
      {activePhoto?.bgRemovalStatus === 'done' && (
        <div className="flex flex-col gap-8 w-full animate-fade-in">
          <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl mx-auto">
            <span className="material-symbols-outlined text-primary text-xl" data-icon="check_circle">check_circle</span>
            <span className="text-primary font-semibold text-sm">{t.bgDone}</span>
          </div>

          {/* Format Selector */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/20 shadow-md">
            <label className="text-sm font-bold text-on-surface block mb-3">{t.formatLabel}</label>
            <div className="flex gap-3">
              {Object.entries(FORMATS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => updateActivePhoto('format', key)}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border
                    ${activePhoto?.format === key
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:text-on-surface'}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cropping Area */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/20 shadow-md">
            <h3 className="text-sm font-bold text-on-surface mb-1">{t.cropTitle}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{t.cropDesc}</p>
            {activePhoto && activePhoto.originalPreview ? (
              <div className="flex justify-center bg-gray-100 p-4 rounded-lg overflow-hidden">
                <ReactCrop
                  crop={activePhoto.crop}
                  onChange={(c) => updateActivePhoto('crop', c)}
                  onComplete={(c, pc) => updateActivePhoto('completedCrop', pc)}
                  aspect={FORMATS[activePhoto.format || 'normal'].ratio}
                >
                  <img
                    ref={imgRef}
                    src={activePhoto.bgRemovedUrl || activePhoto.originalPreview}
                    onLoad={onImageLoad}
                    alt="Crop preview"
                    className="max-w-full h-auto block"
                    crossOrigin="anonymous"
                    style={{
                      filter: `brightness(${activePhoto.brightness || 100}%) contrast(${activePhoto.contrast || 100}%)`,
                    }}
                  />
                </ReactCrop>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                No photo selected
              </div>
            )}
          </div>

          {/* Lighting Adjustments */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/20 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary" data-icon="tune">tune</span>
                {t.brightnessLabel} & {t.contrastLabel}
              </h3>
              <button
                onClick={() => {
                  updateActivePhoto('brightness', 100);
                  updateActivePhoto('contrast', 100);
                }}
                className="text-xs text-primary font-bold hover:text-primary/80 transition-colors px-3 py-1 bg-primary/5 rounded-lg"
              >
                {t.resetFilters}
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-on-surface-variant">{t.brightnessLabel}</label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{activePhoto?.brightness}%</span>
                </div>
                <input
                  type="range" min="50" max="200" value={activePhoto?.brightness || 100}
                  onChange={(e) => updateActivePhoto('brightness', Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-highest accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-on-surface-variant">{t.contrastLabel}</label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{activePhoto?.contrast}%</span>
                </div>
                <input
                  type="range" min="50" max="200" value={activePhoto?.contrast || 100}
                  onChange={(e) => updateActivePhoto('contrast', Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-highest accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Print Configuration */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/20 shadow-md">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary" data-icon="print">print</span>
              {t.printConfig}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">{t.copies}</label>
                <div className="flex gap-2 flex-wrap">
                  {[6, 12, 24, 30].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateActivePhoto('numCopies', n)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border
                        ${activePhoto?.numCopies === n
                          ? 'bg-primary text-on-primary border-primary shadow-md'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:text-on-surface'}`}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number" min="1" max="100" value={activePhoto?.numCopies || 6}
                    onChange={(e) => updateActivePhoto('numCopies', Math.max(1, Math.min(100, Number(e.target.value))))}
                    className="w-20 px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface text-center font-semibold text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                <label className="text-xs font-semibold text-on-surface-variant block mb-2">{t.bgColorLabel}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm font-medium text-on-surface-variant uppercase">{bgColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <input
                    type="checkbox"
                    checked={includeName}
                    onChange={(e) => setIncludeName(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-outline-variant/50 accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {t.includeName}
                  </span>
                </label>
                {includeName && (
                  <div className="animate-fade-in pl-8">
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={activePhoto?.nameText || ''}
                      onChange={(e) => updateActivePhoto('nameText', e.target.value)}
                      maxLength={40}
                      className="w-full sm:w-64 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container-highest text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer group w-max mt-2">
                  <input
                    type="checkbox"
                    checked={includeDate}
                    onChange={(e) => setIncludeDate(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-outline-variant/50 accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                    {t.includeDate}
                  </span>
                </label>
                {includeDate && (
                  <div className="animate-fade-in pl-8 flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group w-max">
                      <input
                        type="checkbox"
                        checked={useCustomDate}
                        onChange={(e) => setUseCustomDate(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-outline-variant/50 accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {t.customDate}
                      </span>
                    </label>
                    {useCustomDate && (
                      <input
                        type="text"
                        placeholder={t.customDatePlaceholder}
                        value={customDateText}
                        onChange={(e) => setCustomDateText(e.target.value)}
                        maxLength={15}
                        className="w-full sm:w-64 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container-highest text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              onClick={handleRemovePhoto}
              className="px-6 py-3 rounded-xl font-bold text-sm border border-outline-variant/30 text-error hover:text-error hover:bg-error/10 hover:border-error transition-all duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg" data-icon="delete">delete</span>
              {language === 'hi' ? 'हटाएं' : 'Remove'}
            </button>
            <button
              onClick={generatePDF}
              disabled={!photos.some(p => p.completedCrop) || generating}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${!photos.some(p => p.completedCrop) || generating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary'
                }`}
            >
              {generating ? 'Generating...' : 'Generate Final Sheet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}