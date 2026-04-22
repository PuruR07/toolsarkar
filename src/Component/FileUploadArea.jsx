export default function FileUploadArea({ file, setFile, language }) {
  const translations = {
    en: {
      uploadFile: "1. Upload File",
      dragDrop: "Drag & Drop or Click to Browse",
      supports: "Supports PDF, DOCX, Excel, JPG, PNG (Max 50MB)",
      browse: "Browse Files",
      filesSelected: "files selected",
      totalMb: "total",
      changeFile: "Change File"
    },
    hi: {
      uploadFile: "1. फ़ाइल अपलोड करें",
      dragDrop: "खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
      supports: "PDF, DOCX, Excel, JPG, PNG का समर्थन करता है (अधिकतम 50MB)",
      browse: "फ़ाइलें ब्राउज़ करें",
      filesSelected: "फ़ाइलें चयनित",
      totalMb: "कुल",
      changeFile: "फ़ाइल बदलें"
    }
  };
  
  const t = translations[language] || translations['en'];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const allowedMimeTypes = [
          'application/pdf', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'image/jpeg', 
          'image/png'
      ];
      const maxSizeBytes = 50 * 1024 * 1024;
      
      const validFiles = Array.from(e.target.files).filter(f => {
         // Some browsers send empty type or application/octet-stream, extension check acts as fallback but mime is best.
         const extensionMatch = f.name.match(/\.(pdf|docx|xlsx|xls|jpg|jpeg|png)$/i);
         if (!allowedMimeTypes.includes(f.type) && !extensionMatch) return false;
         if (f.size > maxSizeBytes) return false;
         return true;
      });

      if (validFiles.length !== e.target.files.length) {
         alert("Some files were rejected. Only PDF, DOCX, XLSX, XLS, JPG, and PNG under 50MB are allowed.");
      }

      setFile(validFiles);
    }
  }

  return (
    <section className="flex flex-col gap-6 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm transition-all duration-300 hover:shadow-md mt-6">
      <h2 className="text-[1.75rem] font-black text-on-surface leading-tight tracking-tight">{t.uploadFile}</h2>
      <div className="relative border-2 border-dashed border-outline-variant/40 hover:border-primary bg-surface/50 rounded-2xl flex flex-col items-center justify-center py-20 px-6 gap-6 cursor-pointer transition-all duration-300">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.xls,.jpg,.png,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          multiple
        />
        <span className="material-symbols-outlined text-[4rem] text-primary" data-icon="upload_file">upload_file</span>
        <div className="text-center flex flex-col gap-2">
          <p className="text-xl font-bold text-on-surface">
            {file && file.length > 0 ? `${file.length} ${t.filesSelected}` : t.dragDrop}
          </p>
          <p className="text-on-surface-variant">
            {file && file.length > 0
              ? `${(file.reduce((total, f) => total + f.size, 0) / 1024 / 1024).toFixed(2)} MB ${t.totalMb}`
              : t.supports}
          </p>
        </div>
        <button className="bg-primary text-on-primary font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-[17px] pointer-events-none">
          {file ? t.changeFile : t.browse}
        </button>
      </div>
    </section>
  )
}
