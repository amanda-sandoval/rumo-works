'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds (e.g. 100, 200, 300)
  variant?: 'popup' | 'fade-up' | 'scale';
  as?: React.ElementType;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  variant = 'popup',
  as: Component = 'div',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const currentElement = elementRef.current;
    if (!currentElement) return;

    // Use IntersectionObserver with comfortable entry threshold
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  // Class variations for smooth emergence
  const getInitialClasses = () => {
    if (variant === 'popup') {
      return isVisible
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 translate-y-7 scale-[0.97] pointer-events-none';
    }
    if (variant === 'scale') {
      return isVisible
        ? 'opacity-100 scale-100'
        : 'opacity-0 scale-95 pointer-events-none';
    }
    // Default 'fade-up'
    return isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-6 pointer-events-none';
  };

  return (
    <Component
      ref={elementRef}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity] ${getInitialClasses()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Component>
  );
};
