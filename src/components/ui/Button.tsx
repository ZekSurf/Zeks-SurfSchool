import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const MotionButton = motion(
  forwardRef<HTMLButtonElement, ButtonProps & MotionProps>((props, ref) => {
    const { children, ...rest } = props;
    return (
      <button ref={ref} {...rest}>
        {children}
      </button>
    );
  })
);

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-orange-800 text-white focus:ring-primary',
    secondary: 'bg-secondary hover:bg-yellow-500 text-gray-900 focus:ring-secondary',
    accent: 'bg-accent hover:bg-blue-600 text-white focus:ring-accent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const isDisabled = disabled || isLoading;

  // Omit drag and animation event props to avoid type conflicts
  const {
    onDrag, onDragEnd, onDragStart,
    onAnimationStart, onAnimationEnd, onAnimationIteration,
    ...rest
  } = props;

  return (
    <MotionButton
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </MotionButton>
  );
}; 