import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof globalThis !== 'undefined' ? globalThis.innerWidth : 1000,
    height: typeof globalThis !== 'undefined' ? globalThis.innerHeight : 1000,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight,
      });
    }
    
    globalThis.addEventListener('resize', handleResize);
    handleResize();
    
    return () => globalThis.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
