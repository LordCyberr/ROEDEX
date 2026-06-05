import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function initOverlay() {
  const overlayId = 'roedex-overlay-root';
  let rootContainer = document.getElementById(overlayId);

  // If the container doesn't exist (because we are injected via Content Script), create it.
  if (!rootContainer) {
    rootContainer = document.createElement('div');
    rootContainer.id = overlayId;
    
    // Ensure it overlays the game canvas perfectly
    rootContainer.style.position = 'fixed';
    rootContainer.style.top = '0';
    rootContainer.style.left = '0';
    rootContainer.style.width = '100vw';
    rootContainer.style.height = '100vh';
    rootContainer.style.pointerEvents = 'none'; // Let clicks pass through to the game by default
    rootContainer.style.zIndex = '999999';
    
    document.body.appendChild(rootContainer);
  }

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
