import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Add this import

export default function TemplatePage({ setActiveTemplate, onContinue, isDark }) {
  const navigate = useNavigate(); // Add this hook
  
  const containerClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const buttonClasses = 'w-full py-2 rounded-lg font-bold transition-colors duration-200 mt-4';

  const templateVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  const templates = [
    { id: 'simple', name: 'Simple', preview: 'A clean, straightforward resume layout.' },
    { id: 'professional', name: 'Professional', preview: 'A classic, elegant, and structured design.' },
    { id: 'creative', name: 'Creative', preview: 'A modern design with a unique style.' },
    { id: 'classic', name: 'Classic', preview: 'A simple, one-column layout for traditionalists.' },
  ];

  // Updated handler to navigate with template in URL
  const handleTemplateSelect = (templateId) => {
    console.log('🎯 Template selected:', templateId);
    setActiveTemplate(templateId);
    
    // Navigate to builder with template as query parameter
    // This ensures the builder receives the template even after page refresh
    navigate(`/builder?template=${templateId}`);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-300 ${containerClasses}`}>
      <motion.h1 
        className="text-4xl font-bold mt-8 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Templates we recommend for you
      </motion.h1>
      <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        You can always change your template later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {templates.map((template, index) => (
          <motion.div 
            key={template.id}
            variants={templateVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`border rounded-xl p-6 shadow-lg ${cardClasses}`}
          >
            <h2 className="text-xl font-bold mb-2">{template.name}</h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{template.preview}</p>
            <button 
              onClick={() => handleTemplateSelect(template.id)} // Updated handler
              className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700`}
            >
              Choose this template
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}