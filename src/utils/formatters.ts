const nameMap: Record<string, string> = {
  'crystalrock': 'Crystal Rock',
  'dinobones': 'Dino Bone',
  'enchantedbark': 'Enchanted Bark',
  'elasticcore': 'Elastic Core',
  'pureessence': 'Pure Essence',
  'wolfpelt': 'Wolf Pelt',
  'silverleaf': 'Silverleaf',
  'blackoak': 'Blackoak',
  'moonpetal': 'Moonpetal',
  'ironwood': 'Ironwood',
  'bronzewood': 'Bronzewood',
  'godwood': 'Godwood',
  'dreadwood': 'Dreadwood',
  'cinderheart': 'Cinderheart',
  'shadowleaf': 'Shadowleaf',
  'goldleaf': 'Goldleaf',
  'mourninglily': 'Mourning Lily',
  'mistweed': 'Mistweed',
  'bloodroot': 'Bloodroot',
};

export const formatInternalName = (raw: string) => {
  let clean = raw.trim();
  
  if (nameMap[clean.toLowerCase()]) {
    return nameMap[clean.toLowerCase()];
  }
  
  // Strip common suffixes case-insensitively
  clean = clean.replace(/\s*(ore|node|flower|tree|ai)$/i, '').trim();
  
  // Format camelCase to Title Case if needed
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  return clean.replace(/^./, (str) => str.toUpperCase());
};

export const formatDuration = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s}s`;
  return `${m}m ${s}s`;
};
