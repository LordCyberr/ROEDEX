import React, { useRef, useEffect } from 'react';

/**
 * A custom input component that aggressively blocks native DOM events from bubbling up.
 * 
 * HTML5 games often attach a global `keydown` listener to the `window` to call 
 * `e.preventDefault()`, which stops browser scrolling but also inadvertently blocks 
 * text input in overlay extensions.
 * 
 * This component catches the events at the absolute top of the DOM in the capture phase.
 */
export const IsolatedInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, forwardedRef) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = (forwardedRef || internalRef) as React.RefObject<HTMLInputElement>;
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Stop bubbling up from the element itself
    const stopNative = (e: Event) => e.stopPropagation();
    const events = ['keydown', 'keyup', 'keypress', 'mousedown', 'pointerdown'];
    events.forEach(evt => el.addEventListener(evt, stopNative, { capture: false }));
    
    // Catch events BEFORE the game sees them at the window level
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!isFocusedRef.current || !el) return;
      
      e.stopImmediatePropagation();
      e.stopPropagation();
      
      if (e.type === 'keydown') {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        
        const triggerReact = (newValue: string, newCursor: number) => {
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, newValue);
          } else {
            el.value = newValue;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.setSelectionRange(newCursor, newCursor);
        };

        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const hasSelection = start !== end;

        if (e.key === 'Backspace') {
          e.preventDefault();
          if (hasSelection) {
            const nextVal = el.value.slice(0, start) + el.value.slice(end);
            triggerReact(nextVal, start);
          } else if (start > 0) {
            const nextVal = el.value.slice(0, start - 1) + el.value.slice(end);
            triggerReact(nextVal, start - 1);
          }
        } else if (e.key === 'Delete') {
          e.preventDefault();
          if (hasSelection) {
            const nextVal = el.value.slice(0, start) + el.value.slice(end);
            triggerReact(nextVal, start);
          } else if (start < el.value.length) {
            const nextVal = el.value.slice(0, start) + el.value.slice(start + 1);
            triggerReact(nextVal, start);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          triggerReact('', 0);
          el.blur();
          if (props.onKeyDown) {
            props.onKeyDown(e as any);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          el.setSelectionRange(Math.max(0, start - 1), Math.max(0, start - 1));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          el.setSelectionRange(Math.min(el.value.length, start + 1), Math.min(el.value.length, start + 1));
        } else if (e.key === 'Enter') {
          if (props.onKeyDown) {
            props.onKeyDown(e as any);
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          const nextVal = el.value.slice(0, start) + e.key + el.value.slice(end);
          triggerReact(nextVal, start + 1);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey, true);
    window.addEventListener('keyup', handleGlobalKey, true);
    window.addEventListener('keypress', handleGlobalKey, true);
    
    return () => {
      events.forEach(evt => el.removeEventListener(evt, stopNative, { capture: false }));
      window.removeEventListener('keydown', handleGlobalKey, true);
      window.removeEventListener('keyup', handleGlobalKey, true);
      window.removeEventListener('keypress', handleGlobalKey, true);
    };
  }, [ref, props.onKeyDown]);

  return (
    <input 
      ref={ref} 
      {...props} 
      onFocus={(e) => {
        isFocusedRef.current = true;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        isFocusedRef.current = false;
        props.onBlur?.(e);
      }}
      style={{ userSelect: 'text', ...props.style }} 
    />
  );
});

IsolatedInput.displayName = 'IsolatedInput';

