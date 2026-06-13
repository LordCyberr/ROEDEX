import React, { useState, useEffect, useRef } from 'react';
import { SpriteCompanion, SpriteMood } from './SpriteCompanion';

interface BobFaceProps {
  mood: SpriteMood;
  isTalking?: boolean;
  voiceStyle?: 'wave' | 'eq' | 'pulse';
  pixelColor?: string;
}

const getMoodColor = (mood: SpriteMood) => {
  switch (mood) {
    case 'angry': return '#ef4444'; // Error/Angry (Red)
    case 'thinking': return '#a855f7'; // Mythic Found (Purple)
    case 'happy': return '#4ade80'; // Rare Found (Green)
    case 'talking': return '#00e5ff'; // Hologram Cyan
    case 'idle': return '#00e5ff'; // Hologram Cyan
    case 'dizzy': return '#f97316'; // Warning (Orange)
    default: return '#00e5ff'; // Default Hologram Cyan
  }
};

export const BobFace: React.FC<BobFaceProps> = ({ 
  mood, 
  isTalking = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [shakeMood, setShakeMood] = useState<SpriteMood | null>(null);

  const displayMood = shakeMood || mood;
  const activeColor = getMoodColor(displayMood);

  const velocityHistory = useRef<number[]>([]);
  const lastMouseTime = useRef<number>(Date.now());
  const lastMousePos = useRef({ x: 0, y: 0 });
  const shakeTimeout = useRef<number | null>(null);

  // CRT Boot Sequence
  useEffect(() => {
    const t = window.setTimeout(() => setIsBooting(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  // Global Tracking (Shaking Physics)
  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      // Physics (Shaking) calculation
      const now = Date.now();
      const dt = now - lastMouseTime.current;
      if (dt > 0) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vel = dist / dt; // pixels per ms
        
        velocityHistory.current.push(vel);
        if (velocityHistory.current.length > 8) velocityHistory.current.shift();
        
        const avgVel = velocityHistory.current.reduce((a, b) => a + b, 0) / velocityHistory.current.length;
        
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Increase hit box slightly for shake detection
          const isOverBob = e.clientX >= rect.left - 20 && e.clientX <= rect.right + 20 && 
                            e.clientY >= rect.top - 20 && e.clientY <= rect.bottom + 20;
          
          if (isOverBob && avgVel > 3.0) { // Shaking detected
            setShakeMood('angry');
            if (shakeTimeout.current) window.clearTimeout(shakeTimeout.current);
            shakeTimeout.current = window.setTimeout(() => setShakeMood(null), 2500);
          }
        }
      }
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = now;
    };

    window.addEventListener('pointermove', handleMouseMove as any, true);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove as any, true);
      if (shakeTimeout.current) window.clearTimeout(shakeTimeout.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isBooting ? 'animate-crt' : ''} ${displayMood === 'angry' ? 'animate-pulse' : ''}`}
    >
      {/* 16x16 Pixel Matrix floating directly */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <SpriteCompanion 
          mood={displayMood as any} 
          isTalking={isTalking} 
          pixelColor={activeColor} 
        />
      </div>
    </div>
  );
};
