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
  const parts = domain.split('.');

  // Ensure the domain has at least two parts (e.g., second-level domain and TLD)
  if (parts.length < 2) {
    return false;
  }

  const tld = parts[parts.length - 1];
  const sld = parts[parts.length - 2];

  // Check if the domain is directly listed in LEGITIMATE_DOMAINS
  const isDirectMatch = LEGITIMATE_DOMAINS.includes(domain);

  // Check if the domain is a subdomain of a legitimate domain
  const isSubdomainMatch = LEGITIMATE_DOMAINS.some((legitDomain) => domain.endsWith(`.${legitDomain}`));

  // Check if the TLD is legitimate
  const isTldLegitimate = LEGITIMATE_TLDS.includes(tld);

  // Check if the second-level domain has a reasonable structure
  const isSldValid = sld.length >= 2 && !/^(test|fake|temp|spam|mail|email)/.test(sld);

  // Direct match bypasses subdomain checks
  if (isDirectMatch) {
    return isTldLegitimate && isSldValid;
  }

  // All conditions must be true for subdomains
  return isSubdomainMatch && isTldLegitimate && isSldValid;
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