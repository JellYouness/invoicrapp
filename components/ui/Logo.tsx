import React from 'react';
import { cn } from '@/lib/utils';


interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
};

export function Logo({ 
  size = 'md', 
  className, 
  showText = true, 
  textClassName 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/invoicr-logo.png" 
        alt="Invoicr Logo" 
        className={cn(sizeMap[size], "object-contain")}
      />
      {showText && (
        <span className={cn(
          "font-bold text-gray-900 tracking-tight",
          textSizeMap[size],
          textClassName
        )}>
          Invoicr
        </span>
      )}
    </div>
  );
}
