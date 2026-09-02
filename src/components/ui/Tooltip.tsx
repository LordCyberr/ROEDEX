import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../../store/settingsStore';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'follow';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  disabled = false, 
  position = 'bottom',
  className = ''
}) => {
  const theme = useSettingsStore(s => s.theme);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || !content) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTargetRect(rect);
    setCoords({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (position === 'follow' && isVisible) {
      setCoords({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setTargetRect(null);
  };

  useEffect(() => {
    if (disabled) {
      setIsVisible(false);
    }
    return () => {
      setIsVisible(false);
    };
  }, [disabled]);

  let trigger: ReactNode;

  if (React.isValidElement(children)) {
    const child = React.Children.only(children) as React.ReactElement<any>;
    trigger = React.cloneElement(child, {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        handleMouseEnter(e);
        if (child.props.onMouseEnter) child.props.onMouseEnter(e);
      },
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
        handleMouseMove(e);
        if (child.props.onMouseMove) child.props.onMouseMove(e);
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        handleMouseLeave();
        if (child.props.onMouseLeave) child.props.onMouseLeave(e);
      }
    });
  } else {
    trigger = (
      <span 
        onMouseEnter={handleMouseEnter} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
    );
  }

  // Calculate position coordinates
  let left = 0;
  let top = 0;
  let transform = '';

  if (position === 'follow' || !targetRect) {
    left = coords.x + 12;
    top = coords.y + 12;
    if (typeof window !== 'undefined') {
      if (left > window.innerWidth - 180) left = coords.x - 180;
      if (top > window.innerHeight - 60) top = coords.y - 45;
    }
  } else {
    switch (position) {
      case 'top':
        left = targetRect.left + targetRect.width / 2;
        top = targetRect.top - 6;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        left = targetRect.left + targetRect.width / 2;
        top = targetRect.bottom + 6;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        left = targetRect.left - 6;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        left = targetRect.right + 6;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(0, -50%)';
        break;
    }

    // Viewport edge clamping
    if (typeof window !== 'undefined') {
      if (left < 60) {
        left = 60;
      } else if (left > window.innerWidth - 60) {
        left = window.innerWidth - 60;
      }
      if (top < 30 && position === 'top') {
        top = targetRect.bottom + 6;
        transform = 'translate(-50%, 0)';
      } else if (top > window.innerHeight - 40 && position === 'bottom') {
        top = targetRect.top - 6;
        transform = 'translate(-50%, -100%)';
      }
    }
  }

  return (
    <>
      {trigger}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && content && !disabled && (
            <motion.div
              ref={tooltipRef}
              data-theme={theme}
              initial={{ opacity: 0, scale: 0.92, y: position === 'top' ? 2 : (position === 'bottom' ? -2 : 0) }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{
                position: 'fixed',
                left,
                top,
                transform,
                zIndex: 2147483647, // Maximum z-index
                pointerEvents: 'none',
              }}
              className={`bg-[#0c1322]/95 text-slate-200 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide max-w-[220px] whitespace-nowrap z-[2147483647] overflow-hidden flex items-center justify-center gap-1 backdrop-blur-xl pointer-events-none select-none ${className}`}
            >
              {/* Subtle glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              <div className="relative z-10 text-center">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById('roedex-overlay-root') || document.body
      )}
    </>
  );
};
