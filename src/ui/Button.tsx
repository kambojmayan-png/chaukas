'use client';

import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'choice';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  href,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#E8590C] text-white hover:bg-[#D44F0A] shadow-[0_2px_10px_rgba(232,89,12,0.25)] border-transparent';
      break;
    case 'secondary':
      variantClasses =
        'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A]/20 hover:bg-[#FBF7F0] hover:border-[#1A1A1A]/40 shadow-[0_2px_8px_rgba(26,26,26,0.05)]';
      break;
    case 'choice':
      variantClasses =
        'bg-white text-[#1A1A1A] border-2 border-[#1A1A1A]/15 hover:border-[#0F6B4F] active:bg-[#E6F3EE] shadow-[0_2px_8px_rgba(26,26,26,0.05)] text-left justify-between w-full';
      break;
  }

  const baseClasses = `inline-flex items-center justify-center min-h-[48px] px-5 py-3 rounded-[16px] font-bold text-[18px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button disabled={disabled} className={baseClasses} {...props}>
      {children}
    </button>
  );
}
