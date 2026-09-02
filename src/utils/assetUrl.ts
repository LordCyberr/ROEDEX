let cachedExtensionUrl = '';
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
  try {
    if (chrome.runtime.id) {
      const rootUrl = chrome.runtime.getURL('');
      if (rootUrl) {
        cachedExtensionUrl = rootUrl.endsWith('/') ? rootUrl : `${rootUrl}/`;
      }
    }
  } catch {}
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('chrome-extension:')) return path;
  
  // Clean up leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    try {
      if (chrome.runtime.id) {
        const url = chrome.runtime.getURL(cleanPath);
        if (url) {
          if (!cachedExtensionUrl) {
            const idx = url.indexOf(`/${cleanPath}`);
            if (idx !== -1) {
              cachedExtensionUrl = url.substring(0, idx + 1);
            }
          }
          return url;
        }
      }
    } catch (e) {
      // Extension context invalidated
    }
  }
  
  if (cachedExtensionUrl) {
    return `${cachedExtensionUrl}${cleanPath}`;
  }
  
  return path;
}
