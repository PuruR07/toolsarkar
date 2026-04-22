import React from 'react';

export const TEMPLATES = [
  // Minimalist
  { id: 'minimalist', name: 'Minimalist', category: 'Minimalist', desc: 'Lots of whitespace, #000000 text' },
  { id: 'elegant', name: 'Elegant', category: 'Minimalist', desc: 'Thin fonts, slate text #475569' },
  { id: 'pure-white', name: 'Pure White', category: 'Minimalist', desc: 'Maximum whitespace, extremely clean structure' },
  { id: 'clean-lines', name: 'Clean Lines', category: 'Minimalist', desc: 'Subtle borders to separate content effortlessly' },
  { id: 'simple-margins', name: 'Simple Margins', category: 'Minimalist', desc: 'Heavy indentation with profile photo support', supportsPhoto: true },

  // Professional
  { id: 'academic', name: 'Academic', category: 'Professional', desc: 'Centered serif, horizontal lines #cccccc' },
  { id: 'corporate-blue', name: 'Corporate Blue', category: 'Professional', desc: '#1d4ed8 accents for headers' },
  { id: 'timeline', name: 'Timeline', category: 'Professional', desc: '#9ca3af vertical left borders' },
  { id: 'classic-serif', name: 'Classic Serif', category: 'Professional', desc: 'Traditional professional layout with photo block', supportsPhoto: true },
  { id: 'structured-pro', name: 'Structured Pro', category: 'Professional', desc: 'Grid-based structured layout with circular avatar', supportsPhoto: true },

  // Modern
  { id: 'modern-split', name: 'Modern Split', category: 'Modern', desc: 'Vertical 50/50, left #f3f4f6, right #ffffff' },
  { id: 'startup', name: 'Startup', category: 'Modern', desc: 'Dark navy #0f172a headers, emerald #10b981 accents' },
  { id: 'tech-sidebar', name: 'Tech Sidebar', category: 'Modern', desc: 'Left sidebar #1e293b, main #ffffff' },
  { id: 'dark-accent', name: 'Dark Accent', category: 'Modern', desc: 'Deep background sidebar with modern avatar', supportsPhoto: true },
  { id: 'rounded-modern', name: 'Rounded Modern', category: 'Modern', desc: 'Soft pill-shapes and smooth borders with photo', supportsPhoto: true },

  // Creative
  { id: 'creative-bold', name: 'Creative Bold', category: 'Creative', desc: 'Massive header #db2777, white text' },
  { id: 'portfolio-accent', name: 'Brand Accent', category: 'Creative', desc: 'Colorful branding with prominent large photo', supportsPhoto: true },
  { id: 'vibrant-boxes', name: 'Vibrant Boxes', category: 'Creative', desc: 'High-contrast boxing approach' },
  { id: 'quirky-offset', name: 'Quirky Offset', category: 'Creative', desc: 'Offset titles and bold colors with asymmetrical photo', supportsPhoto: true },
  { id: 'photo-hero', name: 'Photo Hero', category: 'Creative', desc: 'Immersive top header fully dedicated to your avatar', supportsPhoto: true },

  // Executive
  { id: 'executive', name: 'Executive', category: 'Executive', desc: 'Heavy top border #111827, elegant serif' },
  { id: 'heavy-borders', name: 'Heavy Borders', category: 'Executive', desc: 'Assertive thick solid borders' },
  { id: 'prestige', name: 'Prestige', category: 'Executive', desc: 'Gold/Blue luxury color palette with strong hierarchy' },
  { id: 'board-member', name: 'Board Member', category: 'Executive', desc: 'Authoritative spacing and large serif text' },
  { id: 'legacy-serif', name: 'Legacy Serif', category: 'Executive', desc: 'Old-world charm with formal right-aligned photo', supportsPhoto: true }
];

// Helper to filter empty skills
const getSkillsList = (skills) => skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];

