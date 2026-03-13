import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider} from '../firebase';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

export default function Login({ isDark, onLogin, onLogout }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        onLogin(user);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const themeClasses = isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClasses = isDark
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500';

  // Save user data to Firestore
  const saveUserToFirestore = async (user, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || additionalData.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          ...additionalData
        });
      } else {
        // Update last login
        await setDoc(userRef, {
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await saveUserToFirestore(user);
      console.log('Google login successful:', user);
      onLogin(user);
    } catch (error) {
      console.error('Google login error:', error);
      setAuthError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Validation
    if (!formData.email || !formData.password) {
      setAuthError('Please enter both email and password');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setAuthError("Passwords don't match");
      return;
    }

    if (!isLogin && !formData.displayName) {
      setAuthError('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      let user;

      if (isLogin) {
        // Email Login
        const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        user = result.user;
        await saveUserToFirestore(user);
      } else {
        // Sign Up
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = result.user;
        
        // Update profile with display name
        if (formData.displayName) {
          await updateProfile(user, {
            displayName: formData.displayName
          });
        }

        await saveUserToFirestore(user, {
          displayName: formData.displayName
        });
      }

      console.log('Authentication successful:', user);
      onLogin(user);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      });
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      default:
        return error.message || 'Authentication failed. Please try again.';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (authError) setAuthError('');
  };

  // If user is already logged in, show profile with logout option
  if (currentUser) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${themeClasses} flex items-center justify-center p-4`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl ${cardClasses}`}
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className={`p-4 rounded-full ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <User className={isDark ? 'text-blue-400' : 'text-blue-600'} size={32} />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome, {currentUser.displayName || currentUser.email}!
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'} mb-6>
              You are successfully signed in.
            </p>
            <button
              onClick={onLogout}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Sign Out'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md border rounded-2xl p-8 shadow-2xl ${cardClasses}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
              <User className={isDark ? 'text-blue-400' : 'text-blue-600'} size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {isLogin ? 'Sign in to your account to continue' : 'Sign up to get started'}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
          >
            {authError}
          </motion.div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg font-medium transition-all duration-200 mb-6 ${
            isDark
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white'
              : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <>
              <FaGoogle size={20} />
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 border rounded-lg pr-10 ${inputClasses}`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 border rounded-lg ${inputClasses}`}
                required={!isLogin}
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login/Signup */}
        <div className="text-center mt-6">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  displayName: ''
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* REMOVED: Log Out button from login form */}
      </motion.div>
    </div>
  );
}