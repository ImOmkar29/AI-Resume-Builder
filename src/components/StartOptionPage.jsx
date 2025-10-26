import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload } from 'lucide-react';

export default function StartOptionPage({ onStartNew, onImproveResume, isDark }) {
  const containerClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const buttonClasses = 'w-full py-3 rounded-lg font-bold transition-colors duration-200';

  const handleFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.rtf';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Selected file:', file.name);
        onImproveResume(file);
      }
    };
    
    fileInput.click();
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${containerClasses}`}>
      <motion.h1 
        className="text-4xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        How would you like to build your resume?
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Start Fresh Option */}
        <motion.div 
          className={`border-2 rounded-xl p-6 shadow-lg relative hover:shadow-xl transition-shadow duration-300 ${cardClasses}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-4 right-4 bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
            Packed with AI
          </div>
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold">Start Fresh</h2>
          </div>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Flexible for everyone. Personalized for you, every step of the way. Tell us a few details and we'll create a professional resume from scratch.
          </p>
          <button 
            onClick={onStartNew}
            className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Create New Resume
          </button>
        </motion.div>

        {/* Resume Improver Option */}
        <motion.div 
          className={`border-2 rounded-xl p-6 shadow-lg relative hover:shadow-xl transition-shadow duration-300 ${cardClasses}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <div className="absolute top-4 right-4 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
            AI Powered
          </div>
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Improve Existing</h2>
          </div>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have a resume? Upload it and let our AI analyze and enhance it with professional suggestions, ATS optimization, and content improvements.
          </p>
          <button 
            onClick={handleFileUpload}
            className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2`}
          >
            <Upload className="w-5 h-5" />
            Improve My Resume
          </button>
          <p className={`text-xs mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Supports PDF, DOC, DOCX, TXT
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Choose the option that works best for you
        </p>
      </motion.div>
    </div>
  );
}