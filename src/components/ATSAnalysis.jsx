import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Eye
} from 'lucide-react';

// Gauge component for the ATS score
const ATSScoreGauge = ({ score, isDark }) => {
  const getScoreColor = () => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 60) return '#facc15'; // yellow-400
    return '#ef4444'; // red-500
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center w-28 h-28">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className={isDark ? "text-gray-700" : "text-gray-200"}
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <motion.circle
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={getScoreColor()}
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color: getScoreColor() }}>
          {score}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
      </div>
    </div>
  );
};

// Function to normalize text for comparison
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .trim();
};

// Function to check if keyword exists in text (case-insensitive, whole word matching)
const keywordExists = (keyword, text) => {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  
  // Create a regex pattern for whole word matching
  const pattern = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return pattern.test(normalizedText);
};

// Function to calculate ATS score considering both summary and skills
const calculateATSScore = (atsResult, resumeData) => {
  if (!atsResult || !resumeData) return atsResult;
  
  // Combine summary and skills for keyword analysis
  const summaryText = resumeData.summary || '';
  const skillsText = Array.isArray(resumeData.skills) 
    ? resumeData.skills.join(' ')
    : resumeData.skills || '';
  
  const combinedText = `${summaryText} ${skillsText}`;
  
  console.log('Combined text for analysis:', combinedText);
  console.log('Original missing keywords:', atsResult.missing_keywords);
  
  // If we have missing keywords, check if they exist in combined text (summary + skills)
  if (Array.isArray(atsResult.missing_keywords)) {
    const updatedMissingKeywords = atsResult.missing_keywords.filter(keyword => {
      const exists = !keywordExists(keyword, combinedText);
      console.log(`Keyword "${keyword}" exists in combined text: ${!exists}`);
      return exists;
    });
    
    console.log('Updated missing keywords:', updatedMissingKeywords);
    
    // Recalculate score based on found keywords in both summary and skills
    const totalKeywords = (atsResult.missing_keywords.length || 0) + (atsResult.found_keywords?.length || 0);
    const foundKeywords = totalKeywords - updatedMissingKeywords.length;
    const keywordScore = totalKeywords > 0 ? Math.round((foundKeywords / totalKeywords) * 40) : 0;
    
    // Update the breakdown with new keyword score
    const updatedBreakdown = {
      ...atsResult.breakdown,
      keyword_match: keywordScore
    };
    
    // Recalculate total score
    const totalScore = Object.values(updatedBreakdown).reduce((sum, score) => sum + score, 0);
    
    return {
      ...atsResult,
      total_score: totalScore,
      breakdown: updatedBreakdown,
      missing_keywords: updatedMissingKeywords,
      found_keywords: Array.isArray(atsResult.found_keywords) 
        ? atsResult.found_keywords 
        : []
    };
  }
  
  return atsResult;
};

// Main ATS Analysis Component
export default function ATSAnalysis({ atsResult, isLoading, isDark, resumeData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate enhanced ATS score considering skills
  const enhancedATSResult = calculateATSScore(atsResult, resumeData);

  // Loading state
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-4 p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin h-6 w-6 border-b-2 border-purple-600 rounded-full"></div>
          <span className="text-sm font-medium">Analyzing ATS compatibility...</span>
        </div>
      </motion.div>
    );
  }

  // Don't render if no result or hidden
  if (!enhancedATSResult || !isVisible) {
    return null;
  }

  const getScoreColor = (score, maxScore = 100) => {
    const percentage = maxScore === 100 ? score : (score / maxScore) * 100;
    if (percentage >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (percentage >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getScoreIcon = (score, maxScore = 100) => {
    const percentage = maxScore === 100 ? score : (score / maxScore) * 100;
    if (percentage >= 80) return <CheckCircle size={16} className="text-green-500" />;
    if (percentage >= 60) return <AlertCircle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`mt-4 rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {/* Header with score preview and controls */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ATSScoreGauge score={enhancedATSResult.total_score} isDark={isDark} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-600" />
                <h4 className="font-bold text-lg">ATS Analysis</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  enhancedATSResult.total_score >= 80 ? 
                    (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                  enhancedATSResult.total_score >= 60 ? 
                    (isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                    (isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                }`}>
                  {enhancedATSResult.total_score >= 80 ? 'Excellent' : 
                   enhancedATSResult.total_score >= 60 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {enhancedATSResult.recommendation || "Your resume has been analyzed for ATS compatibility."}
              </p>
              {/* <p className="text-xs text-purple-600 mt-1 font-medium">
                ✓ Considering both summary and skills sections
              </p> */}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Eye size={14} />
              {isExpanded ? 'Less' : 'Details'}
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Hide analysis"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`border-t p-4 space-y-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              
              {/* Score Breakdown */}
              {enhancedATSResult.breakdown && (
                <div>
                  <h5 className="font-semibold flex items-center gap-2 mb-3">
                    <BarChart3 size={16} />
                    Score Breakdown
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(enhancedATSResult.breakdown).map(([key, value], index) => {
                      const maxScores = {
                        keyword_match: 40,
                        relevance: 30,
                        clarity: 20,
                        ats_friendliness: 10
                      };
                      const maxScore = maxScores[key] || 25;
                      const percentage = (value / maxScore) * 100;
                      
                      return (
                        <div key={index} className={`p-3 rounded border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              {getScoreIcon(value, maxScore)}
                              <span className="text-sm font-medium capitalize">
                                {key.replace('_', ' ')}
                              </span>
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(value, maxScore)}`}>
                              {value}/{maxScore}
                            </span>
                          </div>
                          <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-1.5 rounded-full ${
                                percentage >= 80 ? 'bg-green-500' :
                                percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {Array.isArray(enhancedATSResult.missing_keywords) && enhancedATSResult.missing_keywords.length > 0 && (
                <div>
                  <h5 className="font-semibold flex items-center gap-2 mb-3">
                    <Target size={16} className="text-orange-500" />
                    Missing Keywords ({enhancedATSResult.missing_keywords.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {enhancedATSResult.missing_keywords.slice(0, 12).map((keyword, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isDark 
                            ? 'bg-orange-900/30 text-orange-300 border border-orange-700' 
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                  {enhancedATSResult.missing_keywords.length > 12 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{enhancedATSResult.missing_keywords.length - 12} more keywords not shown
                    </p>
                  )}
                </div>
              )}

              {/* Recommendation */}
              {enhancedATSResult.recommendation && (
                <div className={`p-3 rounded border-l-4 ${
                  enhancedATSResult.total_score >= 80 ?
                    (isDark ? 'bg-green-900/20 border-green-500 text-green-300' : 'bg-green-50 border-green-400 text-green-800') :
                  enhancedATSResult.total_score >= 60 ?
                    (isDark ? 'bg-yellow-900/20 border-yellow-500 text-yellow-300' : 'bg-yellow-50 border-yellow-400 text-yellow-800') :
                    (isDark ? 'bg-blue-900/20 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-400 text-blue-800')
                }`}>
                  <h5 className="font-semibold mb-2 text-sm">Recommendation</h5>
                  <p className="text-sm leading-relaxed">{enhancedATSResult.recommendation}</p>
                </div>
              )}

              {/* Quick tips */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="font-medium mb-1">💡 Quick Tips:</p>
                <ul className="space-y-1 text-xs opacity-75">
                  <li>• Scores 80+ are excellent for most ATS systems</li>
                  <li>• Include missing keywords naturally in your content</li>
                  <li>• Use standard formatting and avoid complex layouts</li>
                  {/* <li>• Keywords in both summary and skills sections are considered</li> */}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}