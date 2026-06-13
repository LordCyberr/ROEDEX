import React, { useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled || !content) return;
    setIsVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isVisible) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (disabled) {
      setIsVisible(false);
    }
  }, [disabled]);

  let trigger: ReactNode;

  if (React.isValidElement(children)) {
    const child = React.Children.only(children) as React.ReactElement<any>;
    trigger = React.cloneElement(child, {
      onMouseEnter: (e: React.MouseEvent) => {
        handleMouseEnter(e);
        if (child.props.onMouseEnter) child.props.onMouseEnter(e);
      },
      onMouseMove: (e: React.MouseEvent) => {
        handleMouseMove(e);
        if (child.props.onMouseMove) child.props.onMouseMove(e);
      },
      onMouseLeave: (e: React.MouseEvent) => {
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

  // Adjust position to stay on screen
  let adjustedX = position.x + 15;
  let adjustedY = position.y + 15;
  
  if (typeof window !== 'undefined') {
    // Quick heuristic: if too far right/bottom, flip it
    if (adjustedX > window.innerWidth - 200) adjustedX = position.x - 15 - 150;
    if (adjustedY > window.innerHeight - 100) adjustedY = position.y - 15 - 50;
  }

  return (
    <>
      {trigger}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && content && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: 'fixed',
                left: adjustedX,
                top: adjustedY,
                zIndex: 2147483647, // Maximum z-index
                pointerEvents: 'none'
              }}
              className="bg-[var(--bg-panel)]/90 text-[var(--text-primary)] border border-[var(--border-accent)] shadow-[0_4px_20px_var(--border-subtle)] rounded-lg px-3 py-2 text-[10px] font-bold max-w-[250px] whitespace-normal z-[2147483647] overflow-hidden flex flex-col gap-1 backdrop-blur-xl"
            >
              {/* Added absolute glassmorphism highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
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
