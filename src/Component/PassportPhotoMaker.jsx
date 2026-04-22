import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { jsPDF } from 'jspdf';

// Aspect ratios for passport formats
const FORMATS = {
  normal: { label: 'Normal (3.5 × 4.5 in)', ratio: 3.5 / 4.5 },
  small: { label: 'Small (1.3 × 1.7 in)', ratio: 1.3 / 1.7 },
};

export default function PassportPhotoMaker({ onGenerateComplete, language }) {
  // --- State ---
  const [originalFile, setOriginalFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [bgRemovedUrl, setBgRemovedUrl] = useState(null);
  const [bgRemovalStatus, setBgRemovalStatus] = useState('idle'); // idle | processing | done | error

  const [format, setFormat] = useState('normal');
  const [crop, setCrop] = useState(undefined);
  const [completedCrop, setCompletedCrop] = useState(null);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const [numCopies, setNumCopies] = useState(6);
  const [includeName, setIncludeName] = useState(false);
  const [nameText, setNameText] = useState('');
  const [includeDate, setIncludeDate] = useState(false);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDateText, setCustomDateText] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [generating, setGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [modelProgress, setModelProgress] = useState(0); // 0-100 for model download

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // --- File Upload (uses Web Worker to avoid freezing the UI) ---
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setOriginalFile(file);
    const previewUrl = URL.createObjectURL(file);
    setOriginalPreview(previewUrl);
    setBgRemovedUrl(null);
    setBgRemovalStatus('processing');
    setModelProgress(0);
    setCompletedCrop(null);
    setCrop(undefined);
    setBrightness(100);
    setContrast(100);

    // Offload heavy model inference to a Web Worker so UI stays responsive
    const worker = new Worker(
      new URL('../workers/bgRemovalWorker.js', import.meta.url),
      { type: 'module' }
    );
    worker.postMessage({ imageBlob: file });
    worker.onmessage = (e) => {
      const { type, progress, maskData, maskWidth, maskHeight, maskChannels, message } = e.data;

      if (type === 'progress') {
        setModelProgress(progress || 0);
      } else if (type === 'segmenting') {
        setModelProgress(100);
      } else if (type === 'done') {
        // Composite: apply the mask to the original image on a canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get the pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          // Scale mask to image dimensions if they differ
          const mW = maskWidth;
          const mH = maskHeight;
          const iW = canvas.width;
          const iH = canvas.height;

          // Apply mask as alpha channel
          for (let y = 0; y < iH; y++) {
            for (let x = 0; x < iW; x++) {
              const iIdx = (y * iW + x) * 4;
              // Map image coords to mask coords
              const mX = Math.floor((x / iW) * mW);
              const mY = Math.floor((y / iH) * mH);
              const mIdx = (mY * mW + mX) * (maskChannels || 1);
              // The mask value (0-255): 255 = foreground, 0 = background
              const maskVal = maskData[mIdx];
              pixels[iIdx + 3] = maskVal; // Set alpha
            }
          }

          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setBgRemovedUrl(url);
              setBgRemovalStatus('done');
            } else {
              setBgRemovalStatus('error');
            }
            worker.terminate();
          }, 'image/png');
        };
        img.onerror = () => {
          setBgRemovalStatus('error');
          worker.terminate();
        };
        img.src = previewUrl;
      } else if (type === 'error') {
        console.error('Background removal worker error:', message);
        setBgRemovalStatus('error');
        worker.terminate();
      }
    };
    worker.onerror = (err) => {
      console.error('Worker error:', err);
      setBgRemovalStatus('error');
      worker.terminate();
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleReupload = () => {
    setOriginalFile(null);
    setOriginalPreview(null);
    setBgRemovedUrl(null);
    setBgRemovalStatus('idle');
    setCompletedCrop(null);
    setCrop(undefined);
    setBrightness(100);
    setContrast(100);
  };

  // --- Auto-set initial crop when image loads or format changes ---
  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    if (!width || !height) return;
    const aspect = FORMATS[format].ratio;

    // Calculate centered initial crop in PIXELS (display pixels)
    let cropW, cropH;
    if (width / height > aspect) {
      cropH = height * 0.9;
      cropW = cropH * aspect;
    } else {
      cropW = width * 0.9;
      cropH = cropW / aspect;
    }
    const newCrop = {
      unit: 'px',
      x: (width - cropW) / 2,
      y: (height - cropH) / 2,
      width: cropW,
      height: cropH,
    };
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, [format]);

  // Reset crop when format changes
  useEffect(() => {
    if (imgRef.current && bgRemovedUrl) {
      const { width, height } = imgRef.current;
      if (!width || !height) return;
      const aspect = FORMATS[format].ratio;
      let cropW, cropH;
      if (width / height > aspect) {
        cropH = height * 0.9;
        cropW = cropH * aspect;
      } else {
        cropW = width * 0.9;
        cropH = cropW / aspect;
      }
      const newCrop = {
        unit: 'px',
        x: (width - cropW) / 2,
        y: (height - cropH) / 2,
        width: cropW,
        height: cropH,
      };
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  }, [format, bgRemovedUrl]);

  // --- Get cropped canvas ---
  const getCroppedCanvas = useCallback(() => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return null;
    const image = imgRef.current;

    // completedCrop is in display pixels; scale to natural image pixels
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const srcX = completedCrop.x * scaleX;
    const srcY = completedCrop.y * scaleY;
    const srcW = completedCrop.width * scaleX;
    const srcH = completedCrop.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d');

    // 1. Draw the subject FIRST (without the background) and apply lighting
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(
      image,
      srcX, srcY, srcW, srcH,
      0, 0, srcW, srcH
    );

    // 2. Clear the filter so it doesn't mess with our pixel math
    ctx.filter = 'none';

    // 3. 🧠 ALPHA BLEED FIX: Harden the core subject
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Loop through every pixel's Alpha (opacity) channel
    for (let i = 3; i < data.length; i += 4) {
      // If the AI made the pixel more than 85% solid (like the face),
      // we force it to be 100% solid (255). 
      if (data[i] > 215) {
        data[i] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // 4. Slide the selected background color BEHIND the newly solid subject
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';

    return canvas;
  }, [completedCrop, brightness, contrast, bgColor]);

  // --- PDF Generation ---
  const generatePDF = useCallback(async () => {
    const canvas = getCroppedCanvas();
    if (!canvas) return;
    setGenerating(true);

    try {
      // A4 dimensions in inches (8.27 × 11.69)
      const A4_W = 8.27;
      const A4_H = 11.69;
      const GAP = 0.19685; // 5mm ≈ 0.19685 inches
      const MARGIN = 0.394; // 1cm ≈ 0.394 inches
      const COLS = 6;

      // Photo dimensions based on selected format (in inches)
      let photoW, photoH;

      if (format === 'normal') {
        photoW = 3.5;
        photoH = 4.5;
      } else {
        photoW = 1.3;
        photoH = 1.7;
      }

      // Calculate usable area
      const usableW = A4_W - 2 * MARGIN;
      const usableH = A4_H - 2 * MARGIN;

      // Grid with exactly 6 per row
      const totalGridW = COLS * photoW + (COLS - 1) * GAP;

      // Scale factor if grid exceeds printable width
      let scale = 1;
      if (totalGridW > usableW) {
        scale = usableW / totalGridW;
      }

      const scaledPhotoW = photoW * scale;
      const scaledPhotoH = photoH * scale;
      const scaledGap = GAP * scale;

      const actualGridW = COLS * scaledPhotoW + (COLS - 1) * scaledGap;
      const rows = Math.ceil(numCopies / COLS);
      const actualGridH = rows * scaledPhotoH + (rows - 1) * scaledGap;

      // Check vertical scaling
      let vScale = 1;
      if (actualGridH > usableH) {
        vScale = usableH / actualGridH;
      }
      const finalScale = Math.min(1, vScale);
      const finalPhotoW = scaledPhotoW * finalScale;
      const finalPhotoH = scaledPhotoH * finalScale;
      const finalGap = scaledGap * finalScale;

      const finalGridW = COLS * finalPhotoW + (COLS - 1) * finalGap;
      const finalGridH = rows * finalPhotoH + (rows - 1) * finalGap;

      // Top align the grid
      const offsetX = (A4_W - finalGridW) / 2;
      // Shift grid upward: Cuts the top margin in half (from ~1cm to ~0.5cm)
      const offsetY = 0.15;

      // Generate image data from canvas
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create a temp canvas for each photo with date/name overlay if needed
      const getPhotoDataUrl = () => {
        if (!includeName && !includeDate) return imgData;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);

        // ==========================================
        // MANUAL TWEAKING VARIABLES
        // ==========================================
        const stripH = Math.max(canvas.height * 0.18, 50);
        const sidePadding = 15;
        const nameFontSize = Math.max(stripH * 0.50, 30);
        const dateFontSize = Math.max(stripH * 0.40, 24);
        const maxLetterSpacing = 5;
        // ==========================================

        // Draw the white strip
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, canvas.height - stripH, canvas.width, stripH);

        // Resolve Final Date String for context (used later by jsPDF)
        let finalDateStr = '';
        if (includeDate) {
          const now = new Date();
          let dateStr = now.toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });
          finalDateStr = (useCustomDate && customDateText.trim() !== '') ? customDateText.trim() : dateStr;
        }

        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';

        // CUSTOM TEXT JUSTIFICATION ENGINE (with Auto-Scaling Up & Down)
        const drawJustifiedText = (text, y, initialFontSize, maxGap) => {
          let fontSize = initialFontSize;
          ctx.font = `600 ${fontSize}px Arial, "Courier New", sans-serif`;
          const textStr = text.trim().toUpperCase();
          const availableWidth = canvas.width - (sidePadding * 2);

          let fullTextWidth = ctx.measureText(textStr).width;

          // Step 1: Calculate ratio needed to make it fit width exactly
          // (This mathematically works for shrinking big names AND stretching small names)
          const scaleFactor = availableWidth / fullTextWidth;
          fontSize = Math.floor(fontSize * scaleFactor);

          // Step 2: CRITICAL - Prevent short names from getting comically tall!
          // We cap the font size so it doesn't grow more than 35% larger than the base size.
          const maxAllowedSize = initialFontSize * 1.35;
          if (fontSize > maxAllowedSize) {
            fontSize = maxAllowedSize;
          }

          // Re-apply the new perfectly calculated font size
          ctx.font = `600 ${fontSize}px  sans-serif, "Courier New", Arial`;

          // Step 3: Measure individual characters for justification
          const chars = textStr.split('');
          let totalCharWidth = 0;
          chars.forEach(char => {
            totalCharWidth += ctx.measureText(char).width;
          });

          let gap = (availableWidth - totalCharWidth) / (chars.length - 1);

          if (totalCharWidth >= availableWidth || chars.length <= 1) {
            ctx.textAlign = 'center';
            ctx.fillText(textStr, canvas.width / 2, y);
            return;
          }

          gap = Math.min(gap, maxGap);

          ctx.textAlign = 'left';
          const blockWidth = totalCharWidth + (gap * (chars.length - 1));
          let currentX = (canvas.width - blockWidth) / 2;

          chars.forEach(char => {
            ctx.fillText(char, currentX, y);
            currentX += ctx.measureText(char).width + gap;
          });
        };

        const hasName = includeName && nameText.trim() !== '';

        if (hasName && includeDate) {
          // Push name up to make space for the date added via jsPDF
          const line1Y = canvas.height - stripH * 0.75;
          drawJustifiedText(nameText, line1Y, nameFontSize, maxLetterSpacing);
        } else if (hasName) {
          // Just the name, centered vertically in the strip
          drawJustifiedText(nameText, canvas.height - stripH / 2, nameFontSize, maxLetterSpacing);
        } else if (includeDate) {
          // No name, just the strip for the date. We do not draw the date here!
        }

        return { tempImgData: tempCanvas.toDataURL('image/jpeg', 0.95), finalDateStr };
      };

      const result = getPhotoDataUrl();
      // Handle the fallback if getPhotoDataUrl doesn't return an object when using unmodified imgData
      const finalImgData = typeof result === 'string' ? result : result.tempImgData;
      const parsedDateStr = typeof result === 'string' ? '' : result.finalDateStr;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'a4',
      });

      let placed = 0;
      for (let row = 0; row < rows && placed < numCopies; row++) {
        for (let col = 0; col < COLS && placed < numCopies; col++) {
          const x = offsetX + col * (finalPhotoW + finalGap);
          const y = offsetY + row * (finalPhotoH + finalGap);
          doc.addImage(finalImgData, 'JPEG', x, y, finalPhotoW, finalPhotoH);
          // Add a thin black border around each photo so they are easier to cut
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.005);
          doc.rect(x, y, finalPhotoW, finalPhotoH, 'S');
          
          if (includeDate && parsedDateStr) {
            // Explicitly set very small font size for unobtrusive date text
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text(parsedDateStr, x + finalPhotoW / 2, y + finalPhotoH - 0.02, { align: 'center' });
          }
          
          placed++;
        }
      }

      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], 'passport_photos.pdf', { type: 'application/pdf' });

      if (onGenerateComplete) {
        onGenerateComplete(pdfFile);
      }

      // Also trigger download
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
  }, [getCroppedCanvas, format, numCopies, includeName, includeDate, nameText, useCustomDate, customDateText, onGenerateComplete]);


  // =========== RENDER ===========

  // Step 1: Upload
  if (!originalFile) {
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
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
          />
        </div>
      </div>
    );
  }

  // Step 2: Processing background removal
  if (bgRemovalStatus === 'processing') {
    const statusText = modelProgress < 100
      ? (language === 'hi'
        ? `AI मॉडल डाउनलोड हो रहा है: ${modelProgress}%...`
        : `Downloading AI Model: ${modelProgress}%...`)
      : t.processing;

    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
        <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-3xl border border-outline-variant/20 shadow-lg w-full max-w-xl flex flex-col items-center gap-6">
          {/* Original image preview */}
          <div className="w-40 h-40 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/20 shadow-inner">
            <img src={originalPreview} alt="Original" className="w-full h-full object-cover" />
          </div>
          {/* Loading animation */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative">
              <span className="material-symbols-outlined text-5xl text-primary animate-spin" data-icon="progress_activity">
                progress_activity
              </span>
            </div>
            <p className="text-primary font-bold text-lg text-center">{statusText}</p>
            <div className="w-full max-w-xs h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${modelProgress < 100 ? modelProgress : 100}%` }}
              />
            </div>
            {modelProgress < 100 && (
              <p className="text-xs text-on-surface-variant">
                {language === 'hi' ? 'पहली बार डाउनलोड होगा, उसके बाद कैश हो जाएगा' : 'First download only — cached for future use'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 2b: Background removal error
  if (bgRemovalStatus === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-error/30 shadow-lg w-full max-w-xl flex flex-col items-center gap-5">
          <span className="material-symbols-outlined text-5xl text-error" data-icon="error">error</span>
          <p className="text-error font-bold text-lg text-center">{t.bgError}</p>
          <button
            onClick={handleReupload}
            className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            {t.reupload}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Crop + Adjust + Generate
  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Success badge */}
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
              onClick={() => setFormat(key)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border
                ${format === key
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
        <div className="flex justify-center bg-surface-container rounded-xl p-3 border border-outline-variant/10 overflow-hidden">
          {bgRemovedUrl && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={FORMATS[format].ratio}
              className="max-h-[400px]"
            >
              <img
                src={bgRemovedUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                ref={imgRef}
                className="max-h-[400px] object-contain"
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              />
            </ReactCrop>
          )}
        </div>
      </div>

      {/* Lighting Adjustments */}
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/20 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary" data-icon="tune">tune</span>
            {t.brightnessLabel} & {t.contrastLabel}
          </h3>
          <button
            onClick={() => { setBrightness(100); setContrast(100); }}
            className="text-xs text-primary font-bold hover:text-primary/80 transition-colors px-3 py-1 bg-primary/5 rounded-lg"
          >
            {t.resetFilters}
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-on-surface-variant">{t.brightnessLabel}</label>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{brightness}%</span>
            </div>
            <input
              type="range" min="50" max="200" value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-highest accent-primary"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-on-surface-variant">{t.contrastLabel}</label>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{contrast}%</span>
            </div>
            <input
              type="range" min="50" max="200" value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
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
                  onClick={() => setNumCopies(n)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border
                    ${numCopies === n
                      ? 'bg-primary text-on-primary border-primary shadow-md'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:text-on-surface'}`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number" min="1" max="100" value={numCopies}
                onChange={(e) => setNumCopies(Math.max(1, Math.min(100, Number(e.target.value))))}
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
            {/* Name Toggle */}
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
                  value={nameText}
                  onChange={(e) => setNameText(e.target.value)}
                  maxLength={40}
                  className="w-full sm:w-64 px-4 py-2 border border-outline-variant/30 rounded-xl bg-surface-container-highest text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            )}

            {/* Date Toggle */}
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
          onClick={handleReupload}
          className="px-6 py-3 rounded-xl font-bold text-sm border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-all duration-200 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg" data-icon="restart_alt">restart_alt</span>
          {t.reupload}
        </button>
        <button
          onClick={generatePDF}
          disabled={generating || !completedCrop}
          className="px-10 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:transform-none disabled:shadow-none"
        >
          {generating ? (
            <>
              <span className="material-symbols-outlined animate-spin" data-icon="progress_activity">progress_activity</span>
              {t.generating}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" data-icon="picture_as_pdf">picture_as_pdf</span>
              {t.generate}
            </>
          )}
        </button>
      </div>
    </div>
  );
}