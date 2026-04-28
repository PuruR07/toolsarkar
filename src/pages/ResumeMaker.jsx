import { useState, useRef, useEffect, forwardRef, useLayoutEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { TEMPLATES, TemplateRenderer, MiniatureTemplate } from './ResumeTemplates';

export default function ResumeMaker({ language }) {
  const translations = {
    en: {
      title: "Resume Maker",
      addExperience: "Add Experience",
      addEducation: "Add Education",
      personalDetails: "Personal Details",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      linkedin: "LinkedIn URL",
      professionalSummary: "Professional Summary",
      experience: "Experience",
      jobTitle: "Job Title",
      company: "Company",
      dates: "Dates (e.g., 2020 - Present)",
      description: "Description",
      education: "Education",
      institution: "School/College",
      degree: "Degree",
      skills: "Strengths",
      score: "Marks / CGPA / %",
      downloadPdf: "Download PDF",
      chooseTemplate: "Choose a Template",
      backToTemplates: "Back to Templates",
    },
    hi: {
      title: "रिज्यूमे मेकर",
      addExperience: "अनुभव जोड़ें",
      addEducation: "शिक्षा जोड़ें",
      personalDetails: "व्यक्तिगत विवरण",
      name: "पूरा नाम",
      email: "ईमेल",
      phone: "फ़ोन",
      address: "पता",
      linkedin: "लिंक्डइन यूआरएल",
      professionalSummary: "पेशेवर सारांश",
      experience: "अनुभव",
      jobTitle: "नौकरी का शीर्षक",
      company: "कंपनी",
      dates: "तारीखें",
      description: "विवरण",
      education: "शिक्षा",
      institution: "स्कूल/कॉलेज",
      degree: "डिग्री",
      skills: "ताकत (अल्पविराम से अलग)",
      score: "अंक / सीजीपीए / %",
      downloadPdf: "पीडीएफ डाउनलोड करें",
      chooseTemplate: "टेम्पलेट चुनें",
      backToTemplates: "टेम्पलेट्स पर वापस जाएं",
    }
  };
  const t = translations[language] || translations['en'];

  // Two-Step View State
  const [view, setView] = useState('gallery'); // 'gallery' | 'editor'
  const [selectedTemplate, setSelectedTemplate] = useState('modern-split');
  const [activeFilter, setActiveFilter] = useState('All');

  // Cropper State
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const imgRef = useRef(null);

  const isPhotoSupported = TEMPLATES.find(t => t.id === selectedTemplate)?.supportsPhoto;

  // Form State
  const [personalDetails, setPersonalDetails] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, Country',
    linkedin: 'linkedin.com/in/johndoe',
    profileImage: '',
    customFields: []
  });
  const [summary, setSummary] = useState('A highly motivated and results-driven professional with experience in web development, seeking to leverage technical skills to build engaging user experiences.');

  const [experience, setExperience] = useState([
    { id: 1, title: 'Senior Developer', company: 'Tech Corp', dates: '2021 - Present', description: 'Led a team of 5 developers to build scalable SAAS products. Improved performance by 40%.' },
    { id: 2, title: 'Web Developer', company: 'Digital Agency', dates: '2019 - 2021', description: 'Developed fully responsive websites for clients across multiple industries.' }
  ]);

  const [education, setEducation] = useState([
    { id: 1, institution: 'State University', board: '', degree: 'B.S. in Computer Science', dates: '2015 - 2019', score: '' }
  ]);

  const [skills, setSkills] = useState([
    { id: 1, text: 'Hard Working' },
    { id: 2, text: 'Honest' },
    { id: 3, text: 'Confident' },
    { id: 4, text: 'Loyal' },
    { id: 5, text: 'Communication Skills' }
  ]);
  const [computerKnowledge, setComputerKnowledge] = useState([
    { id: 1, text: 'Basic Computer Knowledge' },
    { id: 2, text: 'MS Office' },
    { id: 3, text: 'MS Excel' }
  ]);

  const [pagesData, setPagesData] = useState([{ isFirst: true, header: true, summary: true, experience: experience, education: education, skills: true, strengths: true, computerKnowledge: true, profile: true, footer: true }]);
  const hiddenPreviewRef = useRef(null);

  // Resize logic for scaling container proportionally
  const scaleContainerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (view !== 'editor') return;
    const container = scaleContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const availableWidth = entry.contentRect.width;
        const targetWidth = 794;
        const padding = 32; // 16px padding on both sides
        if (availableWidth < targetWidth + padding) {
          setScale((availableWidth - padding) / targetWidth);
        } else {
          setScale(1);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [view]);

  // PAGINATION MEASUREMENT PASS
  // Every time content changes, we measure the monolithic invisible layout to chunk it into A4 pages natively
  useLayoutEffect(() => {
    if (view !== 'editor') return;

    const timer = setTimeout(() => {
      const container = hiddenPreviewRef.current;
      if (!container) return;

      const sections = Array.from(container.querySelectorAll('[data-measure]'));
      if (sections.length === 0) return;

      const pages = [];
      let currentPage = { isFirst: true, header: false, summary: false, skills: false, strengths: false, computerKnowledge: false, profile: false, footer: false, experience: [], education: [] };
      let currentHeight = 0;
      const MAX_HEIGHT = 980; // Safe inner height for 1123px A4 minus container padding

      sections.forEach(node => {
        const type = node.getAttribute('data-measure');
        const id = node.getAttribute('data-id');

        const styles = window.getComputedStyle(node);
        const mt = parseFloat(styles.marginTop) || 0;
        const mb = parseFloat(styles.marginBottom) || 0;
        const nodeHeight = node.offsetHeight + mt + mb;

        if (currentHeight + nodeHeight > MAX_HEIGHT && currentHeight > 0) {
          pages.push({ ...currentPage });
          currentPage = { isFirst: false, header: false, summary: false, skills: false, strengths: false, computerKnowledge: false, profile: false, footer: false, experience: [], education: [] };
          currentHeight = 0;
        }

        currentHeight += nodeHeight;

        if (type === 'header') currentPage.header = true;
        if (type === 'summary') currentPage.summary = true;
        if (type === 'skills') currentPage.skills = true;
        if (type === 'strengths') currentPage.strengths = true;
        if (type === 'computerKnowledge') currentPage.computerKnowledge = true;
        if (type === 'profile') currentPage.profile = true;
        if (type === 'footer') currentPage.footer = true;
        if (type === 'experience-item') {
          const item = experience.find(e => e.id.toString() === id);
          if (item) currentPage.experience.push(item);
        }
        if (type === 'education-item') {
          const item = education.find(e => e.id.toString() === id);
          if (item) currentPage.education.push(item);
        }
      });

      // push any remaining data
      if (currentPage.header || currentPage.summary || currentPage.skills || currentPage.strengths || currentPage.computerKnowledge || currentPage.profile || currentPage.footer || currentPage.experience.length > 0 || currentPage.education.length > 0 || pages.length === 0) {
        pages.push(currentPage);
      }

      setPagesData(pages);
    }, 100);

    return () => clearTimeout(timer);
  }, [personalDetails, summary, experience, education, skills, computerKnowledge, selectedTemplate, view]);


  // Handlers
  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setView('editor');

    if (id.startsWith('basic')) {
      let newEdu = [];
      if (id === 'basic-10th') {
        newEdu = [{ id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' }];
      } else if (id === 'basic-12th') {
        newEdu = [
          { id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' },
          { id: 2, degree: '12th / Intermediate', institution: '', board: '', dates: '', score: '' }
        ];
      } else if (id === 'basic-diploma') {
        newEdu = [
          { id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' },
          { id: 2, degree: 'Diploma', institution: '', board: '', dates: '', score: '' }
        ];
      } else if (id === 'basic-graduation-diploma') {
        newEdu = [
          { id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' },
          { id: 2, degree: 'Diploma', institution: '', board: '', dates: '', score: '' },
          { id: 3, degree: 'Graduation / Degree', institution: '', board: '', dates: '', score: '' }
        ];
      } else if (id === 'basic-graduation') {
        newEdu = [
          { id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' },
          { id: 2, degree: '12th / Intermediate', institution: '', board: '', dates: '', score: '' },
          { id: 3, degree: 'Graduation / Degree', institution: '', board: '', dates: '', score: '' }
        ];
      } else if (id === 'basic-masters') {
        newEdu = [
          { id: 1, degree: '10th / High School', institution: '', board: '', dates: '', score: '' },
          { id: 2, degree: '12th / Intermediate', institution: '', board: '', dates: '', score: '' },
          { id: 3, degree: 'Graduation / Degree', institution: '', board: '', dates: '', score: '' },
          { id: 4, degree: 'Post Graduation / Masters', institution: '', board: '', dates: '', score: '' }
        ];
      }
      setEducation(newEdu);

      setSummary('To seek an entry-level position to utilize my skills and abilities in the industry that offers professional growth while being resourceful, innovative, and flexible.');
      setSkills([
        { id: 101, text: 'Kind' },
        { id: 102, text: 'Hard Working' },
        { id: 103, text: 'Loyal' },
        { id: 104, text: 'Positive Attitude' },
        { id: 105, text: 'Quick Learner' }
      ]);

      setPersonalDetails(prev => ({
        ...prev,
        customFields: [
          { id: 101, label: "Father's Name", value: 'Mr. John Doe' },
          { id: 102, label: "Date of Birth", value: '01/01/2000' },
          { id: 103, label: "Gender", value: 'Male' },
          { id: 104, label: "Nationality", value: 'Indian' },
          { id: 105, label: "Religion / Caste", value: 'Hindu / General' },
          { id: 106, label: "Languages Known", value: 'English, Hindi' },
          { id: 107, label: "Marital Status", value: 'Unmarried' }
        ]
      }));
    }
  };

  const handlePersonalChange = (e) => {
    setPersonalDetails({ ...personalDetails, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
  };

  const confirmCrop = () => {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const image = imgRef.current;

    // Scale crop to actual image dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setPersonalDetails({ ...personalDetails, profileImage: base64Image });
    setImgSrc('');
    setIsCropperOpen(false);
  };

  const cancelCrop = () => {
    setImgSrc('');
    setIsCropperOpen(false);
  };

  const handleExperienceChange = (id, field, value) => {
    setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const addExperience = () => {
    setExperience([...experience, { id: Date.now(), title: '', company: '', dates: '', description: '' }]);
  };

  const removeExperience = (id) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const handleEducationChange = (id, field, value) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const addEducation = () => {
    setEducation([...education, { id: Date.now(), institution: '', board: '', degree: '', dates: '', score: '' }]);
  };

  const removeEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handleStrengthChange = (id, value) => setSkills(skills.map(s => s.id === id ? { ...s, text: value } : s));
  const addStrength = () => setSkills([...skills, { id: Date.now(), text: '' }]);
  const removeStrength = (id) => setSkills(skills.filter(s => s.id !== id));

  const handleComputerKnowledgeChange = (id, value) => setComputerKnowledge(computerKnowledge.map(s => s.id === id ? { ...s, text: value } : s));
  const addComputerKnowledge = () => setComputerKnowledge([...computerKnowledge, { id: Date.now(), text: '' }]);
  const removeComputerKnowledge = (id) => setComputerKnowledge(computerKnowledge.filter(s => s.id !== id));

  // Custom Fields handlers
  const addCustomField = () => {
    setPersonalDetails(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { id: Date.now(), label: '', value: '' }]
    }));
  };

  const removeCustomField = (id) => {
    setPersonalDetails(prev => ({
      ...prev,
      customFields: (prev.customFields || []).filter(f => f.id !== id)
    }));
  };

  const handleCustomFieldChange = (id, field, value) => {
    setPersonalDetails(prev => ({
      ...prev,
      customFields: (prev.customFields || []).map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const downloadPdf = async () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pages = document.querySelectorAll('.resume-page-node');
      if (pages.length === 0) return;

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const fileName = personalDetails.name ? `${personalDetails.name.replace(/\s+/g, '-')}-Resume.pdf` : 'Resume.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  if (view === 'gallery') {
    return (
      <div className="w-full flex-1 flex flex-col items-center bg-surface py-10 px-6">
        <h1 className="text-4xl font-black text-on-surface mb-2 tracking-tight">{t.chooseTemplate}</h1>
        <p className="text-on-surface-variant font-medium mb-8 text-lg text-center max-w-2xl">
          Pick a beautifully crafted, professional resume design. You can change this later at any time.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["All", "Basic", "Minimalist", "Professional", "Modern", "Creative", "Executive", "With Photo"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${activeFilter === cat ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1400px] w-full">
          {TEMPLATES.filter(tmpl => activeFilter === "All" || (activeFilter === "With Photo" ? tmpl.supportsPhoto : tmpl.category === activeFilter)).map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleTemplateSelect(tmpl.id)}
              className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group flex flex-col"
            >
              <div className="h-48 bg-surface-variant/40 relative flex items-center justify-center p-4">
                <div className="w-[120px] h-[169px] bg-white shadow-md border border-gray-200" style={{ transform: 'scale(1)' }}>
                  <MiniatureTemplate previewId={tmpl.id} />
                </div>
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-primary text-on-primary font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all">Select</span>
                </div>
              </div>
              <div className="p-5 flex-1 bg-surface border-t border-outline-variant/10">
                <h3 className="text-lg font-black text-on-surface mb-1">{tmpl.name}</h3>
                <p className="text-sm font-medium text-on-surface-variant line-clamp-2">{tmpl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-surface relative">

      {/* Hidden Measurer - Always rendered invisibly */}
      <div className="opacity-0 pointer-events-none -z-50" aria-hidden="true" style={{ position: 'fixed', left: '-9999px', top: '0' }}>
        <div ref={hiddenPreviewRef} className="w-[794px] bg-[#ffffff] shadow-2xl">
          <TemplateRenderer
            templateId={selectedTemplate}
            personalDetails={personalDetails}
            summary={summary}
            experience={experience}
            education={education}
            skills={skills}
            computerKnowledge={computerKnowledge}
            t={t}
            isMeasuring={true}
          />
        </div>
      </div>

      {/* Editor Header */}
      <div className="w-full bg-surface border-b border-outline-variant/20 py-3 px-6 flex justify-between items-center sticky top-[73px] z-40 shadow-sm">
        <button
          onClick={() => setView('gallery')}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t.backToTemplates}
        </button>
        <button
          onClick={downloadPdf}
          className="flex items-center gap-2 bg-primary text-on-primary py-2 px-5 rounded-lg font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          {t.downloadPdf}
        </button>
      </div>

      <div className="w-full flex-1 flex flex-col lg:flex-row">

        {/* Left Side: Form */}
        <div className="w-full lg:w-[45%] xl:w-[40%] p-6 lg:p-8 overflow-y-auto bg-surface border-r border-outline-variant/20 custom-scrollbar" style={{ height: 'calc(100vh - 130px)' }}>
          <div className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Form Fields Go Here (Truncated inputs for readability, keeping identical functionality) */}
            <section className="space-y-4">
              <h2 className="text-xl font-black border-b border-outline-variant/20 pb-2 text-on-surface">{t.personalDetails}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isPhotoSupported && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">Profile Photo (Optional)</label>
                    <label className="flex items-center justify-center w-full bg-surface border-2 border-dashed border-outline-variant/50 hover:border-primary/50 hover:bg-primary/5 rounded-lg px-3 py-6 text-sm font-medium transition-colors cursor-pointer group">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
                        <span className="text-on-surface-variant group-hover:text-primary transition-colors">Click to upload photo</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {personalDetails.profileImage && (
                      <div className="mt-2 text-xs font-bold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Photo uploaded successfully
                      </div>
                    )}
                  </div>
                )}
                <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.name}</label><input type="text" name="name" value={personalDetails.name} onChange={handlePersonalChange} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" /></div>
                <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.email}</label><input type="email" name="email" value={personalDetails.email} onChange={handlePersonalChange} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" /></div>
                <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.phone}</label><input type="text" name="phone" value={personalDetails.phone} onChange={handlePersonalChange} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" /></div>
                <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.linkedin}</label><input type="text" name="linkedin" value={personalDetails.linkedin} onChange={handlePersonalChange} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.address}</label><input type="text" name="address" value={personalDetails.address} onChange={handlePersonalChange} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" /></div>
              </div>


            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-black border-b border-outline-variant/20 pb-2 text-on-surface">{t.professionalSummary}</h2>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-3 text-sm font-medium focus:border-primary outline-none min-h-[120px] resize-y" />
            </section>
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h2 className="text-xl font-black text-on-surface">{t.experience}</h2>
                <button onClick={addExperience} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> {t.addExperience}</button>
              </div>
              {experience.map((exp) => (
                <div key={exp.id} className="p-5 bg-surface-variant/20 border border-outline-variant/30 rounded-xl relative">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 p-1.5 text-on-surface-variant hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors" title="Remove experience"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.jobTitle}</label><input type="text" value={exp.title} onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.company}</label><input type="text" value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.dates}</label><input type="text" value={exp.dates} onChange={(e) => handleExperienceChange(exp.id, 'dates', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.description}</label><textarea value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none min-h-[80px]" /></div>
                  </div>
                </div>
              ))}
            </section>
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h2 className="text-xl font-black text-on-surface">{t.education}</h2>
                <button onClick={addEducation} className="text-sm font-bold text-primary flex items-center gap-1 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> {t.addEducation}</button>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="p-5 bg-surface-variant/20 border border-outline-variant/30 rounded-xl relative">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 p-1.5 text-on-surface-variant hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors" title="Remove education"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.institution}</label><input type="text" value={edu.institution} onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">Board/University</label><input type="text" value={edu.board || ''} onChange={(e) => handleEducationChange(edu.id, 'board', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.degree}</label><input type="text" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.dates}</label><input type="text" value={edu.dates} onChange={(e) => handleEducationChange(edu.id, 'dates', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-on-surface-variant uppercase tracking-wider">{t.score || "Score / %"}</label><input type="text" value={edu.score || ''} onChange={(e) => handleEducationChange(edu.id, 'score', e.target.value)} className="w-full bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none" /></div>
                  </div>
                </div>
              ))}
            </section>
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h2 className="text-xl font-black text-on-surface">{t.skills}</h2>
                <button onClick={addStrength} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> Add Strength</button>
              </div>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <input type="text" placeholder="e.g. HTML" value={skill.text} onChange={(e) => handleStrengthChange(skill.id, e.target.value)} className="flex-1 bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors" />
                    <button onClick={() => removeStrength(skill.id)} className="p-1.5 text-on-surface-variant hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors flex-shrink-0" title="Remove strength">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h2 className="text-xl font-black text-on-surface">Computer Knowledge</h2>
                <button onClick={addComputerKnowledge} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> Add Computer Knowledge</button>
              </div>
              <div className="space-y-3">
                {computerKnowledge.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input type="text" placeholder="e.g. MS Office" value={item.text} onChange={(e) => handleComputerKnowledgeChange(item.id, e.target.value)} className="flex-1 bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors" />
                    <button onClick={() => removeComputerKnowledge(item.id)} className="p-1.5 text-on-surface-variant hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors flex-shrink-0" title="Remove knowledge">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                <h2 className="text-xl font-black text-on-surface">Profile</h2>
                <button onClick={addCustomField} className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"><span className="material-symbols-outlined text-[18px]">add</span> Add Field</button>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Add any custom profile details like Language, Nationality, or Father's Name.</p>
              <div className="space-y-3">
                {(personalDetails.customFields || []).map((cf) => (
                  <div key={cf.id} className="flex items-center gap-2">
                    <input type="text" placeholder="Label (e.g. Nationality)" value={cf.label} onChange={(e) => handleCustomFieldChange(cf.id, 'label', e.target.value)} className="flex-1 bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors" />
                    <input type="text" placeholder="Value (e.g. American)" value={cf.value} onChange={(e) => handleCustomFieldChange(cf.id, 'value', e.target.value)} className="flex-1 bg-surface border border-outline-variant/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none transition-colors" />
                    <button onClick={() => removeCustomField(cf.id)} className="p-1.5 text-on-surface-variant hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors flex-shrink-0" title="Remove field">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right Side: Multi-Page Live Preview */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex-col items-center bg-[#f3f4f6]" style={{ height: 'calc(100vh - 130px)', overflowY: 'auto' }}>
          <div ref={scaleContainerRef} className="w-full min-h-full flex justify-center py-10 px-4">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: `-${1123 * (2 - scale) * 0.5}px` }} className="flex flex-col gap-[32px]">
              {pagesData.map((page, index) => (
                <div key={index} className="w-[794px] h-[1123px] bg-[#ffffff] shadow-2xl overflow-hidden resume-page-node">
                  <TemplateRenderer
                    templateId={selectedTemplate}
                    personalDetails={personalDetails}
                    summary={summary}
                    experience={experience}
                    education={education}
                    skills={skills}
                    computerKnowledge={computerKnowledge}
                    t={t}
                    isMeasuring={false}
                    pageData={page}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Cropper Modal */}
      {isCropperOpen && !!imgSrc && (
        <div className="fixed inset-0 z-[9999] bg-[#000000]/80 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-surface p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto">
            <h2 className="text-2xl font-black mb-4 text-on-surface border-b border-outline-variant/20 pb-4">Crop Profile Photo</h2>
            <div className="bg-surface-variant/20 p-2 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '50vh', objectFit: 'contain' }} />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3 mt-auto">
              <button onClick={cancelCrop} className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors">Cancel</button>
              <button onClick={confirmCrop} disabled={!completedCrop?.width || !completedCrop?.height} className="px-5 py-2.5 rounded-lg font-bold text-on-primary bg-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">Confirm Crop</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

