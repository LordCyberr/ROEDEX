import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function initOverlay() {
  const overlayId = 'roedex-overlay-root';
  let rootContainer = document.getElementById(overlayId);

  // If the container already exists (e.g. extension was reloaded), remove it completely
  // to prevent React reconciliation hook errors (Error #310)
  if (rootContainer) {
    rootContainer.remove();
  }

  rootContainer = document.createElement('div');
  rootContainer.id = overlayId;
  
  // Ensure it overlays the game canvas perfectly
  rootContainer.style.position = 'fixed';
  rootContainer.style.top = '0';
  rootContainer.style.left = '0';
  rootContainer.style.width = '100vw';
  rootContainer.style.height = '100vh';
  rootContainer.style.pointerEvents = 'none'; // Let clicks pass through to the game by default
  rootContainer.style.zIndex = '2147483647'; // Maximum possible z-index to ensure it stays above the game canvas
  
  // Append to documentElement (the <html> tag) instead of document.body.
  // Many HTML5 games completely clear or overwrite document.body during load,
  // which destroys the overlay if it's attached there.
  document.documentElement.appendChild(rootContainer);

  createRoot(rootContainer).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Ensure the body is ready before injecting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlay);
} else {
  initOverlay();
}
