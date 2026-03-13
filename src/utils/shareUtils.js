/**
 * Generate a unique share ID for public resume links
 * Creates a short, URL-friendly ID (8 characters)
 */
export const generateShareId = () => {
  // Use Web Crypto API if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Take first 8 chars of UUID for shorter URL
    return crypto.randomUUID().substring(0, 8);
  }
  
  // Fallback for older browsers
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate the full shareable URL
 * @param {string} shareId - The unique share ID
 * @returns {string} Full URL to shared resume
 */
export const getShareUrl = (shareId) => {
  if (!shareId) return '';
  return `${window.location.origin}/resume/share/${shareId}`;
};

/**
 * Validate if a string looks like a valid share ID
 * @param {string} shareId - The share ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidShareId = (shareId) => {
  // Share IDs are 8 characters, alphanumeric
  return /^[a-z0-9]{8}$/.test(shareId);
};