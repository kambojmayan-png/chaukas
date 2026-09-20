'use client';

import React from 'react';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export function BackButton({
  href = '/',
  onClick,
  label = '← Back',
  className = '',
}: BackButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center min-h-[48px] px-4 py-2.5 bg-white border-2 border-[#1A1A1A]/20 text-[#1A1A1A] font-bold text-base sm:text-lg rounded-[14px] shadow-[0_2px_8px_rgba(26,26,26,0.06)] hover:bg-[#FBF7F0] hover:border-[#1A1A1A]/40 active:scale-[0.98] transition-all cursor-pointer';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseClasses} ${className}`}>
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${className}`}>
      {label}
    </Link>
  );
}
