import React from 'react';
import { MatrixRain } from './MatrixRain';
import { CanvasPixelFace } from './CanvasPixelFace';

export type BobMood = 'idle' | 'happy' | 'angry' | 'talking' | 'thinking' | 'dizzy' | 'sleeping';

interface PixelFaceMatrixProps {
  mood: BobMood;
  className?: string;
  pixelColor?: string;
  isTalking?: boolean;
}

export const PixelFaceMatrix: React.FC<PixelFaceMatrixProps> = ({ 
  mood, 
  className = '', 
  pixelColor = '#22d3ee',
  isTalking = false
}) => {
  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center ${className}`} 
      style={{ 
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)'
      }}
    >
      {/* Background radial glow for 3D depth */}
      <div 
        className="absolute inset-0 opacity-40 z-0 mix-blend-screen"
        style={{ background: `radial-gradient(circle, ${pixelColor}60 0%, transparent 70%)` }}
      />

      {/* Subtle grid background to simulate digital holographic space */}
      <div 
        className="absolute inset-0 opacity-[0.25] z-0"
        style={{
          backgroundImage: `linear-gradient(${pixelColor}80 1px, transparent 1px), linear-gradient(90deg, ${pixelColor}80 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Scanline CRT overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-60"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 50%)`,
          backgroundSize: '100% 3px'
        }}
      />

      {/* Subtle Digital Distortion / Hologram Noise */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Background Matrix Rain (Dark and slow) */}
      <div className="absolute inset-0 z-0">
        <MatrixRain color={pixelColor} density={30} speed={0.6} className="opacity-20" />
      </div>

      {/* Holographic Projection Platform (Base) */}
      <div className="absolute bottom-[-10%] w-[120%] h-[30%] flex items-center justify-center z-10 pointer-events-none [perspective:500px]">
        {/* Core light beam shooting up */}
        <div 
          className="absolute bottom-4 w-12 h-32 blur-md mix-blend-screen opacity-60"
          style={{ background: `linear-gradient(to top, ${pixelColor}, transparent)` }}
        />
        {/* Rotating 3D rings */}
        <div 
          className="absolute w-24 h-24 rounded-full border border-dashed opacity-50 animate-[spin_10s_linear_infinite]"
          style={{ borderColor: pixelColor, transform: 'rotateX(75deg)' }}
        />
        <div 
          className="absolute w-32 h-32 rounded-full border-[2px] opacity-80 animate-[spin_8s_linear_reverse_infinite]"
          style={{ 
            borderColor: pixelColor, 
            transform: 'rotateX(75deg)',
            boxShadow: `0 0 15px ${pixelColor}, inset 0 0 10px ${pixelColor}`
          }}
        />
        <div 
          className="absolute w-40 h-40 rounded-full border border-dotted opacity-30 animate-[spin_15s_linear_infinite]"
          style={{ borderColor: pixelColor, transform: 'rotateX(75deg)' }}
        />
        <div 
          className="absolute w-4 h-4 rounded-full mix-blend-screen opacity-90 animate-pulse"
          style={{ 
            background: '#ffffff',
            boxShadow: `0 0 20px 10px ${pixelColor}`
          }}
        />
      </div>

      {/* Floating Glitch Particles */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 mix-blend-screen animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 20}%`,
              backgroundColor: i % 2 === 0 ? pixelColor : '#ffffff',
              boxShadow: `0 0 4px ${pixelColor}`,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Sweeping holographic laser scanner */}
      <div 
        className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none animate-scanline-sweep mix-blend-screen opacity-70"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: `0 0 8px 2px ${pixelColor}, 0 0 2px 1px #fff`
        }}
      />

      {/* The Programmatic Pixel Art Face */}
      <div className="z-10 w-[80%] h-[80%] flex items-center justify-center">
        <CanvasPixelFace 
          mood={mood} 
          color={pixelColor} 
          isTalking={isTalking} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};