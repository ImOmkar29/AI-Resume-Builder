import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function StartOptionPage({ onStartNew, isDark }) {
  const containerClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const buttonClasses = 'w-full py-3 rounded-lg font-bold transition-colors duration-200';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${containerClasses}`}>
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Let's Build Your Resume
      </motion.h1>
      
      <motion.p 
        className={`text-xl mb-12 text-center max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Start fresh with our AI-powered resume builder. We'll guide you through every step.
      </motion.p>

      <div className="flex justify-center max-w-md w-full">
        {/* Start Fresh Option - Single Centered Card */}
        <motion.div 
          className={`border-2 rounded-xl p-8 shadow-lg relative hover:shadow-xl transition-all duration-300 w-full ${cardClasses}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            AI-POWERED
          </div>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Start Fresh</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Create a professional resume from scratch with our intelligent builder. 
              Perfect for job seekers who want a fresh start.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>AI-powered content suggestions</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>Multiple professional templates</span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>ATS-friendly formatting</span>
            </div>
          </div>

          <button 
            onClick={onStartNew}
            className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <Plus className="w-5 h-5" />
            Create New Resume
          </button>
        </motion.div>
      </div>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Takes less than 10 minutes to create a professional resume
        </p>
      </motion.div>
    </div>
  );
}