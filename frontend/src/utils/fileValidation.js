/**
 * SECURE FILE VALIDATION UTILITY
 * Comprehensive validation for image uploads with security checks
 */

// Configuration constants
const FILE_VALIDATION_CONFIG = {
  // Maximum file sizes (in bytes)
  MAX_SIZE: {
    PROFILE_PICTURE: 2 * 1024 * 1024,    // 2MB for profile pictures
    POST_IMAGE: 5 * 1024 * 1024,         // 5MB for post images
  },
  
  // Allowed MIME types (strict validation)
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  
  // Allowed file extensions
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Minimum file size (to prevent empty files)
  MIN_SIZE: 1024, // 1KB
};

/**
 * Validates file size
 */
const validateFileSize = (file, maxSize) => {
  if (file.size < FILE_VALIDATION_CONFIG.MIN_SIZE) {
    return {
      isValid: false,
      error: 'Filen er for lille. Minimum størrelse er 1KB.'
    };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Filen er for stor (${fileSizeMB}MB). Maksimum størrelse er ${maxSizeMB}MB.`
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file type using MIME type
 */
const validateFileType = (file) => {
  if (!FILE_VALIDATION_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Kun billeder er tilladt (JPG, PNG, WebP).'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file extension
 */
const validateFileExtension = (file) => {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = FILE_VALIDATION_CONFIG.ALLOWED_EXTENSIONS.some(
    ext => fileName.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'Ugyldig filtype. Kun .jpg, .png og .webp er tilladt.'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates file name for security
 */
const validateFileName = (file) => {
  const fileName = file.name;
  
  // Check for dangerous characters
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return {
      isValid: false,
      error: 'Filnavnet indeholder ugyldige tegn.'
    };
  }
  
  // Check file name length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'Filnavnet er for langt.'
    };
  }
  
  if (fileName.length < 1) {
    return {
      isValid: false,
      error: 'Filnavnet er tomt.'
    };
  }
  
  return { isValid: true };
};

/**
 * Main validation function for post images
 */
export const validatePostImage = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'Ingen fil valgt.'
    };
  }

  // Run all validations
  const validations = [
    validateFileType(file),
    validateFileExtension(file),
    validateFileName(file),
    validateFileSize(file, FILE_VALIDATION_CONFIG.MAX_SIZE.POST_IMAGE)
  ];

  // Find first validation error
  const failedValidation = validations.find(v => !v.isValid);
  if (failedValidation) {
    return failedValidation;
  }

  return { 
    isValid: true, 
    message: `Billede valideret ✓ (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
  };
};

/**
 * Main validation function for profile pictures
 */
export const validateProfilePicture = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'Ingen fil valgt.'
    };
  }

  // Run all validations
  const validations = [
    validateFileType(file),
    validateFileExtension(file),
    validateFileName(file),
    validateFileSize(file, FILE_VALIDATION_CONFIG.MAX_SIZE.PROFILE_PICTURE)
  ];

  // Find first validation error
  const failedValidation = validations.find(v => !v.isValid);
  if (failedValidation) {
    return failedValidation;
  }

  return { 
    isValid: true, 
    message: `Profilbillede valideret ✓ (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
  };
};

/**
 * Helper function to get file size in human readable format
 */
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Check if file is an image by reading file signature (magic bytes)
 * This is an additional security layer beyond MIME type checking
 */
export const validateImageMagicBytes = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);
      let header = '';
      
      // Read first 4 bytes
      for (let i = 0; i < arr.length && i < 4; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }
      
      // Check magic bytes for common image formats
      const imageSignatures = {
        'ffd8ffe0': 'jpeg',
        'ffd8ffe1': 'jpeg', 
        'ffd8ffe2': 'jpeg',
        'ffd8ffe3': 'jpeg',
        'ffd8ffe8': 'jpeg',
        '89504e47': 'png',
        '52494646': 'webp', // First part of RIFF (WebP container)
      };
      
      const detectedFormat = imageSignatures[header.substring(0, 8)];
      
      if (!detectedFormat) {
        resolve({
          isValid: false,
          error: 'Filen er ikke et gyldigt billede.'
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Kunne ikke læse fil.'
      });
    };
    
    // Read first 4 bytes only
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export default {
  validatePostImage,
  validateProfilePicture,
  validateImageMagicBytes,
  getFileSize,
  FILE_VALIDATION_CONFIG
}; 