import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

/**
 * AnimatedCounter — smoothly ticks a number up/down using Framer Motion spring.
 * Usage: <AnimatedCounter value={1234} unit="g" decimals={0} />
 */
export const AnimatedCounter: React.FC<{
  value: number;
  unit?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Spring stiffness — higher = faster (default 80) */
  stiffness?: number;
  /** Spring damping (default 20) */
  damping?: number;
}> = ({
  value,
  unit = '',
  prefix = '',
  decimals = 0,
  className = '',
  style,
  stiffness = 80,
  damping = 20,
}) => {
  const spring = useSpring(value, { stiffness, damping });
  const display = useTransform(spring, (v: number) =>
    `${prefix}${v.toFixed(decimals)}${unit}`
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className} style={{ ...style, fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </motion.span>
  );
};

/**
 * RarityGlowBadge — an inline rarity badge with a pulsing glow border.
 * Usage: <RarityGlowBadge rarity="mythic" label="Mythic" />
 */
export const RarityGlowBadge: React.FC<{
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}> = ({ rarity, label, size = 'sm', className = '' }) => {
  const colorMap = {
    mythic: { fg: 'var(--rarity-mythic)', bg: 'color-mix(in srgb, var(--rarity-mythic) 12%, transparent)', border: 'color-mix(in srgb, var(--rarity-mythic) 45%, transparent)' },
    rare: { fg: 'var(--rarity-rare)', bg: 'color-mix(in srgb, var(--rarity-rare) 12%, transparent)', border: 'color-mix(in srgb, var(--rarity-rare) 45%, transparent)' },
    uncommon: { fg: 'var(--rarity-uncommon)', bg: 'color-mix(in srgb, var(--rarity-uncommon) 12%, transparent)', border: 'color-mix(in srgb, var(--rarity-uncommon) 45%, transparent)' },
    common: { fg: 'var(--rarity-common)', bg: 'color-mix(in srgb, var(--rarity-common) 8%, transparent)', border: 'color-mix(in srgb, var(--rarity-common) 25%, transparent)' },
  }[rarity];

  const sizeMap = {
    xs: 'text-[7px] px-1 py-px',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-1',
  }[size];

  const glowPeriod = rarity === 'mythic' ? 1.8 : rarity === 'rare' ? 2.2 : 2.8;

  return (
    <motion.span
      className={`inline-flex items-center justify-center font-black uppercase tracking-wider rounded-md select-none ${sizeMap} ${className}`}
      style={{ color: colorMap.fg, background: colorMap.bg, border: `1px solid ${colorMap.border}` }}
      animate={{
        boxShadow: [
          `0 0 4px color-mix(in srgb, ${colorMap.fg} 15%, transparent)`,
          `0 0 10px color-mix(in srgb, ${colorMap.fg} 40%, transparent)`,
          `0 0 4px color-mix(in srgb, ${colorMap.fg} 15%, transparent)`,
        ],
        borderColor: [
          colorMap.border,
          `color-mix(in srgb, ${colorMap.fg} 70%, transparent)`,
          colorMap.border,
        ]
      }}
      transition={{ duration: glowPeriod, repeat: Infinity, ease: 'easeInOut' }}
    >
      {label || rarity}
    </motion.span>
  );
};

/**
 * StaggerList — wraps children in staggered entrance animations.
 * Usage: <StaggerList>{items.map(i => <div key={i.id}>{i.name}</div>)}</StaggerList>
 */
export const StaggerList: React.FC<{
  children: React.ReactNode;
  stagger?: number;
  className?: string;
  itemClassName?: string;
}> = ({ children, stagger = 0.04, className = '', itemClassName = '' }) => {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          className={itemClassName}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * stagger, type: 'spring', stiffness: 380, damping: 28 }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

/**
 * FadeSlide — single element fade+slide entrance.
 */
export const FadeSlide: React.FC<{
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}> = ({ children, direction = 'up', delay = 0, className = '' }) => {
  const initial = {
    up: { opacity: 0, y: 10 },
    down: { opacity: 0, y: -10 },
    left: { opacity: 0, x: 10 },
    right: { opacity: 0, x: -10 },
  }[direction];

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * PulseOnChange — flashes a subtle highlight when `value` changes.
 */
export const PulseOnChange: React.FC<{
  value: any;
  color?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, color = 'var(--accent-primary)', children, className = '' }) => {
  const prevValue = useRef(value);
  const [flashing, setFlashing] = React.useState(false);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <motion.span
      className={`inline-block rounded-sm ${className}`}
      animate={flashing ? {
        backgroundColor: [`color-mix(in srgb, ${color} 0%, transparent)`, `color-mix(in srgb, ${color} 20%, transparent)`, `color-mix(in srgb, ${color} 0%, transparent)`],
      } : {}}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
};
