// ResumeEditor.jsx
import React, { useState } from 'react';
import { Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeEditor({ resumeData, setResumeData, isDark }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSkill, setCurrentSkill] = useState('');
  const [direction, setDirection] = useState(0);

  const steps = [
    'Personal Info',
    'Summary',
    'Skills',
    'Work Experience',
    'Education',
    'Projects',
    'Certifications'
  ];

  const inputClasses = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

  const handleInputChange = (field, value) =>
    setResumeData(prev => ({ ...prev, [field]: value }));

  const handleNestedChange = (e, section, index, field) => {
    const { value } = e.target;
    setResumeData(prev => {
      const newSection = [...prev[section]];
      newSection[index] = { ...newSection[index], [field]: value };
      return { ...prev, [section]: newSection };
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() && !resumeData.skills.includes(currentSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, currentSkill.trim()] }));
      setCurrentSkill('');
    }
  };

  const removeSkill = skill => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleAddEntry = (section, initialObject) => {
    setResumeData(prev => ({ ...prev, [section]: [...prev[section], initialObject] }));
  };

  const handleRemoveEntry = (section, index) => {
    setResumeData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const nextStep = () => { setDirection(1); setCurrentStep(prev => Math.min(prev + 1, steps.length - 1)); };
  const prevStep = () => { setDirection(-1); setCurrentStep(prev => Math.max(prev - 1, 0)); };

  // Horizontal slide animation variants
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
  };

  // Step Renderer
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" value={resumeData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="text" placeholder="Job Title" value={resumeData.jobTitle} onChange={e => handleInputChange('jobTitle', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="email" placeholder="Email" value={resumeData.email} onChange={e => handleInputChange('email', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="tel" placeholder="Phone" value={resumeData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
            <input type="text" placeholder="Location" value={resumeData.location} onChange={e => handleInputChange('location', e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`} />
          </div>
        );

      case 1: // Summary
        return (
          <textarea placeholder="Professional Summary" value={resumeData.summary} onChange={e => handleInputChange('summary', e.target.value)} rows={5} className={`w-full px-4 py-3 border rounded-lg resize-none ${inputClasses}`} />
        );

      case 2: // Skills
        return (
          <div>
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Add skill and press Enter" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} onKeyPress={handleKeyPress} className={`flex-1 px-4 py-3 border rounded-lg ${inputClasses}`} />
              <button onClick={addSkill} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={14} /></button>
                </span>
              ))}
            </div>
          </div>
        );

      case 3: // Work Experience
        return (
          <div className="space-y-3">
            {resumeData.experiences.map((exp, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Job Title" value={exp.jobTitle} onChange={e => handleNestedChange(e, 'experiences', index, 'jobTitle')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Company" value={exp.company} onChange={e => handleNestedChange(e, 'experiences', index, 'company')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Duration" value={exp.duration} onChange={e => handleNestedChange(e, 'experiences', index, 'duration')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <textarea placeholder="Description" rows={3} value={exp.description} onChange={e => handleNestedChange(e, 'experiences', index, 'description')} className={`w-full px-3 py-2 rounded-lg resize-none ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('experiences', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('experiences', { jobTitle: '', company: '', duration: '', description: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Experience</button>
          </div>
        );

      case 4: // Education
  return (
    <div className="space-y-3">
      {resumeData.educations.map((edu, index) => (
        <div
          key={index}
          className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
        >
          <input
            type="text"
            placeholder="Degree / Certification or 12th / Diploma"
            value={edu.degree}
            onChange={e => handleNestedChange(e, 'educations', index, 'degree')}
            className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`}
          />
          <input
            type="text"
            placeholder="School / University / College"
            value={edu.university}
            onChange={e => handleNestedChange(e, 'educations', index, 'university')}
            className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`}
          />
          <input
            type="text"
            placeholder="Marks / CGPA"
            value={edu.marks}
            onChange={e => handleNestedChange(e, 'educations', index, 'marks')}
            className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`}
          />
          <input
            type="text"
            placeholder="Year"
            value={edu.year}
            onChange={e => handleNestedChange(e, 'educations', index, 'year')}
            className={`w-full px-3 py-2 rounded-lg ${inputClasses}`}
          />
          <button
            onClick={() => handleRemoveEntry('educations', index)}
            className="mt-2 text-red-500 flex items-center gap-1"
          >
            <X size={16} /> Remove
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          handleAddEntry('educations', { degree: '', university: '', marks: '', year: '' })
        }
        className="mt-2 text-blue-600 flex items-center gap-2"
      >
        <Plus size={16} /> Add Education
      </button>
    </div>
  );

      case 5: // Projects
        return (
          <div className="space-y-3">
            {resumeData.projects.map((proj, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Title" value={proj.title} onChange={e => handleNestedChange(e, 'projects', index, 'title')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Link" value={proj.link} onChange={e => handleNestedChange(e, 'projects', index, 'link')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <textarea placeholder="Description" rows={3} value={proj.description} onChange={e => handleNestedChange(e, 'projects', index, 'description')} className={`w-full px-3 py-2 rounded-lg resize-none ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('projects', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('projects', { title: '', link: '', description: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Project</button>
          </div>
        );

      case 6: // Certifications
        return (
          <div className="space-y-3">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className={`border p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                <input type="text" placeholder="Title" value={cert.title} onChange={e => handleNestedChange(e, 'certifications', index, 'title')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Authority" value={cert.authority} onChange={e => handleNestedChange(e, 'certifications', index, 'authority')} className={`w-full px-3 py-2 mb-2 rounded-lg ${inputClasses}`} />
                <input type="text" placeholder="Year" value={cert.year} onChange={e => handleNestedChange(e, 'certifications', index, 'year')} className={`w-full px-3 py-2 rounded-lg ${inputClasses}`} />
                <button onClick={() => handleRemoveEntry('certifications', index)} className="mt-2 text-red-500 flex items-center gap-1"><X size={16}/> Remove</button>
              </div>
            ))}
            <button onClick={() => handleAddEntry('certifications', { title: '', authority: '', year: '' })} className="mt-2 text-blue-600 flex items-center gap-2"><Plus size={16}/> Add Certification</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-xl p-6 transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h2 className="text-xl font-semibold mb-4">{steps[currentStep]}</h2>

      {/* Fixed container for smooth animation */}
      <div className="relative min-h-[350px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-400 text-white disabled:opacity-50">
          <ArrowLeft size={16}/> Previous
        </button>
        <button onClick={nextStep} disabled={currentStep === steps.length - 1} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
          Next <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}