export const TemplateRenderer = ({ templateId, personalDetails, summary, experience, education, skills, t, isMeasuring, pageData }) => {
  const { name, email, phone, address, linkedin, profileImage, customFields = [] } = personalDetails;
  const skillsList = getSkillsList(skills);

  const customFieldsStrings = customFields.filter(cf => cf.value).map(cf => `${cf.label ? cf.label + ': ' : ''}${cf.value}`);
  const contactDetails = [email, phone, linkedin, address].filter(Boolean);
  const showProfile = isMeasuring || pageData?.profile;

  const isFirst = isMeasuring || pageData?.isFirst;
  const showHeader = isMeasuring || pageData?.header;
  const showSummary = isMeasuring || pageData?.summary;
  const showSkills = isMeasuring || pageData?.skills;

  const expToRender = isMeasuring ? experience : (pageData?.experience || []);
  const eduToRender = isMeasuring ? education : (pageData?.education || []);

  const hasPhoto = profileImage && profileImage.trim() !== "";

  // ------------------------------------------------------------------------------------------------
  // REUSABLE BLOCKS FOR STANDARD VERTICAL TEMPLATES (To radically compress redundant layout code)
  // ------------------------------------------------------------------------------------------------
  const BlockHeader = ({ css, nameCss, contactCss }) => (
    <div data-measure="header" className={css}>
      <h1 className={nameCss}>{name || "Your Name"}</h1>
      <div className={contactCss}>{contactDetails.join("  |  ")}</div>
    </div>
  );

  const BlockSummary = ({ css, textCss }) => (
    <div data-measure="summary" className={css}>
      <p className={textCss}>{summary}</p>
    </div>
  );

  const BlockExp = ({ containerCss, titleCss, itemCss, headerTitleCss, dateCompanyCss, descCss, dot }) => (
    <div className={containerCss}>
      {isFirst && <h2 className={titleCss}>{t.experience}</h2>}
      {expToRender.map((exp, idx) => (
        <div key={exp.id} data-measure="experience-item" data-id={exp.id} className={itemCss}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <h3 className={headerTitleCss}>{dot && <span className="mr-[8px]">•</span>}{exp.title}</h3>
            <span className={dateCompanyCss.date}>{exp.dates}</span>
          </div>
          {exp.company && <h4 className={dateCompanyCss.company}>{exp.company}</h4>}
          {exp.description && <p className={descCss}>{exp.description}</p>}
        </div>
      ))}
    </div>
  );

  const BlockEdu = ({ containerCss, titleCss, itemCss, headerTitleCss, dateCompanyCss }) => (
    <div className={containerCss}>
      {isFirst && <h2 className={titleCss}>{t.education}</h2>}
      {eduToRender.map(edu => (
        <div key={edu.id} data-measure="education-item" data-id={edu.id} className={itemCss}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <h3 className={headerTitleCss}>{edu.degree}</h3>
            <span className={dateCompanyCss.date}>{edu.dates}</span>
          </div>
          {edu.institution && <h4 className={dateCompanyCss.company}>{edu.institution}</h4>}
        </div>
      ))}
    </div>
  );

  const BlockSkills = ({ containerCss, titleCss, mapCss, pillCss }) => (
    <div data-measure="skills" className={containerCss}>
      <h2 className={titleCss}>{t.skills}</h2>
      <div className={mapCss}>
        {skillsList.map((skill, i) => <span key={i} className={pillCss}>{skill}</span>)}
      </div>
    </div>
  );

  const BlockProfile = ({ containerCss, titleCss, textCss }) => (
    <div data-measure="profile" className={containerCss}>
      <h2 className={titleCss}>Profile</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
        {customFields.filter(cf => cf.value).map((cf, i) => (
          <div key={i} className={textCss}><span style={{ fontWeight: 700 }}>{cf.label}:</span> {cf.value}</div>
        ))}
      </div>
    </div>
  );


  // ------------------------------------------------------------------------------------------------
  // CATEGORY 1: MINIMALIST
  // ------------------------------------------------------------------------------------------------
  if (templateId === 'minimalist') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#000000] p-[50px] font-sans whitespace-normal break-words">
        {showHeader && <BlockHeader css="mb-[40px]" nameCss="text-[42px] font-[900] tracking-[-1px] leading-none mb-[16px]" contactCss="text-[13px] font-[500] flex gap-x-[16px] flex-wrap" />}
        {showSummary && summary && <BlockSummary css="mb-[32px]" textCss="text-[14px] leading-[1.6]" />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[32px]" titleCss="text-[12px] font-[700] uppercase tracking-[2px] border-t border-[#000000] pt-[8px] mb-[16px]" itemCss="mb-[16px]" headerTitleCss="text-[16px] font-[700]" dateCompanyCss={{ date: "text-[13px] font-[500]", company: "text-[14px] font-[500] italic mb-[4px]" }} descCss="text-[14px] leading-[1.5] mt-[4px]" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[32px]" titleCss="text-[12px] font-[700] uppercase tracking-[2px] border-t border-[#000000] pt-[8px] mb-[16px]" itemCss="mb-[16px]" headerTitleCss="text-[16px] font-[700]" dateCompanyCss={{ date: "text-[13px] font-[500]", company: "text-[14px] font-[500] italic" }} />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[12px] font-[700] uppercase tracking-[2px] border-t border-[#000000] pt-[8px] mb-[16px]" mapCss="text-[14px] leading-[1.6]" pillCss="after:content-[',_'] last:after:content-['']" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[20px]" titleCss="text-[12px] font-[700] uppercase tracking-[2px] border-t border-[#000000] pt-[8px] mb-[8px]" textCss="text-[14px] leading-[1.6]" />}
      </div>
    );
  }

  if (templateId === 'elegant') {
    return (
      <div className="w-full h-full bg-[#fafafa] text-[#334155] p-[60px] font-sans font-light whitespace-normal break-words border-l-[4px] border-[#94a3b8]">
        {showHeader && (
          <div data-measure="header" className="text-center mb-[40px]">
            <h1 className="text-[38px] font-[300] tracking-[2px] mb-[12px] text-[#0f172a] uppercase">{name}</h1>
            <div className="text-[12px] tracking-[1px] text-[#64748b]">
              {contactDetails.join("  •  ")}
            </div>
            <div className="mx-auto w-[60px] h-[1px] bg-[#cbd5e1] mt-[20px]"></div>
          </div>
        )}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[40px]">
            <p className="text-[13px] leading-[1.8] text-[#475569] text-center max-w-[80%] mx-auto">{summary}</p>
          </div>
        )}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[30px]" titleCss="text-[12px] font-[600] uppercase tracking-[3px] text-[#0f172a] mb-[20px] text-center" itemCss="mb-[20px] border-b border-[#f1f5f9] pb-[10px]" headerTitleCss="text-[15px] font-[600] text-[#1e293b]" dateCompanyCss={{ date: "text-[12px] font-[500] text-[#94a3b8]", company: "text-[13px] font-[400] text-[#64748b] mb-[8px]" }} descCss="text-[13px] leading-[1.7]" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[30px]" titleCss="text-[12px] font-[600] uppercase tracking-[3px] text-[#0f172a] mb-[20px] text-center" itemCss="mb-[16px]" headerTitleCss="text-[15px] font-[600] text-[#1e293b]" dateCompanyCss={{ date: "text-[12px] font-[500] text-[#94a3b8]", company: "text-[13px] font-[400] text-[#64748b]" }} />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="text-center" titleCss="text-[12px] font-[600] uppercase tracking-[3px] text-[#0f172a] mb-[16px] text-center" mapCss="text-[12px] tracking-[1px] leading-[2]" pillCss="after:content-['__•__'] last:after:content-[''] text-[#475569]" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="text-center mt-[20px]" titleCss="text-[12px] font-[600] uppercase tracking-[3px] text-[#0f172a] mb-[8px] text-center" textCss="text-[13px] text-[#475569] leading-[1.8]" />}
      </div>
    );
  }

  if (templateId === 'pure-white') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#111111] p-[60px] font-sans break-words pb-[80px]">
        {showHeader && <BlockHeader css="mb-[50px]" nameCss="text-[50px] font-[900] tracking-[-2px] mb-[8px]" contactCss="text-[14px] font-[400] text-[#666666]" />}
        {showSummary && summary && <BlockSummary css="mb-[40px] pl-[20px] border-l-[3px] border-[#111111]" textCss="text-[15px] leading-[1.7] text-[#333333] font-[500]" />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[40px]" titleCss="text-[18px] font-[900] uppercase tracking-[-0.5px] mb-[24px]" itemCss="mb-[24px]" headerTitleCss="text-[18px] font-[800]" dateCompanyCss={{ date: "text-[14px] font-[600] text-[#666666]", company: "text-[15px] font-[600] mb-[8px] text-[#444444]" }} descCss="text-[15px] leading-[1.6]" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[40px]" titleCss="text-[18px] font-[900] uppercase tracking-[-0.5px] mb-[24px]" itemCss="mb-[20px]" headerTitleCss="text-[18px] font-[800]" dateCompanyCss={{ date: "text-[14px] font-[600] text-[#666666]", company: "text-[15px] font-[600] text-[#444444]" }} />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[18px] font-[900] uppercase tracking-[-0.5px] mb-[16px]" mapCss="flex flex-wrap gap-[12px]" pillCss="px-[14px] py-[6px] border-[2px] border-[#111111] font-[700] text-[13px] rounded-full" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[24px]" titleCss="text-[18px] font-[900] uppercase tracking-[-0.5px] mb-[8px]" textCss="text-[15px] leading-[1.7] text-[#333333]" />}
      </div>
    );
  }

  if (templateId === 'clean-lines') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#1f2937] p-[50px] font-sans whitespace-normal break-words">
        {showHeader && <BlockHeader css="mb-[30px] border-b border-[#e5e7eb] pb-[20px]" nameCss="text-[32px] font-[500] tracking-[1px] mb-[10px]" contactCss="text-[14px] font-[400] text-[#6b7280]" />}
        {showSummary && summary && <BlockSummary css="mb-[30px] border-b border-[#e5e7eb] pb-[20px]" textCss="text-[14px] leading-[1.6] text-[#4b5563]" />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[30px] border-b border-[#e5e7eb] pb-[20px]" titleCss="text-[14px] font-[700] uppercase text-[#9ca3af] mb-[16px]" itemCss="mb-[20px]" headerTitleCss="text-[16px] font-[600]" dateCompanyCss={{ date: "text-[13px] font-[400] text-[#9ca3af]", company: "text-[14px] font-[500] mb-[6px] text-[#4b5563]" }} descCss="text-[14px] leading-[1.5] text-[#4b5563]" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[30px] border-b border-[#e5e7eb] pb-[20px]" titleCss="text-[14px] font-[700] uppercase text-[#9ca3af] mb-[16px]" itemCss="mb-[16px]" headerTitleCss="text-[16px] font-[600]" dateCompanyCss={{ date: "text-[13px] font-[400] text-[#9ca3af]", company: "text-[14px] font-[500] text-[#4b5563]" }} />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[14px] font-[700] uppercase text-[#9ca3af] mb-[16px]" mapCss="flex flex-wrap gap-[10px]" pillCss="font-[500] text-[14px] text-[#4b5563] bg-[#f3f4f6] px-[12px] py-[4px] rounded-md" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[20px] border-t border-[#e5e7eb] pt-[20px]" titleCss="text-[14px] font-[700] uppercase text-[#9ca3af] mb-[8px]" textCss="text-[14px] font-[500] text-[#4b5563] leading-[1.6]" />}
      </div>
    );
  }

  // [PHOTO SUPPORT 1]
  if (templateId === 'simple-margins') {
    return (
      <div className="flex w-full h-full bg-[#f8fafc] text-[#0f172a] font-sans break-words p-[40px] gap-[30px]">
        {isMeasuring && <div className="hidden">{name}</div> /* Force re-render */}
        <div className="w-[30%] flex flex-col items-center">
          {isFirst && hasPhoto && (
            <img src={profileImage} alt="Profile" className="w-[140px] h-[140px] rounded-full object-cover border-[4px] border-[#ffffff] shadow-lg mb-[20px]" />
          )}
          {showHeader && (
            <div data-measure="header" className="text-center w-full bg-[#ffffff] p-[20px] rounded-lg shadow-sm border border-[#e2e8f0]">
              <h1 className="text-[20px] font-[800] leading-tight mb-[10px] break-words">{name}</h1>
              <div className="flex flex-col gap-[8px] text-[12px] font-[500] text-[#64748b] break-words">
                {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
              </div>
            </div>
          )}
        </div>
        <div className="w-[70%]">
          {showSummary && summary && (
            <div data-measure="summary" className="mb-[30px] bg-[#ffffff] p-[24px] rounded-lg shadow-sm border border-[#e2e8f0]">
              <h2 className="text-[14px] font-[700] uppercase text-[#475569] mb-[10px] border-b border-[#e2e8f0] pb-[6px]">Profile</h2>
              <p className="text-[14px] leading-[1.6] text-[#334155]">{summary}</p>
            </div>
          )}
          {expToRender.length > 0 && (
            <div className="mb-[30px] bg-[#ffffff] p-[24px] rounded-lg shadow-sm border border-[#e2e8f0]">
              {isFirst && <h2 className="text-[14px] font-[700] uppercase text-[#475569] mb-[16px] border-b border-[#e2e8f0] pb-[6px]">Experience</h2>}
              {expToRender.map(exp => (
                <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="mb-[16px]">
                  <h3 className="text-[16px] font-[800] text-[#0f172a]">{exp.title}</h3>
                  <div className="text-[13px] text-[#64748b] font-[600] mt-[2px] mb-[6px]">{exp.company} • {exp.dates}</div>
                  <p className="text-[14px] leading-[1.5] text-[#334155]">{exp.description}</p>
                </div>
              ))}
            </div>
          )}
          {eduToRender.length > 0 && (
            <div className="mb-[30px] bg-[#ffffff] p-[24px] rounded-lg shadow-sm border border-[#e2e8f0]">
              {isFirst && <h2 className="text-[14px] font-[700] uppercase text-[#475569] mb-[16px] border-b border-[#e2e8f0] pb-[6px]">Education</h2>}
              {eduToRender.map(edu => (
                <div key={edu.id} data-measure="education-item" data-id={edu.id} className="mb-[12px]">
                  <h3 className="text-[15px] font-[800] text-[#0f172a]">{edu.degree}</h3>
                  <div className="text-[13px] text-[#64748b] font-[600] mt-[2px]">{edu.institution} • {edu.dates}</div>
                </div>
              ))}
            </div>
          )}
          {showSkills && skillsList.length > 0 && (
            <div data-measure="skills" className="bg-[#ffffff] p-[24px] rounded-lg shadow-sm border border-[#e2e8f0]">
              <h2 className="text-[14px] font-[700] uppercase text-[#475569] mb-[12px] border-b border-[#e2e8f0] pb-[6px]">Skills</h2>
              <div className="flex flex-wrap gap-[6px]">
                {skillsList.map((skill, i) => <span key={i} className="text-[12px] font-[600] text-[#475569] bg-[#f1f5f9] px-[10px] py-[4px] rounded">{skill}</span>)}
              </div>
            </div>
          )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="bg-[#ffffff] p-[24px] rounded-lg shadow-sm border border-[#e2e8f0] mt-[16px]" titleCss="text-[14px] font-[700] uppercase text-[#475569] mb-[12px] border-b border-[#e2e8f0] pb-[6px]" textCss="text-[14px] font-[500] text-[#475569] leading-[1.6]" />}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------------------------------
  // CATEGORY 2: PROFESSIONAL
  // ------------------------------------------------------------------------------------------------
  if (templateId === 'academic') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#222222] p-[50px] font-serif whitespace-normal break-words">
        {showHeader && (
          <div data-measure="header" className="text-center border-b-[2px] border-[#cccccc] pb-[20px] mb-[24px]">
            <h1 className="text-[36px] font-[700] leading-tight mb-[8px]">{name}</h1>
            <p className="text-[14px] font-[400] text-[#555555]">
              {contactDetails.join(" • ")}
            </p>
          </div>
        )}
        {showSummary && summary && <BlockSummary css="mb-[24px]" textCss="text-[14px] leading-[1.6] text-center italic" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[24px]" titleCss="text-[16px] font-[700] uppercase tracking-[1px] text-center mb-[16px]" itemCss="mb-[12px]" headerTitleCss="text-[15px] font-[700]" dateCompanyCss={{ date: "text-[14px]", company: "text-[15px] italic" }} />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[24px]" titleCss="text-[16px] font-[700] uppercase tracking-[1px] text-center mb-[16px]" itemCss="mb-[16px]" headerTitleCss="text-[15px] font-[700]" dateCompanyCss={{ date: "text-[14px]", company: "text-[15px] italic mb-[4px]" }} descCss="text-[14px] leading-[1.6]" />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[16px] font-[700] uppercase tracking-[1px] text-center mb-[12px]" mapCss="text-[14px] leading-[1.6] text-center" pillCss="after:content-['__•__'] last:after:content-['']" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[16px] text-center" titleCss="text-[16px] font-[700] uppercase tracking-[1px] text-center mb-[8px]" textCss="text-[14px] leading-[1.6] text-center" />}
      </div>
    );
  }

  if (templateId === 'corporate-blue') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#1f2937] p-[50px] font-sans whitespace-normal break-words">
        {showHeader && <BlockHeader css="" nameCss="text-[38px] font-[800] text-[#1e3a8a] leading-[1] mb-[8px]" contactCss="text-[14px] text-[#4b5563] font-[500] mb-[24px]" />}
        {showSummary && summary && <BlockSummary css="mb-[24px]" textCss="text-[14px] leading-[1.6] text-[#374151]" />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[24px]" titleCss="text-[16px] font-[800] text-[#1e3a8a] uppercase tracking-[1px] border-b border-[#1e3a8a] pb-[4px] mb-[16px]" itemCss="mb-[20px]" headerTitleCss="text-[16px] font-[800] text-[#111827]" dateCompanyCss={{ date: "text-[14px] font-[600] text-[#1d4ed8]", company: "text-[14px] font-[700] text-[#4b5563] mb-[8px]" }} descCss="text-[14px] leading-[1.6] text-[#374151]" />}
        {eduToRender.length > 0 && <BlockEdu containerCss="mb-[24px]" titleCss="text-[16px] font-[800] text-[#1e3a8a] uppercase tracking-[1px] border-b border-[#1e3a8a] pb-[4px] mb-[16px]" itemCss="mb-[16px]" headerTitleCss="text-[15px] font-[800] text-[#111827]" dateCompanyCss={{ date: "text-[13px] text-[#6b7280] font-[500] mt-[2px]", company: "text-[14px] text-[#4b5563] mt-[2px]" }} />}
        {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[16px] font-[800] text-[#1e3a8a] uppercase tracking-[1px] border-b border-[#1e3a8a] pb-[4px] mb-[16px]" mapCss="flex flex-wrap gap-x-[20px] gap-y-[8px]" pillCss="text-[14px] font-[500] text-[#374151] list-item ml-[20px]" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[20px]" titleCss="text-[16px] font-[800] text-[#1e3a8a] uppercase tracking-[1px] border-b border-[#1e3a8a] pb-[4px] mb-[8px]" textCss="text-[14px] font-[500] text-[#374151] leading-[1.6]" />}
      </div>
    );
  }

  if (templateId === 'timeline') {
    return (
      <div className="w-full h-full bg-[#f9fafb] text-[#111827] p-[50px] font-sans break-words pb-[60px]">
        {showHeader && (
          <div data-measure="header" className="text-center mb-[40px]">
            <h1 className="text-[36px] font-[800] mb-[12px]">{name}</h1>
            <div className="text-[14px] text-[#6b7280] flex justify-center gap-[16px] flex-wrap">
              {contactDetails.map((t, i) => <span key={i}>{t}</span>)}
            </div>
            <div className="mx-auto w-[60px] h-[3px] bg-[#3b82f6] mt-[20px] mb-[10px]"></div>
          </div>
        )}
        <div className="flex gap-[30px]">
          <div className="w-[60%] border-l-[2px] border-[#d1d5db] relative pl-[20px] pb-[20px]">
            {isMeasuring && <div className="hidden">{summary}</div>}
            {expToRender.length > 0 && (
              <div>
                {isFirst && <div className="absolute w-[12px] h-[12px] rounded-full bg-[#ffffff] border-[3px] border-[#3b82f6] left-[-7px] top-[0px]"></div>}
                {isFirst && <h2 className="text-[18px] font-[800] text-[#1f2937] uppercase tracking-[1px] mb-[20px]">Experience</h2>}
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="mb-[24px] relative">
                    <div className="absolute w-[8px] h-[8px] rounded-full bg-[#d1d5db] left-[-25px] top-[6px]"></div>
                    <h3 className="text-[16px] font-[700] text-[#111827]">{exp.title}</h3>
                    <div className="text-[13px] font-[600] text-[#3b82f6] mb-[6px]">{exp.company} | {exp.dates}</div>
                    <p className="text-[14px] leading-[1.6] text-[#4b5563]">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-[40%] flex flex-col gap-[30px]">
            {showSummary && summary && (
              <div data-measure="summary" className="bg-[#ffffff] p-[20px] border border-[#e5e7eb] rounded-sm shadow-sm">
                <h2 className="text-[16px] font-[800] text-[#1f2937] uppercase tracking-[1px] mb-[12px]">Profile</h2>
                <p className="text-[14px] leading-[1.6] text-[#4b5563]">{summary}</p>
              </div>
            )}
            {eduToRender.length > 0 && (
              <div className="bg-[#ffffff] p-[20px] border border-[#e5e7eb] rounded-sm shadow-sm">
                {isFirst && <h2 className="text-[16px] font-[800] text-[#1f2937] uppercase tracking-[1px] mb-[12px]">Education</h2>}
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id} className="mb-[12px]">
                    <h3 className="text-[14px] font-[700] text-[#111827]">{edu.degree}</h3>
                    <div className="text-[13px] text-[#4b5563] mt-[2px]">{edu.institution}</div>
                    <div className="text-[12px] text-[#9ca3af] font-[500] mt-[2px]">{edu.dates}</div>
                  </div>
                ))}
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills" className="bg-[#ffffff] p-[20px] border border-[#e5e7eb] rounded-sm shadow-sm">
                <h2 className="text-[16px] font-[800] text-[#1f2937] uppercase tracking-[1px] mb-[12px]">Skills</h2>
                <div className="flex flex-wrap gap-[6px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[12px] text-[#374151] font-[600] bg-[#f3f4f6] px-[8px] py-[4px] rounded-sm">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="bg-[#ffffff] p-[20px] border border-[#e5e7eb] rounded-sm shadow-sm mt-[16px]" titleCss="text-[16px] font-[800] text-[#1f2937] uppercase tracking-[1px] mb-[12px]" textCss="text-[14px] font-[500] text-[#1f2937] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 2]
  if (templateId === 'classic-serif') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#1a1a1a] p-[50px] font-serif break-words">
        {showHeader && (
          <div data-measure="header" className="flex items-center gap-[30px] border-b-4 border-[#000000] pb-[24px] mb-[30px]">
            {hasPhoto && <img src={profileImage} alt="" className="w-[120px] h-[120px] object-cover border-[3px] border-[#000000]" />}
            <div>
              <h1 className="text-[44px] font-[700] uppercase mb-[8px] leading-none">{name}</h1>
              <div className="text-[14px] font-[400] text-[#444444] tracking-[0.5px]">
                {contactDetails.join("  |  ")}
              </div>
            </div>
          </div>
        )}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[30px] italic text-[16px] leading-[1.6] text-[#333333]">
            "{summary}"
          </div>
        )}
        <div className="flex gap-[40px]">
          <div className="w-[60%]">
            {expToRender.length > 0 && (
              <div className="mb-[30px]">
                {isFirst && <h2 className="text-[20px] font-[700] uppercase border-b border-[#000000] pb-[4px] mb-[20px]">Professional Experience</h2>}
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="mb-[20px]">
                    <h3 className="text-[18px] font-[700]">{exp.title}</h3>
                    <div className="text-[15px] font-[600] text-[#555555] mb-[6px] italic">{exp.company} <span className="mx-[8px] font-sans not-italic text-[13px]">{exp.dates}</span></div>
                    <p className="text-[14px] font-sans font-[400] leading-[1.6]">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-[40%]">
            {eduToRender.length > 0 && (
              <div className="mb-[30px]">
                {isFirst && <h2 className="text-[20px] font-[700] uppercase border-b border-[#000000] pb-[4px] mb-[20px]">Education</h2>}
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id} className="mb-[16px]">
                    <h3 className="text-[16px] font-[700]">{edu.degree}</h3>
                    <div className="text-[15px] font-[600] text-[#555555] italic leading-tight mt-[4px]">{edu.institution}</div>
                    <div className="text-[13px] font-sans text-[#777777] mt-[4px]">{edu.dates}</div>
                  </div>
                ))}
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[20px] font-[700] uppercase border-b border-[#000000] pb-[4px] mb-[20px]">Core Competencies</h2>
                <ul className="list-disc list-inside font-sans text-[14px] font-[500] text-[#333333] leading-[1.8]">
                  {skillsList.map((skill, i) => <li key={i}>{skill}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 3]
  if (templateId === 'structured-pro') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#111827] p-[40px] font-sans break-words pb-[60px]">
        {showHeader && (
          <div data-measure="header" className="flex items-center gap-[24px] bg-[#f3f4f6] p-[24px] rounded-xl mb-[30px]">
            {hasPhoto && <img src={profileImage} alt="" className="w-[100px] h-[100px] object-cover rounded-full border-[4px] border-[#ffffff] shadow-sm" />}
            <div className="flex-1">
              <h1 className="text-[36px] font-[800] leading-none mb-[12px] text-[#111827]">{name}</h1>
              <div className="grid grid-cols-2 gap-[8px] text-[13px] font-[500] text-[#4b5563]">
                {contactDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-[6px]"><span className="w-[6px] h-[6px] bg-[#3b82f6] rounded-full"></span>{detail}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[20px] font-[700] uppercase border-b border-[#000000] pb-[4px] mb-[20px]" textCss="text-[14px] font-[500] text-[#374151] leading-[1.6]" />}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[30px] p-[20px] border-[2px] border-[#e5e7eb] rounded-xl relative">
            <div className="absolute top-[-10px] left-[20px] bg-[#ffffff] px-[8px] text-[12px] font-[800] uppercase text-[#3b82f6]">Profile</div>
            <p className="text-[14px] leading-[1.6] text-[#374151] mt-[4px]">{summary}</p>
          </div>
        )}
        <div className="flex gap-[30px]">
          <div className="w-[65%]">
            {expToRender.length > 0 && (
              <div>
                {isFirst && <div className="text-[16px] font-[800] uppercase border-b-[2px] border-[#e5e7eb] pb-[8px] mb-[20px]">Experience</div>}
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="mb-[24px]">
                    <h3 className="text-[16px] font-[800] text-[#111827]">{exp.title}</h3>
                    <div className="flex justify-between items-center text-[14px] font-[600] text-[#6b7280] mb-[8px]">
                      <span>{exp.company}</span>
                      <span className="bg-[#f3f4f6] px-[8px] py-[2px] rounded-md text-[12px]">{exp.dates}</span>
                    </div>
                    <p className="text-[14px] leading-[1.6] text-[#4b5563]">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-[35%]">
            {eduToRender.length > 0 && (
              <div className="mb-[30px]">
                {isFirst && <div className="text-[16px] font-[800] uppercase border-b-[2px] border-[#e5e7eb] pb-[8px] mb-[20px]">Education</div>}
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id} className="mb-[16px] bg-[#f9fafb] p-[16px] rounded-xl border border-[#f3f4f6]">
                    <h3 className="text-[14px] font-[800] text-[#111827]">{edu.degree}</h3>
                    <div className="text-[13px] text-[#6b7280] font-[600] mt-[4px]">{edu.institution}</div>
                    <div className="text-[12px] font-[500] text-[#9ca3af] mt-[4px]">{edu.dates}</div>
                  </div>
                ))}
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <div className="text-[16px] font-[800] uppercase border-b-[2px] border-[#e5e7eb] pb-[8px] mb-[20px]">Skills</div>
                <div className="flex flex-col gap-[8px]">
                  {skillsList.map((skill, i) => <div key={i} className="text-[13px] font-[600] text-[#4b5563] border-l-[3px] border-[#3b82f6] pl-[10px] bg-[#f9fafb] py-[4px]">{skill}</div>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="" textCss="text-[14px] font-[500] text-[#374151] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------------------------------
  // CATEGORY 3: MODERN
  // ------------------------------------------------------------------------------------------------
  if (templateId === 'modern-split') {
    return (
      <div className="flex w-full h-full bg-[#ffffff] text-[#1f2937] font-sans break-words">
        <div className="w-[35%] bg-[#f3f4f6] p-[40px] flex flex-col gap-[30px] border-r border-[#e5e7eb]">
          {showHeader && (
            <div data-measure="header">
              <h1 className="text-[32px] font-[900] text-[#111827] leading-[1.1] mb-[20px] uppercase break-words">{name}</h1>
              <div className="flex flex-col gap-[12px] text-[13px] font-[500] text-[#4b5563] break-all">
                {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
              </div>
            </div>
          )}
          {eduToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[15px] font-[800] text-[#111827] uppercase tracking-[1px] mb-[16px]">Education</h2>}
              <div className="flex flex-col gap-[20px]">
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                    <h3 className="text-[14px] font-[800] text-[#374151]">{edu.degree}</h3>
                    <div className="text-[13px] text-[#6b7280] font-[500] mt-[4px]">{edu.institution}</div>
                    <div className="text-[12px] text-[#9ca3af] mt-[2px]">{edu.dates}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showSkills && skillsList.length > 0 && (
            <div data-measure="skills">
              <h2 className="text-[15px] font-[800] text-[#111827] uppercase tracking-[1px] mb-[16px]">Skills</h2>
              <div className="flex flex-col gap-[8px]">
                {skillsList.map((skill, i) => <span key={i} className="text-[13px] font-[500] text-[#4b5563]">{skill}</span>)}
              </div>
            </div>
          )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[15px] font-[800] text-[#111827] uppercase tracking-[1px] mb-[16px]" textCss="text-[14px] font-[500] text-[#111827] leading-[1.6]" />}
        </div>
        <div className="w-[65%] p-[40px] flex flex-col gap-[30px]">
          {showSummary && summary && (
            <div data-measure="summary">
              <h2 className="text-[15px] font-[800] text-[#111827] uppercase tracking-[1px] mb-[16px] text-[#3b82f6]">Profile</h2>
              <p className="text-[14px] leading-[1.6] text-[#4b5563]">{summary}</p>
            </div>
          )}
          {expToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[15px] font-[800] text-[#111827] uppercase tracking-[1px] mb-[20px] text-[#3b82f6]">Experience</h2>}
              <div className="flex flex-col gap-[24px]">
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                    <h3 className="text-[18px] font-[800] text-[#111827]">{exp.title}</h3>
                    <div className="text-[14px] font-[600] text-[#6b7280] mb-[8px]">{exp.company} | {exp.dates}</div>
                    <p className="text-[14px] leading-[1.6] text-[#4b5563]">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (templateId === 'startup') {
    return (
      <div className="w-full h-full bg-[#f8fbfa] text-[#1f2937] p-[50px] font-sans break-words">
        {showHeader && (
          <div data-measure="header" className="flex justify-between items-end border-b-4 border-[#0f172a] pb-[16px] mb-[30px]">
            <h1 className="text-[42px] font-[900] text-[#0f172a] leading-none">{name}</h1>
            <div className="text-[13px] font-[600] text-[#4b5563] flex flex-col items-end gap-[4px] text-right">
              {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
            </div>
          </div>
        )}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[30px] border-l-[4px] border-[#10b981] pl-[20px]">
            <p className="text-[15px] font-[500] leading-[1.6] text-[#374151]">{summary}</p>
          </div>
        )}
        {expToRender.length > 0 && (
          <div className="mb-[30px]">
            {isFirst && <h2 className="text-[16px] font-[900] text-[#10b981] uppercase tracking-[2px] mb-[20px] flex items-center gap-[10px]"><span className="w-[10px] h-[10px] bg-[#10b981] block"></span> EXPERIENCE</h2>}
            <div className="flex flex-col gap-[24px]">
              {expToRender.map(exp => (
                <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                  <div className="flex justify-between items-center bg-[#0f172a] text-[#ffffff] px-[16px] py-[8px] mb-[12px] rounded-sm">
                    <h3 className="text-[16px] font-[800]">{exp.title}</h3>
                    <span className="text-[13px] font-[600] text-[#34d399]">{exp.dates}</span>
                  </div>
                  <h4 className="text-[15px] font-[700] text-[#4b5563] mb-[8px]">{exp.company}</h4>
                  <p className="text-[14px] leading-[1.6] text-[#374151]">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-[30px]">
          <div className="w-[1/2] flex-1">
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[16px] font-[900] text-[#10b981] uppercase tracking-[2px] mb-[16px] flex items-center gap-[10px]"><span className="w-[10px] h-[10px] bg-[#10b981] block"></span> EDUCATION</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[800] text-[#0f172a]">{edu.degree}</h3>
                      <div className="text-[14px] text-[#4b5563] mt-[2px]">{edu.institution}</div>
                      <div className="text-[13px] text-[#9ca3af] font-[600] mt-[2px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[1/2] flex-1">
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[16px] font-[900] text-[#10b981] uppercase tracking-[2px] mb-[16px] flex items-center gap-[10px]"><span className="w-[10px] h-[10px] bg-[#10b981] block"></span> SKILLS</h2>
                <div className="flex flex-wrap gap-[8px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[13px] font-[700] bg-[#e2e8f0] text-[#0f172a] px-[12px] py-[6px] rounded-sm">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[16px] font-[900] text-[#10b981] uppercase tracking-[2px] mb-[16px] flex items-center gap-[10px]" textCss="text-[14px] font-[500] text-[#10b981] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'tech-sidebar') {
    return (
      <div className="flex w-full h-full bg-[#ffffff] text-[#333333] font-sans whitespace-normal break-words">
        <div className="w-[30%] bg-[#1e293b] text-[#ffffff] p-[30px] flex flex-col gap-[30px]">
          {showHeader && (
            <div data-measure="header">
              <h1 className="text-[28px] font-[800] leading-[1.1] mb-[16px]">{name}</h1>
              <h2 className="text-[14px] font-[700] uppercase tracking-[1px] border-b border-[#334155] pb-[6px] mb-[12px]">Contact</h2>
              <div className="flex flex-col gap-[8px] text-[13px] text-[#cbd5e1] break-all mb-[30px]">
                {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
              </div>
            </div>
          )}
          {showSkills && skillsList.length > 0 && (
            <div data-measure="skills">
              <h2 className="text-[14px] font-[700] uppercase tracking-[1px] border-b border-[#334155] pb-[6px] mb-[12px]">Skills</h2>
              <div className="flex flex-col gap-[6px] text-[13px] text-[#cbd5e1]">
                {skillsList.map((skill, i) => <span key={i}>{skill}</span>)}
              </div>
            </div>
          )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[14px] font-[700] uppercase tracking-[1px] border-b border-[#334155] pb-[6px] mb-[12px]" textCss="text-[14px] font-[500] text-[#374151] leading-[1.6]" />}
        </div>
        <div className="w-[70%] p-[40px]">
          {showSummary && summary && (
            <div data-measure="summary" className="mb-[30px]">
              <h2 className="text-[16px] font-[800] text-[#1e293b] uppercase tracking-[1px] border-b-2 border-[#1e293b] pb-[4px] mb-[12px]">Profile</h2>
              <p className="text-[14px] leading-[1.6] text-[#475569]">{summary}</p>
            </div>
          )}
          {expToRender.length > 0 && (
            <div className="mb-[30px]">
              {isFirst && <h2 className="text-[16px] font-[800] text-[#1e293b] uppercase tracking-[1px] border-b-2 border-[#1e293b] pb-[4px] mb-[16px]">Experience</h2>}
              <div className="flex flex-col gap-[20px]">
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                    <h3 className="text-[16px] font-[700] text-[#0f172a]">{exp.title}</h3>
                    <div className="flex justify-between text-[13px] text-[#64748b] mb-[8px] font-[500]"><span>{exp.company}</span><span>{exp.dates}</span></div>
                    <p className="text-[14px] leading-[1.5] text-[#475569]">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {eduToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[16px] font-[800] text-[#1e293b] uppercase tracking-[1px] border-b-2 border-[#1e293b] pb-[4px] mb-[16px]">Education</h2>}
              <div className="flex flex-col gap-[16px]">
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                    <h3 className="text-[16px] font-[700] text-[#0f172a]">{edu.degree}</h3>
                    <div className="flex justify-between text-[13px] text-[#64748b] mt-[4px] font-[500]"><span>{edu.institution}</span><span>{edu.dates}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 4]
  if (templateId === 'dark-accent') {
    return (
      <div className="flex w-full h-full bg-[#ffffff] text-[#111827] font-sans break-words">
        <div className="w-[35%] bg-[#0f172a] text-[#ffffff] p-[40px] flex flex-col items-center border-r-[4px] border-[#3b82f6]">
          {isFirst && hasPhoto && (
            <img src={profileImage} alt="" className="w-[140px] h-[140px] rounded-lg object-cover mb-[30px] border-[2px] border-[#3b82f6]" />
          )}
          {showHeader && (
            <div data-measure="header" className="w-full text-center mb-[40px]">
              <h1 className="text-[30px] font-[900] leading-tight mb-[16px] text-[#ffffff]">{name}</h1>
              <div className="w-full h-[1px] bg-[#334155] mb-[16px]"></div>
              <div className="flex flex-col gap-[10px] text-[13px] font-[400] text-[#94a3b8] break-all">
                {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
              </div>
            </div>
          )}
          {showSkills && skillsList.length > 0 && (
            <div data-measure="skills" className="w-full text-left">
              <h2 className="text-[14px] font-[800] uppercase tracking-[1px] text-[#3b82f6] mb-[16px]">Skills</h2>
              <div className="flex flex-col gap-[8px] text-[13px] text-[#cbd5e1] font-[500]">
                {skillsList.map((skill, i) => <span key={i}>• {skill}</span>)}
              </div>
            </div>
          )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="w-full text-left mt-[16px]" titleCss="text-[14px] font-[800] uppercase tracking-[1px] text-[#3b82f6] mb-[16px]" textCss="text-[14px] font-[500] text-[#3b82f6] leading-[1.6]" />}
        </div>
        <div className="w-[65%] p-[50px] flex flex-col gap-[30px]">
          {showSummary && summary && (
            <div data-measure="summary">
              <h2 className="text-[16px] font-[900] uppercase tracking-[1px] text-[#111827] mb-[10px] flex items-center gap-[8px]">
                <span className="w-[20px] h-[2px] bg-[#3b82f6]"></span> Profile
              </h2>
              <p className="text-[14px] leading-[1.6] text-[#4b5563] ml-[28px]">{summary}</p>
            </div>
          )}
          {expToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[16px] font-[900] uppercase tracking-[1px] text-[#111827] mb-[20px] flex items-center gap-[8px]">
                <span className="w-[20px] h-[2px] bg-[#3b82f6]"></span> Experience
              </h2>}
              <div className="flex flex-col gap-[20px] ml-[28px]">
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="bg-[#f8fafc] p-[20px] border-l-[3px] border-[#3b82f6]">
                    <h3 className="text-[16px] font-[800] text-[#111827]">{exp.title}</h3>
                    <div className="text-[13px] font-[600] text-[#6b7280] mb-[8px]">{exp.company} | <span className="text-[#3b82f6]">{exp.dates}</span></div>
                    <p className="text-[14px] leading-[1.6] text-[#4b5563]">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {eduToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[16px] font-[900] uppercase tracking-[1px] text-[#111827] mb-[20px] flex items-center gap-[8px]">
                <span className="w-[20px] h-[2px] bg-[#3b82f6]"></span> Education
              </h2>}
              <div className="flex flex-col gap-[16px] ml-[28px]">
                {eduToRender.map(edu => (
                  <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                    <h3 className="text-[15px] font-[800] text-[#111827]">{edu.degree}</h3>
                    <div className="text-[14px] font-[500] text-[#6b7280] mt-[2px]">{edu.institution}</div>
                    <div className="text-[13px] text-[#9ca3af] font-[600] mt-[2px]">{edu.dates}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 5]
  if (templateId === 'rounded-modern') {
    return (
      <div className="w-full h-full bg-[#f8fafc] text-[#1e293b] p-[40px] font-sans break-words pb-[60px]">
        {showHeader && (
          <div data-measure="header" className="bg-[#ffffff] rounded-[24px] p-[30px] shadow-sm mb-[30px] flex items-center gap-[30px] border border-[#e2e8f0]">
            {hasPhoto && <img src={profileImage} alt="" className="w-[110px] h-[110px] rounded-[30px] object-cover" />}
            <div>
              <h1 className="text-[38px] font-[900] text-[#0f172a] leading-none mb-[12px]">{name}</h1>
              <div className="flex flex-wrap gap-[12px] text-[13px] font-[600] text-[#64748b] bg-[#f1f5f9] p-[10px] rounded-xl inline-flex">
                {contactDetails.map((t, i) => <span key={i} className="bg-[#ffffff] px-[10px] py-[4px] rounded-lg shadow-sm">{t}</span>)}
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-[30px]">
          <div className="w-[60%] flex flex-col gap-[30px]">
            {showSummary && summary && (
              <div data-measure="summary" className="bg-[#ffffff] rounded-[24px] p-[24px] shadow-sm border border-[#e2e8f0]">
                <h2 className="text-[16px] font-[800] text-[#0f172a] mb-[12px]">About Me</h2>
                <p className="text-[14px] leading-[1.6] text-[#475569]">{summary}</p>
              </div>
            )}
            {expToRender.length > 0 && (
              <div className="bg-[#ffffff] rounded-[24px] p-[24px] shadow-sm border border-[#e2e8f0]">
                {isFirst && <h2 className="text-[16px] font-[800] text-[#0f172a] mb-[20px]">Experience</h2>}
                <div className="flex flex-col gap-[20px]">
                  {expToRender.map(exp => (
                    <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                      <div className="flex justify-between items-center mb-[4px]">
                        <h3 className="text-[16px] font-[800] text-[#0f172a]">{exp.title}</h3>
                        <span className="text-[12px] font-[700] text-[#ffffff] bg-[#0f172a] px-[10px] py-[4px] rounded-full">{exp.dates}</span>
                      </div>
                      <h4 className="text-[14px] font-[600] text-[#64748b] mb-[8px]">{exp.company}</h4>
                      <p className="text-[14px] leading-[1.6] text-[#475569]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[40%] flex flex-col gap-[30px]">
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills" className="bg-[#0f172a] text-[#ffffff] rounded-[24px] p-[24px] shadow-sm border border-[#1e293b]">
                <h2 className="text-[16px] font-[800] text-[#ffffff] mb-[16px]">Skills</h2>
                <div className="flex flex-wrap gap-[8px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[13px] font-[600] bg-[#1e293b] text-[#e2e8f0] px-[12px] py-[6px] rounded-xl">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="bg-[#0f172a] text-[#ffffff] rounded-[24px] p-[24px] shadow-sm border border-[#1e293b] mt-[16px]" titleCss="text-[16px] font-[800] text-[#ffffff] mb-[16px]" textCss="text-[14px] font-[500] text-[#ffffff] leading-[1.6]" />}
            {eduToRender.length > 0 && (
              <div className="bg-[#ffffff] rounded-[24px] p-[24px] shadow-sm border border-[#e2e8f0]">
                {isFirst && <h2 className="text-[16px] font-[800] text-[#0f172a] mb-[20px]">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[800] text-[#0f172a]">{edu.degree}</h3>
                      <div className="text-[14px] font-[500] text-[#64748b] mt-[4px]">{edu.institution}</div>
                      <div className="text-[13px] font-[600] text-[#94a3b8] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------------------------------
  // CATEGORY 4: CREATIVE
  // ------------------------------------------------------------------------------------------------
  if (templateId === 'creative-bold') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#111827] font-sans whitespace-normal break-words flex flex-col">
        {showHeader && (
          <div data-measure="header" className="bg-[#db2777] text-[#ffffff] px-[50px] py-[60px] text-center flex flex-col items-center justify-center">
            <h1 className="text-[48px] font-[900] tracking-tight leading-none mb-[16px]">{name}</h1>
            <p className="text-[15px] font-[500] max-w-[80%] opacity-90 leading-relaxed mx-auto">{summary}</p>
          </div>
        )}
        <div className="flex p-[50px] gap-[40px]">
          <div className="w-[65%] flex flex-col gap-[30px]">
            {isMeasuring && <div className="hidden">{summary}</div>}
            {expToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[20px] font-[900] text-[#db2777] uppercase tracking-[1px] mb-[16px]">Experience</h2>}
                <div className="flex flex-col gap-[20px]">
                  {expToRender.map(exp => (
                    <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="border-l-[4px] border-[#fbcfe8] pl-[16px]">
                      <h3 className="text-[18px] font-[800] leading-tight">{exp.title}</h3>
                      <div className="text-[14px] text-[#4b5563] font-[600] mt-[4px] mb-[8px]">{exp.company} | {exp.dates}</div>
                      <p className="text-[14px] text-[#374151] leading-[1.6]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[20px] font-[900] text-[#db2777] uppercase tracking-[1px] mb-[16px]">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id} className="border-l-[4px] border-[#fbcfe8] pl-[16px]">
                      <h3 className="text-[18px] font-[800] leading-tight">{edu.degree}</h3>
                      <div className="text-[14px] text-[#4b5563] font-[600] mt-[4px]">{edu.institution} | {edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[35%] flex flex-col gap-[30px]">
            {showHeader && (
              <div data-measure="header-info">
                <h2 className="text-[16px] font-[800] text-[#111827] uppercase tracking-[1px] border-b border-[#e5e7eb] pb-[8px] mb-[16px]">Contact</h2>
                <div className="flex flex-col gap-[10px] text-[14px] text-[#374151] font-[500] break-all">
                  {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
                </div>
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[16px] font-[800] text-[#111827] uppercase tracking-[1px] border-b border-[#e5e7eb] pb-[8px] mb-[16px]">Skills</h2>
                <div className="flex flex-wrap gap-[8px]">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="bg-[#f3f4f6] text-[#111827] text-[12px] font-[700] px-[12px] py-[6px] rounded-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[16px] font-[800] text-[#111827] uppercase tracking-[1px] border-b border-[#e5e7eb] pb-[8px] mb-[16px]" textCss="text-[14px] font-[500] text-[#111827] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 6]
  if (templateId === 'portfolio-accent') {
    return (
      <div className="flex w-full h-full bg-[#111827] text-[#f9fafb] font-sans break-words p-[40px] gap-[40px]">
        <div className="w-[35%] flex flex-col items-center">
          {isFirst && hasPhoto && (
            <img src={profileImage} alt="" className="w-full aspect-square object-cover shadow-2xl mb-[30px] grayscale hover:grayscale-0 transition-all border-[8px] border-[#1f2937]" />
          )}
          {showHeader && (
            <div data-measure="header" className="w-full text-left">
              <h1 className="text-[40px] font-[900] text-[#f97316] leading-none mb-[20px] uppercase">{name}</h1>
              <div className="w-[50px] h-[5px] bg-[#f97316] mb-[30px] pr-[20px]"></div>
              <div className="flex flex-col gap-[12px] text-[14px] font-[600] text-[#9ca3af]">
                {contactDetails.map((detail, idx) => <span key={idx}>{detail}</span>)}
              </div>
            </div>
          )}
        </div>
        <div className="w-[65%] flex flex-col gap-[40px]">
          {showSummary && summary && (
            <div data-measure="summary">
              <h2 className="text-[18px] font-[800] uppercase text-[#f97316] mb-[16px]">About Me</h2>
              <p className="text-[15px] leading-[1.7] text-[#d1d5db] font-[400]">{summary}</p>
            </div>
          )}
          {expToRender.length > 0 && (
            <div>
              {isFirst && <h2 className="text-[18px] font-[800] uppercase text-[#f97316] mb-[20px]">Experience</h2>}
              <div className="flex flex-col gap-[24px]">
                {expToRender.map(exp => (
                  <div key={exp.id} data-measure="experience-item" data-id={exp.id} className="relative">
                    <div className="absolute top-[8px] left-[-20px] w-[6px] h-[6px] bg-[#f97316] rounded-full"></div>
                    <h3 className="text-[18px] font-[800] text-[#f9fafb]">{exp.title}</h3>
                    <div className="text-[14px] font-[600] text-[#9ca3af] mb-[8px] mt-[4px]">{exp.company}  |  <span className="text-[#f97316]">{exp.dates}</span></div>
                    <p className="text-[14px] leading-[1.6] text-[#d1d5db]">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-[40px]">
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[18px] font-[800] uppercase text-[#f97316] mb-[20px]">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[800] text-[#f9fafb]">{edu.degree}</h3>
                      <div className="text-[13px] font-[500] text-[#9ca3af] mt-[4px]">{edu.institution}</div>
                      <div className="text-[12px] font-[700] text-[#f97316] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[18px] font-[800] uppercase text-[#f97316] mb-[20px]">Skills</h2>
                <div className="flex flex-col gap-[8px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[14px] font-[600] text-[#d1d5db]">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[18px] font-[800] uppercase text-[#f97316] mb-[20px]" textCss="text-[14px] font-[500] text-[#f97316] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'vibrant-boxes') {
    return (
      <div className="w-full h-full bg-[#f3f4f6] p-[40px] font-sans break-words flex flex-col gap-[16px]">
        {showHeader && (
          <div data-measure="header" className="bg-[#6366f1] text-[#ffffff] p-[30px] rounded-xl shadow-md border-[4px] border-[#312e81]">
            <h1 className="text-[44px] font-[900] leading-none mb-[16px] uppercase tracking-[-1px]">{name}</h1>
            <div className="flex gap-[20px] text-[14px] font-[600] text-[#e0e7ff] flex-wrap">
              {contactDetails.map((t, i) => <span key={i} className="bg-[#4f46e5] px-[12px] py-[4px] rounded-full">{t}</span>)}
            </div>
          </div>
        )}
        {showSummary && summary && (
          <div data-measure="summary" className="bg-[#ffffff] p-[24px] rounded-xl shadow-md border-[4px] border-[#111827]">
            <h2 className="text-[16px] font-[900] text-[#111827] uppercase bg-[#fde047] inline-block px-[10px] py-[2px] mb-[12px] transform -rotate-1">Profile</h2>
            <p className="text-[15px] leading-[1.6] text-[#374151] font-[500]">{summary}</p>
          </div>
        )}
        <div className="flex gap-[16px] flex-1">
          <div className="w-[60%] flex flex-col gap-[16px]">
            {expToRender.length > 0 && (
              <div className="bg-[#ffffff] p-[24px] rounded-xl shadow-md border-[4px] border-[#111827] flex-1">
                {isFirst && <h2 className="text-[16px] font-[900] text-[#111827] uppercase bg-[#86efac] inline-block px-[10px] py-[2px] mb-[20px] transform rotate-1">Experience</h2>}
                <div className="flex flex-col gap-[20px]">
                  {expToRender.map(exp => (
                    <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                      <h3 className="text-[18px] font-[900] text-[#111827]">{exp.title}</h3>
                      <div className="text-[14px] font-[700] text-[#6366f1] mb-[8px]">{exp.company} • {exp.dates}</div>
                      <p className="text-[14px] leading-[1.6] text-[#4b5563] font-[500]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[40%] flex flex-col gap-[16px]">
            {eduToRender.length > 0 && (
              <div className="bg-[#ffffff] p-[24px] rounded-xl shadow-md border-[4px] border-[#111827]">
                {isFirst && <h2 className="text-[16px] font-[900] text-[#111827] uppercase bg-[#f9a8d4] inline-block px-[10px] py-[2px] mb-[20px] transform -rotate-2">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[900] text-[#111827]">{edu.degree}</h3>
                      <div className="text-[14px] font-[700] text-[#6b7280] mt-[4px]">{edu.institution}</div>
                      <div className="text-[13px] font-[800] text-[#6366f1] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills" className="bg-[#ffffff] p-[24px] rounded-xl shadow-md border-[4px] border-[#111827] flex-1">
                <h2 className="text-[16px] font-[900] text-[#111827] uppercase bg-[#cbd5e1] inline-block px-[10px] py-[2px] mb-[20px] transform rotate-2">Skills</h2>
                <div className="flex flex-wrap gap-[10px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[13px] font-[800] text-[#ffffff] bg-[#111827] px-[12px] py-[6px] rounded-sm">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="bg-[#ffffff] p-[24px] rounded-xl shadow-md border-[4px] border-[#111827] flex-1 mt-[16px]" titleCss="text-[16px] font-[900] text-[#111827] uppercase bg-[#cbd5e1] inline-block px-[10px] py-[2px] mb-[20px] transform rotate-2" textCss="text-[14px] font-[500] text-[#111827] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 7]
  if (templateId === 'quirky-offset') {
    return (
      <div className="w-full h-full bg-[#fdf8f5] text-[#2d3748] p-[50px] font-sans break-words pb-[60px] border-t-[20px] border-[#ed8936]">
        <div className="flex items-start gap-[40px] mb-[40px]">
          <div className="flex-1">
            {showHeader && (
              <div data-measure="header">
                <h1 className="text-[46px] font-[900] leading-none text-[#1a202c] uppercase tracking-[-1px] mb-[16px] transform -rotate-1 origin-bottom-left">{name}</h1>
                <div className="flex flex-col gap-[8px] text-[14px] font-[600] text-[#4a5568]">
                  {contactDetails.map((t, i) => <span key={i}>{t}</span>)}
                </div>
              </div>
            )}
          </div>
          {isFirst && hasPhoto && (
            <div className="w-[150px] h-[150px] transform rotate-3 origin-center">
              <img src={profileImage} alt="" className="w-full h-full object-cover border-[8px] border-[#ffffff] shadow-xl" />
            </div>
          )}
        </div>

        {showSummary && summary && (
          <div data-measure="summary" className="mb-[40px] relative">
            <div className="absolute top-[-10px] left-[-10px] w-full h-full bg-[#ed8936] z-0"></div>
            <div className="bg-[#ffffff] p-[24px] relative z-10 border-[3px] border-[#1a202c]">
              <p className="text-[15px] font-[600] leading-[1.6] text-[#2d3748]">{summary}</p>
            </div>
          </div>
        )}

        <div className="flex gap-[40px]">
          <div className="w-[60%] flex flex-col gap-[40px]">
            {expToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[20px] font-[900] bg-[#1a202c] text-[#ffffff] px-[16px] py-[8px] inline-block mb-[24px] transform -rotate-1 shadow-lg">Experience</h2>}
                <div className="flex flex-col gap-[24px]">
                  {expToRender.map(exp => (
                    <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                      <h3 className="text-[18px] font-[900] text-[#1a202c] border-b-[2px] border-[#cbd5e0] pb-[4px] inline-block">{exp.title}</h3>
                      <div className="text-[14px] font-[700] text-[#ed8936] mb-[8px] mt-[8px]">{exp.company} // {exp.dates}</div>
                      <p className="text-[14px] font-[500] leading-[1.6] text-[#4a5568]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[40%] flex flex-col gap-[40px]">
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[20px] font-[900] bg-[#1a202c] text-[#ffffff] px-[16px] py-[8px] inline-block mb-[24px] transform rotate-1 shadow-lg">Education</h2>}
                <div className="flex flex-col gap-[20px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[16px] font-[900] text-[#1a202c]">{edu.degree}</h3>
                      <div className="text-[14px] font-[700] text-[#718096] mt-[4px]">{edu.institution}</div>
                      <div className="text-[13px] font-[800] text-[#ed8936] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[20px] font-[900] bg-[#1a202c] text-[#ffffff] px-[16px] py-[8px] inline-block mb-[24px] transform -rotate-1 shadow-lg">Skills</h2>
                <div className="flex flex-col gap-[10px]">
                  {skillsList.map((skill, i) => <span key={i} className="text-[14px] font-[800] text-[#2d3748] border-l-[4px] border-[#ed8936] pl-[12px] bg-[#ffffff] py-[4px] shadow-sm">{skill}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[20px] font-[900] bg-[#1a202c] text-[#ffffff] px-[16px] py-[8px] inline-block mb-[24px] transform -rotate-1 shadow-lg" textCss="text-[14px] font-[500] text-[#ffffff] leading-[1.6]" />}
          </div>
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 8]
  if (templateId === 'photo-hero') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#1f2937] font-sans break-words">
        {showHeader && (
          <div data-measure="header" className="relative h-[250px] mb-[40px] flex items-end">
            <div className="absolute inset-0 bg-[#1e293b] z-0"></div>
            {hasPhoto && <img src={profileImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 grayscale" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent z-10"></div>
            <div className="relative z-20 p-[40px] w-full text-center">
              <h1 className="text-[48px] font-[900] text-[#ffffff] leading-none mb-[12px] tracking-tight">{name}</h1>
              <div className="text-[14px] font-[500] text-[#cbd5e1] flex justify-center gap-[20px] flex-wrap">
                {contactDetails.map((t, i) => <span key={i}>{t}</span>)}
              </div>
            </div>
          </div>
        )}
        <div className="px-[50px] pb-[60px] flex flex-col gap-[30px]">
          {isMeasuring && <div className="hidden">{summary}</div>}
          {showSummary && summary && (
            <div data-measure="summary" className="text-center max-w-[85%] mx-auto">
              <p className="text-[16px] font-[500] leading-[1.8] text-[#334155]">{summary}</p>
            </div>
          )}
          <div className="flex gap-[40px]">
            <div className="w-[60%] flex flex-col gap-[30px]">
              {expToRender.length > 0 && (
                <div>
                  {isFirst && <h2 className="text-[16px] font-[800] uppercase tracking-[2px] text-[#0f172a] border-b-[2px] border-[#3b82f6] pb-[8px] mb-[24px]">Experience</h2>}
                  <div className="flex flex-col gap-[24px]">
                    {expToRender.map(exp => (
                      <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                        <h3 className="text-[18px] font-[800] text-[#0f172a]">{exp.title}</h3>
                        <div className="text-[14px] font-[600] text-[#3b82f6] mt-[4px] mb-[8px]">{exp.company} • {exp.dates}</div>
                        <p className="text-[14px] font-[500] leading-[1.6] text-[#475569]">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-[40%] flex flex-col gap-[30px]">
              {eduToRender.length > 0 && (
                <div>
                  {isFirst && <h2 className="text-[16px] font-[800] uppercase tracking-[2px] text-[#0f172a] border-b-[2px] border-[#3b82f6] pb-[8px] mb-[24px]">Education</h2>}
                  <div className="flex flex-col gap-[16px]">
                    {eduToRender.map(edu => (
                      <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                        <h3 className="text-[15px] font-[800] text-[#0f172a]">{edu.degree}</h3>
                        <div className="text-[14px] font-[500] text-[#475569] mt-[4px]">{edu.institution}</div>
                        <div className="text-[13px] font-[600] text-[#94a3b8] mt-[4px]">{edu.dates}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showSkills && skillsList.length > 0 && (
                <div data-measure="skills">
                  <h2 className="text-[16px] font-[800] uppercase tracking-[2px] text-[#0f172a] border-b-[2px] border-[#3b82f6] pb-[8px] mb-[24px]">Skills</h2>
                  <div className="flex flex-wrap gap-[8px]">
                    {skillsList.map((skill, i) => <span key={i} className="text-[13px] font-[600] text-[#475569] bg-[#f1f5f9] px-[12px] py-[6px] rounded-full">{skill}</span>)}
                  </div>
                </div>
              )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[16px] font-[800] uppercase tracking-[2px] text-[#0f172a] border-b-[2px] border-[#3b82f6] pb-[8px] mb-[24px]" textCss="text-[14px] font-[500] text-[#0f172a] leading-[1.6]" />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------------------------------------
  // CATEGORY 5: EXECUTIVE
  // ------------------------------------------------------------------------------------------------
  if (templateId === 'executive') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#171717] p-[50px] font-serif whitespace-normal break-words border-t-[12px] border-[#171717]">
        {showHeader && (
          <div data-measure="header" className="text-center mb-[40px] pt-[20px]">
            <h1 className="text-[46px] font-[700] uppercase tracking-[2px] leading-none mb-[16px] text-[#171717]">{name}</h1>
            <div className="flex justify-center items-center gap-[16px]">
              <div className="w-[40px] h-[1px] bg-[#a3a3a3]"></div>
              <div className="text-[13px] font-[400] text-[#525252] tracking-[1px] uppercase text-center max-w-[80%] leading-relaxed">
                {contactDetails.join("  •  ")}
              </div>
              <div className="w-[40px] h-[1px] bg-[#a3a3a3]"></div>
            </div>
          </div>
        )}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[40px]">
            <p className="text-[14px] leading-[1.8] text-[#404040] text-center max-w-[85%] mx-auto font-sans font-[400]">{summary}</p>
          </div>
        )}
        {expToRender.length > 0 && (
          <div className="mb-[40px]">
            {isFirst && <h2 className="text-[14px] font-[700] uppercase tracking-[3px] text-[#171717] text-center border-b-[2px] border-[#171717] pb-[8px] mb-[24px]">Professional Experience</h2>}
            <div className="flex flex-col gap-[24px]">
              {expToRender.map(exp => (
                <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                  <div className="flex justify-between items-end mb-[4px]">
                    <h3 className="text-[16px] font-[700] text-[#171717] uppercase tracking-[1px]">{exp.title}</h3>
                    <span className="text-[13px] font-sans font-[600] text-[#737373]">{exp.dates}</span>
                  </div>
                  <div className="text-[15px] font-[400] italic text-[#404040] mb-[8px]">{exp.company}</div>
                  <p className="text-[14px] leading-[1.7] font-sans text-[#404040] font-[400]">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-[40px]">
          <div className="w-[1/2] flex-1">
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[14px] font-[700] uppercase tracking-[3px] text-[#171717] text-center border-b-[2px] border-[#171717] pb-[8px] mb-[24px]">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[700] text-[#171717] uppercase tracking-[1px]">{edu.degree}</h3>
                      <div className="text-[14px] font-[400] italic text-[#404040] mt-[4px]">{edu.institution}</div>
                      <div className="text-[13px] font-sans font-[600] text-[#737373] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[1/2] flex-1">
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[14px] font-[700] uppercase tracking-[3px] text-[#171717] text-center border-b-[2px] border-[#171717] pb-[8px] mb-[24px]">Expertise</h2>
                <ul className="text-[14px] leading-[1.8] font-sans text-[#404040] list-disc list-inside">
                  {skillsList.map((skill, i) => <li key={i}>{skill}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'heavy-borders') {
    return (
      <div className="w-full h-full bg-[#ffffff] text-[#000000] p-[50px] font-sans whitespace-normal break-words">
        {showHeader && <BlockHeader css="mb-[30px] border-[4px] border-[#000000] p-[20px]" nameCss="text-[36px] font-[900] uppercase tracking-[-1px] leading-[1] mb-[12px]" contactCss="text-[14px] font-[700] text-[#000000]" />}
        {showSummary && summary && <BlockSummary css="mb-[30px] border-l-[8px] border-[#000000] pl-[20px]" textCss="text-[15px] leading-[1.6] font-[600] text-[#000000]" />}
        {expToRender.length > 0 && <BlockExp containerCss="mb-[30px]" titleCss="text-[20px] font-[900] uppercase tracking-[1px] border-b-[4px] border-[#000000] pb-[8px] mb-[20px] bg-[#000000] text-[#ffffff] px-[16px] py-[4px] inline-block" itemCss="mb-[24px] border-b-[2px] border-[#000000] pb-[16px]" headerTitleCss="text-[18px] font-[900]" dateCompanyCss={{ date: "text-[14px] font-[800] bg-[#e5e5e5] px-[8px] py-[2px]", company: "text-[16px] font-[800] mb-[8px]" }} descCss="text-[14px] leading-[1.6] font-[500]" />}
        <div className="flex gap-[40px]">
          {eduToRender.length > 0 && <BlockEdu containerCss="flex-1" titleCss="text-[20px] font-[900] uppercase tracking-[1px] border-b-[4px] border-[#000000] pb-[8px] mb-[20px] bg-[#000000] text-[#ffffff] px-[16px] py-[4px] inline-block" itemCss="mb-[16px] border-[2px] border-[#000000] p-[16px]" headerTitleCss="text-[16px] font-[900]" dateCompanyCss={{ date: "text-[13px] font-[800]", company: "text-[14px] font-[800] mt-[4px]" }} />}
          {showSkills && skillsList.length > 0 && <BlockSkills containerCss="flex-1" titleCss="text-[20px] font-[900] uppercase tracking-[1px] border-b-[4px] border-[#000000] pb-[8px] mb-[20px] bg-[#000000] text-[#ffffff] px-[16px] py-[4px] inline-block" mapCss="flex flex-col gap-[8px]" pillCss="text-[14px] font-[800] border-[2px] border-[#000000] px-[12px] py-[6px] uppercase" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="flex-1 mt-[20px]" titleCss="text-[20px] font-[900] uppercase tracking-[1px] border-b-[4px] border-[#000000] pb-[8px] mb-[12px] bg-[#000000] text-[#ffffff] px-[16px] py-[4px] inline-block" textCss="text-[14px] font-[800] leading-[1.6]" />}
        </div>
      </div>
    );
  }

  // [PHOTO SUPPORT 9]
  if (templateId === 'legacy-serif') {
    return (
      <div className="w-full h-full bg-[#fdfdfd] text-[#1f2937] p-[50px] font-serif whitespace-normal break-words border-x-[8px] border-[#e5e7eb] flex flex-col">
        <div className="flex items-center justify-between mb-[30px] border-b-[2px] border-[#1f2937] pb-[20px]">
          <div className={hasPhoto ? "w-[70%]" : "w-full"}>
            {showHeader && (
              <div data-measure="header">
                <h1 className="text-[44px] font-[700] text-[#111827] uppercase tracking-[1px] leading-tight mb-[8px]">{name}</h1>
                <div className="text-[14px] font-[500] text-[#4b5563] flex flex-col gap-[4px] mt-[8px]">
                  {contactDetails.map((t, i) => <span key={i}>{t}</span>)}
                </div>
              </div>
            )}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss=" mt-[16px]" titleCss="text-[14px] font-[700] uppercase tracking-[3px] text-[#171717] text-center border-b-[2px] border-[#171717] pb-[8px] mb-[24px]" textCss="text-[14px] font-[500] text-[#171717] leading-[1.6]" />}
          </div>
          {isFirst && hasPhoto && (
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[4px] border-[#e5e7eb] shadow-md flex-shrink-0">
              <img src={profileImage} alt="" className="w-full h-full object-cover grayscale" />
            </div>
          )}
        </div>
        {isMeasuring && <div className="hidden">{summary}</div>}
        {showSummary && summary && (
          <div data-measure="summary" className="mb-[30px]">
            <p className="text-[15px] leading-[1.8] text-[#374151] italic">{summary}</p>
          </div>
        )}
        {expToRender.length > 0 && (
          <div className="mb-[30px]">
            {isFirst && <h2 className="text-[18px] font-[700] text-[#111827] uppercase tracking-[2px] mb-[20px]">Professional Experience</h2>}
            <div className="flex flex-col gap-[20px]">
              {expToRender.map(exp => (
                <div key={exp.id} data-measure="experience-item" data-id={exp.id}>
                  <div className="flex justify-between items-end mb-[4px]">
                    <h3 className="text-[16px] font-[700] text-[#111827]">{exp.title}</h3>
                    <span className="text-[14px] text-[#6b7280] font-[600]">{exp.dates}</span>
                  </div>
                  <div className="text-[15px] font-[600] text-[#374151] mb-[8px]">{exp.company}</div>
                  <p className="text-[14px] leading-[1.7] font-sans text-[#4b5563]">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-[40px]">
          <div className="w-[1/2] flex-1">
            {eduToRender.length > 0 && (
              <div>
                {isFirst && <h2 className="text-[18px] font-[700] text-[#111827] uppercase tracking-[2px] mb-[20px]">Education</h2>}
                <div className="flex flex-col gap-[16px]">
                  {eduToRender.map(edu => (
                    <div key={edu.id} data-measure="education-item" data-id={edu.id}>
                      <h3 className="text-[15px] font-[700] text-[#111827]">{edu.degree}</h3>
                      <div className="text-[14px] font-[600] text-[#374151] mt-[4px]">{edu.institution}</div>
                      <div className="text-[13px] text-[#6b7280] font-[600] mt-[4px]">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-[1/2] flex-1">
            {showSkills && skillsList.length > 0 && (
              <div data-measure="skills">
                <h2 className="text-[18px] font-[700] text-[#111827] uppercase tracking-[2px] mb-[20px]">Core Competencies</h2>
                <ul className="text-[14px] leading-[1.8] font-sans text-[#4b5563] list-disc list-inside">
                  {skillsList.map((skill, i) => <li key={i}>{skill}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback default structure for remaining Executive/Professional standard designs to prevent excessive code repetition
  return (
    <div className="w-full h-full bg-[#ffffff] text-[#1f2937] p-[50px] font-sans whitespace-normal break-words">
      {showHeader && <BlockHeader css="mb-[30px] border-b-2 border-[#1e293b] pb-[16px]" nameCss="text-[40px] font-[900] leading-tight text-[#111827] mb-[4px]" contactCss="text-[14px] text-[#475569] font-[500]" />}
      {showSummary && summary && <BlockSummary css="mb-[30px]" textCss="text-[15px] font-[500] leading-[1.6] text-[#333333]" />}
      {expToRender.length > 0 && <BlockExp containerCss="mb-[30px]" titleCss="text-[18px] font-[900] text-[#1e293b] uppercase tracking-[1px] mb-[16px]" itemCss="mb-[20px] pl-[12px] border-l-[3px] border-[#3b82f6]" headerTitleCss="text-[18px] font-[800] text-[#111827]" dateCompanyCss={{ date: "", company: "text-[14px] font-[600] text-[#3b82f6] mb-[8px]" }} descCss="text-[14px] leading-[1.6] text-[#4b5563]" />}
      {eduToRender.length > 0 && <BlockEdu containerCss="mb-[30px]" titleCss="text-[18px] font-[900] text-[#1e293b] uppercase tracking-[1px] mb-[16px]" itemCss="mb-[16px] bg-[#f8fafc] p-[16px] rounded-sm" headerTitleCss="text-[16px] font-[800] text-[#111827]" dateCompanyCss={{ date: "text-[13px] text-[#94a3b8]", company: "text-[14px] font-[600] text-[#475569]" }} />}
      {showSkills && skillsList.length > 0 && <BlockSkills containerCss="" titleCss="text-[18px] font-[900] text-[#1e293b] uppercase tracking-[1px] mb-[16px]" mapCss="flex flex-wrap gap-[8px]" pillCss="bg-[#e2e8f0] text-[#0f172a] text-[13px] font-[700] px-[12px] py-[4px] rounded-md" />}
        {showProfile && customFields.filter(cf => cf.value).length > 0 && <BlockProfile containerCss="mt-[20px]" titleCss="text-[18px] font-[900] text-[#1e293b] uppercase tracking-[1px] mb-[8px]" textCss="text-[14px] font-[600] text-[#475569] leading-[1.6]" />}
    </div>
  );
};


// ------------------------------------------------------------------------------------------------
// MINIATURE TEMPLATE PREVIEWS (CSS only representation)
// ------------------------------------------------------------------------------------------------
export const MiniatureTemplate = ({ previewId }) => {
  if (['minimalist', 'clean-lines', 'pure-white'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col">
      <div className="w-1/2 h-2 bg-gray-800 mb-1"></div>
      <div className="w-3/4 h-1 bg-gray-300 mb-3"></div>
      <div className="w-full h-1 bg-gray-200 mb-0.5"></div>
      <div className="w-5/6 h-1 bg-gray-200 mb-3"></div>
      <div className="w-1/3 h-1.5 bg-gray-800 mb-2"></div>
      <div className="w-full h-1 bg-gray-200 mb-0.5"></div>
      <div className="w-full h-1 bg-gray-200 mb-0.5"></div>
      <div className="w-2/3 h-1 bg-gray-200 mb-3"></div>
    </div>
  );

  if (['elegant', 'simple-margins', 'legacy-serif'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col items-center bg-[#fdfdfd] relative border-l-2 border-transparent">
      <div className="w-1/3 aspect-square rounded-full bg-gray-400 mb-2"></div>
      <div className="w-1/2 h-2 bg-slate-800 mb-2"></div>
      <div className="w-full flex justify-center gap-1 mb-3">
        <div className="w-1/5 h-0.5 bg-slate-400"></div>
        <div className="w-1/5 h-0.5 bg-slate-400"></div>
      </div>
      <div className="w-full h-1 bg-slate-200 z-10 mb-2 mt-1"></div>
      <div className="w-3/4 h-1.5 bg-slate-800 z-10 mb-1"></div>
    </div>
  );

  if (['tech-sidebar', 'dark-accent'].includes(previewId)) return (
    <div className="w-full h-full flex">
      <div className="w-[35%] h-full bg-slate-800 p-1.5 flex flex-col gap-1.5 items-center">
        {previewId === 'dark-accent' && <div className="w-3/4 aspect-square rounded-md bg-white/50 mb-1"></div>}
        <div className="w-full h-2 bg-white/80 rounded-sm mb-1 mt-1"></div>
        <div className="w-full h-1 bg-white/40"></div>
        <div className="w-3/4 h-1 bg-white/40"></div>
        <div className="w-full h-1 bg-white/40 mt-2"></div>
      </div>
      <div className="w-[65%] h-full p-2 flex flex-col gap-2">
        <div className="w-1/2 h-1.5 bg-slate-800"></div>
        <div className="w-full flex border-b border-gray-200 gap-1 flex-col pb-1">
          <div className="w-full h-1 bg-gray-300"></div>
          <div className="w-5/6 h-1 bg-gray-300"></div>
        </div>
        <div className="w-1/2 h-1.5 bg-slate-800 mt-1"></div>
        <div className="w-full h-1 bg-gray-300"></div>
      </div>
    </div>
  );

  if (['academic', 'executive', 'board-member'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col items-center border-t-2 border-gray-800">
      <div className="w-2/3 h-2 bg-gray-900 mb-1 mt-1"></div>
      <div className="w-2/3 h-1 bg-gray-400 mb-3 border-b border-gray-300 pb-1"></div>
      <div className="w-full h-1 bg-gray-200 mb-1"></div>
      <div className="w-3/4 h-1 bg-gray-200 mb-3"></div>
      <div className="w-1/3 h-1.5 bg-gray-700 mb-2"></div>
      <div className="w-full flex justify-between mb-1">
        <div className="w-1/2 h-1 bg-gray-600"></div>
        <div className="w-1/4 h-1 bg-gray-400"></div>
      </div>
      <div className="w-full h-1 bg-gray-200 mb-1"></div>
    </div>
  );

  if (['modern-split', 'startup', 'vibrant-boxes'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col">
      <div className="w-full flex justify-between border-b-2 border-slate-900 pb-1 mb-2">
        <div className="w-1/2 h-2.5 bg-slate-900"></div>
        <div className="w-1/4 flex flex-col gap-0.5">
          <div className="w-full h-0.5 bg-slate-500"></div>
        </div>
      </div>
      <div className="w-1/3 h-1 bg-emerald-500 mb-1"></div>
      <div className="w-full h-1 bg-slate-300 mb-2"></div>
      <div className="w-1/3 h-1. bg-emerald-500 mb-1"></div>
      <div className="w-full flex justify-between mb-1">
        <div className="w-1/3 h-1.5 bg-slate-900"></div>
        <div className="w-1/4 h-1 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );

  if (['creative-bold', 'portfolio-accent', 'photo-hero', 'quirky-offset'].includes(previewId)) return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full h-12 bg-pink-600 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
        {previewId !== 'creative-bold' && <div className="absolute inset-0 bg-gray-800 opacity-50"></div>}
        <div className="w-2/3 h-2 bg-white z-10"></div>
        <div className="w-1/2 h-1 bg-white/70 z-10"></div>
      </div>
      <div className="flex flex-1 p-2 gap-2">
        <div className="w-[60%] flex flex-col gap-2">
          <div className="w-1/2 h-1.5 bg-pink-600"></div>
          <div className="pl-1 border-l-2 border-pink-200 flex flex-col gap-1">
            <div className="w-full h-1 bg-gray-700"></div>
          </div>
        </div>
        <div className="w-[40%] flex flex-col gap-2">
          <div className="w-full h-1.5 bg-gray-800"></div>
          <div className="w-full h-1 bg-gray-400"></div>
        </div>
      </div>
    </div>
  );

  if (['corporate-blue', 'heavy-borders', 'prestige', 'structured-pro'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 mb-1 bg-gray-100 p-1 rounded-sm border border-gray-200">
        {previewId === 'structured-pro' && <div className="w-4 h-4 rounded-full bg-gray-400"></div>}
        <div className="flex-1">
          <div className="w-1/2 h-2 bg-blue-800 mb-0.5"></div>
          <div className="w-full h-0.5 bg-gray-400"></div>
        </div>
      </div>
      <div className="w-1/3 h-1.5 bg-blue-800 border-b border-blue-800 pb-0.5"></div>
      <div className="w-full flex justify-between mt-1">
        <div className="w-1/2 h-1 bg-gray-800"></div>
        <div className="w-1/4 h-1 bg-blue-600"></div>
      </div>
      <div className="w-full h-1 bg-gray-300 mb-2"></div>
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-full h-1 bg-gray-800"></div>
        </div>
      </div>
    </div>
  );

  if (['timeline', 'rounded-modern', 'classic-serif'].includes(previewId)) return (
    <div className="w-full h-full p-2 flex flex-col bg-gray-50">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="w-1/2 h-2 bg-gray-800"></div>
        {previewId !== 'timeline' && <div className="w-4 h-4 bg-gray-400 rounded-lg"></div>}
      </div>
      <div className="w-full h-4 bg-white border-l-2 border-blue-500 mb-2 shadow-sm rounded-sm"></div>
      <div className="flex gap-2 flex-1">
        <div className="w-[60%] border-l border-gray-300 pl-1 relative flex flex-col gap-2">
          <div className="w-1.5 h-1.5 bg-white border border-blue-500 rounded-full absolute -left-[3.5px] top-0"></div>
          <div className="w-full h-1 bg-gray-800 mt-0.5"></div>
          <div className="w-3/4 h-1 bg-blue-500"></div>
        </div>
        <div className="w-[40%] flex flex-col gap-1">
          <div className="w-full h-4 bg-white shadow-sm rounded-sm"></div>
        </div>
      </div>
    </div>
  );

  return <div className="w-full h-full bg-gray-100"></div>;
};
