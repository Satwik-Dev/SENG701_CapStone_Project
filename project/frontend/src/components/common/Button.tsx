import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
  as?: 'button' | 'span' | 'div';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  as: Component = 'button',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-md hover:shadow-lg',
  };

  if (Component !== 'button') {
    return (
      <Component
        className={`${baseStyles} ${variants[variant]} ${className} inline-flex`}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </Component>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};