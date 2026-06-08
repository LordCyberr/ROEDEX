export const formatInternalName = (raw: string) => {
  let clean = raw.trim();
  if (clean.toLowerCase() === 'crystalrock') return 'Crystal';
  if (clean.toLowerCase() === 'dinobones') return 'Dino Bone';
  
  // Strip common suffixes case-insensitively
  clean = clean.replace(/\s*(ore|node|flower|tree|ai)$/i, '').trim();
  
  // Format camelCase to Title Case if needed
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  return clean.replace(/^./, (str) => str.toUpperCase());
};
