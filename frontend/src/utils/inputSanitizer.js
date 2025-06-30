/**
 * INPUT SANITIZATION UTILITY
 * Enhanced text input security and validation
 */

/**
 * Sanitize text input to prevent XSS and other attacks
 */
export const sanitizeText = (text, options = {}) => {
  if (!text || typeof text !== 'string') return '';
  
  const config = {
    maxLength: 1000,
    allowHtml: false,
    allowNewlines: true,
    trimWhitespace: true,
    ...options
  };
  
  let sanitized = text;
  
  // Trim whitespace if enabled
  if (config.trimWhitespace) {
    sanitized = sanitized.trim();
  }
  
  // Check length
  if (sanitized.length > config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }
  
  // Remove potentially dangerous characters if HTML not allowed
  if (!config.allowHtml) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/&/g, '&amp;');
  }
  
  // Handle newlines
  if (!config.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
};

/**
 * Validate and sanitize user names
 */
export const sanitizeName = (name) => {
  if (!name) return '';
  
  // Remove potentially dangerous characters
  let sanitized = name
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /admin/i,
    /system/i,
    /null/i,
    /undefined/i,
    /script/i,
    /javascript/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      // Don't reject completely, just replace with safe alternative
      sanitized = sanitized.replace(pattern, '[Bruger]');
    }
  }
  
  return sanitized.substring(0, 50);
};

/**
 * Validate and sanitize item descriptions
 */
export const sanitizeItemDescription = (description) => {
  return sanitizeText(description, {
    maxLength: 500,
    allowHtml: false,
    allowNewlines: true,
    trimWhitespace: true
  });
};

/**
 * Validate and sanitize item titles
 */
export const sanitizeItemTitle = (title) => {
  return sanitizeText(title, {
    maxLength: 60,
    allowHtml: false,
    allowNewlines: false,
    trimWhitespace: true
  });
};

/**
 * Validate and sanitize chat messages
 */
export const sanitizeChatMessage = (message) => {
  return sanitizeText(message, {
    maxLength: 500,
    allowHtml: false,
    allowNewlines: true,
    trimWhitespace: true
  });
};

/**
 * Check for prohibited content
 */
export const containsProhibitedContent = (text) => {
  if (!text) return false;
  
  const prohibitedPatterns = [
    // Common spam patterns
    /\b(FREE|GRATIS)\s+(MONEY|PENGE)/i,
    /\b(CLICK\s+HERE|KLIK\s+HER)/i,
    /\b(www\.|http|\.com|\.dk)\b/i,
    
    // Inappropriate content flags
    /\b(sex|porn|drugs|våben)/i,
    
    // Phishing patterns
    /\b(password|adgangskode|login|bank)/i,
    
    // Excessive repetition
    /(.)\1{10,}/,
    /(.).*\1.*\1.*\1.*\1/i
  ];
  
  return prohibitedPatterns.some(pattern => pattern.test(text));
};

/**
 * Enhanced validation for bug reports
 */
export const sanitizeBugReport = (description) => {
  const sanitized = sanitizeText(description, {
    maxLength: 2000,
    allowHtml: false,
    allowNewlines: true,
    trimWhitespace: true
  });
  
  // Check if it contains useful information
  if (sanitized.length < 10) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Beskrivelsen er for kort. Beskriv venligst fejlen detaljeret.'
    };
  }
  
  return {
    isValid: true,
    sanitized,
    error: null
  };
};

/**
 * Safe URL validation (if ever needed)
 */
export const validateUrl = (url) => {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow specific protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Block local/private IPs
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1'
    ];
    
    if (blockedHosts.includes(hostname)) {
      return false;
    }
    
    // Block private IP ranges
    const privateIpPattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
    if (privateIpPattern.test(hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export default {
  sanitizeText,
  sanitizeName,
  sanitizeItemDescription,
  sanitizeItemTitle,
  sanitizeChatMessage,
  containsProhibitedContent,
  sanitizeBugReport,
  validateUrl
}; 