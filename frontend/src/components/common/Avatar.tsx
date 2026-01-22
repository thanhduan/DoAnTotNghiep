import React from 'react';
import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

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
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Get first letter of name for fallback
  const getFallbackLetter = () => {
    if (fallbackText) {
      return fallbackText.charAt(0).toUpperCase();
    }
    return alt.charAt(0).toUpperCase();
  };

  return (
    <ShadcnAvatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{getFallbackLetter()}</AvatarFallback>
    </ShadcnAvatar>
  );
};

export default Avatar;
