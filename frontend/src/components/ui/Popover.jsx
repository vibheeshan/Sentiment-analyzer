import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Popover({
  isOpen,
  onClose,
  triggerRef,
  align = 'left',
  matchWidth = false,
  className = '',
  style = {},
  children,
  zIndex = 'var(--z-overlay-panel)',
}) {
  const [coords, setCoords] = useState({});

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const newCoords = { top: rect.bottom + 8 };
      
      if (matchWidth) {
        newCoords.width = rect.width;
      }
      
      if (align === 'right') {
        newCoords.right = window.innerWidth - rect.right;
      } else {
        newCoords.left = rect.left;
      }
      
      setCoords(newCoords);
    }
  }, [isOpen, triggerRef, align, matchWidth]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimming backdrop overlay */}
          <div
            className="fixed inset-0 backdrop-blur-[2px]"
            style={{ zIndex: 'var(--z-overlay-backdrop)', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />

          {/* Elevated Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              zIndex: zIndex,
              backgroundColor: 'var(--surface-panel)',
              ...(triggerRef ? coords : {}),
              ...style
            }}
            className={`rounded-2xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10 dark:shadow-[0_16px_50px_rgba(0,0,0,0.7)] ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
