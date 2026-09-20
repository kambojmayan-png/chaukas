import React from 'react';

interface PageTitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tag?: React.ReactNode;
  className?: string;
}

export function PageTitle({
  title,
  subtitle,
  tag,
  className = '',
}: PageTitleProps) {
  return (
    <div className={`space-y-2 mb-6 ${className}`}>
      {tag && <div className="mb-2">{tag}</div>}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight leading-snug">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#1A1A1A]/75 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
