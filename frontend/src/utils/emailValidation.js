/**
 * Comprehensive Email Validation Utility
 * Goes beyond basic regex to validate real email domains
 */

// Common legitimate email providers (top domains)
const LEGITIMATE_DOMAINS = [
  // Major providers
  'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com',
  'protonmail.com', 'aol.com', 'live.com', 'msn.com', 'yahoo.co.uk',
  
  // Danish providers (since this is a Danish app)
  'jubii.dk', 'post.dk', 'ofir.dk', 'stofanet.dk', 'tdc.dk', 'webspeed.dk',
  'mail.dk', 'spray.dk', 'get2net.dk', 'sol.dk',
  
  // European providers
  'web.de', 'gmx.de', 't-online.de', 'freenet.de', 'mail.ru',
  'yandex.com', 'orange.fr', 'wanadoo.fr', 'libero.it', 'virgilio.it',
  
  // Business/Education domains patterns
  'edu', 'ac.uk', 'edu.au', 'edu.dk', 'gov', 'mil',
  
  // Other legitimate providers
  'zoho.com', 'fastmail.com', 'tutanota.com', 'hey.com'
];

// Known disposable/temporary email services
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
  'maildrop.cc', 'sharklasers.com', 'guerrillamail.de', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'spam4.me', 'grr.la',
  'guerrillamailblock.com', 'pokemail.net', 'spamgourmet.com',
  'mailnesia.com', 'trashmail.com', '33mail.com', 'emailondeck.com',
  'fakeinbox.com', 'tempail.com', 'tempr.email', 'dispostable.com',
  'mohmal.com', 'emkei.cf', 'thankyou2010.com', 'trash-mail.com',
  'mytrashmail.com', 'tempinbox.com', 'temporarymail.com'
];

// Common TLDs that are often used for legitimate emails
const LEGITIMATE_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  // Country codes
  'dk', 'se', 'no', 'fi', 'de', 'uk', 'fr', 'it', 'es', 'nl', 'be',
  'ca', 'au', 'nz', 'jp', 'br', 'in', 'ch', 'at', 'pl', 'ru'
];

/**
 * Basic email format validation
 */
const isValidEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Extract domain from email
 */
const getDomainFromEmail = (email) => {
  return email.split('@')[1]?.toLowerCase();
};

/**
 * Check if domain is a known legitimate provider
 */
const isLegitmateDomain = (domain) => {
  // Direct match
  if (LEGITIMATE_DOMAINS.includes(domain)) {
    return true;
  }
  
  // Check if it's a subdomain of a legitimate domain
  for (const legitDomain of LEGITIMATE_DOMAINS) {
    if (domain.endsWith('.' + legitDomain)) {
      return true;
    }
  }
  
  // Check if it has a legitimate TLD and reasonable structure
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const tld = parts[parts.length - 1];
    const sld = parts[parts.length - 2];
    
    // Must have legitimate TLD and reasonable second-level domain
    if (LEGITIMATE_TLDS.includes(tld) && sld.length >= 2) {
      // Additional checks for business domains
      if (tld === 'com' || tld === 'org' || tld === 'net') {
        // Allow if it looks like a real business domain
        return sld.length >= 3 && !/^(test|fake|temp|spam|mail|email)/.test(sld);
      }
      return true;
    }
  }
  
  return false;
};

/**
 * Check if domain is a disposable email service
 */
const isDisposableDomain = (domain) => {
  return DISPOSABLE_DOMAINS.includes(domain);
};

/**
 * Check for suspicious patterns
 */
const hasSuspiciousPatterns = (email) => {
  const suspiciousPatterns = [
    /test.*@/i,
    /fake.*@/i,
    /spam.*@/i,
    /temp.*@/i,
    /throw.*away.*@/i,
    /disposable.*@/i,
    /@.*test/i,
    /@.*fake/i,
    /@.*temp/i,
    /@.*spam/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(email));
};

/**
 * Comprehensive email validation
 */
export const validateEmail = (email) => {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic format check
  if (!isValidEmailFormat(trimmedEmail)) {
    return {
      isValid: false,
      reason: 'INVALID_FORMAT',
      message: 'Indtast en gyldig email-adresse (f.eks. din@email.dk)'
    };
  }
  
  const domain = getDomainFromEmail(trimmedEmail);
  
  if (!domain) {
    return {
      isValid: false,
      reason: 'NO_DOMAIN',
      message: 'Email-adressen mangler et gyldigt domæne'
    };
  }
  
  // Check for disposable emails
  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      reason: 'DISPOSABLE_EMAIL',
      message: 'Midlertidige email-adresser er ikke tilladt. Brug venligst din rigtige email.'
    };
  }
  
  // Check for suspicious patterns
  if (hasSuspiciousPatterns(trimmedEmail)) {
    return {
      isValid: false,
      reason: 'SUSPICIOUS_PATTERN',
      message: 'Denne email-adresse ser ikke ægte ud. Brug venligst din rigtige email.'
    };
  }
  
  // Check if domain is legitimate
  if (!isLegitmateDomain(domain)) {
    return {
      isValid: false,
      reason: 'UNKNOWN_DOMAIN',
      message: 'Dette email-domæne genkendes ikke. Kontroller venligst din email-adresse.'
    };
  }
  
  return {
    isValid: true,
    reason: 'VALID',
    message: 'Email-adresse er gyldig'
  };
};

/**
 * Simple email format check (for backwards compatibility)
 */
export const isValidEmail = (email) => {
  const result = validateEmail(email);
  return result.isValid;
}; 