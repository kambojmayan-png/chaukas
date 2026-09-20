import React from 'react';

export type ChipVariant = 'neutral' | 'guide' | 'saffron' | 'red' | 'green' | 'amber';

interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  className?: string;
  lang?: string;
}

export function Chip({
  children,
  variant = 'neutral',
  className = '',
  lang,
}: ChipProps) {
  let colorClasses = '';
  switch (variant) {
    case 'guide':
      colorClasses = 'bg-[#E6F3EE] text-[#0F6B4F] border border-[#0F6B4F]/20';
      break;
    case 'saffron':
      colorClasses = 'bg-[#FFF2EB] text-[#E8590C] border border-[#E8590C]/20';
      break;
    case 'red':
      colorClasses = 'bg-[#FDF2F2] text-[#C92A2A] border border-[#C92A2A]/20';
      break;
    case 'green':
      colorClasses = 'bg-[#EBFBEE] text-[#2B8A3E] border border-[#2B8A3E]/20';
      break;
    case 'amber':
      colorClasses = 'bg-[#FFF9DB] text-[#E67700] border border-[#E67700]/20';
      break;
    case 'neutral':
    default:
      colorClasses = 'bg-[#1A1A1A]/5 text-[#1A1A1A]/80 border border-[#1A1A1A]/10';
      break;
  }

  return (
    <span
      lang={lang}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold leading-normal ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
}
