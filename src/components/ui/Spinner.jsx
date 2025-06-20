import React from 'react';

const Spinner = ({ size = 'md', className = '', ...props }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} animate-spin rounded-full border-2 border-gray-300 border-t-primary`}
      {...props}
    />
  );
};

export default Spinner; 