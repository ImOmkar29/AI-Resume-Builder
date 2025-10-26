import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import axios from 'axios';

export default function ResumeUpload({ onComplete, onBack, isDark }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Results

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const containerClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  // Upload and process resume
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setStep(2);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post(`${API_URL}/api/uploadResume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      });

      if (response.data.success) {
        setExtractedData(response.data.extractedData);
        setAiSuggestions(response.data.aiSuggestions);
        setStep(3);
      } else {
        throw new Error(response.data.error || 'Failed to process resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to process resume. Please try again.';
      setError(errorMessage);
      setStep(1);
    } finally {
      setUploading(false);
    }
  };

  // Apply AI suggestion to a field
  const applySuggestion = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Remove applied suggestion
    setAiSuggestions(prev => ({
      ...prev,
      [field]: null
    }));
  };

  // Continue to editor with extracted data
  const handleContinue = () => {
    if (extractedData) {
      onComplete(extractedData);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3b82f6';
    e.currentTarget.style.background = isDark ? '#1f2937' : '#eff6ff';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = isDark ? '#374151' : '#e5e7eb';
    e.currentTarget.style.background = isDark ? '#1f2937' : '#f9fafb';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = isDark ? '#374151' : '#e5e7eb';
    e.currentTarget.style.background = isDark ? '#1f2937' : '#f9fafb';
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClasses} p-4 sm:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className={`flex items-center gap-2 mb-4 ${textSecondary} hover:text-blue-500 transition-colors`}
          >
            <ArrowLeft size={20} />
            Back to Options
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Resume Improver</h1>
          <p className={textSecondary}>
            Upload your resume and let AI extract, enhance, and optimize your content
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              }`}
            >
              <AlertCircle size={20} className="text-red-500" />
              <span className="text-red-500 text-sm">{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X size={18} className="text-red-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload/Results */}
          <div className="lg:col-span-2">
            <motion.div
              className={`border-2 rounded-xl p-6 shadow-lg ${cardClasses}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Upload */}
                {step === 1 && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
                    
                    {!file ? (
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <div
                          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                            isDark ? 'border-gray-600 bg-gray-900/50 hover:border-blue-500' : 'border-gray-300 bg-gray-50 hover:border-blue-500'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <Upload size={48} className="mx-auto mb-4 text-blue-500" />
                          <h3 className="text-xl font-bold mb-2">Drop your resume here</h3>
                          <p className={`mb-4 ${textSecondary}`}>or click to browse</p>
                          <p className={`text-sm ${textMuted}`}>
                            Supports PDF, DOC, DOCX, TXT (Max 10MB)
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className={`border-2 rounded-xl p-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                          <FileText size={40} className="text-blue-500" />
                          <div className="flex-1">
                            <h3 className="font-semibold">{file.name}</h3>
                            <p className={`text-sm ${textMuted}`}>
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => setFile(null)}
                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Sparkles size={20} />
                          )}
                          {uploading ? 'Processing...' : 'Process with AI'}
                        </button>
                      </div>
                    )}
                    
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </motion.div>
                )}

                {/* Step 2: Processing */}
                {step === 2 && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                    <h3 className="text-xl font-bold mb-2">AI is Processing Your Resume...</h3>
                    <p className={textSecondary}>
                      Extracting content and generating improvements
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className={`h-2 bg-gray-200 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : ''}`}>
                        <div 
                          className="h-full bg-blue-500 rounded-full animate-pulse"
                          style={{ width: '70%' }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">Analyzing content structure...</p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Results */}
                {step === 3 && extractedData && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle size={24} className="text-green-500" />
                      <h2 className="text-xl font-bold">Resume Processed Successfully</h2>
                    </div>

                    {/* Extracted Data Preview */}
                    <div className="space-y-4 mb-6">
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-2">Personal Information</h3>
                        <div className="text-sm space-y-1">
                          <p><strong>Name:</strong> {extractedData.fullName || 'Not detected'}</p>
                          <p><strong>Title:</strong> {extractedData.jobTitle || 'Not detected'}</p>
                          <p><strong>Email:</strong> {extractedData.email || 'Not detected'}</p>
                          <p><strong>Phone:</strong> {extractedData.phone || 'Not detected'}</p>
                          <p><strong>Location:</strong> {extractedData.location || 'Not detected'}</p>
                        </div>
                      </div>

                      {extractedData.summary && (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2">Summary</h3>
                          <p className="text-sm">{extractedData.summary}</p>
                        </div>
                      )}

                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2">Skills ({extractedData.skills.length})</h3>
                          <div className="flex flex-wrap gap-2">
                            {extractedData.skills.slice(0, 10).map((skill, index) => (
                              <span key={index} className={`px-3 py-1 rounded-full text-xs ${
                                isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {skill}
                              </span>
                            ))}
                            {extractedData.skills.length > 10 && (
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                +{extractedData.skills.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {extractedData.experiences && extractedData.experiences.length > 0 && (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2">Experience ({extractedData.experiences.length})</h3>
                          {extractedData.experiences.slice(0, 2).map((exp, index) => (
                            <div key={index} className="text-sm mb-3 last:mb-0">
                              <p className="font-medium">{exp.jobTitle || 'Position'} at {exp.company || 'Company'}</p>
                              {exp.duration && <p className={textMuted}>{exp.duration}</p>}
                              {exp.description && (
                                <p className="mt-1 text-xs line-clamp-2">{exp.description}</p>
                              )}
                            </div>
                          ))}
                          {extractedData.experiences.length > 2 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +{extractedData.experiences.length - 2} more experiences
                            </p>
                          )}
                        </div>
                      )}

                      {extractedData.educations && extractedData.educations.length > 0 && (
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <h3 className="font-semibold mb-2">Education ({extractedData.educations.length})</h3>
                          {extractedData.educations.slice(0, 2).map((edu, index) => (
                            <div key={index} className="text-sm mb-2 last:mb-0">
                              <p className="font-medium">{edu.degree || 'Degree'}</p>
                              <p className={textMuted}>{edu.university || 'Institution'}</p>
                              {edu.year && <p className="text-xs">{edu.year}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleContinue}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={20} />
                      Continue to Editor
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Panel - AI Suggestions */}
          {step === 3 && aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border-2 rounded-xl p-6 shadow-lg ${cardClasses} lg:sticky lg:top-8 h-fit`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-purple-500" />
                <h2 className="text-lg font-bold">AI Suggestions</h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(aiSuggestions).map(([field, suggestion]) => 
                  suggestion && (
                    <motion.div 
                      key={field}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        isDark ? 'bg-purple-900/10 border-purple-800' : 'bg-purple-50 border-purple-200'
                      }`}
                    >
                      <h3 className="font-semibold text-sm mb-2 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm mb-3">{suggestion}</p>
                      <button
                        onClick={() => applySuggestion(field, suggestion)}
                        className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} />
                        Apply Suggestion
                      </button>
                    </motion.div>
                  )
                )}

                {Object.values(aiSuggestions).filter(s => s).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-gray-500">All suggestions applied! Your resume looks great.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Processing Tips */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
              <FileText size={24} className="mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold text-sm">Text Extraction</h4>
              <p className="text-xs text-gray-500 mt-1">AI extracts text from your resume with high accuracy</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
              <Sparkles size={24} className="mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold text-sm">Smart Parsing</h4>
              <p className="text-xs text-gray-500 mt-1">Intelligently identifies sections and content structure</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white border'}`}>
              <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold text-sm">Quality Improvements</h4>
              <p className="text-xs text-gray-500 mt-1">Suggests enhancements for better impact</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}