import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Globe, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ResumePreview from '../components/ResumePreview';

export default function PublicSharePage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resume, setResume] = useState(null);
  const [template, setTemplate] = useState('simple');
  const [isDark, setIsDark] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');

  useEffect(() => {
    const fetchSharedResume = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Fetching shared resume with ID:', shareId);
        
        const { data, error } = await supabase
          .from('resumes_firebase')
          .select('*')
          .eq('share_id', shareId)
          .eq('is_public', true)
          .single();

        if (error) {
          console.error('Database error:', error);
          throw new Error('Resume not found');
        }

        if (!data) {
          setError('Resume not found or not shared');
          return;
        }

        console.log('✅ Shared resume fetched:', {
          id: data.id,
          title: data.title,
          template: data.template
        });

        // Convert database structure to component structure
        const dbData = data.resume_data || {};
        
        setResume({
          fullName: dbData?.basics?.name || dbData?.fullName || 'Anonymous',
          jobTitle: dbData?.basics?.title || dbData?.jobTitle || 'Professional',
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
        
        setTemplate(data.template || 'simple');
        setIsDark(data.is_dark || false);
        setResumeTitle(data.title || 'Shared Resume');
      } catch (err) {
        console.error('❌ Error fetching shared resume:', err);
        setError('This resume is not available or the link is invalid');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedResume();
    } else {
      setError('Invalid share link');
      setLoading(false);
    }
  }, [shareId]);

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading shared resume...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the resume</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Resume Not Available</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This resume is private or does not exist'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 font-medium"
            >
              <ArrowLeft size={20} />
              Go to Home
            </button>
            <p className="text-xs text-gray-400">
              The resume owner may have made it private or the link is incorrect
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                Home
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Globe size={20} className="text-blue-600" />
                  Shared Resume
                </h1>
                <p className="text-sm text-gray-500">
                  {resumeTitle} • {template.charAt(0).toUpperCase() + template.slice(1)} Template
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Eye size={16} />
                Read Only
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Globe size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">You're viewing a shared resume</p>
              <p className="text-blue-600 text-sm">
                This resume has been shared publicly. You can view it but cannot make changes.
              </p>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="bg-white rounded-xl p-6 md:p-10 shadow-lg border">
          <div className="flex items-center justify-center">
            <div className="resume-a4-container" style={{ maxWidth: '210mm', margin: '0 auto' }}>
              <ResumePreview
                resumeData={resume}
                activeTemplate={template}
                isDark={isDark}
              />
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>Shared via public link</span>
              </div>
              <div>
                <span>Share ID: {shareId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles - for if someone tries to print */}
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