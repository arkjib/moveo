
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'sparkle' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = "py-2 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-[#1a4d8c] text-white hover:bg-[#143a6d] hover:shadow-lg hover:shadow-[#1a4d8c]/40",
    accent: "bg-[#f7a01c] text-slate-900 hover:bg-[#e58d0b]",
    sparkle: "bg-slate-900 text-[#f7a01c] border-2 border-[#f7a01c] hover:bg-[#1a4d8c] hover:text-white flex items-center gap-2",
    danger: "text-red-400 hover:text-red-500 font-semibold border border-red-400 hover:bg-red-400/10",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
