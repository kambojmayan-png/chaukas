import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({
  children,
  className = '',
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-[16px] border border-[#1A1A1A]/10 shadow-[0_2px_12px_rgba(26,26,26,0.06)] p-5 sm:p-6 ${
        hoverEffect ? 'hover:shadow-[0_4px_20px_rgba(26,26,26,0.1)] hover:border-[#1A1A1A]/20 transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
