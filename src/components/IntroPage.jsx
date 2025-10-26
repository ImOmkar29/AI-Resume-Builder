import React from 'react';
import { motion } from 'framer-motion';

export default function IntroPage({ onContinue, isDark }) {
  const containerClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800' : 'bg-white';
  const iconClasses = 'text-green-500';

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${containerClasses}`}
    >
      <div className="max-w-4xl w-full text-center">
        <motion.h1
          className="text-4xl font-bold mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Build Your Dream Resume in 3 Easy Steps
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`p-8 rounded-xl shadow-lg ${cardClasses}`}
          >
            <div className="mb-4">
              <span className={`text-5xl ${iconClasses}`}>📄</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Build Your Resume</h2>
            <ul
              className={`text-sm text-left mx-auto max-w-[220px] ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <li className="flex items-center gap-2">✓ Dynamic sections with live preview</li>
              <li className="flex items-center gap-2">✓ Multiple professional templates</li>
              <li className="flex items-center gap-2">✓ Easy-to-use editor</li>
            </ul>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`p-8 rounded-xl shadow-lg ${cardClasses}`}
          >
            <div className="mb-4">
              <span className={`text-5xl ${iconClasses}`}>🤖</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Enhance with AI</h2>
            <ul
              className={`text-sm text-left mx-auto max-w-[220px] ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <li className="flex items-center gap-2">✓ AI-generated professional summary</li>
              <li className="flex items-center gap-2">✓ Section-wise AI improvements</li>
              <li className="flex items-center gap-2">✓ ATS keyword optimization</li>
            </ul>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`p-8 rounded-xl shadow-lg ${cardClasses}`}
          >
            <div className="mb-4">
              <span className={`text-5xl ${iconClasses}`}>🚀</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Export & Share</h2>
            <ul
              className={`text-sm text-left mx-auto max-w-[220px] ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <li className="flex items-center gap-2">✓ Export as PDF with styling</li>
              <li className="flex items-center gap-2">✓ Multiple resume versions</li>
              <li className="flex items-center gap-2">✓ Shareable online resume link</li>
            </ul>
          </motion.div>
        </div>

        <motion.button
          onClick={onContinue}
          className="mt-12 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors duration-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
