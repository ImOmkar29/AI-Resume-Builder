import React, { useState, useEffect } from 'react';
import { Moon, Sun, ArrowLeft, User } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import IntroPage from './components/IntroPage';
import StartOptionPage from './components/StartOptionPage';
import TemplatePage from './components/TemplatePage';
import ResumeBuilder from './components/ResumeBuilder';
import Login from './components/Login';
import ResumePreviewPage from './pages/ResumePreviewPage';
import Dashboard from './pages/Dashboard';
import PublicSharePage from './pages/PublicSharePage'; // ADD THIS IMPORT

// Layout component with header and theme toggle
function Layout({ children, isDark, setIsDark, user, handleLogout, showBack = false, onBack, title }) {
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBack && (
              <button 
                onClick={onBack} 
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{user?.displayName || user?.email}</span>
            </div>

            {/* Dashboard Link - only show if not on dashboard */}
            {window.location.pathname !== '/dashboard' && (
              <button
                onClick={() => window.location.href = '/dashboard'}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                My Resumes
              </button>
            )}

            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={handleLogout} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : null;
}

// Main App Component with Routes
export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState('simple');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <Login 
          isDark={isDark} 
          onLogin={(user) => {
            setUser(user);
            navigate('/intro');
          }} 
        />
      } />

      {/* Public Share Route - NO AUTH REQUIRED */}
      <Route path="/resume/share/:shareId" element={<PublicSharePage />} />

      {/* Protected Routes */}
      <Route path="/intro" element={
        <ProtectedRoute>
          <Layout 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            handleLogout={handleLogout}
            title="Welcome"
          >
            <IntroPage 
              onContinue={() => navigate('/start')} 
              isDark={isDark} 
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/start" element={
        <ProtectedRoute>
          <Layout 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            handleLogout={handleLogout}
            showBack={true}
            onBack={() => navigate('/intro')}
            title="Start New Resume"
          >
            <StartOptionPage 
              onStartNew={() => navigate('/template')} 
              isDark={isDark} 
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/template" element={
        <ProtectedRoute>
          <Layout 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            handleLogout={handleLogout}
            showBack={true}
            onBack={() => navigate('/start')}
            title="Choose Template"
          >
            <TemplatePage
              isDark={isDark}
              onContinue={() => navigate('/builder')}
              setActiveTemplate={(template) => {
                console.log('🎯 Template selected:', template);
                setActiveTemplate(template);
              }}
            />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Builder route - for new resumes */}
      <Route path="/builder" element={
        <ProtectedRoute>
          <Layout 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            handleLogout={handleLogout}
            showBack={true}
            onBack={() => navigate('/template')}
            title="Resume Builder"
          >
            <ResumeBuilder
              isDark={isDark}
              activeTemplate={activeTemplate}
              user={user}
            />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Edit route - with ID parameter */}
      <Route path="/builder" element={
        <ProtectedRoute>
          <Layout 
            isDark={isDark} 
            setIsDark={setIsDark} 
            user={user} 
            handleLogout={handleLogout}
            showBack={true}
            onBack={() => navigate('/dashboard')}
            title="Edit Resume"
          >
            <ResumeBuilder
              isDark={isDark}
              activeTemplate={activeTemplate}
              user={user}
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/preview" element={
        <ProtectedRoute>
          <ResumePreviewPage isDark={isDark} />
        </ProtectedRoute>
      } />

      <Route path="/preview/:id" element={
        <ProtectedRoute>
          <ResumePreviewPage isDark={isDark} />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard isDark={isDark} />
        </ProtectedRoute>
      } />

      {/* Redirect root to appropriate page */}
      <Route path="/" element={
        user ? <Navigate to="/intro" /> : <Navigate to="/login" />
      } />
    </Routes>
  );
}