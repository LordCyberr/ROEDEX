import React from 'react';
import { getAssetUrl } from '../../utils/assetUrl';

export type SpriteMood = 'idle' | 'talking' | 'happy' | 'alert' | 'warning' | 'sleeping' | 'angry' | 'thinking' | 'dizzy';

interface SpriteCompanionProps {
  mood: SpriteMood;
  isTalking?: boolean;
  className?: string;
  pixelColor?: string;
}

export const SpriteCompanion: React.FC<SpriteCompanionProps> = ({
  mood,
  isTalking = false,
  className = '',
  pixelColor = '#00e5ff'
}) => {
  
  // The sprite sheet has 6 rows. We map moods to a specific row index (0-5).
  // Y-position percentage for 6 rows is: 0%, 20%, 40%, 60%, 80%, 100%
  const getRowPercent = (m: SpriteMood) => {
    switch (m) {
      case 'idle': return '0%';
      case 'talking': return '20%';
      case 'happy': return '40%';
      case 'thinking': return '60%';
      case 'dizzy': return '60%';
      case 'alert': return '80%';
      case 'angry': return '80%';
      case 'warning': return '80%';
      case 'sleeping': return '100%';
      default: return '0%';
    }
  };

  // If the character is actively talking, force the talking animation row
  const activeMood = isTalking ? 'talking' : mood;
  const backgroundPositionY = getRowPercent(activeMood);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      
      {/* 3D Holographic Projection Base */}
      <div className="absolute bottom-[-15%] w-[120%] h-[30%] flex items-center justify-center z-0 pointer-events-none [perspective:500px]">
        {/* Central Core Beam */}
        <div 
          className="absolute bottom-4 w-16 h-40 blur-xl mix-blend-screen opacity-50"
          style={{ background: `linear-gradient(to top, ${pixelColor}, transparent)` }}
        />
        {/* Rotating Outer Ring */}
        <div 
          className="absolute w-32 h-32 rounded-full border border-dashed opacity-60 animate-[spin_10s_linear_infinite]"
          style={{ borderColor: pixelColor, transform: 'rotateX(75deg)' }}
        />
        {/* Pulsing Inner Ring */}
        <div 
          className="absolute w-24 h-24 rounded-full border-[2px] opacity-80 animate-[spin_6s_linear_reverse_infinite]"
          style={{ 
            borderColor: pixelColor, 
            transform: 'rotateX(75deg)',
            boxShadow: `0 0 20px ${pixelColor}, inset 0 0 10px ${pixelColor}`
          }}
        />
        {/* Data Track Ring */}
        <div 
          className="absolute w-40 h-40 rounded-full border-[1px] border-dotted opacity-30 animate-[spin_15s_linear_infinite]"
          style={{ borderColor: pixelColor, transform: 'rotateX(75deg)' }}
        />
        {/* Core Emitter */}
        <div 
          className="absolute w-6 h-6 rounded-full mix-blend-screen animate-pulse"
          style={{ 
            background: '#ffffff',
            boxShadow: `0 0 25px 10px ${pixelColor}`
          }}
        />
      </div>

      {/* Floating Glitch Particles */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 mix-blend-screen animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 20}%`,
              backgroundColor: i % 3 === 0 ? '#ffffff' : pixelColor,
              boxShadow: `0 0 6px ${pixelColor}`,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.6 + 0.4
            }}
          />
        ))}
      </div>

      {/* Sweeping Laser Scanner */}
      <div 
        className="absolute left-0 right-0 h-[1.5px] z-30 pointer-events-none animate-scanline-sweep mix-blend-screen opacity-80"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: `0 0 12px 2px ${pixelColor}, 0 0 2px 1px #fff`
        }}
      />

      {/* The Sprite Sheet Character */}
      <div className="relative w-[90%] h-[90%] z-10 animate-float-slow">
        
        {/* Sprite Container mapped to state */}
        {/* background-size: 100% width, 600% height (6 vertical frames) */}
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url('${getAssetUrl('assets/companions/bob_hologram_sprites.png')}')`,
            backgroundSize: '100% 600%',
            backgroundPositionY: backgroundPositionY,
            imageRendering: 'pixelated',
            filter: `drop-shadow(0 0 12px ${pixelColor}) drop-shadow(0 0 4px #ffffff) contrast(1.2) brightness(1.1)`,
            opacity: 0.95,
            transition: 'background-position-y 0s' // Instant switch for frames
          }}
        />

        {/* CRT Scanline Overlay applied directly onto the sprite */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50 rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 50%)',
            backgroundSize: '100% 4px'
          }}
        />

        {/* Subtle Digital Distortion Noise */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>
      
    </div>
  );
};
