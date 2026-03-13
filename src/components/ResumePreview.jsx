import React from 'react';
import { Mail, Phone, MapPin, Award, Globe, Briefcase, GraduationCap, User, Wrench } from 'lucide-react';

const ResumePreview = ({ resumeData, activeTemplate, isDark, isForPrint = false, fitToOnePage = false }) => {
  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const hasContent = (item) => {
    if (typeof item === 'string') return item && item.trim();
    if (Array.isArray(item)) return item.length > 0;
    if (typeof item === 'object') {
      return Object.values(item).some(val => 
        val && (typeof val === 'string' ? val.trim() : true)
      );
    }
    return !!item;
  };

  // Calculate content density for smart scaling
  const calculateContentDensity = () => {
    let totalContent = 0;
    
    // Count summary length
    if (resumeData.summary) totalContent += resumeData.summary.length / 100;
    
    // Count skills
    totalContent += safeArray(resumeData.skills).length * 0.5;
    
    // Count experiences (each is significant)
    totalContent += safeArray(resumeData.experiences).filter(exp => 
      hasContent(exp.description)
    ).length * 3;
    
    // Count educations
    totalContent += safeArray(resumeData.educations).filter(edu => 
      hasContent(edu.degree)
    ).length * 1.5;
    
    // Count projects
    totalContent += safeArray(resumeData.projects).filter(proj => 
      hasContent(proj.description)
    ).length * 2;
    
    // Count certifications
    totalContent += safeArray(resumeData.certifications).filter(cert => 
      hasContent(cert.title)
    ).length * 1;
    
    // Count custom sections
    totalContent += safeArray(resumeData.customSections).reduce((acc, section) => 
      acc + (safeArray(section.points).filter(p => p && p.trim()).length * 0.8), 0
    );
    
    return totalContent;
  };

  // Calculate scaling factors based on content density
  const getScalingFactors = () => {
    if (!fitToOnePage) {
      return { fontScale: 1, spacingScale: 1, lineHeightScale: 1 };
    }
    
    const contentDensity = calculateContentDensity();
    
    // Smart scaling logic:
    // - Very dense content (20+): aggressive scaling
    // - Moderate content (10-20): moderate scaling
    // - Light content (<10): minimal scaling
    
    let fontScale, spacingScale, lineHeightScale;
    
    if (contentDensity > 20) {
      // Very dense content - aggressive scaling
      fontScale = 0.82; // 82% of original font size
      spacingScale = 0.70; // 70% of original spacing
      lineHeightScale = 1.1; // Slightly tighter line height
    } else if (contentDensity > 15) {
      // Dense content - moderate scaling
      fontScale = 0.87; // 87% of original font size
      spacingScale = 0.75; // 75% of original spacing
      lineHeightScale = 1.15;
    } else if (contentDensity > 10) {
      // Moderate content - light scaling
      fontScale = 0.92; // 92% of original font size
      spacingScale = 0.80; // 80% of original spacing
      lineHeightScale = 1.2;
    } else {
      // Light content - minimal scaling
      fontScale = 0.95; // 95% of original font size
      spacingScale = 0.85; // 85% of original spacing
      lineHeightScale = 1.25;
    }
    
    return { fontScale, spacingScale, lineHeightScale };
  };

  const { fontScale, spacingScale, lineHeightScale } = getScalingFactors();

  // Helper function to apply scaling to styles
  const applyScaling = (baseStyles = {}) => {
    if (!fitToOnePage) return baseStyles;
    
    const scaledStyles = { ...baseStyles };
    
    // Scale font sizes
    if (scaledStyles.fontSize) {
      if (typeof scaledStyles.fontSize === 'string' && scaledStyles.fontSize.endsWith('px')) {
        const baseSize = parseFloat(scaledStyles.fontSize);
        scaledStyles.fontSize = `${baseSize * fontScale}px`;
      } else if (typeof scaledStyles.fontSize === 'string' && scaledStyles.fontSize.endsWith('rem')) {
        const baseSize = parseFloat(scaledStyles.fontSize);
        scaledStyles.fontSize = `${baseSize * fontScale}rem`;
      } else if (typeof scaledStyles.fontSize === 'string' && scaledStyles.fontSize.endsWith('em')) {
        const baseSize = parseFloat(scaledStyles.fontSize);
        scaledStyles.fontSize = `${baseSize * fontScale}em`;
      }
    }
    
    // Scale margins and paddings
    const spacingProps = ['margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
                         'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
                         'gap', 'rowGap', 'columnGap'];
    
    spacingProps.forEach(prop => {
      if (scaledStyles[prop]) {
        if (typeof scaledStyles[prop] === 'string') {
          if (scaledStyles[prop].endsWith('px')) {
            const baseValue = parseFloat(scaledStyles[prop]);
            scaledStyles[prop] = `${baseValue * spacingScale}px`;
          } else if (scaledStyles[prop].endsWith('rem')) {
            const baseValue = parseFloat(scaledStyles[prop]);
            scaledStyles[prop] = `${baseValue * spacingScale}rem`;
          } else if (scaledStyles[prop].endsWith('em')) {
            const baseValue = parseFloat(scaledStyles[prop]);
            scaledStyles[prop] = `${baseValue * spacingScale}em`;
          }
        }
      }
    });
    
    // Scale line height
    if (scaledStyles.lineHeight) {
      if (typeof scaledStyles.lineHeight === 'string') {
        if (scaledStyles.lineHeight.endsWith('px')) {
          const baseValue = parseFloat(scaledStyles.lineHeight);
          scaledStyles.lineHeight = `${baseValue * lineHeightScale}px`;
        } else if (!isNaN(parseFloat(scaledStyles.lineHeight))) {
          const baseValue = parseFloat(scaledStyles.lineHeight);
          scaledStyles.lineHeight = baseValue * lineHeightScale;
        }
      }
    }
    
    return scaledStyles;
  };

  // Apply scaling to Tailwind classes
  const getScaledClasses = (baseClasses = '') => {
    if (!fitToOnePage) return baseClasses;
    
    // Scale spacing classes (p-, m-, gap-, space-)
    let scaledClasses = baseClasses;
    
    // Replace padding classes
    scaledClasses = scaledClasses.replace(/\bp-(\d+)\b/g, (match, p1) => {
      const original = parseInt(p1);
      const scaled = Math.max(1, Math.round(original * spacingScale));
      return `p-${scaled}`;
    });
    
    // Replace margin classes
    scaledClasses = scaledClasses.replace(/\bm-(\d+)\b/g, (match, m1) => {
      const original = parseInt(m1);
      const scaled = Math.max(1, Math.round(original * spacingScale));
      return `m-${scaled}`;
    });
    
    // Replace gap classes
    scaledClasses = scaledClasses.replace(/\bgap-(\d+)\b/g, (match, g1) => {
      const original = parseInt(g1);
      const scaled = Math.max(1, Math.round(original * spacingScale));
      return `gap-${scaled}`;
    });
    
    // Replace space-y classes
    scaledClasses = scaledClasses.replace(/\bspace-y-(\d+)\b/g, (match, s1) => {
      const original = parseInt(s1);
      const scaled = Math.max(1, Math.round(original * spacingScale));
      return `space-y-${scaled}`;
    });
    
    // Add compressed line-height for paragraphs
    if (scaledClasses.includes('leading-')) {
      scaledClasses = scaledClasses.replace(/\bleading-(\w+)\b/g, (match, l1) => {
        // Use tighter line heights for fit-to-page
        return `leading-tight`;
      });
    }
    
    // Add font scaling class
    if (fontScale < 1) {
      scaledClasses += ` scale-font-${Math.round(fontScale * 100)}`;
    }
    
    return scaledClasses;
  };

  const renderCustomSections = (styleConfig = {}) => {
    const { containerClass = "mb-6", titleClass = "text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2", listClass = "list-disc list-inside space-y-1 pl-4" } = styleConfig;
    return safeArray(resumeData.customSections).map((section, index) => {
      const hasPoints = safeArray(section.points).some(p => p && p.trim());
      if (!section.title && !hasPoints) return null;
      return (
        <div key={index} className={getScaledClasses(containerClass)}>
          <h3 className={getScaledClasses(titleClass)}>{section.title || 'Custom Section'}</h3>
          <ul className={getScaledClasses(listClass)}>
            {safeArray(section.points).map((point, pointIndex) => 
              point && point.trim() && <li key={pointIndex}>{point}</li>
            )}
          </ul>
        </div>
      );
    });
  };

  const templateProps = isForPrint ? {
    className: `a4-resume ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${fitToOnePage ? 'fit-to-page' : ''}`,
    style: { 
      width: '210mm', 
      minHeight: '297mm',
      margin: '0 auto',
      background: 'white',
      ...(fitToOnePage ? {
        fontSize: `${fontScale * 100}%`,
        lineHeight: lineHeightScale
      } : {})
    }
  } : {
    className: `preview-resume ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${fitToOnePage ? 'fit-to-page' : ''}`,
    style: { 
      width: '210mm', 
      minHeight: '297mm',
      background: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      ...(fitToOnePage ? {
        fontSize: `${fontScale * 100}%`,
        lineHeight: lineHeightScale
      } : {})
    }
  };

  // Helper component for scaled sections
  const ScaledSection = ({ children, className = '', style = {} }) => (
    <div 
      className={getScaledClasses(className)} 
      style={applyScaling(style)}
    >
      {children}
    </div>
  );

  switch (activeTemplate) {
    case 'simple':
  return (
    <div {...templateProps}>
      <div className={`p-12 font-sans ${fitToOnePage ? 'compressed-mode' : ''}`} style={fitToOnePage ? { 
        padding: `${10 * spacingScale}px`,
        fontSize: `${fontScale * 100}%`,
        lineHeight: lineHeightScale
      } : {}}>
        
        {/* Header - reduced bottom padding */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
          <h1 className={`${fitToOnePage ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>{resumeData.fullName || 'Your Name'}</h1>
          <p className={`${fitToOnePage ? 'text-lg' : 'text-xl'} ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{resumeData.jobTitle || 'Your Job Title'}</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
            {resumeData.email && <div className="flex items-center gap-1"><Mail size={12}/> {resumeData.email}</div>}
            {resumeData.phone && <div className="flex items-center gap-1"><Phone size={12}/> {resumeData.phone}</div>}
            {resumeData.location && <div className="flex items-center gap-1"><MapPin size={12}/> {resumeData.location}</div>}
          </div>
        </div>
        
        {/* Professional Summary - reduced spacing */}
        {resumeData.summary && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">PROFESSIONAL SUMMARY</h3>
            <p className="text-gray-700 text-sm leading-snug text-justify">{resumeData.summary}</p>
          </div>
        )}
        
        {/* Skills - reduced spacing */}
        {safeArray(resumeData.skills).length > 0 && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">SKILLS</h3>
            <div className="flex flex-wrap gap-1">
              {safeArray(resumeData.skills).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm border">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Work Experience - reduced spacing */}
        {safeArray(resumeData.experiences).some(exp => hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">WORK EXPERIENCE</h3>
            <div className="space-y-2">
              {safeArray(resumeData.experiences).map((exp, index) => (
                (hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="font-semibold text-gray-900">{exp.jobTitle || 'Position'}</div>
                        <div className="text-gray-600 font-medium">{exp.company || 'Company'}</div>
                      </div>
                      <div className="text-gray-500 text-sm whitespace-nowrap">{exp.duration || 'Duration'}</div>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{exp.description || 'Description of responsibilities and achievements.'}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* EDUCATION - SINGLE LINE FORMAT with reduced spacing */}
        {safeArray(resumeData.educations).some(edu => hasContent(edu.degree) || hasContent(edu.university)) && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">EDUCATION</h3>
            <div className="space-y-1">
              {safeArray(resumeData.educations).map((edu, index) => (
                (hasContent(edu.degree) || hasContent(edu.university)) && (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{edu.degree || 'Degree'}</div>
                      <div className="text-gray-600 text-xs">
                        {edu.university || 'Institution'}
                        {(edu.percentage || edu.cgpa) && (
                          <span className="text-gray-500">
                            {edu.percentage && ` • ${edu.percentage}%`}
                            {edu.cgpa && !edu.percentage && ` • CGPA: ${edu.cgpa}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs whitespace-nowrap ml-2">{edu.year || 'Year'}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Projects - reduced spacing */}
        {safeArray(resumeData.projects).some(proj => hasContent(proj.title) || hasContent(proj.description)) && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">PROJECTS</h3>
            <div className="space-y-2">
              {safeArray(resumeData.projects).map((proj, index) => (
                (hasContent(proj.title) || hasContent(proj.description)) && (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="font-semibold text-gray-900">{proj.title || 'Project Title'}</div>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{proj.description || 'Project description and contributions.'}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Certifications - reduced spacing */}
        {safeArray(resumeData.certifications).some(cert => hasContent(cert.title)) && (
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-2">CERTIFICATIONS</h3>
            <div className="space-y-1">
              {safeArray(resumeData.certifications).map((cert, index) => (
                hasContent(cert.title) && (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{cert.title}</div>
                      <div className="text-gray-600 text-xs">
                        {cert.authority && `${cert.authority}`}
                        {cert.authority && cert.year && ', '}
                        {cert.year && `${cert.year}`}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Custom Sections - reduced spacing */}
        {renderCustomSections({
          containerClass: "mb-3",
          titleClass: "text-lg font-semibold text-gray-900 border-b-2 border-blue-500 pb-1 mb-2",
          listClass: "list-disc list-inside space-y-0.5 pl-4 text-sm"
        })}
      </div>
    </div>
  );

    case 'professional':
      return (
        <div {...templateProps}>
          <div className={`p-12 font-sans ${fitToOnePage ? 'scale-content' : ''}`} style={fitToOnePage ? { transform: `scale(${fontScale})`, transformOrigin: 'top center' } : {}}>
            <div className="grid grid-cols-4 gap-8">
              {/* Left Column - Sidebar */}
              <div className="col-span-1 space-y-8">
                {/* Profile Image */}
                {resumeData.profileImage && (
                  <div className="flex justify-center">
                    <img src={resumeData.profileImage} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-blue-500" 
                      style={fitToOnePage ? { width: `${28 * spacingScale}px`, height: `${28 * spacingScale}px` } : {}} />
                  </div>
                )}
                
                {/* Contact */}
                <ScaledSection>
                  <h3 className="font-semibold text-lg text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">CONTACT</h3>
                  <div className="space-y-3 text-sm">
                    {resumeData.email && (
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-600 break-words">{resumeData.email}</div>
                      </div>
                    )}
                    {resumeData.phone && (
                      <div>
                        <div className="font-medium text-gray-900">Phone</div>
                        <div className="text-gray-600">{resumeData.phone}</div>
                      </div>
                    )}
                    {resumeData.location && (
                      <div>
                        <div className="font-medium text-gray-900">Location</div>
                        <div className="text-gray-600">{resumeData.location}</div>
                      </div>
                    )}
                  </div>
                </ScaledSection>
                
                {/* Skills */}
                {safeArray(resumeData.skills).length > 0 && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">SKILLS</h3>
                    <div className="space-y-2">
                      {safeArray(resumeData.skills).map((skill, index) => (
                        <div key={index} className="text-sm text-gray-700">{skill}</div>
                      ))}
                    </div>
                  </ScaledSection>
                )}
                
                {/* Certifications */}
                {safeArray(resumeData.certifications).some(cert => hasContent(cert.title)) && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">CERTIFICATIONS</h3>
                    <div className="space-y-3 text-sm">
                      {safeArray(resumeData.certifications).map((cert, index) => (
                        hasContent(cert.title) && (
                          <div key={index}>
                            <div className="font-medium text-gray-900">{cert.title}</div>
                            <div className="text-gray-600">
                              {cert.authority && `${cert.authority}`}
                              {cert.authority && cert.year && ', '}
                              {cert.year && `${cert.year}`}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </ScaledSection>
                )}
              </div>
              
              {/* Right Column - Main Content */}
              <div className="col-span-3 space-y-8">
                {/* Header */}
                <ScaledSection className="border-b-2 border-blue-500 pb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{resumeData.fullName || 'Your Name'}</h1>
                  <p className="text-2xl text-gray-600 mt-2">{resumeData.jobTitle || 'Your Job Title'}</p>
                </ScaledSection>
                
                {/* Professional Summary */}
                {resumeData.summary && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-300 pb-1 mb-3">PROFESSIONAL SUMMARY</h3>
                    <p className="text-gray-700 leading-relaxed text-justify" style={{ lineHeight: lineHeightScale }}>{resumeData.summary}</p>
                  </ScaledSection>
                )}
                
                {/* Work Experience */}
                {safeArray(resumeData.experiences).some(exp => hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-300 pb-1 mb-3">WORK EXPERIENCE</h3>
                    <div className="space-y-6">
                      {safeArray(resumeData.experiences).map((exp, index) => (
                        (hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg text-gray-900">{exp.jobTitle || 'Position'}</div>
                                <div className="text-gray-600 font-medium">{exp.company || 'Company'}</div>
                              </div>
                              <div className="text-gray-500 text-sm whitespace-nowrap">{exp.duration || 'Duration'}</div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ lineHeight: lineHeightScale }}>{exp.description || 'Description of responsibilities and achievements.'}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </ScaledSection>
                )}
                
                {/* Education */}
                {safeArray(resumeData.educations).some(edu => hasContent(edu.degree) || hasContent(edu.university)) && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-300 pb-1 mb-3">EDUCATION</h3>
                    <div className="space-y-4">
                      {safeArray(resumeData.educations).map((edu, index) => (
                        (hasContent(edu.degree) || hasContent(edu.university)) && (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-gray-900">{edu.degree || 'Degree'}</div>
                                <div className="text-gray-600">{edu.university || 'Institution'}</div>
                              </div>
                              <div className="text-gray-500 text-sm">{edu.year || 'Year'}</div>
                            </div>
                            {(edu.percentage || edu.cgpa) && (
                              <p className="text-gray-600 text-sm">
                                {edu.percentage && `Percentage: ${edu.percentage}%`}
                                {edu.percentage && edu.cgpa && ' | '}
                                {edu.cgpa && `CGPA: ${edu.cgpa}`}
                              </p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </ScaledSection>
                )}

                {/* Projects */}
                {safeArray(resumeData.projects).some(proj => hasContent(proj.title) || hasContent(proj.description)) && (
                  <ScaledSection>
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-gray-300 pb-1 mb-3">PROJECTS</h3>
                    <div className="space-y-4">
                      {safeArray(resumeData.projects).map((proj, index) => (
                        (hasContent(proj.title) || hasContent(proj.description)) && (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-gray-900">{proj.title || 'Project Title'}</div>
                                {proj.link && (
                                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                                    View Project
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ lineHeight: lineHeightScale }}>{proj.description || 'Project description and contributions.'}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </ScaledSection>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    // In the ResumePreview.jsx file, find the Classic template section
// Replace the ENTIRE Classic template case with this optimized version:

case 'classic':
  return (
    <div {...templateProps}>
      <div className={`p-12 font-serif ${fitToOnePage ? 'compressed-mode' : ''}`} style={fitToOnePage ? { 
        padding: `${10 * spacingScale}px`,
        fontSize: `${fontScale * 100}%`,
        lineHeight: lineHeightScale
      } : {}}>
        {/* Header - reduced spacing */}
        <div className="text-center mb-4">
          <h1 className={`${fitToOnePage ? 'text-3xl' : 'text-4xl'} font-bold text-gray-900 uppercase tracking-wider`}>{resumeData.fullName || 'Your Name'}</h1>
          <div className="h-1 w-20 bg-gray-400 mx-auto my-3"></div>
          <p className={`${fitToOnePage ? 'text-lg' : 'text-xl'} text-gray-600`}>{resumeData.jobTitle || 'Your Job Title'}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-500">
            {resumeData.email && <div>{resumeData.email}</div>}
            {resumeData.phone && <div>{resumeData.phone}</div>}
            {resumeData.location && <div>{resumeData.location}</div>}
          </div>
        </div>
        
        {/* Professional Summary - reduced spacing */}
        {resumeData.summary && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">Professional Summary</h3>
            <p className="text-gray-700 leading-snug text-justify text-sm">{resumeData.summary}</p>
          </div>
        )}
        
        {/* Work Experience - reduced spacing */}
        {safeArray(resumeData.experiences).some(exp => hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">Professional Experience</h3>
            <div className="space-y-3">
              {safeArray(resumeData.experiences).map((exp, index) => (
                (hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-900">{exp.jobTitle || 'Position'}</div>
                      <div className="text-gray-500 text-sm italic">{exp.duration || 'Duration'}</div>
                    </div>
                    <div className="font-medium text-gray-600 text-sm">{exp.company || 'Company'}</div>
                    <p className="text-gray-700 text-sm leading-snug">{exp.description || 'Description of responsibilities and achievements.'}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Skills - reduced spacing */}
        {safeArray(resumeData.skills).length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">Technical Skills</h3>
            <div className="grid grid-cols-2 gap-2">
              {safeArray(resumeData.skills).map((skill, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-gray-700 text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* EDUCATION - SINGLE LINE FORMAT with reduced spacing */}
        {safeArray(resumeData.educations).some(edu => hasContent(edu.degree) || hasContent(edu.university)) && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">Education</h3>
            <div className="space-y-2">
              {safeArray(resumeData.educations).map((edu, index) => (
                (hasContent(edu.degree) || hasContent(edu.university)) && (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{edu.degree || 'Degree'}</div>
                      <div className="text-gray-600 text-xs">
                        {edu.university || 'Institution'}
                        {(edu.percentage || edu.cgpa) && (
                          <span className="text-gray-500">
                            {edu.percentage && ` • ${edu.percentage}%`}
                            {edu.cgpa && !edu.percentage && ` • CGPA: ${edu.cgpa}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs italic ml-2">{edu.year || 'Year'}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Projects - reduced spacing */}
        {safeArray(resumeData.projects).some(proj => hasContent(proj.title) || hasContent(proj.description)) && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">PROJECTS</h3>
            <div className="space-y-3">
              {safeArray(resumeData.projects).map((proj, index) => (
                (hasContent(proj.title) || hasContent(proj.description)) && (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{proj.title || 'Project Title'}</div>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{proj.description || 'Project description and contributions.'}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Certifications - reduced spacing */}
        {safeArray(resumeData.certifications).some(cert => hasContent(cert.title)) && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2">CERTIFICATIONS</h3>
            <div className="space-y-2">
              {safeArray(resumeData.certifications).map((cert, index) => (
                hasContent(cert.title) && (
                  <div key={index} className="space-y-0.5">
                    <div className="font-semibold text-gray-900 text-sm">{cert.title}</div>
                    <div className="text-gray-600 text-xs">
                      {cert.authority && `${cert.authority}`}
                      {cert.authority && cert.year && ', '}
                      {cert.year && `${cert.year}`}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
        
        {/* Custom Sections - reduced spacing */}
        {renderCustomSections({
          containerClass: "mb-4",
          titleClass: "text-lg font-semibold text-gray-900 uppercase tracking-wide border-b-2 border-gray-400 pb-1 mb-2",
          listClass: "list-disc list-inside space-y-0.5 pl-4 text-sm"
        })}
      </div>
    </div>
  );

    case 'creative':
      return (
        <div {...templateProps}>
          <div className={`flex font-sans ${fitToOnePage ? 'scale-content' : ''}`} style={{ 
            minHeight: '297mm', 
            width: '210mm',
            ...(fitToOnePage ? { transform: `scale(${fontScale})`, transformOrigin: 'top center' } : {})
          }}>
            {/* Left Sidebar */}
            <div className={`w-2/5 p-8 ${isDark ? 'bg-blue-900 text-white' : 'bg-blue-600 text-white'}`}>
              {/* Profile Image */}
              <div className="flex justify-center mb-8">
                {resumeData.profileImage ? (
                  <img src={resumeData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white" 
                    style={fitToOnePage ? { width: `${32 * spacingScale}px`, height: `${32 * spacingScale}px` } : {}} />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white bg-blue-500"
                    style={fitToOnePage ? { width: `${32 * spacingScale}px`, height: `${32 * spacingScale}px` } : {}}>
                    <User size={Math.round(48 * fontScale)} className="text-white"/>
                  </div>
                )}
              </div>
              
              {/* Contact */}
              <ScaledSection className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User size={Math.round(18 * fontScale)} />
                  Contact
                </h2>
                <div className="space-y-3 text-sm">
                  {resumeData.email && <div className="flex items-center gap-2"><Mail size={Math.round(14 * fontScale)}/> {resumeData.email}</div>}
                  {resumeData.phone && <div className="flex items-center gap-2"><Phone size={Math.round(14 * fontScale)}/> {resumeData.phone}</div>}
                  {resumeData.location && <div className="flex items-center gap-2"><MapPin size={Math.round(14 * fontScale)}/> {resumeData.location}</div>}
                </div>
              </ScaledSection>

              {/* Skills */}
              {safeArray(resumeData.skills).length > 0 && (
                <ScaledSection className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Wrench size={Math.round(18 * fontScale)} />
                    Skills
                  </h2>
                  <div className="space-y-2">
                    {safeArray(resumeData.skills).map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-3" 
                          style={fitToOnePage ? { width: `${2 * spacingScale}px`, height: `${2 * spacingScale}px`, marginRight: `${3 * spacingScale}px` } : {}}></div>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </ScaledSection>
              )}

              {/* Certifications */}
              {safeArray(resumeData.certifications).some(cert => hasContent(cert.title)) && (
                <ScaledSection className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award size={Math.round(18 * fontScale)} />
                    Certifications
                  </h2>
                  <div className="space-y-3 text-sm">
                    {safeArray(resumeData.certifications).map((cert, index) => (
                      hasContent(cert.title) && (
                        <div key={index}>
                          <div className="font-semibold">{cert.title}</div>
                          <div>
                            {cert.authority && `${cert.authority}`}
                            {cert.authority && cert.year && ', '}
                            {cert.year && `${cert.year}`}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </ScaledSection>
              )}

              {/* Custom Sections */}
              {renderCustomSections({
                containerClass: "mb-8",
                titleClass: "text-xl font-bold mb-4",
                listClass: "space-y-2 text-sm"
              })}
            </div>

            {/* Main Content */}
            <div className={`w-3/5 p-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
              {/* Header */}
              <ScaledSection className="mb-8">
                <h1 className="text-4xl font-bold text-blue-600">{resumeData.fullName || 'Your Name'}</h1>
                <p className="text-2xl mt-2 text-gray-600">{resumeData.jobTitle || 'Your Job Title'}</p>
              </ScaledSection>

              {/* Professional Summary */}
              {resumeData.summary && (
                <ScaledSection className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Professional Summary</h3>
                  <p className="leading-relaxed text-justify" style={{ lineHeight: lineHeightScale }}>{resumeData.summary}</p>
                </ScaledSection>
              )}

              {/* Work Experience */}
              {safeArray(resumeData.experiences).some(exp => hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                <ScaledSection className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
                    <Briefcase size={Math.round(18 * fontScale)} />
                    Work Experience
                  </h3>
                  <div className="space-y-6">
                    {safeArray(resumeData.experiences).map((exp, index) => (
                      (hasContent(exp.jobTitle) || hasContent(exp.company) || hasContent(exp.description)) && (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg text-gray-900">{exp.jobTitle || 'Position'}</div>
                              <div className="text-blue-500 font-medium">{exp.company || 'Company'}</div>
                            </div>
                            <div className="text-gray-500 text-sm">{exp.duration || 'Duration'}</div>
                          </div>
                          <p className="leading-relaxed text-gray-700" style={{ lineHeight: lineHeightScale }}>{exp.description || 'Description of responsibilities and achievements.'}</p>
                        </div>
                      )
                    ))}
                  </div>
                </ScaledSection>
              )}

              {/* Education */}
              {safeArray(resumeData.educations).some(edu => hasContent(edu.degree) || hasContent(edu.university)) && (
                <ScaledSection className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-blue-500 pb-2 mb-4 flex items-center gap-2">
                    <GraduationCap size={Math.round(18 * fontScale)} />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {safeArray(resumeData.educations).map((edu, index) => (
                      (hasContent(edu.degree) || hasContent(edu.university)) && (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-900">{edu.degree || 'Degree'}</div>
                              <div className="text-gray-600">{edu.university || 'Institution'}</div>
                            </div>
                            <div className="text-gray-500">{edu.year || 'Year'}</div>
                          </div>
                          {(edu.percentage || edu.cgpa) && (
                            <p className="text-gray-600 text-sm">
                              {edu.percentage && `Percentage: ${edu.percentage}%`}
                              {edu.percentage && edu.cgpa && ' | '}
                              {edu.cgpa && `CGPA: ${edu.cgpa}`}
                            </p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </ScaledSection>
              )}

              {/* Projects */}
              {safeArray(resumeData.projects).some(proj => hasContent(proj.title) || hasContent(proj.description)) && (
                <ScaledSection className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-blue-500 pb-2 mb-4">Projects</h3>
                  <div className="space-y-4">
                    {safeArray(resumeData.projects).map((proj, index) => (
                      (hasContent(proj.title) || hasContent(proj.description)) && (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="font-semibold text-gray-900">{proj.title || 'Project Title'}</div>
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">
                                <Globe size={Math.round(14 * fontScale)} />
                                View Project
                              </a>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm" style={{ lineHeight: lineHeightScale }}>{proj.description || 'Project description and contributions.'}</p>
                        </div>
                      )
                    ))}
                  </div>
                </ScaledSection>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div {...templateProps}>
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{resumeData.fullName || 'Your Name'}</h1>
            <p className="text-xl text-gray-600 mb-8">{resumeData.jobTitle || 'Your Job Title'}</p>
            <p className="text-gray-500">Select a template to see a professional resume preview.</p>
          </div>
        </div>
      );
  }
};

export default ResumePreview;