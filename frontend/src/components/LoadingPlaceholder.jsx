import React, { useState } from 'react';

const LoadingPlaceholder = ({ 
  src, 
  alt, 
  className = "", 
  placeholderClassName = "",
  fallbackSrc = "/default_pfp.jpg",
  children 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center ${placeholderClassName}`}>
          <div className="w-8 h-8 text-gray-400">
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      
      {/* Optional overlay content */}
      {children && !isLoading && (
        <div className="absolute inset-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default LoadingPlaceholder; 