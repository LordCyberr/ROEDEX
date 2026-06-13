import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  color?: string;
  className?: string;
  density?: number;
  speed?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ 
  color = '#00ff41', 
  className = '',
  density = 20,
  speed = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to parent
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width || parent.clientWidth || 200;
        canvas.height = rect.height || parent.clientHeight || 200;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Matrix characters (Katakana + Latin)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');

    const fontSize = Math.max(10, canvas.width / density);
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y coordinate of each drop
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random negative y positions
    }

    let animationFrameId: number;
    let lastDrawTime = 0;

    const draw = (timestamp: number) => {
      // Throttle frame rate slightly to make it look like retro terminal (approx 30fps)
      if (timestamp - lastDrawTime > 33 / speed) {
        // Black bg with opacity to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';

        for (let i = 0; i < drops.length; i++) {
          const text = charArray[Math.floor(Math.random() * charArray.length)];
          const x = i * fontSize + (fontSize / 2);
          const y = drops[i] * fontSize;

          // Draw the character
          ctx.fillText(text, x, y);

          // Randomly reset drop to top
          if (y > canvas.height && Math.random() > 0.95) {
            drops[i] = 0;
          }

          // Move drop down
          drops[i]++;
        }
        lastDrawTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, density, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} 
    />
  );
};
