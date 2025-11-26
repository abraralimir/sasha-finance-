'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedBox = React.forwardRef<HTMLDivElement, AnimatedBoxProps>(
  ({ className, children, style, delay = 0, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'opacity-0 animate-slide-in-from-right',
          className
        )}
        style={{
          ...style,
          animationFillMode: 'forwards',
          animationDelay: `${delay}ms`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedBox.displayName = 'AnimatedBox';

export default AnimatedBox;
