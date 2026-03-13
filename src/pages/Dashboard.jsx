import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Edit2, Eye, Trash2, FileText, Plus, Calendar, Clock, User } from 'lucide-react';
import ResumePreview from '../components/ResumePreview';

const Dashboard = ({ isDark }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchResumes(currentUser.uid);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchResumes = async (userId) => {
    try {
      setLoading(true);
      console.log('🔍 [DASHBOARD] Fetching resumes for user:', userId);
      
      const { data, error } = await supabase
        .from('resumes_firebase')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('✅ [DASHBOARD] Received resumes:', data?.length || 0);
      
      if (data && data.length > 0) {
        data.forEach((resume, index) => {
          console.log(`📄 Resume ${index + 1}:`, {
            id: resume.id,
            title: resume.title,
            template: resume.template,
            hasTitle: !!resume.title,
            titleLength: resume.title ? resume.title.length : 0
          });
        });
      }
      
      setResumes(data || []);
    } catch (err) {
      console.error('❌ [DASHBOARD] Error fetching resumes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      console.log('🗑️ [DASHBOARD] Deleting resume:', resumeId);
      const { error } = await supabase
        .from('resumes_firebase')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      console.log('✅ [DASHBOARD] Resume deleted');
      
      if (user) {
        fetchResumes(user.uid);
      }
    } catch (err) {
      console.error('❌ [DASHBOARD] Error deleting resume:', err);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateColor = (template) => {
    const colors = {
      simple: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      modern: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      professional: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      creative: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[template] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getPreviewData = (resume) => {
    return {
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
  };

  const refreshResumes = () => {
    if (user) {
      fetchResumes(user.uid);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Resumes</h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage and edit all your saved resumes
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={refreshResumes}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Refresh List
              </button>
              <Link
                to="/builder"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Plus size={20} />
                Create New Resume
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8`}>
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Resumes</p>
                  <p className="text-2xl font-bold">{resumes.length}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="text-green-600" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Created</p>
                  <p className="text-lg font-semibold">
                    {resumes[0] ? formatDate(resumes[0].created_at) : 'No resumes'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Account</p>
                  <p className="text-lg font-semibold truncate" title={user?.email}>
                    {user?.email || 'Not signed in'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Grid */}
        {error ? (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-red-900/20' : 'bg-red-50'} text-red-600`}>
            <p>Error loading resumes: {error}</p>
            <button
              onClick={refreshResumes}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : resumes.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <FileText size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold mb-2">No Resumes Yet</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your first resume to get started
            </p>
            <Link
              to="/builder"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus size={20} />
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-blue-900/20' 
                    : 'bg-white border border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <FileText className={isDark ? 'text-blue-400' : 'text-blue-600'} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg truncate" title={resume.title}>
                          {(() => {
                            if (resume.title && resume.title.trim() !== '') {
                              return resume.title;
                            }
                            return `Resume (${resume.template || 'simple'} template)`;
                          })()}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getTemplateColor(resume.template)}`}>
                            {(resume.template || 'Simple').charAt(0).toUpperCase() + (resume.template || 'Simple').slice(1)} Template
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(resume.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Created: {formatDate(resume.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Updated: {formatTime(resume.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* PREVIEW WITH ACTUAL TEMPLATE */}
                  {resume.resume_data && (
                    <div className={`mb-6 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} overflow-hidden`}>
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Preview ({resume.template || 'simple'} template)
                      </div>
                      <div className="relative" style={{ height: '180px', overflow: 'hidden' }}>
                        <div className="absolute top-0 left-0" style={{ 
                          transform: 'scale(0.35)', 
                          transformOrigin: 'top left',
                          width: '285.714%',
                          height: '285.714%'
                        }}>
                          <ResumePreview
                            resumeData={getPreviewData(resume)}
                            activeTemplate={resume.template}
                            isDark={isDark}
                            isForPrint={false}
                            fitToOnePage={false}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions - FIXED: Added template to edit URL */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/builder?edit=${resume.id}&template=${resume.template}`)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/preview/${resume.id}`)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      className={`p-2 rounded-lg transition-all ${
                        isDark
                          ? 'bg-red-900/20 hover:bg-red-800 text-red-400 hover:text-white'
                          : 'bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
                      }`}
                      title="Delete Resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;