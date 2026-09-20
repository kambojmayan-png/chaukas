'use client';

import React from 'react';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  hideTopBar?: boolean;
  maxWidth?: string;
}

export function AppShell({
  children,
  className = '',
  hideTopBar = false,
  maxWidth = 'max-w-4xl',
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] text-[18px] leading-[1.6]">
      <div className={`mx-auto p-4 sm:p-6 md:p-8 ${maxWidth} flex flex-col justify-between min-h-screen ${className}`}>
        <div className="w-full">
          {!hideTopBar && <TopBar />}
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
