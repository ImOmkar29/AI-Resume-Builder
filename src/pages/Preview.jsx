import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header';
import ResumePreview from './ResumePreview'; // IMPORT THE COMPONENT
import '../styles/Preview.css';

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchResume(currentUser.uid);
      } else {
        setError('Please login to view resume');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const fetchResume = async (userId) => {
    try {
      setLoading(true);
      console.log('🔍 [PREVIEW] Fetching resume:', { id, userId });
      
      const { data, error } = await supabase
        .from('resumes_firebase')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      console.log('✅ [PREVIEW] Resume loaded:', {
        id: data.id,
        title: data.title,
        template: data.template,
        resume_data: data.resume_data,
        is_dark: data.is_dark
      });
      
      setResume(data);
    } catch (err) {
      console.error('❌ [PREVIEW] Error:', err);
      setError('Resume not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="preview-container">
        <Header />
        <div className="loading">Loading preview...</div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="preview-container">
        <Header />
        <div className="error-container">
          <h2>Resume Not Found</h2>
          <p>{error || 'The requested resume could not be loaded.'}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Convert database structure to component structure
  const previewData = {
    fullName: resume.resume_data?.basics?.name || '',
    jobTitle: resume.resume_data?.basics?.title || '',
    email: resume.resume_data?.basics?.email || '',
    phone: resume.resume_data?.basics?.phone || '',
    location: resume.resume_data?.basics?.location || '',
    summary: resume.resume_data?.basics?.summary || '',
    skills: resume.resume_data?.skills || [],
    experiences: resume.resume_data?.work || [],
    educations: resume.resume_data?.education || [],
    projects: resume.resume_data?.projects || [],
    certifications: resume.resume_data?.certifications || [],
    customSections: resume.resume_data?.customSections || [],
    profileImage: resume.resume_data?.profileImage || null,
  };

  return (
    <div className="preview-container">
      <Header />
      
      <div className="preview-controls">
        <button onClick={() => navigate('/dashboard')} className="control-btn">
          ← Back to Dashboard
        </button>
        <button onClick={() => navigate(`/builder?edit=${id}`)} className="control-btn edit">
          Edit Resume
        </button>
        <button onClick={handlePrint} className="control-btn print">
          Print / Save as PDF
        </button>
      </div>

      <div className="preview-content">
        {/* Resume Title Header */}
        <div className="preview-header">
          <h2 className="resume-title-display">{resume.title || 'Untitled Resume'}</h2>
          <div className="template-info">
            <span className="template-badge">
              Template: {(resume.template || 'simple').charAt(0).toUpperCase() + (resume.template || 'simple').slice(1)}
            </span>
            {resume.is_dark && <span className="dark-mode-badge">Dark Mode</span>}
          </div>
        </div>

        {/* USE THE ACTUAL RESUME PREVIEW COMPONENT */}
        <div className="resume-display-wrapper">
          <ResumePreview
            resumeData={previewData}
            activeTemplate={resume.template || 'simple'}
            isDark={resume.is_dark || false}
            isForPrint={true}
            fitToOnePage={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;