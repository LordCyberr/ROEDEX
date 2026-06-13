export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Clean up leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    try {
      return chrome.runtime.getURL(cleanPath);
    } catch (e) {
      console.warn("Extension context invalidated. Please refresh the page.");
      return path;
    }
  }
  return path;
}
