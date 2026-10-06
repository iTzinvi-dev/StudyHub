import React, { CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#FFD700',
      shimmerSize = '0.08em',
      shimmerDuration = '3s',
      borderRadius = '9999px',
      background = 'rgba(18, 26, 18, 0.95)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background
          } as CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-[#FFD700]/30 px-6 py-2.5 text-[#FFFFCC] [background:var(--bg)] [border-radius:var(--radius)]',
          'transform-gpu transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.18)] hover:shadow-[0_0_28px_rgba(255,215,0,0.35)]',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div className={cn('-z-30 blur-[2px]', 'absolute inset-0 overflow-visible [container-type:size]')}>
          {/* Spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {children}

        {/* Ambient Top Highlight */}
        <div
          className={cn(
            'absolute inset-0 size-full pointer-events-none',
            'rounded-full px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_rgba(255,215,0,0.12)]',
            'transform-gpu transition-all duration-300 ease-in-out',
            'group-hover:shadow-[inset_0_-6px_14px_rgba(255,215,0,0.25)]',
            'group-active:shadow-[inset_0_-10px_14px_rgba(255,215,0,0.3)]'
          )}
        />

        {/* Backdrop Cutout */}
        <div
          className={cn(
            'absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)] pointer-events-none'
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
