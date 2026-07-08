export const ThemeColors = {
  rarity: {
    mythic: {
      text: 'text-[#e879f9]', // Purple
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/60',
      bg: 'bg-purple-950/10',
      border: 'border-purple-500/20'
    },
    rare: {
      text: 'text-[#4ade80]', // Green
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.4)] border-emerald-500/60',
      bg: 'bg-emerald-950/10',
      border: 'border-emerald-500/20'
    },
    uncommon: {
      text: 'text-[#60a5fa]', // Blue
      glow: 'shadow-[0_0_20px_rgba(96,165,250,0.4)] border-blue-500/60',
      bg: 'bg-blue-950/10',
      border: 'border-blue-500/20'
    },
    common: {
      text: 'text-[var(--text-muted)]', // Gray
      glow: 'shadow-lg border-white/10',
      bg: 'bg-[var(--bg-panel)]',
      border: 'border-white/10'
    }
  },
  status: {
    combat: 'shadow-[0_0_20px_rgba(244,63,94,0.4)] border-rose-500/60',
    error: 'shadow-[0_0_20px_rgba(244,63,94,0.4)] border-rose-500/60',
    success: 'shadow-[0_0_20px_rgba(74,222,128,0.4)] border-emerald-500/60',
    achievement: 'shadow-[0_0_20px_rgba(250,204,21,0.4)] border-yellow-500/60',
    systemOnline: 'shadow-[0_0_20px_rgba(34,211,238,0.5)] border-cyan-400/60'
  }
};
