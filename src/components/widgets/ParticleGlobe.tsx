import React, { useEffect, useRef } from 'react';

interface ParticleGlobeProps {
  color?: string;
  isTalking?: boolean;
  className?: string;
  mood?: string;
  forceHighFPS?: boolean;
}

export const ParticleGlobe: React.FC<ParticleGlobeProps> = ({
  color = '#00e5ff',
  isTalking = false,
  className = '',
  mood = 'idle',
  forceHighFPS = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  const colorRef = useRef(color);
  const isTalkingRef = useRef(isTalking);
  const forceHighFPSRef = useRef(forceHighFPS);

  useEffect(() => {
    moodRef.current = mood;
    colorRef.current = color;
    isTalkingRef.current = isTalking;
    forceHighFPSRef.current = forceHighFPS;
  }, [mood, color, isTalking, forceHighFPS]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 64;
    const height = rect.height || 64;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const NUM_CORE_PARTICLES = 200;
    const BASE_RADIUS = Math.min(width, height) * 0.08;
    const PERSPECTIVE = width * 0.8;
    const PROJECTION_CENTER_X = width / 2;
    const PROJECTION_CENTER_Y = height / 2;

    const particles: any[] = [];
    
    for (let i = 0; i < NUM_CORE_PARTICLES; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / NUM_CORE_PARTICLES);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);
      const rOffset = 0.5 + (Math.random() * 0.5);
      particles.push({
        x, y, z,
        baseRadius: BASE_RADIUS * rOffset,
        size: Math.random() * 1.5 + 0.5,
        type: 'core',
        speed: Math.random() * 0.02 + 0.01
      });
    }

    const NUM_RINGS = 4;
    for (let r = 0; r < NUM_RINGS; r++) {
      const ringRadius = BASE_RADIUS * (1.5 + (r * 0.3));
      const numRingParticles = 80 + (r * 15);
      const tiltX = Math.random() * Math.PI * 2;
      const tiltZ = Math.random() * Math.PI * 2;
      const ringSpeed = (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
      
      for (let i = 0; i < numRingParticles; i++) {
        if (Math.random() > 0.7) continue;
        const angle = (i / numRingParticles) * Math.PI * 2;
        let rx = Math.cos(angle);
        let ry = 0;
        let rz = Math.sin(angle);
        
        let y1 = ry * Math.cos(tiltX) - rz * Math.sin(tiltX);
        let z1 = ry * Math.sin(tiltX) + rz * Math.cos(tiltX);
        ry = y1; rz = z1;
        
        let x2 = rx * Math.cos(tiltZ) - ry * Math.sin(tiltZ);
        let y2 = rx * Math.sin(tiltZ) + ry * Math.cos(tiltZ);
        rx = x2; ry = y2;

        particles.push({
          x: rx, y: ry, z: rz,
          baseRadius: ringRadius,
          size: Math.random() > 0.8 ? 2 : 1,
          type: 'ring',
          ringIndex: r,
          ringSpeed,
        });
      }
    }

    let animationFrameId: number;
    let throttleTimer: ReturnType<typeof setTimeout>;
    let time = 0;
    let globalRotY = 0;
    let globalRotX = 0;
    
    // Smooth transition state
    let currentTransition = moodRef.current === 'dimmed' ? 0 : 1;
    let currentSpeedMult = moodRef.current === 'dimmed' ? 0.1 : 1.0;

    const hexToRgb = (hex: string) => {
      let r = 0, g = 229, b = 255;
      if (hex.startsWith('#') && hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }
      return { r, g, b };
    };

    const lerpColor = (c1: {r:number, g:number, b:number}, c2: {r:number, g:number, b:number}, t: number) => {
      return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t)
      };
    };

    const getRGBAFromObj = (c: {r:number, g:number, b:number}, alpha: number) => {
      return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
    };

    const render = () => {
      if (document.hidden) {
         // Pause heavy canvas drawing if the tab is not visible
         throttleTimer = setTimeout(() => {
           animationFrameId = requestAnimationFrame(render);
         }, 500);
         return;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      const currentMood = moodRef.current;
      const currentColorHex = colorRef.current;
      const currentIsTalking = isTalkingRef.current;

      const targetTransition = currentMood === 'dimmed' ? 0 : 1;
      // Lerp transition slowly (approx 1-2 seconds)
      currentTransition += (targetTransition - currentTransition) * 0.03;

      let targetSpeedMult = 1.0;
      if (currentMood === 'angry') targetSpeedMult = 3.0;
      else if (currentMood === 'happy') targetSpeedMult = 2.0;
      else if (currentMood === 'sleeping') targetSpeedMult = 0.2;
      else if (currentMood === 'dimmed') targetSpeedMult = 0.1;

      currentSpeedMult += (targetSpeedMult - currentSpeedMult) * 0.05;
      
      time += 0.005 * currentSpeedMult;
      
      const rotSpeedY = (currentIsTalking ? 0.0005 : 0.002) * currentSpeedMult;
      const rotSpeedX = (currentIsTalking ? 0.0002 : 0.001) * currentSpeedMult;
      
      globalRotY += rotSpeedY;
      globalRotX += rotSpeedX;

      const rotY = globalRotY * 20; 
      const rotX = Math.sin(globalRotX * 10) * 0.2;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      let voicePulse = 0;
      if (currentIsTalking) {
        voicePulse = 0.1 + (Math.sin(time * 15) * 0.05);
      } else if (currentMood === 'alert' || currentMood === 'warning') {
        voicePulse = Math.max(0, Math.sin(time * 10)) * 0.05;
      }

      ctx.globalCompositeOperation = 'screen';
      
      const particleScale = Math.max(0.5, width / 150);

      // Colors setup
      const activeBase = hexToRgb(currentColorHex);
      const activeCore = currentMood === 'angry' ? hexToRgb('#ff2222') : (currentMood === 'sleeping' ? hexToRgb('#334455') : activeBase);
      const activeRing = activeCore;
      const activeHighlight = currentMood === 'angry' ? hexToRgb('#ff8888') : (currentMood === 'sleeping' ? hexToRgb('#556677') : hexToRgb('#ffffff'));

      const dimmedCore = hexToRgb('#333333');
      const dimmedRing = hexToRgb('#222222');
      const dimmedHighlight = hexToRgb('#444444');

      const coreColor = lerpColor(dimmedCore, activeCore, currentTransition);
      const ringColor = lerpColor(dimmedRing, activeRing, currentTransition);
      const highlightColor = lerpColor(dimmedHighlight, activeHighlight, currentTransition);

      const projected = particles.map(p => {
        let targetRadius = p.baseRadius;
        if (p.type === 'core') {
          targetRadius += p.baseRadius * voicePulse;
          p.animX = p.x; p.animY = p.y; p.animZ = p.z;
        } else if (p.type === 'ring') {
          const ringRot = (time * (currentIsTalking ? 0.1 : 0.2)) * p.ringSpeed * 50 * currentSpeedMult; 
          const crCos = Math.cos(ringRot);
          const crSin = Math.sin(ringRot);
          const tempX = p.x * crCos - p.z * crSin;
          const tempZ = p.x * crSin + p.z * crCos;
          p.animX = tempX; p.animY = p.y; p.animZ = tempZ;
          if (currentIsTalking) targetRadius += p.baseRadius * (voicePulse * 1.5);
        }

        const px = p.animX * targetRadius;
        const py = p.animY * targetRadius;
        const pz = p.animZ * targetRadius;

        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2, size: p.size, type: p.type, ringIndex: p.ringIndex };
      });

      projected.sort((a, b) => b.z - a.z);
      
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const zDepth = p.z + PERSPECTIVE; 
        if (zDepth <= 0) continue;
        
        const scale = PERSPECTIVE / zDepth;
        const x2d = (p.x * scale) + PROJECTION_CENTER_X;
        const y2d = (p.y * scale) + PROJECTION_CENTER_Y;

        const normalizedZ = (p.z + BASE_RADIUS*3) / (BASE_RADIUS * 6); 
        let alpha = 0.1 + (normalizedZ * 0.8);
        let finalSize = (p.size * particleScale) * scale;
        
        let pointColor = ringColor;

        if (p.type === 'ring') {
          alpha *= 1.2;
          if (p.size > 1.5) pointColor = highlightColor; 
        } else {
          pointColor = coreColor;
          // Dim core particles more when transition is low
          alpha *= (0.3 + 0.7 * currentTransition); 
        }
        
        if (currentIsTalking) alpha = Math.min(1.0, alpha * 1.3);

        ctx.fillStyle = getRGBAFromObj(pointColor, Math.min(1, Math.max(0, alpha)));
        
        if (p.type === 'ring' && p.size <= 1.5) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, Math.max(0.5, finalSize/2), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x2d - finalSize/2, y2d - finalSize/2, Math.max(1, finalSize), Math.max(1, finalSize));
        }

        if (currentIsTalking && Math.random() > 0.995) {
           ctx.strokeStyle = getRGBAFromObj(ringColor, alpha * 0.4);
           ctx.lineWidth = Math.max(0.5, 1 * particleScale * scale);
           ctx.beginPath();
           ctx.moveTo(x2d, y2d);
           ctx.lineTo(PROJECTION_CENTER_X + (p.x * scale * 0.3), PROJECTION_CENTER_Y + (p.y * scale * 0.3));
           ctx.stroke();
        }
      }

      // Heartbeat pulse: sharp spikes followed by a rest
      const heartbeat = Math.pow(Math.abs(Math.sin(time * 2.5)), 12) * 1.5 + Math.pow(Math.abs(Math.sin(time * 2.5 - 0.5)), 12) * 0.8;
      const corePulse = currentIsTalking ? Math.abs(Math.sin(time * 15)) * (8 * particleScale) : heartbeat * (4 * particleScale);
      
      let activeCoreRadius = currentIsTalking ? (BASE_RADIUS * 0.5) : (BASE_RADIUS * 0.4);
      let dimmedCoreRadius = BASE_RADIUS * 0.15; // Very small glowing dot
      let baseFinalRadius = dimmedCoreRadius + (activeCoreRadius - dimmedCoreRadius) * currentTransition;
      let finalRadius = baseFinalRadius + corePulse;

      const coreGradient = ctx.createRadialGradient(
        PROJECTION_CENTER_X, PROJECTION_CENTER_Y, 0,
        PROJECTION_CENTER_X, PROJECTION_CENTER_Y, finalRadius
      );
      
      const dotColor = hexToRgb(currentColorHex);
      
      // Interpolate the gradient stops smoothly
      const centerAlpha = 0.9 - 0.2 * currentTransition; // 0.9 when dimmed, 0.7 when active
      const midAlpha = 0.2 + 0.1 * currentTransition; // 0.2 when dimmed, 0.3 when active

      const gradientColor = currentTransition < 0.5 ? dotColor : coreColor;
      
      coreGradient.addColorStop(0, currentIsTalking ? getRGBAFromObj(activeHighlight, 0.6) : getRGBAFromObj(gradientColor, centerAlpha));
      coreGradient.addColorStop(0.4, getRGBAFromObj(gradientColor, midAlpha));
      coreGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(PROJECTION_CENTER_X, PROJECTION_CENTER_Y, finalRadius, 0, Math.PI * 2);
      ctx.fill();

      // Throttle FPS based on mood to preserve game performance
      const targetFPS = forceHighFPSRef.current ? 60 : (
        currentMood === 'dimmed' ? 5 
        : currentIsTalking ? 30 : 15
      );
      
      if (targetFPS >= 60) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        throttleTimer = setTimeout(() => {
          animationFrameId = requestAnimationFrame(render);
        }, 1000 / targetFPS);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(throttleTimer);
    };
  }, []); // Empty dependency array! Will never unmount on prop changes!

  let shadowColor = color;
  if (mood === 'angry') shadowColor = '#ff2222';
  else if (mood === 'sleeping') shadowColor = '#334455';
  else if (mood === 'dimmed') shadowColor = 'rgba(0,0,0,0)'; // No outer glow when dimmed

  // Transition the drop-shadow CSS slowly as well!
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] z-10" 
        style={{ 
          filter: mood === 'dimmed' ? 'drop-shadow(0 0 0px rgba(0,0,0,0))' : `drop-shadow(0 0 12px ${shadowColor})`,
          transition: 'filter 1.5s ease-in-out'
        }}
      />
    </div>
  );
};
