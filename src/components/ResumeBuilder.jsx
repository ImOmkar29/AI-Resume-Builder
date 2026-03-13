import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Plus, X, Briefcase, GraduationCap, User, Wrench, FileText, Sparkles, Image as ImageIcon, ArrowRight, ArrowLeft, Settings, Target, Mail, Phone, MapPin, Award, Globe, CheckCircle, AlertCircle, Save, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ATSAnalysis from './ATSAnalysis';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ResumePreview from './ResumePreview';
import { supabase } from '../lib/supabase';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ResumeBuilder({ isDark, activeTemplate: propActiveTemplate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // ATS-specific states
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Skill validation states
  const [skillValidation, setSkillValidation] = useState({ valid: true, message: '' });
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [isValidatingSkill, setIsValidatingSkill] = useState(false);

  // Save Resume states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveResumeName, setSaveResumeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [searchParams] = useSearchParams();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Template state - initialize from prop (which comes from URL)
  const [activeTemplate, setActiveTemplate] = useState(propActiveTemplate || 'simple');

  // Refs for tab scrolling
  const tabRefs = useRef([]);

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
      experiences: [],
      educations: [],
      projects: [],
      certifications: [],
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

  const navigate = useNavigate();

  // Scroll active tab into view when currentStep changes
  useEffect(() => {
    if (tabRefs.current[currentStep]) {
      tabRefs.current[currentStep].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);

  // Update template when prop changes (for new resumes from template page)
  useEffect(() => {
    if (propActiveTemplate && !isEditing) {
      console.log('🎯 Setting template from props:', propActiveTemplate);
      setActiveTemplate(propActiveTemplate);
    }
  }, [propActiveTemplate, isEditing]);

  // Check user on mount and load resume for editing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔍 [ResumeBuilder] Firebase user:', firebaseUser?.email);
      setUser(firebaseUser);
      
      // Check if we're editing a resume
      const editResumeId = searchParams.get('edit');
      const templateFromUrl = searchParams.get('template');
      
      console.log('🔍 [ResumeBuilder] URL params:', {
        edit: editResumeId,
        template: templateFromUrl,
        propTemplate: propActiveTemplate
      });
      
      if (editResumeId && firebaseUser) {
        console.log('✅ [ResumeBuilder] Loading resume for editing:', editResumeId);
        await loadResumeForEditing(editResumeId);
      } else if (editResumeId && !firebaseUser) {
        console.log('⚠️ [ResumeBuilder] User not logged in, cannot edit');
        navigate('/');
      } else {
        // New resume - use template from URL if available
        if (templateFromUrl) {
          console.log('📝 [ResumeBuilder] New resume with template from URL:', templateFromUrl);
          setActiveTemplate(templateFromUrl);
        }
        setInitialLoadComplete(true);
      }
    });

    return () => unsubscribe();
  }, [searchParams, navigate, propActiveTemplate]);

  // Load resume for editing
  const loadResumeForEditing = async (resumeId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please login to edit saved resumes');
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      console.log('📥 [ResumeBuilder] Fetching resume from DB:', resumeId);
      
      const { data, error } = await supabase
        .from('resumes_firebase')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', currentUser.uid)
        .single();

      if (error) {
        console.error('❌ [ResumeBuilder] Supabase error:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ [ResumeBuilder] Resume loaded successfully:', {
          id: data.id,
          title: data.title,
          savedTemplate: data.template,
          urlTemplate: searchParams.get('template')
        });
        
        // Convert database structure to component structure
        const dbData = data.resume_data || {};
        
        // Update resume data
        setResumeData({
          fullName: dbData?.basics?.name || dbData?.fullName || '',
          jobTitle: dbData?.basics?.title || dbData?.jobTitle || '',
          email: dbData?.basics?.email || dbData?.email || '',
          phone: dbData?.basics?.phone || dbData?.phone || '',
          location: dbData?.basics?.location || dbData?.location || '',
          summary: dbData?.basics?.summary || dbData?.summary || '',
          skills: dbData?.skills || [],
          experiences: dbData?.work || dbData?.experiences || [],
          educations: dbData?.education || dbData?.educations || [],
          projects: dbData?.projects || [],
          certifications: dbData?.certifications || [],
          customSections: dbData?.customSections || [],
          profileImage: dbData?.profileImage || null,
        });
        
        setSaveResumeName(data.title || 'Untitled Resume');
        setCurrentResumeId(data.id);
        setIsEditing(true);
        
        // IMPORTANT: Use the template from the saved resume, not from URL
        // This ensures the correct template is used when editing
        if (data.template) {
          console.log('🎯 Setting template from saved resume:', data.template);
          setActiveTemplate(data.template);
        }
        
        setInitialLoadComplete(true);
      } else {
        console.log('❌ [ResumeBuilder] No resume found with ID:', resumeId);
        alert('Resume not found. It may have been deleted.');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ [ResumeBuilder] Error loading resume:', err);
      alert('Failed to load resume. Please try again.');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if content exists
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

  const safeArray = (array) => (Array.isArray(array) ? array : []);

  const openPreview = () => {
    // If editing, include the resume ID in navigation
    if (currentResumeId) {
      navigate(`/preview/${currentResumeId}`, {
        state: {
          resumeData,
          activeTemplate
        }
      });
    } else {
      navigate('/preview', {
        state: {
          resumeData,
          activeTemplate
        }
      });
    }
  };

  // Save Resume Function
  const handleSaveResume = async () => {
    if (!saveResumeName.trim()) {
      alert('Please enter a resume name');
      return;
    }

    // Get current Firebase user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      alert('Please login to save resumes');
      setShowSaveModal(false);
      return;
    }

    setIsSaving(true);
    
    try {
      const resumeToSave = {
        user_id: currentUser.uid,
        title: saveResumeName.trim(),
        resume_data: {
          basics: {
            name: resumeData.fullName,
            title: resumeData.jobTitle,
            email: resumeData.email,
            phone: resumeData.phone,
            location: resumeData.location,
            summary: resumeData.summary
          },
          skills: resumeData.skills,
          work: resumeData.experiences,
          education: resumeData.educations,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
          customSections: resumeData.customSections,
          profileImage: resumeData.profileImage
        },
        template: activeTemplate, // Save current template
        is_dark: isDark,
        updated_at: new Date().toISOString(),
      };

      let result;
      let successMessage = 'Resume saved successfully!';
      
      if (isEditing && currentResumeId) {
        // Update existing resume
        console.log('💾 [ResumeBuilder] Updating resume:', currentResumeId);
        result = await supabase
          .from('resumes_firebase')
          .update(resumeToSave)
          .eq('id', currentResumeId)
          .eq('user_id', currentUser.uid)
          .select();
          
        successMessage = 'Resume updated successfully!';
      } else {
        // Create new resume
        console.log('💾 [ResumeBuilder] Creating new resume');
        result = await supabase
          .from('resumes_firebase')
          .insert([{ 
            ...resumeToSave, 
            created_at: new Date().toISOString() 
          }])
          .select();
      }

      if (result.error) throw result.error;

      console.log('✅ [ResumeBuilder] Save result:', result);

      if (!isEditing && result.data?.[0]?.id) {
        setCurrentResumeId(result.data[0].id);
        setIsEditing(true);
      }

      alert(successMessage);
      setShowSaveModal(false);
      setSaveResumeName('');
      
    } catch (error) {
      console.error('❌ [ResumeBuilder] Error saving resume:', error);
      alert(`Failed to save resume: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Skill validation function
  const validateSkill = async (skill) => {
    if (!skill.trim()) {
      setSkillValidation({ valid: false, message: 'Skill cannot be empty' });
      return false;
    }

    if (skill.trim().length < 2) {
      setSkillValidation({ valid: false, message: 'Skill must be at least 2 characters long' });
      return false;
    }

    if (skill.trim().length > 50) {
      setSkillValidation({ valid: false, message: 'Skill must be less than 50 characters' });
      return false;
    }

    // Basic character validation
    if (/[^a-zA-Z0-9\s\-\+\.\#]/.test(skill)) {
      setSkillValidation({ valid: false, message: 'Skill contains invalid characters' });
      return false;
    }

    setIsValidatingSkill(true);
    try {
      const response = await fetch('http://localhost:5000/validate-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skill.trim() })
      });
      
      const validationResult = await response.json();
      setSkillValidation(validationResult);
      
      if (validationResult.suggestions) {
        setSkillSuggestions(validationResult.suggestions);
      } else {
        setSkillSuggestions([]);
      }
      
      return validationResult.valid;
    } catch (error) {
      console.error('Skill validation error:', error);
      // Fallback validation
      const isValid = skill.trim().length >= 2 && skill.trim().length <= 50;
      setSkillValidation({ 
        valid: isValid, 
        message: isValid ? 'Valid skill' : 'Please enter a meaningful skill' 
      });
      return isValid;
    } finally {
      setIsValidatingSkill(false);
    }
  };

  // Real-time skill validation as user types
  const handleSkillInputChange = async (e) => {
    const value = e.target.value;
    setCurrentSkill(value);
    
    if (value.trim().length > 1) {
      await validateSkill(value);
    } else {
      setSkillValidation({ valid: true, message: '' });
      setSkillSuggestions([]);
    }
  };

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

  const addSkill = async () => {
    if (!currentSkill.trim()) return;
    
    const isValid = await validateSkill(currentSkill);
    
    if (isValid && !safeArray(resumeData.skills).includes(currentSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...safeArray(prev.skills), currentSkill.trim()] }));
      setCurrentSkill('');
      setSkillValidation({ valid: true, message: '' });
      setSkillSuggestions([]);
    }
  };

  const removeSkill = (skillToRemove) => {
    setResumeData(prev => ({ ...prev, skills: safeArray(prev.skills).filter(skill => skill !== skillToRemove) }));
  };

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await addSkill();
    }
  };

  const useSuggestion = (suggestion) => {
    setCurrentSkill(suggestion);
    setSkillValidation({ valid: true, message: '' });
    setSkillSuggestions([]);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          summary: resumeData.summary, 
          jobDescription: jobDescription,
          skills: safeArray(resumeData.skills)
        }),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: resumeData.jobTitle,
          jobDescription: jobDescription 
        }),
      });
      const data = await response.json();
      // Only add skills that pass validation
      const validSkills = [];
      for (const skill of data.skills) {
        const isValid = await validateSkill(skill);
        if (isValid) {
          validSkills.push(skill);
        }
      }
      setResumeData(prev => ({ 
        ...prev, 
        skills: [...new Set([...safeArray(prev.skills), ...validSkills])] 
      }));
    } catch (error) {
      console.error("Error suggesting skills:", error);
      alert("Failed to suggest skills. Check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

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
  const inputClasses = isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

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
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
              <input 
                id="fullName"
                type="text" 
                placeholder="John Doe" 
                value={resumeData.fullName} 
                onChange={e => handleInputChange('fullName', e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Job Title</label>
              <input 
                id="jobTitle"
                type="text" 
                placeholder="Senior Software Engineer" 
                value={resumeData.jobTitle} 
                onChange={e => handleInputChange('jobTitle', e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <input 
                id="email"
                type="email" 
                placeholder="john.doe@email.com" 
                value={resumeData.email} 
                onChange={e => handleInputChange('email', e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
              <input 
                id="phone"
                type="tel" 
                placeholder="+91 98765 43210" 
                value={resumeData.phone} 
                onChange={e => handleInputChange('phone', e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Location</label>
              <input 
                id="location"
                type="text" 
                placeholder="Mumbai, Maharashtra" 
                value={resumeData.location} 
                onChange={e => handleInputChange('location', e.target.value)} 
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 pb-4">
            <div>
              <label htmlFor="jobDescription" className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                <Target size={16} /> 
                Target Job Description
              </label>
              <textarea 
                id="jobDescription"
                placeholder="Paste the job description here for AI-optimized summary generation and ATS score analysis..." 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                rows={5} 
                className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${inputClasses}`} 
              />
            </div>
            
            <div>
              <label htmlFor="summary" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Professional Summary</label>
              <textarea 
                id="summary"
                placeholder="Your AI-generated summary will appear here, or write your own..." 
                value={resumeData.summary} 
                onChange={e => handleInputChange('summary', e.target.value)} 
                rows={5} 
                className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${inputClasses}`} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleAISummary} 
                disabled={isLoading || !jobDescription} 
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
                aria-label="Generate AI summary"
              >
                {isLoading && !atsResult ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Sparkles size={18} />
                )}
                Generate Summary
              </button>
              <button 
                onClick={handleATSScore} 
                disabled={isLoading || !jobDescription || !resumeData.summary} 
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm"
                aria-label="Analyze ATS score"
              >
                {isLoading && atsResult ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <FileText size={18} />
                )}
                Analyze ATS Score
              </button>
            </div>

            <ATSAnalysis 
              atsResult={atsResult} 
              isLoading={isLoading && !atsResult} 
              isDark={isDark} 
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex gap-3 mb-2">
              <div className="flex-1">
                <label htmlFor="skillInput" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Add Skill</label>
                <input 
                  id="skillInput"
                  type="text" 
                  placeholder="Add skill and press Enter" 
                  value={currentSkill} 
                  onChange={handleSkillInputChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    skillValidation.valid === false ? 'border-red-500' : skillValidation.valid === true ? 'border-green-500' : ''
                  } ${inputClasses}`} 
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={addSkill} 
                  disabled={!currentSkill.trim() || !skillValidation.valid || isValidatingSkill}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 h-[52px] shadow-sm"
                  aria-label="Add skill"
                >
                  {isValidatingSkill ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <Plus size={20} />
                  )}
                </button>
              </div>
            </div>

            {skillValidation.message && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                skillValidation.valid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {skillValidation.valid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {skillValidation.message}
              </div>
            )}

            {skillSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Did you mean:</p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-all duration-200 shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleAISkills} 
              disabled={isLoading} 
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50"
              aria-label="Suggest skills with AI"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Sparkles size={18} />
              )}
              Suggest Skills with AI
            </button>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Your Skills</label>
              <div className="flex flex-wrap gap-2">
                {safeArray(resumeData.skills).map((skill, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                    isDark ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-blue-200 border border-blue-700' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                  }`}>
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)} 
                      className="ml-1 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${skill} skill`}
                    >
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Work Experience</label>
            {safeArray(resumeData.experiences).map((exp, index) => (
              <div key={index} className={`border p-6 rounded-xl transition-all duration-200 ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gradient-to-b from-gray-50 to-white border-gray-200'} shadow-sm`}>
                <div className="grid gap-4">
                  <input 
                    type="text" 
                    placeholder="Job Title" 
                    value={exp.jobTitle || ''} 
                    onChange={e => handleNestedChange(e, 'experiences', index, 'jobTitle')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Company" 
                    value={exp.company || ''} 
                    onChange={e => handleNestedChange(e, 'experiences', index, 'company')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Duration (e.g., 2020 - Present)" 
                    value={exp.duration || ''} 
                    onChange={e => handleNestedChange(e, 'experiences', index, 'duration')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <textarea 
                    placeholder="Description of your responsibilities and achievements..." 
                    rows={4} 
                    value={exp.description || ''} 
                    onChange={e => handleNestedChange(e, 'experiences', index, 'description')} 
                    className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${inputClasses}`} 
                  />
                </div>
                <button 
                  onClick={() => handleRemoveEntry('experiences', index)} 
                  className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                  aria-label="Remove experience"
                >
                  <X size={16}/> Remove Experience
                </button>
              </div>
            ))}
            <button 
              onClick={() => handleAddEntry('experiences', { jobTitle: '', company: '', duration: '', description: '' })} 
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 shadow-sm"
              aria-label="Add new experience"
            >
              <Plus size={20}/> Add Experience
            </button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Education</label>
            {safeArray(resumeData.educations).map((edu, index) => (
              <div key={index} className={`border p-6 rounded-xl transition-all duration-200 ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gradient-to-b from-gray-50 to-white border-gray-200'} shadow-sm`}>
                <div className="grid gap-4">
                  <input 
                    type="text" 
                    placeholder="Degree / Certification" 
                    value={edu.degree || ''} 
                    onChange={e => handleNestedChange(e, 'educations', index, 'degree')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="University / College" 
                    value={edu.university || ''} 
                    onChange={e => handleNestedChange(e, 'educations', index, 'university')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Year" 
                    value={edu.year || ''} 
                    onChange={e => handleNestedChange(e, 'educations', index, 'year')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Percentage (%)" 
                      value={edu.percentage || ''} 
                      onChange={e => handleNestedChange(e, 'educations', index, 'percentage')} 
                      className={`px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                    />
                    <input 
                      type="text" 
                      placeholder="CGPA / GPA" 
                      value={edu.cgpa || ''} 
                      onChange={e => handleNestedChange(e, 'educations', index, 'cgpa')} 
                      className={`px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveEntry('educations', index)} 
                  className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                  aria-label="Remove education"
                >
                  <X size={16}/> Remove Education
                </button>
              </div>
            ))}
            <button 
              onClick={() => handleAddEntry('educations', { degree: '', university: '', year: '', percentage: '', cgpa: '' })} 
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 shadow-sm"
              aria-label="Add new education"
            >
              <Plus size={20}/> Add Education
            </button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Projects</label>
            {safeArray(resumeData.projects).map((proj, index) => (
              <div key={index} className={`border p-6 rounded-xl transition-all duration-200 ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gradient-to-b from-gray-50 to-white border-gray-200'} shadow-sm`}>
                <div className="grid gap-4">
                  <input 
                    type="text" 
                    placeholder="Project Title" 
                    value={proj.title || ''} 
                    onChange={e => handleNestedChange(e, 'projects', index, 'title')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Project Link (optional)" 
                    value={proj.link || ''} 
                    onChange={e => handleNestedChange(e, 'projects', index, 'link')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <textarea 
                    placeholder="Project description and your contributions..." 
                    rows={4} 
                    value={proj.description || ''} 
                    onChange={e => handleNestedChange(e, 'projects', index, 'description')} 
                    className={`w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200 ${inputClasses}`} 
                  />
                </div>
                <button 
                  onClick={() => handleRemoveEntry('projects', index)} 
                  className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                  aria-label="Remove project"
                >
                  <X size={16}/> Remove Project
                </button>
              </div>
            ))}
            <button 
              onClick={() => handleAddEntry('projects', { title: '', link: '', description: '' })} 
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 shadow-sm"
              aria-label="Add new project"
            >
              <Plus size={20}/> Add Project
            </button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Certifications</label>
            {safeArray(resumeData.certifications).map((cert, index) => (
              <div key={index} className={`border p-6 rounded-xl transition-all duration-200 ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gradient-to-b from-gray-50 to-white border-gray-200'} shadow-sm`}>
                <div className="grid gap-4">
                  <input 
                    type="text" 
                    placeholder="Certification Title" 
                    value={cert.title || ''} 
                    onChange={e => handleNestedChange(e, 'certifications', index, 'title')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Issuing Authority" 
                    value={cert.authority || ''} 
                    onChange={e => handleNestedChange(e, 'certifications', index, 'authority')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Year" 
                    value={cert.year || ''} 
                    onChange={e => handleNestedChange(e, 'certifications', index, 'year')} 
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  />
                </div>
                <button 
                  onClick={() => handleRemoveEntry('certifications', index)} 
                  className="mt-4 text-red-500 hover:text-red-700 flex items-center gap-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"
                  aria-label="Remove certification"
                >
                  <X size={16}/> Remove Certification
                </button>
              </div>
            ))}
            <button 
              onClick={() => handleAddEntry('certifications', { title: '', authority: '', year: '' })} 
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 shadow-sm"
              aria-label="Add new certification"
            >
              <Plus size={20}/> Add Certification
            </button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Custom Sections</h3>
              <button 
                onClick={startNewCustomSection} 
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm"
                aria-label="Add custom section"
              >
                <Plus size={18} /> Add Section
              </button>
            </div>
            {safeArray(resumeData.customSections).length === 0 ? (
              <div className={`text-center p-8 rounded-xl border-2 border-dashed transition-all duration-200 ${isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' : 'border-gray-300 hover:border-gray-400 bg-gradient-to-b from-gray-50 to-white'}`}>
                <Settings size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Add custom sections like 'Awards' or 'Languages'.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {safeArray(resumeData.customSections).map((section, sectionIndex) => (
                  <div key={sectionIndex} className={`border rounded-xl p-6 transition-all duration-200 ${isDark ? 'bg-gray-800/50 border-gray-600' : 'bg-gradient-to-b from-gray-50 to-white border-gray-200'} shadow-sm`}>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{section.title}</h4>
                      <button 
                        onClick={() => handleRemoveCustomSection(sectionIndex)} 
                        className="text-red-500 hover:text-red-700 transition-all duration-200 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        aria-label={`Remove ${section.title} section`}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {safeArray(section.points).map((point, pointIndex) => (
                        <div key={pointIndex} className="flex gap-3 items-center">
                          <input 
                            type="text" 
                            value={point} 
                            onChange={(e) => handleCustomSectionPointChange(e, sectionIndex, pointIndex)} 
                            className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                            placeholder="Enter bullet point" 
                          />
                          <button 
                            onClick={() => handleRemoveCustomSectionPoint(sectionIndex, pointIndex)} 
                            className="text-red-500 hover:text-red-700 transition-all duration-200 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30" 
                            disabled={safeArray(section.points).length <= 1}
                            aria-label="Remove point"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAddCustomSectionPoint(sectionIndex)} 
                      className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg"
                      aria-label="Add point to section"
                    >
                      <Plus size={16} /> Add Point
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-200 ${isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' : 'border-gray-300 hover:border-gray-400 bg-gradient-to-b from-gray-50 to-white'}`}>
              {resumeData.profileImage ? (
                <div className="relative">
                  <img src={resumeData.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-blue-500 shadow-lg" />
                  <button 
                    onClick={() => setResumeData(prev => ({ ...prev, profileImage: null }))} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 shadow-md"
                    aria-label="Remove profile picture"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload a profile picture for your resume.</p>
                </div>
              )}
              <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                {resumeData.profileImage ? 'Change Picture' : 'Upload Picture'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">Recommended: Square image, 200x200 pixels.</p>
            </div>
            <div className={`text-sm p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
              <p className="font-semibold mb-1 text-gray-800 dark:text-gray-300">Note:</p>
              <p className="text-gray-600 dark:text-gray-400">Profile pictures are best suited for 'Creative' style templates.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading state while fetching edit data
  if (isLoading && !initialLoadComplete) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading your resume...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Save Resume Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className={`rounded-xl p-6 w-full max-w-md ${cardClasses} shadow-2xl`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {isEditing ? 'Update Resume' : 'Save Resume'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Resume Name</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer Resume"
                  value={saveResumeName}
                  onChange={(e) => setSaveResumeName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveResumeName('');
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResume}
                  disabled={isSaving || !saveResumeName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 shadow-sm"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </span>
                  ) : (
                    isEditing ? 'Update Resume' : 'Save Resume'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Section Modal */}
      {showCustomSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className={`rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${cardClasses} shadow-2xl`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Create Custom Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Section Title</label>
                <input 
                  type="text" 
                  value={newSectionTitle} 
                  onChange={(e) => setNewSectionTitle(e.target.value)} 
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                  placeholder="e.g., Languages, Awards" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Points</label>
                <div className="space-y-3">
                  {currentSectionPoints.map((point, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={point} 
                        onChange={(e) => updatePoint(index, e.target.value)} 
                        className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${inputClasses}`} 
                        placeholder="Enter a bullet point" 
                      />
                      <button 
                        onClick={() => removePoint(index)} 
                        className="text-red-500 hover:text-red-700 transition-all duration-200 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30" 
                        disabled={currentSectionPoints.length <= 1}
                        aria-label="Remove point"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={addNewPoint} 
                  className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 text-sm transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                  aria-label="Add new point"
                >
                  <Plus size={16} /> Add Point
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCustomSectionModal(false)} 
                className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'border-gray-300 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={saveCustomSection} 
                disabled={!newSectionTitle.trim()} 
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 shadow-sm"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1920px] mx-auto px-4 py-8">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? `Edit Resume: ${saveResumeName}` : 'Resume Builder'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              {isEditing ? 'Edit your saved resume' : 'Create a professional resume in minutes'}
            </p>
            {/* Show template indicator */}
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Template: <span className="font-semibold capitalize">{activeTemplate}</span>
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-3">                
                {/* Save Resume Button */}
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  aria-label="Save resume"
                  disabled={!user}
                >
                  <Save size={20} />
                  {isEditing ? 'Update' : 'Save'} Resume
                </button>
                
                <button
                  onClick={openPreview}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  aria-label="Preview and download"
                >
                  Preview & Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Builder Container */}
        <div className="grid grid-cols-1 xl:grid-cols-[40%,1fr] gap-6 items-start">
          {/* Form Section */}
          <div className="xl:sticky xl:top-8">
            <div className={`rounded-2xl p-6 h-full flex flex-col shadow-lg border ${cardClasses}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Build Your Resume</h2>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full font-medium">
                      Editing Mode
                    </span>
                  )}
                  <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>
              </div>
              
              {/* Step Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>

              {/* Step Navigation - WITH SCROLLING FIX */}
              <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    ref={el => tabRefs.current[index] = el}
                    onClick={() => {
                      setDirection(index > currentStep ? 1 : -1);
                      setCurrentStep(index);
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentStep === index
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Go to ${step} step`}
                  >
                    {step}
                  </button>
                ))}
              </div>

              {/* Step Content */}
              <div className="relative flex-1 min-h-[500px]">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div 
                    key={currentStep} 
                    custom={direction} 
                    variants={variants} 
                    initial="enter" 
                    animate="center" 
                    exit="exit" 
                    transition={{ duration: 0.3 }} 
                    className="absolute top-0 left-0 w-full h-full"
                  >
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                      {renderStep()}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6 gap-4">
                <button 
                  onClick={prevStep} 
                  disabled={currentStep === 0} 
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white disabled:opacity-50 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-sm"
                  aria-label="Previous step"
                >
                  <ArrowLeft size={18}/> 
                  Previous
                </button>
                <button 
                  onClick={nextStep} 
                  disabled={currentStep === steps.length - 1} 
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white disabled:opacity-50 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm"
                  aria-label="Next step"
                >
                  Next 
                  <ArrowRight size={18}/>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="h-[calc(100vh-180px)] min-h-[800px]">
            <div className={`rounded-2xl p-6 h-full flex flex-col shadow-lg border ${cardClasses}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Live Preview</h3>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs rounded-full font-medium">
                      Editing: {saveResumeName}
                    </span>
                  )}
                  <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full capitalize">
                    {activeTemplate} Template
                  </div>
                </div>
              </div>
              
              <div className="preview-container flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30 flex items-start justify-center overflow-auto">
                <div className="resume-display" style={{ transform: 'scale(0.75)', transformOrigin: 'top center', marginTop: '20px' }}>
                  <ResumePreview
                    resumeData={resumeData}
                    activeTemplate={activeTemplate}
                    isDark={isDark}
                    isForPrint={false}
                  />
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  What you see is exactly what you'll get in the PDF
                </p>
                {isEditing && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Editing resume ID: {currentResumeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4338ca, #6d28d9);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .preview-container {
          background: #f8f9fb;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.08);
        }

        .dark .preview-container {
          background: #1f2937;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
        }

        .resume-display {
          transition: transform 0.3s ease;
        }

        @media (max-width: 1280px) {
          .grid-cols-\\[40%\\,1fr\\] {
            grid-template-columns: 1fr;
          }

          .resume-display {
            transform: scale(0.65) !important;
          }
        }

        @media (max-width: 768px) {
          .resume-display {
            transform: scale(0.55) !important;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}