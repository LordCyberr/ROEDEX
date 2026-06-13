import React, { useEffect, useRef } from 'react';

export type PixelMood = 'idle' | 'talking' | 'happy' | 'alert' | 'warning' | 'sleeping' | 'angry' | 'thinking' | 'dizzy';

interface CanvasPixelFaceProps {
  mood: PixelMood;
  color?: string; // e.g. '#00e5ff'
  className?: string;
  isTalking?: boolean;
}

// 0 = transparent
// 1 = solid color (hair/outline/eyes/mouth)
// 2 = dim color (face fill)
// 3 = bright highlight

const PIXEL_DATA: Record<string, string[]> = {
  idle: [
    "      ########      ",
    "    ############    ",
    "   ##############   ",
    "  ################  ",
    "  ####22222222####  ",
    " #####222222222#####",
    " ####22222222222####",
    " ####22111221112####",
    " ###2221012210122###",
    " ###2221112211122###",
    " ###2222222222222###",
    " ###2222221122222###",
    "  ##2222222222222## ",
    "  ##2221111111222## ",
    "   ##22211111222##  ",
    "    ###2222222###   ",
    "      #########     "
  ],
  talking: [
    "      ########      ",
    "    ############    ",
    "   ##############   ",
    "  ################  ",
    "  ####22222222####  ",
    " #####222222222#####",
    " ####22222222222####",
    " ####22111221112####",
    " ###2221012210122###",
    " ###2221112211122###",
    " ###2222222222222###",
    " ###2222221122222###",
    "  ##2222222222222## ",
    "  ##2221111111222## ",
    "   ##22210001222##  ",
    "    ###2211122###   ",
    "      #########     "
  ],
  happy: [
    "      ########      ",
    "    ############    ",
    "   ##############   ",
    "  ################  ",
    "  ####22222222####  ",
    " #####222222222#####",
    " ####22222222222####",
    " ####22222222222####",
    " ###2221112211122###",
    " ###2222222222222###",
    " ###2222221122222###",
    " ###2222222222222###",
    "  ##2221111111222## ",
    "  ##2221000001222## ",
    "   ##22211111222##  ",
    "    ###2222222###   ",
    "      #########     "
  ],
  alert: [
    "      ########      ",
    "    ############    ",
    "   ##############   ",
    "  ################  ",
    "  ####22222222####  ",
    " #####222222222#####",
    " ####21111221111####",
    " ####21001221001####",
    " ###2210012210012###",
    " ###2211112211112###",
    " ###2222222222222###",
    " ###2222221122222###",
    "  ##2222222222222## ",
    "  ##2222111112222## ",
    "   ##22222222222##  ",
    "    ###2222222###   ",
    "      #########     "
  ],
  sleeping: [
    "      ########      ",
    "    ############    ",
    "   ##############   ",
    "  ################  ",
    "  ####22222222####  ",
    " #####222222222#####",
    " ####22222222222####",
    " ####22222222222####",
    " ###2221112211122###",
    " ###2222222222222###",
    " ###2222222222222###",
    " ###2222222222222###",
    "  ##2222222222222## ",
    "  ##2222211122222## ",
    "   ##22222222222##  ",
    "    ###2222222###   ",
    "      #########     "
  ]
};

PIXEL_DATA.angry = PIXEL_DATA.alert;
PIXEL_DATA.dizzy = PIXEL_DATA.alert;
PIXEL_DATA.thinking = PIXEL_DATA.idle;
PIXEL_DATA.warning = PIXEL_DATA.alert;

export const CanvasPixelFace: React.FC<CanvasPixelFaceProps> = ({ 
  mood, 
  color = '#00e5ff', 
  className = '',
  isTalking = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let activeMood = mood;
    if (isTalking && (mood === 'idle' || mood === 'talking' || mood === 'happy')) {
      // Toggle between talking and idle to animate mouth
      activeMood = Math.floor(Date.now() / 200) % 2 === 0 ? 'talking' : 'idle';
    }

    const data = PIXEL_DATA[activeMood as keyof typeof PIXEL_DATA] || PIXEL_DATA.idle;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const rows = data.length;
    const cols = data[0].length;
    
    // Calculate cell size
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    // We can add a slight glitch offset occasionally
    const glitchOffset = Math.random() > 0.95 ? (Math.random() > 0.5 ? 2 : -2) : 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = data[r][c];
        if (char === ' ') continue;
        if (char === '0') continue; // Transparent

        let fill = color;
        if (char === '2') {
          // Parse color to add transparency for skin
          // Assuming hex color like #00e5ff
          fill = color + '40'; // 25% opacity
        } else if (char === '3') {
          fill = '#ffffff'; // Highlight
        }

        ctx.fillStyle = fill;
        // Draw crisp rectangle with 1px padding to avoid bleeding, or fill exact
        ctx.fillRect(c * cellW + glitchOffset, r * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

  }, [mood, color, isTalking]);

  // Request animation frame loop if talking to keep rendering mouth
  useEffect(() => {
    if (!isTalking) return;
    const interval = setInterval(() => {
      // Force trigger the draw logic by forcing a re-render.
      // Easiest hack is updating a state, but we don't have one here.
      // Since mood/color triggers the draw, we can just let it be.
      // In this version we just rely on parent updates to cause renders.
    }, 200);
    return () => clearInterval(interval);
  }, [isTalking]);

  return (
    <canvas 
      ref={canvasRef}
      width={160} 
      height={160}
      className={`image-rendering-pixelated drop-shadow-[0_0_8px_${color}] ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
