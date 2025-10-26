import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Plus, X, Briefcase, GraduationCap, User, Wrench, FileText, Download, Sparkles, Image as ImageIcon, ArrowRight, ArrowLeft, Settings, Target, Mail, Phone, MapPin, Award, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ATSAnalysis from './ATSAnalysis';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ResumeBuilder({ isDark, activeTemplate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // ATS-specific states
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper function to safely initialize resume data
  const getInitialResumeData = () => {
    return {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experiences: [{ jobTitle: '', company: '', duration: '', description: '' }],
      educations: [{ degree: '', university: '', year: '', percentage: '', cgpa: '' }],
      projects: [{ title: '', description: '', link: '' }],
      certifications: [{ title: '', authority: '', year: '' }],
      customSections: [],
      profileImage: null,
    };
  };

  const [resumeData, setResumeData] = useState(() => {
    try {
      const savedData = localStorage.getItem('resumeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return {
          ...getInitialResumeData(),
          ...parsedData,
          skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
          experiences: Array.isArray(parsedData.experiences) ? parsedData.experiences : [{ jobTitle: '', company: '', duration: '', description: '' }],
          educations: Array.isArray(parsedData.educations) ? parsedData.educations : [{ degree: '', university: '', year: '', percentage: '', cgpa: '' }],
          projects: Array.isArray(parsedData.projects) ? parsedData.projects : [{ title: '', description: '', link: '' }],
          certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [{ title: '', authority: '', year: '' }],
          customSections: Array.isArray(parsedData.customSections) ? parsedData.customSections : [],
        };
      }
      return getInitialResumeData();
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      return getInitialResumeData();
    }
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [showCustomSectionModal, setShowCustomSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [currentSectionPoints, setCurrentSectionPoints] = useState(['']);
  const resumePreviewRef = useRef();

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const handleInputChange = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (e, section, index, field) => {
    const { value } = e.target;
    setResumeData(prev => {
      const newSection = [...safeArray(prev[section])];
      if (newSection[index]) {
        newSection[index] = { ...newSection[index], [field]: value };
      }
      return { ...prev, [section]: newSection };
    });
  };

  const handleCustomSectionPointChange = (e, sectionIndex, pointIndex) => {
    const { value } = e.target;
    setResumeData(prev => {
      const newSections = [...safeArray(prev.customSections)];
      if (newSections[sectionIndex]?.points) {
        const newPoints = [...newSections[sectionIndex].points];
        newPoints[pointIndex] = value;
        newSections[sectionIndex] = { ...newSections[sectionIndex], points: newPoints };
      }
      return { ...prev, customSections: newSections };
    });
  };

  const handleAddEntry = (section, initialObject) => {
    setResumeData(prev => ({ ...prev, [section]: [...safeArray(prev[section]), initialObject] }));
  };

  const handleAddCustomSectionPoint = (sectionIndex) => {
    setResumeData(prev => {
      const newSections = [...safeArray(prev.customSections)];
      if (newSections[sectionIndex] && Array.isArray(newSections[sectionIndex].points)) {
        newSections[sectionIndex] = { ...newSections[sectionIndex], points: [...newSections[sectionIndex].points, ''] };
      }
      return { ...prev, customSections: newSections };
    });
  };

  const handleRemoveEntry = (section, index) => {
    setResumeData(prev => ({ ...prev, [section]: safeArray(prev[section]).filter((_, i) => i !== index) }));
  };

  const handleRemoveCustomSection = (sectionIndex) => {
    setResumeData(prev => ({ ...prev, customSections: safeArray(prev.customSections).filter((_, i) => i !== sectionIndex) }));
  };

  const handleRemoveCustomSectionPoint = (sectionIndex, pointIndex) => {
    setResumeData(prev => {
      const newSections = [...safeArray(prev.customSections)];
      if (newSections[sectionIndex]?.points) {
        const newPoints = newSections[sectionIndex].points.filter((_, i) => i !== pointIndex);
        newSections[sectionIndex] = { ...newSections[sectionIndex], points: newPoints };
      }
      return { ...prev, customSections: newSections };
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() && !safeArray(resumeData.skills).includes(currentSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...safeArray(prev.skills), currentSkill.trim()] }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setResumeData(prev => ({ ...prev, skills: safeArray(prev.skills).filter(skill => skill !== skillToRemove) }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const startNewCustomSection = () => {
    setNewSectionTitle('');
    setCurrentSectionPoints(['']);
    setShowCustomSectionModal(true);
  };

  const addNewPoint = () => setCurrentSectionPoints(prev => [...prev, '']);

  const removePoint = (index) => {
    if (currentSectionPoints.length > 1) {
      setCurrentSectionPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePoint = (index, newPoint) => {
    setCurrentSectionPoints(prev => {
      const newPoints = [...prev];
      newPoints[index] = newPoint;
      return newPoints;
    });
  };

  const saveCustomSection = () => {
    if (newSectionTitle.trim()) {
      const newSection = {
        title: newSectionTitle.trim(),
        points: currentSectionPoints.filter(p => p.trim() !== '')
      };
      setResumeData(prev => ({ ...prev, customSections: [...safeArray(prev.customSections), newSection] }));
      setShowCustomSectionModal(false);
      setNewSectionTitle('');
      setCurrentSectionPoints(['']);
    }
  };

  const handleAISummary = async () => {
    setIsLoading(true);
    setAtsResult(null);
    try {
      const response = await fetch("http://localhost:5000/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resumeData.fullName,
          title: resumeData.jobTitle,
          skills: safeArray(resumeData.skills),
          experience: resumeData.experiences.map(e => e.description).join(' '),
          jobDescription: jobDescription,
        }),
      });
      const data = await response.json();
      setResumeData(prev => ({ ...prev, summary: data.summary }));
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary. Check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleATSScore = async () => {
    if (!resumeData.summary || !jobDescription) {
      alert("Please provide a summary and job description first.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: resumeData.summary, jobDescription: jobDescription }),
      });
      const data = await response.json();
      setAtsResult(data);
    } catch (error) {
      console.error("Error calculating ATS score:", error);
      alert("Failed to calculate ATS score. Check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISkills = async () => {
    if (!resumeData.jobTitle) {
      alert("Please enter a job title first");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: resumeData.jobTitle }),
      });
      const data = await response.json();
      setResumeData(prev => ({ ...prev, skills: [...new Set([...safeArray(prev.skills), ...data.skills])] }));
    } catch (error) {
      console.error("Error suggesting skills:", error);
      alert("Failed to suggest skills. Check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumePreviewRef.current) return;

    setIsDownloading(true);
    try {
      const element = resumePreviewRef.current;
      
      // Store original styles
      const originalBackground = element.style.background;
      const originalColor = element.style.color;
      
      // Force white background for PDF export
      element.style.background = 'white';
      element.style.color = 'black';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Restore original styles
      element.style.background = originalBackground;
      element.style.color = originalColor;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `${resumeData.fullName || 'resume'}_${activeTemplate}.pdf`.replace(/\s+/g, '_');
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setResumeData(prev => ({ ...prev, profileImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const themeClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClasses = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

  const steps = ['Personal Info', 'Summary & ATS', 'Skills', 'Work Experience', 'Education', 'Projects', 'Certifications', 'Custom Sections', 'Profile Picture'];
  const nextStep = () => { setDirection(1); setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)); };
  const prevStep = () => { setDirection(-1); setCurrentStep(prev => Math.max(prev - 1, 0)); };
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" value={resumeData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="text" placeholder="Job Title" value={resumeData.jobTitle} onChange={e => handleInputChange('jobTitle', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="email" placeholder="Email" value={resumeData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="tel" placeholder="Phone" value={resumeData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="text" placeholder="Location" value={resumeData.location} onChange={e => handleInputChange('location', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 pb-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1">
                <Target size={14} /> 
                Target Job Description
              </label>
              <textarea 
                placeholder="Paste the job description here for AI-optimized summary generation and ATS score analysis..." 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                rows={5} 
                className={`w-full px-4 py-3 border rounded-lg resize-none ${inputClasses}`} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Professional Summary</label>
              <textarea 
                placeholder="Your AI-generated summary will appear here, or write your own..." 
                value={resumeData.summary} 
                onChange={e => handleInputChange('summary', e.target.value)} 
                rows={5} 
                className={`w-full px-4 py-3 border rounded-lg resize-none ${inputClasses}`} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleAISummary} 
                disabled={isLoading || !jobDescription} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && !atsResult ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <Sparkles size={16} />}
                Generate Summary
              </button>
              <button 
                onClick={handleATSScore} 
                disabled={isLoading || !jobDescription || !resumeData.summary} 
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && atsResult ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <FileText size={16} />}
                Analyze ATS Score
              </button>
            </div>

            {/* ATS Analysis Component */}
            <ATSAnalysis 
              atsResult={atsResult} 
              isLoading={isLoading && !atsResult} 
              isDark={isDark} 
            />
          </div>
        );
      case 2:
        return (
          <div>
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Add skill and press Enter" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} onKeyPress={handleKeyPress} className={`flex-1 px-4 py-3 border rounded-lg ${inputClasses}`} />
              <button onClick={addSkill} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16} /></button>
            </div>
            <button onClick={handleAISkills} disabled={isLoading} className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <Sparkles size={16} />}
              Suggest Skills with AI
            </button>
            <div className="flex flex-wrap gap-2">
              {safeArray(resumeData.skills).map((skill, i) => (
                <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            {safeArray(resumeData.experiences).map((exp, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Job Title" value={exp.jobTitle || ''} onChange={e => handleNestedChange(e, 'experiences', index, 'jobTitle')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Company" value={exp.company || ''} onChange={e => handleNestedChange(e, 'experiences', index, 'company')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Duration" value={exp.duration || ''} onChange={e => handleNestedChange(e, 'experiences', index, 'duration')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <textarea placeholder="Description" rows={3} value={exp.description || ''} onChange={e => handleNestedChange(e, 'experiences', index, 'description')} className={`w-full px-3 py-2 rounded-lg resize-none ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('experiences', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('experiences', { jobTitle: '', company: '', duration: '', description: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Experience</button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            {safeArray(resumeData.educations).map((edu, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Degree / Certification" value={edu.degree || ''} onChange={e => handleNestedChange(e, 'educations', index, 'degree')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="University / College" value={edu.university || ''} onChange={e => handleNestedChange(e, 'educations', index, 'university')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Year" value={edu.year || ''} onChange={e => handleNestedChange(e, 'educations', index, 'year')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" placeholder="Percentage (%)" value={edu.percentage || ''} onChange={e => handleNestedChange(e, 'educations', index, 'percentage')} className={`px-3 py-2 rounded-lg ${inputClasses}`} />
                  <input type="text" placeholder="CGPA / GPA" value={edu.cgpa || ''} onChange={e => handleNestedChange(e, 'educations', index, 'cgpa')} className={`px-3 py-2 rounded-lg ${inputClasses}`} />
                </div>
                <button onClick={() => handleRemoveEntry('educations', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('educations', { degree: '', university: '', year: '', percentage: '', cgpa: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Education</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            {safeArray(resumeData.projects).map((proj, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Title" value={proj.title || ''} onChange={e => handleNestedChange(e, 'projects', index, 'title')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Link" value={proj.link || ''} onChange={e => handleNestedChange(e, 'projects', index, 'link')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <textarea placeholder="Description" rows={3} value={proj.description || ''} onChange={e => handleNestedChange(e, 'projects', index, 'description')} className={`w-full px-3 py-2 rounded-lg resize-none ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('projects', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('projects', { title: '', link: '', description: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Project</button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-3">
            {safeArray(resumeData.certifications).map((cert, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Title" value={cert.title || ''} onChange={e => handleNestedChange(e, 'certifications', index, 'title')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Authority" value={cert.authority || ''} onChange={e => handleNestedChange(e, 'certifications', index, 'authority')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Year" value={cert.year || ''} onChange={e => handleNestedChange(e, 'certifications', index, 'year')} className={`w-full px-3 py-2 rounded-lg ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('certifications', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('certifications', { title: '', authority: '', year: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Certification</button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Custom Sections</h3>
              <button onClick={startNewCustomSection} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus size={16} /> Add Section
              </button>
            </div>
            {safeArray(resumeData.customSections).length === 0 ? (
              <div className={`text-center p-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <Settings size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Add custom sections like 'Awards' or 'Languages'.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeArray(resumeData.customSections).map((section, sectionIndex) => (
                  <div key={sectionIndex} className={`border rounded-lg p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">{section.title}</h4>
                      <button onClick={() => handleRemoveCustomSection(sectionIndex)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                    </div>
                    <div className="space-y-3">
                      {safeArray(section.points).map((point, pointIndex) => (
                        <div key={pointIndex} className="flex gap-2 items-center">
                          <input type="text" value={point} onChange={(e) => handleCustomSectionPointChange(e, sectionIndex, pointIndex)} className={`flex-1 px-3 py-2 border rounded-lg ${inputClasses}`} placeholder="Enter bullet point" />
                          <button onClick={() => handleRemoveCustomSectionPoint(sectionIndex, pointIndex)} className="text-red-500 hover:text-red-700 p-2" disabled={safeArray(section.points).length <= 1}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleAddCustomSectionPoint(sectionIndex)} className="mt-3 text-blue-600 flex items-center gap-2"><Plus size={16} /> Add Point</button>
                  </div>
                ))}
              </div>
            )}
            {showCustomSectionModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`rounded-lg p-6 w-full max-w-md ${cardClasses}`}>
                  <h3 className="text-lg font-semibold mb-4">Create Custom Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section Title</label>
                      <input type="text" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} className={`w-full px-3 py-2 border rounded-lg ${inputClasses}`} placeholder="e.g., Languages, Awards" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Points</label>
                      <div className="space-y-2">
                        {currentSectionPoints.map((point, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input type="text" value={point} onChange={(e) => updatePoint(index, e.target.value)} className={`flex-1 px-3 py-2 border rounded-lg ${inputClasses}`} placeholder="Enter a bullet point" />
                            <button onClick={() => removePoint(index)} className="text-red-500 hover:text-red-700 p-2" disabled={currentSectionPoints.length <= 1}><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <button onClick={addNewPoint} className="mt-2 text-blue-600 flex items-center gap-2 text-sm"><Plus size={14} /> Add Point</button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => setShowCustomSectionModal(false)} className={`flex-1 px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>Cancel</button>
                    <button onClick={saveCustomSection} disabled={!newSectionTitle.trim()} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Section</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              {resumeData.profileImage ? (
                <div className="relative">
                  <img src={resumeData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
                  <button onClick={() => setResumeData(prev => ({ ...prev, profileImage: null }))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={16} /></button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-4">Upload a profile picture for your resume.</p>
                </div>
              )}
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                {resumeData.profileImage ? 'Change Picture' : 'Upload Picture'}
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">Recommended: Square image, 200x200 pixels.</p>
            </div>
            <div className="text-sm text-gray-500">
              <p className="font-semibold">Note:</p>
              <p>Profile pictures are best suited for 'Creative' style templates.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTemplate = () => {
    const safeFilter = (array, condition) => (Array.isArray(array) ? array.filter(condition) : []);

    const renderCustomSections = (styleConfig = {}) => {
      const { containerClass = "mb-6", titleClass = "text-lg font-semibold border-b-2 border-blue-500 pb-1 mb-2", listClass = "list-disc list-inside space-y-1 pl-4" } = styleConfig;
      return safeArray(resumeData.customSections).map((section, index) => {
        const hasContent = safeArray(section.points).some(p => p && p.trim());
        if (!hasContent) return null;
        return (
          <div key={index} className={containerClass}>
            <h3 className={titleClass}>{section.title}</h3>
            <ul className={listClass}>
              {safeArray(section.points).map((point, pointIndex) => point && point.trim() && <li key={pointIndex}>{point}</li>)}
            </ul>
          </div>
        );
      });
    };

    switch (activeTemplate) {
      case 'simple':
        // Clean, minimal single-column layout
        return (
          <div ref={resumePreviewRef} className={`p-8 space-y-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="text-center border-b pb-6" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
              <h1 className="text-3xl font-bold">{resumeData.fullName || 'Your Name'}</h1>
              <p className={`text-lg mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{resumeData.jobTitle || 'Your Job Title'}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm">
                {resumeData.email && <div className="flex items-center gap-1"><Mail size={14}/> {resumeData.email}</div>}
                {resumeData.phone && <div className="flex items-center gap-1"><Phone size={14}/> {resumeData.phone}</div>}
                {resumeData.location && <div className="flex items-center gap-1"><MapPin size={14}/> {resumeData.location}</div>}
              </div>
            </div>
            
            {resumeData.summary && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Professional Summary</h3>
                <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{resumeData.summary}</p>
              </div>
            )}
            
            {safeArray(resumeData.skills).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {safeArray(resumeData.skills).map((skill, index) => (
                    <span key={index} className={`px-3 py-1 rounded text-sm ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Work Experience</h3>
                {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).map((exp, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{exp.jobTitle}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.company}</div>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.duration}</div>
                    </div>
                    <p className={`mt-2 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {safeFilter(resumeData.educations, e => e.degree || e.university).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold border-b pb-1 mb-2">Education</h3>
                {safeFilter(resumeData.educations, e => e.degree || e.university).map((edu, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{edu.degree}</div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.university}</div>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.year}</div>
                    </div>
                    {(edu.percentage || edu.cgpa) && (
                      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {edu.percentage && `Percentage: ${edu.percentage}%`}
                        {edu.percentage && edu.cgpa && ' | '}
                        {edu.cgpa && `CGPA: ${edu.cgpa}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {renderCustomSections()}
          </div>
        );

      case 'professional':
        // Modern two-column layout with clear hierarchy
        return (
          <div ref={resumePreviewRef} className={`p-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="grid grid-cols-4 gap-8">
              {/* Left Column */}
              <div className="col-span-1 space-y-6">
                {resumeData.profileImage && (
                  <div className="flex justify-center">
                    <img src={resumeData.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-lg border-b pb-1 mb-3">Contact</h3>
                  <div className="space-y-2 text-sm">
                    {resumeData.email && <div className="flex items-center gap-2"><Mail size={14}/> {resumeData.email}</div>}
                    {resumeData.phone && <div className="flex items-center gap-2"><Phone size={14}/> {resumeData.phone}</div>}
                    {resumeData.location && <div className="flex items-center gap-2"><MapPin size={14}/> {resumeData.location}</div>}
                  </div>
                </div>
                
                {safeArray(resumeData.skills).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-1 mb-3">Skills</h3>
                    <div className="space-y-2">
                      {safeArray(resumeData.skills).map((skill, index) => (
                        <div key={index} className="text-sm">{skill}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {safeFilter(resumeData.certifications, c => c.title).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-1 mb-3">Certifications</h3>
                    <div className="space-y-2 text-sm">
                      {safeFilter(resumeData.certifications, c => c.title).map((cert, index) => (
                        <div key={index}>
                          <div className="font-medium">{cert.title}</div>
                          <div>{cert.authority}, {cert.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              <div className="col-span-3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">{resumeData.fullName || 'Your Name'}</h1>
                  <p className={`text-xl mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{resumeData.jobTitle || 'Your Job Title'}</p>
                </div>
                
                {resumeData.summary && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-1 mb-3">Professional Summary</h3>
                    <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{resumeData.summary}</p>
                  </div>
                )}
                
                {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-1 mb-3">Work Experience</h3>
                    <div className="space-y-4">
                      {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).map((exp, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{exp.jobTitle}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.company}</div>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.duration}</div>
                          </div>
                          <p className={`mt-2 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {safeFilter(resumeData.educations, e => e.degree || e.university).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg border-b pb-1 mb-3">Education</h3>
                    <div className="space-y-4">
                      {safeFilter(resumeData.educations, e => e.degree || e.university).map((edu, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{edu.degree}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.university}</div>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.year}</div>
                          </div>
                          {(edu.percentage || edu.cgpa) && (
                            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {edu.percentage && `Percentage: ${edu.percentage}%`}
                              {edu.percentage && edu.cgpa && ' | '}
                              {edu.cgpa && `CGPA: ${edu.cgpa}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'classic':
        // Traditional single column with formal styling
        return (
          <div ref={resumePreviewRef} className={`p-8 space-y-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="text-center">
              <h1 className="text-3xl font-bold uppercase tracking-wide">{resumeData.fullName || 'Your Name'}</h1>
              <div className={`h-1 w-20 mx-auto my-3 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{resumeData.jobTitle || 'Your Job Title'}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm">
                {resumeData.email && <div>{resumeData.email}</div>}
                {resumeData.phone && <div>{resumeData.phone}</div>}
                {resumeData.location && <div>{resumeData.location}</div>}
              </div>
            </div>
            
            {resumeData.summary && (
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wide border-b-2 pb-1 mb-3">Professional Summary</h3>
                <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{resumeData.summary}</p>
              </div>
            )}
            
            {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wide border-b-2 pb-1 mb-3">Professional Experience</h3>
                {safeFilter(resumeData.experiences, e => e.jobTitle || e.company).map((exp, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{exp.jobTitle}</div>
                      <div className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.duration}</div>
                    </div>
                    <div className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.company}</div>
                    <p className={`mt-2 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {safeArray(resumeData.skills).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wide border-b-2 pb-1 mb-3">Technical Skills</h3>
                <div className="grid grid-cols-2 gap-2">
                  {safeArray(resumeData.skills).map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {safeFilter(resumeData.educations, e => e.degree || e.university).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wide border-b-2 pb-1 mb-3">Education</h3>
                {safeFilter(resumeData.educations, e => e.degree || e.university).map((edu, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">{edu.degree}</div>
                      <div className={`text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.year}</div>
                    </div>
                    <div className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{edu.university}</div>
                    {(edu.percentage || edu.cgpa) && (
                      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {edu.percentage && `Percentage: ${edu.percentage}%`}
                        {edu.percentage && edu.cgpa && ' | '}
                        {edu.cgpa && `CGPA: ${edu.cgpa}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {renderCustomSections({
              titleClass: "text-lg font-semibold uppercase tracking-wide border-b-2 pb-1 mb-3"
            })}
          </div>
        );

      case 'creative':
        // Modern two-column layout with profile picture and color accents
        return (
          <div ref={resumePreviewRef} className="flex h-full">
            {/* Left Sidebar */}
            <div className={`w-2/5 p-6 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <div className="flex justify-center mb-6">
                {resumeData.profileImage ? (
                  <img src={resumeData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500" />
                ) : (
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-indigo-500 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <User size={48} className={isDark ? 'text-gray-400' : 'text-gray-500'}/>
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User size={18} />
                  Contact
                </h2>
                <div className="space-y-3 text-sm">
                  {resumeData.email && <div className="flex items-center gap-2"><Mail size={14}/> {resumeData.email}</div>}
                  {resumeData.phone && <div className="flex items-center gap-2"><Phone size={14}/> {resumeData.phone}</div>}
                  {resumeData.location && <div className="flex items-center gap-2"><MapPin size={14}/> {resumeData.location}</div>}
                </div>
              </div>

              {safeArray(resumeData.skills).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Wrench size={18} />
                    Skills
                  </h2>
                  <div className="space-y-2">
                    {safeArray(resumeData.skills).map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {safeFilter(resumeData.certifications, c => c.title).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award size={18} />
                    Certifications
                  </h2>
                  <div className="space-y-3 text-sm">
                    {safeFilter(resumeData.certifications, c => c.title).map((cert, index) => (
                      <div key={index}>
                        <div className="font-semibold">{cert.title}</div>
                        <div>{cert.authority}, {cert.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderCustomSections({
                containerClass: "mb-8",
                titleClass: "text-xl font-bold mb-4",
                listClass: "space-y-2 text-sm"
              })}
            </div>

            {/* Main Content */}
            <div className={`w-3/5 p-8 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-indigo-600">{resumeData.fullName || 'Your Name'}</h1>
                <p className="text-xl mt-2">{resumeData.jobTitle || 'Your Job Title'}</p>
              </div>

              {resumeData.summary && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4">Professional Summary</h3>
                  <p className="leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                </div>
              )}

              {safeFilter(resumeData.experiences, e => e.jobTitle).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4 flex items-center gap-2">
                    <Briefcase size={18} />
                    Work Experience
                  </h3>
                  <div className="space-y-6">
                    {safeFilter(resumeData.experiences, e => e.jobTitle).map((exp, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-lg">{exp.jobTitle}</div>
                            <div className="text-indigo-500">{exp.company}</div>
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exp.duration}</div>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {safeFilter(resumeData.educations, e => e.degree).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4 flex items-center gap-2">
                    <GraduationCap size={18} />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {safeFilter(resumeData.educations, e => e.degree).map((edu, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{edu.degree}</div>
                            <div>{edu.university}</div>
                          </div>
                          <div>{edu.year}</div>
                        </div>
                        {(edu.percentage || edu.cgpa) && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {edu.percentage && `Percentage: ${edu.percentage}%`}
                            {edu.percentage && edu.cgpa && ' | '}
                            {edu.cgpa && `CGPA: ${edu.cgpa}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {safeFilter(resumeData.projects, p => p.title).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4">Projects</h3>
                  <div className="space-y-4">
                    {safeFilter(resumeData.projects, p => p.title).map((proj, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center">
                          <div className="font-semibold">{proj.title}</div>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1">
                              <Globe size={14} />
                              View Project
                            </a>
                          )}
                        </div>
                        <p className="mt-1 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div ref={resumePreviewRef} className="p-4 text-center">
            <h1 className="text-2xl font-bold">{resumeData.fullName || 'Your Name'}</h1>
            <p className="text-lg">{resumeData.jobTitle || 'Your Job Title'}</p>
            <p className="text-gray-500 mt-4">Select a template to see a full preview.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8 print:block print:max-w-none print:px-0">
        <div className={`border rounded-xl p-6 transition-all duration-300 ${cardClasses} print:hidden`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{steps[currentStep]}</h2>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
              ) : (
                <Download size={16} />
              )}
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
          <div className="relative min-h-[500px]">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div key={currentStep} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="absolute top-0 left-0 w-full">
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-500 text-white disabled:opacity-50 hover:bg-gray-600"><ArrowLeft size={16}/> Previous</button>
            <button onClick={nextStep} disabled={currentStep === steps.length - 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700">Next <ArrowRight size={16}/></button>
          </div>
        </div>

        <div className={`border rounded-xl p-8 transition-all duration-300 ${cardClasses} print:block print:shadow-none print:border-none print:p-0`}>
          {renderTemplate()}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}