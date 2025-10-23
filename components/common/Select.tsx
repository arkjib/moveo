
import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  const baseClasses = "w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-[#f7a01c]";
  return (
    <select className={`${baseClasses} ${className}`} {...props}>
      {children}
    </select>
  );
};

export default Select;
