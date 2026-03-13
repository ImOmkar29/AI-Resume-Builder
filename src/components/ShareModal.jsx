import React, { useState } from 'react';
import { X, Copy, Mail, Check, Link as LinkIcon, Globe, Lock } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, resume, shareUrl, onTogglePublic }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isPublic, setIsPublic] = useState(resume?.is_public || false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublic = async () => {
    const newState = !isPublic;
    setIsPublic(newState);
    if (onTogglePublic) {
      await onTogglePublic(newState);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    
    // Create mailto link
    const subject = encodeURIComponent(`Resume: ${resume?.title || 'My Resume'}`);
    const body = encodeURIComponent(
      `Here's my resume: ${shareUrl}\n\n` +
      `You can view it online at the link above.`
    );
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
    setEmail('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Share Resume</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resume Title */}
          <div className="pb-2">
            <h3 className="font-medium text-gray-700">{resume?.title || 'Untitled Resume'}</h3>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={20} className="text-blue-600" />
              ) : (
                <Lock size={20} className="text-gray-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-700">
                  {isPublic ? 'Public' : 'Private'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isPublic 
                    ? 'Anyone with the link can view' 
                    : 'Only you can access this resume'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Public Link Section - Only show if public */}
          {isPublic && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <LinkIcon size={16} />
                Shareable Link
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 min-w-[90px] justify-center"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Anyone with this link can view your resume
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Sharing Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Share via Email
            </h3>
            <form onSubmit={handleSendEmail} className="space-y-3">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              {emailSent && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check size={14} />
                  Email client opened!
                </p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Send Email
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Opens your default email app
            </p>
          </div>

          {/* Info Message when Private */}
          {!isPublic && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Toggle to "Public" to generate a shareable link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;