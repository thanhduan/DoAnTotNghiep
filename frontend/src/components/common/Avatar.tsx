import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  fallbackText,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  // Get first letter of name for fallback
  const getFallbackLetter = () => {
    if (fallbackText) {
      return fallbackText.charAt(0).toUpperCase();
    }
    return alt.charAt(0).toUpperCase();
  };

  const [imageError, setImageError] = React.useState(false);

  // If avatar URL exists and no error, show image
  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  // Fallback: Show first letter with colored background
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary-100 flex items-center justify-center ${className}`}
    >
      <span className="text-primary-600 font-semibold">
        {getFallbackLetter()}
      </span>
    </div>
  );
};

export default Avatar;
