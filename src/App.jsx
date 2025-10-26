import React, { useState, useEffect } from 'react';
import { Moon, Sun, ArrowLeft, Download } from 'lucide-react';
import IntroPage from './components/IntroPage';
import StartOptionPage from './components/StartOptionPage';
import TemplatePage from './components/TemplatePage';
import ResumeBuilder from './components/ResumeBuilder';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [step, setStep] = useState('intro');
  const [activeTemplate, setActiveTemplate] = useState('simple');

  useEffect(() => {
    // This effect handles the browser's back/forward buttons
    const handlePopState = (event) => {
      if (event.state && event.state.step) {
        setStep(event.state.step);
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNextPage = () => {
    let nextStep;
    switch (step) {
      case 'intro':
        nextStep = 'start';
        break;
      case 'start':
        nextStep = 'template';
        break;
      case 'template':
        nextStep = 'builder';
        break;
      default:
        return;
    }
    window.history.pushState({ step: nextStep }, '', `#${nextStep}`);
    setStep(nextStep);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return <IntroPage onContinue={handleNextPage} isDark={isDark} />;
      case 'start':
        return <StartOptionPage onStartNew={handleNextPage} onUpload={() => { /* Handle upload logic */ }} isDark={isDark} />;
      case 'template':
        return <TemplatePage setActiveTemplate={(template) => { setActiveTemplate(template); handleNextPage(); }} isDark={isDark} />;
      case 'builder':
        return <ResumeBuilder isDark={isDark} activeTemplate={activeTemplate} />;
      default:
        return <IntroPage onContinue={handleNextPage} isDark={isDark} />;
    }
  };

  const themeClasses = isDark
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <div className={`border-b transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {(step !== 'intro') && (
              <button onClick={handleBack} className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold">Resume Builder</h1>
          </div>
          {/* <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {step === 'builder' && (
              <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2">
                <Download size={16} /> 
              </button>
            )}
          </div> */}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
}
