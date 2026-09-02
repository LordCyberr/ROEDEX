import { useRef, useEffect } from 'react';

/**
 * A hook that aggressively intercepts keydown events at the window level in the capture phase.
 * This prevents background HTML5 games from stealing keystrokes or calling preventDefault()
 * which blocks typing in overlay input fields.
 */
export function useGameSafeInput(
  setValue: (val: string | ((prev: string) => string)) => void,
  onEnter?: () => void
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // If the input is not focused, let the game have the key
      if (!isFocusedRef.current) return;
      
      // Stop the game from ever seeing this key!
      e.stopImmediatePropagation();
      e.stopPropagation();
      
      if (e.type === 'keydown') {
        if (e.key === 'Backspace') {
          e.preventDefault();
          setValue(prev => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setValue('');
          inputRef.current?.blur();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (onEnter) onEnter();
        } else if (e.key === ' ') {
          e.preventDefault();
          setValue(prev => prev + ' ');
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          setValue(prev => prev + e.key);
        }
      }
    };

    // Attach to the VERY TOP of the window in the capture phase
    window.addEventListener('keydown', handleGlobalKey, true);
    window.addEventListener('keyup', handleGlobalKey, true);
    window.addEventListener('keypress', handleGlobalKey, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey, true);
      window.removeEventListener('keyup', handleGlobalKey, true);
      window.removeEventListener('keypress', handleGlobalKey, true);
    };
  }, [setValue, onEnter]);

  return { inputRef, isFocusedRef };
}
