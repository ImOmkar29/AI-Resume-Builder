import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const ResumeForm = ({ resumeData, onUpdateData, isDark }) => {
  const [currentSkill, setCurrentSkill] = useState('');

  const handleInputChange = (field, value) => {
    onUpdateData(field, value);
  };

  const addSkill = () => {
    if (currentSkill.trim() && !resumeData.skills.includes(currentSkill.trim())) {
      const updatedSkills = [...resumeData.skills, currentSkill.trim()];
      onUpdateData('skills', updatedSkills);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = resumeData.skills.filter(skill => skill !== skillToRemove);
    onUpdateData('skills', updatedSkills);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className={`border rounded-xl p-6 transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-semibold mb-6 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>Edit Resume</h2>
      
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Full Name</label>
          <input
            type="text"
            value={resumeData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Job Title</label>
          <input
            type="text"
            value={resumeData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Professional Summary</label>
          <textarea
            value={resumeData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Write a brief summary of your professional background and key achievements..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill and press Enter"
              className={`flex-1 px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              }`}
            />
            <button
              onClick={addSkill}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Skills Tags */}
          {resumeData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {resumeData.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
                    isDark 
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-500 transition-colors duration-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;