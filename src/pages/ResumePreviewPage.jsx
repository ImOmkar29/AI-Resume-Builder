import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react';
import ResumePreview from '../components/ResumePreview';
import ShareModal from '../components/ShareModal';
import { generateShareId, getShareUrl } from '../utils/shareUtils';
import { supabase } from '../lib/supabase';

export default function ResumePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlResumeId } = useParams(); // Get ID from URL if present
  
  // Get data from navigation state or localStorage
  const [resumeData, setResumeData] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState('simple');
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sharing states
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareId, setShareId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saveResumeName, setSaveResumeName] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setLoading(true);
        
        // First try to get from navigation state (from builder)
        if (location.state) {
          const { resumeData: stateResumeData, activeTemplate: stateTemplate } = location.state;
          if (stateResumeData) {
            setResumeData(stateResumeData);
            console.log('📄 Preview data from navigation state');
          }
          if (stateTemplate) {
            setActiveTemplate(stateTemplate);
            console.log('🎯 Template from navigation state:', stateTemplate);
          }
          setLoading(false);
          return;
        }
        
        // If we have a resume ID in the URL, fetch from database
        if (urlResumeId) {
          console.log('🔍 Fetching resume for preview:', urlResumeId);
          
          const { data, error } = await supabase
            .from('resumes_firebase')
            .select('*')
            .eq('id', urlResumeId)
            .single();

          if (error) throw error;

          if (data) {
            console.log('✅ Resume fetched:', {
              id: data.id,
              title: data.title,
              template: data.template,
              share_id: data.share_id,
              is_public: data.is_public
            });
            
            // Convert database structure to component structure
            const dbData = data.resume_data || {};
            
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
            
            // CRITICAL: Use the template from the saved resume
            if (data.template) {
              console.log('🎯 Setting template from saved resume:', data.template);
              setActiveTemplate(data.template);
            }
            
            // Also get theme if saved
            if (data.is_dark !== undefined) setIsDark(data.is_dark);
            
            // Set sharing data
            setCurrentResumeId(data.id);
            setSaveResumeName(data.title || 'Resume');
            if (data.share_id) setShareId(data.share_id);
            if (data.is_public !== undefined) setIsPublic(data.is_public);
          }
          setLoading(false);
          return;
        }
        
        // Fallback to localStorage (for page refresh or direct access)
        try {
          const savedData = localStorage.getItem('resumeData');
          const savedTemplate = localStorage.getItem('activeTemplate');
          const savedTheme = localStorage.getItem('isDarkMode');
          
          if (savedData) {
            setResumeData(JSON.parse(savedData));
            console.log('📄 Preview data from localStorage');
          }
          if (savedTemplate) {
            setActiveTemplate(savedTemplate);
            console.log('🎯 Template from localStorage:', savedTemplate);
          }
          if (savedTheme) setIsDark(JSON.parse(savedTheme));
        } catch (error) {
          console.error("Failed to load data from storage:", error);
        }
      } catch (error) {
        console.error('❌ Error loading preview:', error);
        setError('Failed to load resume preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, [location.state, urlResumeId]);

  // Handle share resume
  const handleShareResume = async () => {
    if (!currentResumeId) {
      alert('Please save the resume first before sharing');
      return;
    }

    try {
      // If resume already has shareId, use it
      if (shareId) {
        setShowShareModal(true);
        return;
      }

      // Generate new shareId
      const newShareId = generateShareId();
      
      // Update database
      const { error } = await supabase
        .from('resumes_firebase')
        .update({ 
          share_id: newShareId,
          is_public: true 
        })
        .eq('id', currentResumeId);

      if (error) throw error;

      setShareId(newShareId);
      setIsPublic(true);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error enabling sharing:', error);
      alert('Failed to enable sharing. Please try again.');
    }
  };

  // Handle toggle public/private
  const handleTogglePublic = async (newState) => {
    try {
      const { error } = await supabase
        .from('resumes_firebase')
        .update({ is_public: newState })
        .eq('id', currentResumeId);

      if (error) throw error;
      setIsPublic(newState);
    } catch (error) {
      console.error('Error toggling public status:', error);
      alert('Failed to update sharing settings');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger browser print dialog for PDF download
    window.print();
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Show loading while data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume preview...</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show error if something went wrong
  if (error || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error || 'Could not load resume'}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header with controls */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Resume Preview</h1>
              <p className="text-gray-600 text-sm">
                Template: <span className="font-medium capitalize">{activeTemplate}</span>
                {urlResumeId && <span className="ml-2 text-xs text-gray-400">ID: {urlResumeId}</span>}
                {isPublic && <span className="ml-2 text-xs text-green-600">• Public</span>}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Share Button - NEW */}
            <button
              onClick={handleShareResume}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <Share2 size={20} />
              Share
            </button>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <Download size={20} />
              Download PDF
            </button>
            
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
            >
              <Printer size={20} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview Container */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm border">
          <div className="flex items-center justify-center">
            <div className="resume-a4-container">
              <ResumePreview
                resumeData={resumeData}
                activeTemplate={activeTemplate}
                isDark={isDark}
              />
            </div>
          </div>
          
          {/* Template info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Current Template:</strong> <span className="font-medium capitalize">{activeTemplate}</span>
              {urlResumeId && <span className="ml-2">• Resume ID: {urlResumeId}</span>}
              {isPublic && shareId && (
                <span className="ml-2 text-green-600">• Share ID: {shareId}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        resume={{ 
          title: saveResumeName || 'Resume',
          is_public: isPublic 
        }}
        shareUrl={shareId ? getShareUrl(shareId) : ''}
        onTogglePublic={handleTogglePublic}
      />

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-a4-container,
          .resume-a4-container * {
            visibility: visible;
          }
          .resume-a4-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}