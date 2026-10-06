import React, { FC, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100
}) => {
  return (
    <span
      style={
        {
          '--shiny-width': `${shimmerWidth}px`
        } as React.CSSProperties
      }
      className={cn(
        'mx-auto max-w-md text-[#E6E6B8]/80',
        // Shimmer effect
        'animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',
        // Shimmer gradient (Golden Zenith amber gold)
        'bg-gradient-to-r from-transparent via-[#FFD700] via-50% to-transparent',
        className
      )}
    >
      {children}
    </span>
  );
};
